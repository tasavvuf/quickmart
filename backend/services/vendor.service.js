const Store = require("../models/Store.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");

const getStoreByOwner = async (userId) => {
  const store = await Store.findOne({ owner: userId });
  if (!store) {
    const error = new Error("No store found associated with this vendor account.");
    error.statusCode = 404;
    throw error;
  }
  return store;
};

const getDashboardStats = async (storeId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    todaysOrdersCount,
    pendingOrdersCount,
    preparingOrdersCount,
    readyOrdersCount,
    totalProductsCount,
    lowStockProductsCount,
    todaysOrders,
  ] = await Promise.all([
    Order.countDocuments({
      store: storeId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }),
    Order.countDocuments({ store: storeId, vendorStatus: "PENDING" }),
    Order.countDocuments({ store: storeId, vendorStatus: "PREPARING" }),
    Order.countDocuments({ store: storeId, vendorStatus: "READY" }),
    Product.countDocuments({ store: storeId }),
    Product.countDocuments({ store: storeId, stock: { $lte: 5 } }),
    Order.find({
      store: storeId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      vendorStatus: { $in: ["ACCEPTED", "PREPARING", "READY"] },
    }),
  ]);

  const revenue = todaysOrders.reduce(
    (sum, order) => sum + (order.grandTotal || 0),
    0
  );

  return {
    todaysOrders: todaysOrdersCount,
    pendingOrders: pendingOrdersCount,
    preparingOrders: preparingOrdersCount,
    readyOrders: readyOrdersCount,
    totalProducts: totalProductsCount,
    lowStockProducts: lowStockProductsCount,
    isOpen: store.isOpen,
    revenue,
    store,
  };
};

const updateStore = async (storeId, updateData) => {
  const allowedFields = [
    "name",
    "description",
    "logo",
    "banner",
    "category",
    "categories",
    "openingHours",
    "emergencyContact",
    "contactPhone",
    "address",
    "isOpen",
    "location",
  ];

  const updateObject = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updateObject[field] = updateData[field];
    }
  }

  const store = await Store.findByIdAndUpdate(storeId, updateObject, {
    new: true,
    runValidators: true,
  });

  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  return store;
};

module.exports = {
  getStoreByOwner,
  getDashboardStats,
  updateStore,
};
