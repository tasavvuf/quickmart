const Order = require("../models/Order.model");
const Store = require("../models/Store.model");
const User = require("../models/user.model");
const Product = require("../models/Product.model");

/**
 * Aggregates system-wide statistics for Admin Dashboard Overview
 */
const getDashboardOverview = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    totalStores,
    pendingStores,
    totalVendors,
    totalPartners,
    pendingPartners,
    deliveredOrders,
    todaysDeliveredOrders,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Store.countDocuments(),
    Store.countDocuments({ isVerifiedByAdmin: false }),
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "deliveryPartner" }),
    User.countDocuments({ role: "deliveryPartner", "deliveryPartnerProfile.isVerified": false }),
    Order.find({ vendorStatus: "DELIVERED" }),
    Order.find({ vendorStatus: "DELIVERED", deliveredAt: { $gte: startOfToday } }),
    Order.find()
      .populate("customer", "name email phoneNumber")
      .populate("store", "name category")
      .populate("deliveryPartner", "name phoneNumber")
      .sort({ createdAt: -1 })
      .limit(8),
  ]);

  const totalGrossMerchandiseValue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPlatformFees = deliveredOrders.reduce((sum, o) => sum + (o.platformFee || 0), 0);
  const totalDeliveryFees = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const totalCustomerPaidGross = deliveredOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const todayRevenue = todaysDeliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const todayPlatformFees = todaysDeliveredOrders.reduce((sum, o) => sum + (o.platformFee || 0), 0);

  return {
    metrics: {
      totalRevenue: Number(totalCustomerPaidGross.toFixed(2)),
      totalGrossMerchandiseValue: Number(totalGrossMerchandiseValue.toFixed(2)),
      totalPlatformFees: Number(totalPlatformFees.toFixed(2)),
      totalDeliveryFees: Number(totalDeliveryFees.toFixed(2)),
      todayRevenue: Number(todayRevenue.toFixed(2)),
      todayPlatformFees: Number(todayPlatformFees.toFixed(2)),
      totalOrders,
      totalDeliveredOrdersCount: deliveredOrders.length,
      totalStores,
      pendingStores,
      totalVendors,
      totalPartners,
      pendingPartners,
    },
    recentOrders,
  };
};

/**
 * Detailed Platform-wide Revenue Analytics (with calendar, vendor breakdown, custom dates)
 */
