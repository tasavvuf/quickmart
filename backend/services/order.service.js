const Order = require("../models/Order.model");
const Product = require("../models/Product.model");

// Vendor-side status transitions — vendor responsibility ends at READY
// Delivery partner handles PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
const ALLOWED_TRANSITIONS = {
  PENDING: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: [],         // Vendor done — delivery partner takes over
  DELIVERED: [],
  REJECTED: [],
};

const getVendorOrders = async (storeId, query = {}) => {
  const filter = { store: storeId };

  if (query.vendorStatus && query.vendorStatus !== "ALL") {
    filter.vendorStatus = query.vendorStatus;
  }

  if (query.deliveryStatus && query.deliveryStatus !== "ALL") {
    filter.deliveryStatus = query.deliveryStatus;
  }

  if (query.search) {
    filter.$or = [
      { "deliveryAddress.customerName": { $regex: query.search, $options: "i" } },
      { "deliveryAddress.phone": { $regex: query.search, $options: "i" } },
      { _id: query.search.match(/^[0-9a-fA-F]{24}$/) ? query.search : null },
    ].filter((cond) => cond._id !== null || cond["deliveryAddress.customerName"]);
  }

  return Order.find(filter)
    .populate("customer", "name email phoneNumber")
    .populate("deliveryPartner", "name phoneNumber")
    .sort({ createdAt: -1 });
};

const getOrderById = async (storeId, orderId) => {
  const order = await Order.findOne({ _id: orderId, store: storeId })
    .populate("customer", "name email phoneNumber profilePhoto")
    .populate("deliveryPartner", "name phoneNumber");

  if (!order) {
    const error = new Error("Order not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  return order;
};

const updateOrderStatus = async (storeId, orderId, newVendorStatus, updatedBy = "vendor") => {
  const order = await Order.findOne({ _id: orderId, store: storeId });
  if (!order) {
    const error = new Error("Order not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = order.vendorStatus;

  // Validate state transition
  const validNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!validNextStates.includes(newVendorStatus)) {
    const error = new Error(
      `Invalid order status transition from ${currentStatus} to ${newVendorStatus}. Allowed transitions: [${validNextStates.join(", ")}]`
    );
    error.statusCode = 400;
    throw error;
  }

  // Handle Inventory Rules:
  // When transitioning to ACCEPTED: reserve/reduce stock
  if (newVendorStatus === "ACCEPTED") {
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        const error = new Error(`Product ${item.productName} no longer exists`);
        error.statusCode = 400;
        throw error;
      }

      if (product.stock < item.quantity) {
        const error = new Error(
          `Insufficient stock for "${product.name}". Required: ${item.quantity}, Available: ${product.stock}`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Deduct stock for each item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    order.acceptedAt = new Date();
  }

  // If order is REJECTED, restore stock if previously accepted, set deliveryStatus to CANCELLED, and clear deliveryPartner
  if (newVendorStatus === "REJECTED") {
    if (currentStatus === "ACCEPTED" || currentStatus === "PREPARING" || currentStatus === "READY") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }
    order.userStatus = "CANCELLED_BY_VENDOR";
    order.deliveryStatus = "CANCELLED";
    order.deliveryPartner = null;
  }

  if (newVendorStatus === "PREPARING") {
    order.preparedAt = new Date();
  }

  order.vendorStatus = newVendorStatus;

  // Append history without overwriting
  order.statusHistory.push({
    status: newVendorStatus,
    updatedBy: updatedBy,
    timestamp: new Date(),
  });

  await order.save();

  return order;
};

module.exports = {
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
};
