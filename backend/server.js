const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

const connectDB = require("./config/db");
const app = require("./src/app");
const Order = require("./models/Order.model");
const User = require("./models/user.model");

// Create HTTP server for Express and Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Throttling map to prevent MongoDB write spam on every GPS tick
const dbUpdateThrottles = new Map();

io.on("connection", (socket) => {
  // Event 1: Securely join order room
  socket.on("order:join", async (data, callback) => {
    try {
      const { orderId, token } = data || {};
      if (!orderId) {
        if (callback) callback({ success: false, message: "orderId is required" });
        return;
      }

      let userId = null;
      let userRole = null;

      const authToken = token || socket.handshake.auth?.token;
      if (authToken) {
        try {
          const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
          userId = decoded.id;
        } catch {
          // Token verification error
        }
      }

      if (!userId) {
        if (callback) callback({ success: false, message: "Unauthorized: Invalid socket token" });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        if (callback) callback({ success: false, message: "Unauthorized: User not found" });
        return;
      }

      userRole = user.role;

      const order = await Order.findById(orderId);
      if (!order) {
        if (callback) callback({ success: false, message: "Order not found" });
        return;
      }

      // Room Authorization Check
      const isCustomer = String(order.customer) === String(userId);
      const isPartner = order.deliveryPartner && String(order.deliveryPartner) === String(userId);
      const isAdmin = userRole === "admin";

      if (!isCustomer && !isPartner && !isAdmin) {
        if (callback) callback({ success: false, message: "Forbidden: Not authorized for this order room" });
        return;
      }

      const roomName = `order:${orderId}`;
      socket.join(roomName);

      if (callback) callback({ success: true, room: roomName, isCustomer, isPartner });
    } catch (error) {
      if (callback) callback({ success: false, message: error.message });
    }
  });

  // Event 2: Delivery partner streams live GPS location
  socket.on("delivery:location", async (data) => {
    try {
      const { orderId, latitude, longitude } = data || {};
      if (!orderId || latitude == null || longitude == null) return;

      const roomName = `order:${orderId}`;

      // Broadcast location strictly to order room
      io.to(roomName).emit("delivery:location", {
        orderId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        updatedAt: new Date(),
      });

      // Throttle database persistence (at most once every 10 seconds per order)
      const now = Date.now();
      const lastUpdate = dbUpdateThrottles.get(orderId) || 0;
      if (now - lastUpdate > 10000) {
        dbUpdateThrottles.set(orderId, now);
        await Order.findByIdAndUpdate(orderId, {
          $set: {
            "liveDeliveryLocation.type": "Point",
            "liveDeliveryLocation.coordinates": [Number(longitude), Number(latitude)],
            "liveDeliveryLocation.updatedAt": new Date(),
          },
        }).catch(() => {});
      }
    } catch (err) {
      console.error("[Socket.IO] Error in delivery:location", err);
    }
  });

  socket.on("disconnect", () => {});
});

// Connect to database and start server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} - http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("database connection failed:", error.message);
    process.exit(1);
  });