const getAdminRevenueAnalytics = async ({ startDate, endDate, storeId } = {}) => {
  const query = { vendorStatus: "DELIVERED" };
  if (storeId) query.store = storeId;

  const deliveredOrders = await Order.find(query)
    .populate("customer", "name phoneNumber email")
    .populate("store", "name category location address")
    .populate("deliveryPartner", "name phoneNumber")
    .sort({ deliveredAt: -1, createdAt: -1 });

  const now = new Date();

  // Boundaries
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

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

  let totalMerchandiseSales = 0;
  let totalPlatformFees = 0;
  let totalDeliveryFees = 0;
  let totalGrossCustomerPaid = 0;
  let totalItemsSold = 0;

  let todaySales = 0;
  let todayPlatformFees = 0;
  let todayOrdersCount = 0;

  let thisWeekSales = 0;
  let thisWeekPlatformFees = 0;
  let thisWeekOrdersCount = 0;

  let thisMonthSales = 0;
  let thisMonthPlatformFees = 0;
  let thisMonthOrdersCount = 0;

  let customSales = 0;
  let customPlatformFees = 0;
  let customOrdersCount = 0;

  const dailyMap = {};
  const storeRevenueMap = {};

  deliveredOrders.forEach((order) => {
    const merchandiseValue = Number(order.totalAmount) || order.items.reduce((s, it) => s + ((it.priceAtPurchase || it.price || 0) * (it.quantity || 1)), 0);
    const platformFee = Number(order.platformFee) || 0;
    const deliveryFee = Number(order.deliveryFee) || 0;
    const grandTotal = Number(order.grandTotal) || (merchandiseValue + platformFee + deliveryFee);
    const itemsCount = order.items.reduce((s, it) => s + (it.quantity || 1), 0);

    const orderDate = new Date(order.deliveredAt || order.createdAt);
    const dateKey = orderDate.toISOString().split("T")[0];

    // Overall Lifetime
    totalMerchandiseSales += merchandiseValue;
    totalPlatformFees += platformFee;
    totalDeliveryFees += deliveryFee;
    totalGrossCustomerPaid += grandTotal;
    totalItemsSold += itemsCount;

    // Today
    if (orderDate >= startOfToday && orderDate <= endOfToday) {
      todaySales += merchandiseValue;
      todayPlatformFees += platformFee;
      todayOrdersCount += 1;
    }

    // This Week
    if (orderDate >= startOfWeek && orderDate <= endOfToday) {
      thisWeekSales += merchandiseValue;
      thisWeekPlatformFees += platformFee;
      thisWeekOrdersCount += 1;
    }

    // This Month
    if (orderDate >= startOfMonth && orderDate <= endOfToday) {
      thisMonthSales += merchandiseValue;
      thisMonthPlatformFees += platformFee;
      thisMonthOrdersCount += 1;
    }

    // Custom Range
    if (customStart && customEnd) {
      if (orderDate >= customStart && orderDate <= customEnd) {
        customSales += merchandiseValue;
        customPlatformFees += platformFee;
        customOrdersCount += 1;
      }
    } else if (customStart) {
      if (orderDate >= customStart) {
        customSales += merchandiseValue;
        customPlatformFees += platformFee;
        customOrdersCount += 1;
      }
    } else if (customEnd) {
      if (orderDate <= customEnd) {
        customSales += merchandiseValue;
        customPlatformFees += platformFee;
        customOrdersCount += 1;
      }
    }

    // Daily Timeline Grouping
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        date: dateKey,
        merchandiseSales: 0,
        platformFees: 0,
        deliveryFees: 0,
        grossTotal: 0,
        ordersCount: 0,
        itemsCount: 0,
      };
    }
    dailyMap[dateKey].merchandiseSales += merchandiseValue;
    dailyMap[dateKey].platformFees += platformFee;
    dailyMap[dateKey].deliveryFees += deliveryFee;
    dailyMap[dateKey].grossTotal += grandTotal;
    dailyMap[dateKey].ordersCount += 1;
    dailyMap[dateKey].itemsCount += itemsCount;

    // Store Leaderboard Grouping
    const sId = String(order.store?._id || "unknown");
    const sName = order.store?.name || "Unknown Store";
    if (!storeRevenueMap[sId]) {
      storeRevenueMap[sId] = {
        storeId: sId,
        storeName: sName,
        merchandiseSales: 0,
        ordersCount: 0,
        itemsSold: 0,
      };
    }
    storeRevenueMap[sId].merchandiseSales += merchandiseValue;
    storeRevenueMap[sId].ordersCount += 1;
    storeRevenueMap[sId].itemsSold += itemsCount;
  });

  return {
    summary: {
      totalMerchandiseSales: Number(totalMerchandiseSales.toFixed(2)),
      totalPlatformFees: Number(totalPlatformFees.toFixed(2)),
      totalDeliveryFees: Number(totalDeliveryFees.toFixed(2)),
      totalGrossCustomerPaid: Number(totalGrossCustomerPaid.toFixed(2)),
      totalDeliveredOrders: deliveredOrders.length,
      totalItemsSold,
      todaySales: Number(todaySales.toFixed(2)),
      todayPlatformFees: Number(todayPlatformFees.toFixed(2)),
      todayOrdersCount,
      thisWeekSales: Number(thisWeekSales.toFixed(2)),
      thisWeekPlatformFees: Number(thisWeekPlatformFees.toFixed(2)),
      thisWeekOrdersCount,
      thisMonthSales: Number(thisMonthSales.toFixed(2)),
      thisMonthPlatformFees: Number(thisMonthPlatformFees.toFixed(2)),
      thisMonthOrdersCount,
      customSales: (customStart || customEnd) ? Number(customSales.toFixed(2)) : null,
      customPlatformFees: (customStart || customEnd) ? Number(customPlatformFees.toFixed(2)) : null,
      customOrdersCount: (customStart || customEnd) ? customOrdersCount : null,
      startDate: startDate || null,
      endDate: endDate || null,
    },
    dailyBreakdown: Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date)),
    storeLeaderboard: Object.values(storeRevenueMap).sort((a, b) => b.merchandiseSales - a.merchandiseSales),
    deliveredOrders: deliveredOrders.map((order) => ({
      _id: order._id,
      store: order.store,
      customer: order.customer,
      deliveryPartner: order.deliveryPartner,
      totalAmount: order.totalAmount,
      platformFee: order.platformFee,
      deliveryFee: order.deliveryFee,
      grandTotal: order.grandTotal,
      paymentType: order.paymentType,
      paymentStatus: order.paymentStatus,
      deliveredAt: order.deliveredAt || order.createdAt,
      createdAt: order.createdAt,
      items: order.items,
    })),
  };
};

