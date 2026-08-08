const Order = require("../models/Order.model");
const Store = require("../models/Store.model");
const User = require("../models/user.model");

/**
 * Aggregates system-wide statistics for Admin Dashboard Overview
 */
const getDashboardOverview = async () => {
  const [
    totalOrders,
    totalStores,
    pendingStores,
    totalVendors,
    totalPartners,
    pendingPartners,
    revenueAgg,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Store.countDocuments(),
    Store.countDocuments({ isVerifiedByAdmin: false }),
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "deliveryPartner" }),
    User.countDocuments({ role: "deliveryPartner", "deliveryPartnerProfile.isVerified": false }),
    Order.aggregate([
      { $match: { vendorStatus: { $ne: "REJECTED" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$grandTotal" } } },
    ]),
    Order.find()
      .populate("customer", "name email phoneNumber")
      .populate("store", "name category")
      .populate("deliveryPartner", "name phoneNumber")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

  return {
    metrics: {
      totalRevenue,
      totalOrders,
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
    .populate("customer", "name email phoneNumber")
    .populate("store", "name address emergencyContact")
    .populate("deliveryPartner", "name phoneNumber")
    .sort({ createdAt: -1 });
};

module.exports = {
  getDashboardOverview,
  getAllStores,
  verifyStore,
  getAllVendors,
  getAllDeliveryPartners,
  verifyDeliveryPartner,
  getAllPlatformOrders,
};
