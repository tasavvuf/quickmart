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
    deliveredOrdersToday,
    allDeliveredOrders,
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
      vendorStatus: "DELIVERED",
      $or: [
        { deliveredAt: { $gte: startOfDay, $lte: endOfDay } },
        { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
      ],
    }),
    Order.find({
      store: storeId,
      vendorStatus: "DELIVERED",
    }),
  ]);

  // Pure vendor revenue is strictly the sum of item prices (totalAmount) of DELIVERED orders
  const todayRevenue = deliveredOrdersToday.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );

  const totalDeliveredRevenue = allDeliveredOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
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
    revenue: todayRevenue,
    totalDeliveredRevenue,
    store,
  };
};

const updateStore = async (storeId, updateData) => {
  const existingStore = await Store.findById(storeId);
  if (!existingStore) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    "name",
    "description",
    "logo",
    "banner",
    "storePhoto",
    "category",
    "categories",
    "openingHours",
    "emergencyContact",
    "contactPhone",
    "address",
    "isOpen",
    "location",
    "gstNumber",
  ];

  const updateObject = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updateObject[field] = updateData[field];
    }
  }

  // Ensure address is cleanly merged with existing address fields so required sub-fields (pincode, city, state, area, street) are never omitted
  if (updateData.address || updateData.street || updateData.city || updateData.pincode || updateData.area || updateData.state) {
    const inputAddress = typeof updateData.address === "object" ? updateData.address : {};
    const currentAddr = existingStore.address || {};

    updateObject.address = {
      street: (inputAddress.street ?? updateData.street ?? currentAddr.street ?? "").trim(),
      area: (inputAddress.area ?? updateData.area ?? currentAddr.area ?? "").trim(),
      pincode: String(inputAddress.pincode ?? updateData.pincode ?? currentAddr.pincode ?? "").trim(),
      city: (inputAddress.city ?? updateData.city ?? currentAddr.city ?? "").trim(),
      state: (inputAddress.state ?? updateData.state ?? currentAddr.state ?? "Gujarat").trim(),
      landmark: (inputAddress.landmark ?? updateData.landmark ?? currentAddr.landmark ?? "").trim(),
    };
  }

  // Ensure openingHours are formatted
  if (updateData.openingHours) {
    const inputHours = typeof updateData.openingHours === "object" ? updateData.openingHours : {};
    const currentHours = existingStore.openingHours || {};
    updateObject.openingHours = {
      open: inputHours.open || currentHours.open || "09:00 AM",
      close: inputHours.close || currentHours.close || "09:00 PM",
    };
  }

  const store = await Store.findByIdAndUpdate(storeId, updateObject, {
    new: true,
    runValidators: true,
  });

  return store;
};

/**
 * Get detailed Vendor Revenue Analytics
 * Pure vendor revenue calculation:
 * - Only includes DELIVERED orders (vendorStatus === 'DELIVERED' or deliveryStatus === 'DELIVERED')
 * - Revenue = order.totalAmount (sum of items price * qty, excluding platform fees and delivery charges)
 */