/**
 * Fetch all stores with optional approval filter
 */
const getAllStores = async (statusFilter = "ALL") => {
  const query = {};
  if (statusFilter === "PENDING_APPROVAL") {
    query.isVerifiedByAdmin = false;
  } else if (statusFilter === "VERIFIED") {
    query.isVerifiedByAdmin = true;
  }

  return Store.find(query)
    .populate("owner", "name email phoneNumber userName")
    .sort({ createdAt: -1 });
};

/**
 * Verify or Reject a Vendor Store
 */
const verifyStore = async (storeId, isApproved) => {
  const store = await Store.findById(storeId);
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  store.isVerifiedByAdmin = Boolean(isApproved);
  store.isOpen = Boolean(isApproved);
  await store.save();

  return store;
};

/**
 * Fetch all vendor accounts with store details
 */
const getAllVendors = async () => {
  const vendors = await User.find({ role: "vendor" })
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  for (const vendor of vendors) {
    vendor.store = await Store.findOne({ owner: vendor._id });
  }

  return vendors;
};

/**
 * Fetch all delivery partners with UNREDACTED verification documents (Admin Privilege)
 */
const getAllDeliveryPartners = async () => {
  const partners = await User.find({ role: "deliveryPartner" })
    .select("-password")
    .sort({ createdAt: -1 });

  return partners;
};

/**
 * Approve / Verify a Delivery Partner
 */
