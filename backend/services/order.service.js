const Order = require("../models/Order.model");
const Product = require("../models/Product.model");

const ALLOWED_TRANSITIONS = {
  PENDING: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: [],
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

  // If order is REJECTED after being ACCEPTED, restore stock
  if (newVendorStatus === "REJECTED" && currentStatus === "ACCEPTED") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
    order.userStatus = "CANCELLED_BY_VENDOR";
  } else if (newVendorStatus === "REJECTED" && currentStatus === "PENDING") {
    order.userStatus = "CANCELLED_BY_VENDOR";
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

const generateFakeOrder = async (storeId) => {
  let products = await Product.find({ store: storeId, status: "active", stock: { $gt: 0 } });
  
  // If store has no active products with stock, fall back to all store products or create dummy product
  if (!products.length) {
    products = await Product.find({ store: storeId });
  }

  if (!products.length) {
    // Create a default product for this store so simulator works seamlessly
    const dummy = await Product.create({
      store: storeId,
      name: "Fresh Organic Apples",
      description: "Crisp and juicy red apples",
      price: 120,
      stock: 50,
      category: "Fruits & Vegetables",
      featured: true,
      images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&q=80"],
    });
    products = [dummy];
  }

  const sampleCustomers = [
    { name: "Aarav Sharma", phone: "+91 98765 43210", street: "Flat 402, Sunshine Heights", area: "Vesu", city: "Surat", state: "Gujarat", pincode: "395007" },
    { name: "Priya Patel", phone: "+91 91234 56789", street: "12 Green Park Villa", area: "Adajan", city: "Surat", state: "Gujarat", pincode: "395009" },
    { name: "Rohan Mehta", phone: "+91 99887 76655", street: "704 Platinum Towers", area: "VIP Road", city: "Surat", state: "Gujarat", pincode: "395007" },
    { name: "Neha Gupta", phone: "+91 98250 11223", street: "Block C-10, Applewood", area: "Varachha", city: "Surat", state: "Gujarat", pincode: "395006" },
    { name: "Vikram Singh", phone: "+91 97123 44556", street: "55 Universal Enclave", area: "Piplod", city: "Surat", state: "Gujarat", pincode: "395007" },
  ];

  const randomCustomer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
  const paymentTypes = ["COD", "UPI"];
  const selectedPaymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];

  // Pick 1 to 3 items randomly
  const itemCount = Math.min(products.length, Math.floor(Math.random() * 3) + 1);
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const selectedProducts = shuffled.slice(0, itemCount);

  const items = selectedProducts.map((p) => {
    const qty = Math.floor(Math.random() * 3) + 1;
    const itemPrice = p.price || 99;
    return {
      productId: p._id,
      productName: p.name,
      productImage: p.images && p.images.length ? p.images[0] : "",
      priceAtPurchase: itemPrice,
      quantity: qty,
      subtotal: itemPrice * qty,
    };
  });

  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);
  const deliveryFee = 30;
  const platformFee = 5;
  const discount = Math.random() > 0.6 ? 20 : 0;
  const grandTotal = Math.max(0, totalAmount + deliveryFee + platformFee - discount);

  const order = await Order.create({
    customer: storeId, // using storeId or fallback customer id for simulator
    store: storeId,
    items,
    totalAmount,
    deliveryFee,
    platformFee,
    discount,
    grandTotal,
    paymentType: selectedPaymentType,
    paymentStatus: selectedPaymentType === "UPI" ? "PAID" : "PENDING",
    userStatus: "ACTIVE",
    vendorStatus: "PENDING",
    deliveryStatus: "WAITING",
    deliveryAddress: {
      street: randomCustomer.street,
      area: randomCustomer.area,
      city: randomCustomer.city,
      state: randomCustomer.state,
      pincode: randomCustomer.pincode,
      fullAddress: `${randomCustomer.street}, ${randomCustomer.area}, ${randomCustomer.city}, ${randomCustomer.state} - ${randomCustomer.pincode}`,
      customerName: randomCustomer.name,
      phone: randomCustomer.phone,
    },
    statusHistory: [
      {
        status: "PENDING",
        updatedBy: "simulator",
        timestamp: new Date(),
      },
    ],
  });

  return order;
};

module.exports = {
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  generateFakeOrder,
};