const getVendorRevenueAnalytics = async (storeId, { startDate, endDate } = {}) => {
  const store = await Store.findById(storeId);
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  // Find all delivered orders for this store
  const deliveredOrders = await Order.find({
    store: storeId,
    vendorStatus: "DELIVERED",
  })
    .populate("customer", "name phoneNumber")
    .sort({ deliveredAt: -1, createdAt: -1 });

  const now = new Date();

  // 1. Today Boundaries
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // 2. This Week Boundaries (Monday to Sunday)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7; // Monday is 0
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  // 3. This Month Boundaries (1st of month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  // 4. Custom Range Boundaries (if specified)
  let customStart = null;
  let customEnd = null;
  if (startDate) {
    customStart = new Date(startDate);
    customStart.setHours(0, 0, 0, 0);
  }
  if (endDate) {
    customEnd = new Date(endDate);
    customEnd.setHours(23, 59, 59, 999);
  }

  let totalLifetimeRevenue = 0;
  let totalItemsSold = 0;

  let todayRevenue = 0;
  let todayOrdersCount = 0;

  let thisWeekRevenue = 0;
  let thisWeekOrdersCount = 0;

  let thisMonthRevenue = 0;
  let thisMonthOrdersCount = 0;

  let customRangeRevenue = 0;
  let customRangeOrdersCount = 0;

  // Daily map: key is 'YYYY-MM-DD'
  const dailyMap = {};

  deliveredOrders.forEach((order) => {
    // Pure product sales amount (billing total for merchandise)
    const orderRevenue = Number(order.totalAmount) || order.items.reduce((s, it) => s + ((it.priceAtPurchase || it.price || 0) * (it.quantity || 1)), 0);
    const orderItemsCount = order.items.reduce((s, it) => s + (it.quantity || 1), 0);
    
    // Order date for calendar grouping (deliveredAt preferred, fallback to createdAt)
    const orderDate = new Date(order.deliveredAt || order.createdAt);
    const dateKey = orderDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // Overall Lifetime
    totalLifetimeRevenue += orderRevenue;
    totalItemsSold += orderItemsCount;

    // Today
    if (orderDate >= startOfToday && orderDate <= endOfToday) {
      todayRevenue += orderRevenue;
      todayOrdersCount += 1;
    }

    // This Week
    if (orderDate >= startOfWeek && orderDate <= endOfToday) {
      thisWeekRevenue += orderRevenue;
      thisWeekOrdersCount += 1;
    }

    // This Month
    if (orderDate >= startOfMonth && orderDate <= endOfToday) {
      thisMonthRevenue += orderRevenue;
      thisMonthOrdersCount += 1;
    }

    // Custom Range
    if (customStart && customEnd) {
      if (orderDate >= customStart && orderDate <= customEnd) {
        customRangeRevenue += orderRevenue;
        customRangeOrdersCount += 1;
      }
    } else if (customStart) {
      if (orderDate >= customStart) {
        customRangeRevenue += orderRevenue;
        customRangeOrdersCount += 1;
      }
    } else if (customEnd) {
      if (orderDate <= customEnd) {
        customRangeRevenue += orderRevenue;
        customRangeOrdersCount += 1;
      }
    }

    // Grouping by Date for Calendar & Timeline
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        date: dateKey,
        revenue: 0,
        ordersCount: 0,
        itemsCount: 0,
        orders: [],
      };
    }

    dailyMap[dateKey].revenue += orderRevenue;
    dailyMap[dateKey].ordersCount += 1;
    dailyMap[dateKey].itemsCount += orderItemsCount;
    dailyMap[dateKey].orders.push({
      _id: order._id,
      customerName: order.customer?.name || order.deliveryAddress?.customerName || "Customer",
      totalAmount: orderRevenue,
      deliveredAt: order.deliveredAt || order.createdAt,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        subtotal: item.subtotal,
      })),
    });
  });

  return {
    summary: {
      totalLifetimeRevenue: Number(totalLifetimeRevenue.toFixed(2)),
      totalDeliveredOrders: deliveredOrders.length,
      totalItemsSold,
      todayRevenue: Number(todayRevenue.toFixed(2)),
      todayOrdersCount,
      thisWeekRevenue: Number(thisWeekRevenue.toFixed(2)),
      thisWeekOrdersCount,
      thisMonthRevenue: Number(thisMonthRevenue.toFixed(2)),
      thisMonthOrdersCount,
      customRangeRevenue: (customStart || customEnd) ? Number(customRangeRevenue.toFixed(2)) : null,
      customRangeOrdersCount: (customStart || customEnd) ? customRangeOrdersCount : null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
    dailyBreakdown: Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date)),
    deliveredOrders: deliveredOrders.map((order) => ({
      _id: order._id,
      customerName: order.customer?.name || order.deliveryAddress?.customerName || "Customer",
      totalAmount: Number(order.totalAmount) || 0,
      paymentType: order.paymentType || "COD",
      paymentStatus: order.paymentStatus || "PAID",
      deliveredAt: order.deliveredAt || order.createdAt,
      createdAt: order.createdAt,
      items: order.items,
    })),
  };
};

module.exports = {
  getStoreByOwner,
  getDashboardStats,
  updateStore,
  getVendorRevenueAnalytics,
};