const verifyDeliveryPartner = async (partnerId, isVerified) => {
  const user = await User.findOne({ _id: partnerId, role: "deliveryPartner" });
  if (!user) {
    const error = new Error("Delivery Partner not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.deliveryPartnerProfile) {
    user.deliveryPartnerProfile = {};
  }

  user.deliveryPartnerProfile.isVerified = Boolean(isVerified);
  await user.save();

  return user;
};

/**
 * Fetch all platform orders across all stores with filters
 */
const getAllPlatformOrders = async (statusFilter = "ALL") => {
  const query = {};
  if (statusFilter !== "ALL") {
    query.$or = [{ vendorStatus: statusFilter }, { deliveryStatus: statusFilter }];
  }

  return Order.find(query)
    .select("+deliveryOtp")
    .populate("customer", "name email phoneNumber profilePhoto")
    .populate("store", "name category address location emergencyContact owner")
    .populate("deliveryPartner", "name phoneNumber deliveryPartnerProfile")
    .populate("items.productId", "name price image category")
    .sort({ createdAt: -1 });
};

/**
 * Admin Cancel Order (Any state before final delivery)
 */
const cancelPlatformOrder = async (orderId, { reason, cancelledBy = "admin" } = {}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.vendorStatus === "DELIVERED" || order.deliveryStatus === "DELIVERED") {
    const error = new Error("Delivered orders cannot be cancelled.");
    error.statusCode = 400;
    throw error;
  }

  if (order.vendorStatus === "CANCELLED" || order.userStatus?.includes("CANCELLED")) {
    const error = new Error("Order is already cancelled.");
    error.statusCode = 400;
    throw error;
  }

  // Restore inventory if items were reserved
  if (["ACCEPTED", "PREPARING", "READY"].includes(order.vendorStatus)) {
    for (const item of order.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }
  }

  // Free assigned delivery partner if any
  if (order.deliveryPartner) {
    await User.findByIdAndUpdate(order.deliveryPartner, {
      $set: {
        "deliveryPartnerProfile.currentOrderId": null,
        "deliveryPartnerProfile.isAvailable": true,
      },
    });
  }

  const cancelReason = reason || `Cancelled by Platform Admin (${cancelledBy})`;

  order.userStatus = "CANCELLED_BY_VENDOR";
  order.vendorStatus = "CANCELLED";
  order.deliveryStatus = "CANCELLED";
  order.paymentStatus = "CANCELLED";
  order.cancelReason = cancelReason;
  order.cancelledAt = new Date();
  order.statusHistory.push({
    status: "CANCELLED_BY_ADMIN",
    updatedBy: cancelledBy || "admin",
    timestamp: new Date(),
    reason: cancelReason,
  });

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .select("+deliveryOtp")
    .populate("customer", "name email phoneNumber")
    .populate("store", "name category address location emergencyContact")
    .populate("deliveryPartner", "name phoneNumber");

  const { broadcastOrderUpdate } = require("../lib/socketHelper");
  broadcastOrderUpdate(populatedOrder, "order:cancelled");
  broadcastOrderUpdate(populatedOrder, "order:status_updated");

  return populatedOrder;
};

/**
 * Admin Reassign / Transfer Delivery Partner for an Order
 */
const reassignDeliveryPartner = async (orderId, newPartnerId, adminName = "admin") => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.vendorStatus === "CANCELLED" || order.vendorStatus === "DELIVERED") {
    const error = new Error(`Cannot reassign partner for ${order.vendorStatus} order.`);
    error.statusCode = 400;
    throw error;
  }

  const newPartner = await User.findOne({ _id: newPartnerId, role: "deliveryPartner" });
  if (!newPartner) {
    const error = new Error("New Delivery Partner account not found.");
    error.statusCode = 404;
    throw error;
  }

  // Release old partner if exists
  const oldPartnerId = order.deliveryPartner ? String(order.deliveryPartner) : null;
  if (oldPartnerId && oldPartnerId !== String(newPartnerId)) {
    await User.findByIdAndUpdate(oldPartnerId, {
      $set: {
        "deliveryPartnerProfile.currentOrderId": null,
        "deliveryPartnerProfile.isAvailable": true,
      },
    });
  }

  // Assign new partner
  await User.findByIdAndUpdate(newPartnerId, {
    $set: {
      "deliveryPartnerProfile.currentOrderId": order._id,
      "deliveryPartnerProfile.isAvailable": false,
    },
  });

  order.deliveryPartner = newPartner._id;
  order.deliveryStatus = "ASSIGNED";
  order.assignedAt = new Date();
  order.statusHistory.push({
    status: `REASSIGNED_TO_${newPartner.name?.toUpperCase() || "PARTNER"}`,
    updatedBy: `admin:${adminName}`,
    timestamp: new Date(),
  });

  await order.save();

  const populatedOrder = await Order.findById(order._id)
    .select("+deliveryOtp")
    .populate("customer", "name email phoneNumber")
    .populate("store", "name category address location emergencyContact")
    .populate("deliveryPartner", "name phoneNumber");

  const { broadcastOrderUpdate } = require("../lib/socketHelper");
  broadcastOrderUpdate(populatedOrder, "order:status_updated");

  return populatedOrder;
};

module.exports = {
  getDashboardOverview,
  getAdminRevenueAnalytics,
  getAllStores,
  verifyStore,
  getAllVendors,
  getAllDeliveryPartners,
  verifyDeliveryPartner,
  getAllPlatformOrders,
  cancelPlatformOrder,
  reassignDeliveryPartner,
};
