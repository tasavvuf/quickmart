const Order = require("../models/Order.model");
const User = require("../models/user.model");
const Store = require("../models/Store.model");

const MAX_DELIVERY_RADIUS_KM = 20;

// Haversine formula — returns distance in km between two [lng, lat] coordinate pairs
const haversineDistance = (coords1, coords2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
};

// Delivery status state machine
const DELIVERY_TRANSITIONS = {
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
};

/**
 * Get available orders within 20km of the delivery partner's current location.
 * Returns orders enriched with distanceToStore and storeToCustomerDistance.
 */
const getAvailableOrders = async (partnerLocation) => {
  const partnerCoords = partnerLocation?.coordinates || [70.7915, 22.2904];

  const orders = await Order.find({
    vendorStatus: "READY",
    deliveryStatus: "WAITING",
    deliveryPartner: null,
  })
    .populate("store", "name location address storePhoto")
    .populate("customer", "name phoneNumber")
    .sort({ createdAt: -1 });

  // Filter by distance and enrich with distance data
  const enrichedOrders = [];

  for (const order of orders) {
    if (!order.store?.location?.coordinates) continue;

    const storeCoords = order.store.location.coordinates;
    const distanceToStore = haversineDistance(partnerCoords, storeCoords);

    // Only include orders where the store is within the radius
    if (distanceToStore > MAX_DELIVERY_RADIUS_KM) continue;

    // Compute store-to-customer distance
    const customerCoords = order.deliveryAddress?.location?.coordinates || partnerCoords;
    const storeToCustomerDistance = haversineDistance(storeCoords, customerCoords);

    const orderObj = order.toObject();
    orderObj.distanceToStore = distanceToStore;
    orderObj.storeToCustomerDistance = storeToCustomerDistance;

    enrichedOrders.push(orderObj);
  }

  // Sort by nearest store first
  enrichedOrders.sort((a, b) => a.distanceToStore - b.distanceToStore);

  return enrichedOrders;
};

/**
 * Get the currently active order for a delivery partner (not yet delivered).
 */
const getMyActiveOrder = async (partnerId) => {
  return Order.findOne({
    deliveryPartner: partnerId,
    deliveryStatus: { $in: ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"] },
  })
    .populate("store", "name location address storePhoto emergencyContact")
    .populate("customer", "name phoneNumber profilePhoto");
};

/**
 * Get completed delivery history for a partner.
 */
const getMyOrderHistory = async (partnerId) => {
  return Order.find({
    deliveryPartner: partnerId,
    deliveryStatus: "DELIVERED",
  })
    .populate("store", "name address")
    .populate("customer", "name phoneNumber")
    .sort({ deliveredAt: -1 });
};

/**
 * Atomically accept a delivery — prevents race conditions.
 * Uses findOneAndUpdate with deliveryPartner: null condition.
 */
const acceptDelivery = async (partnerId, orderId) => {
  // First verify partner is available
  const partner = await User.findById(partnerId);
  if (!partner) {
    const error = new Error("Delivery partner not found");
    error.statusCode = 404;
    throw error;
  }

  if (!partner.deliveryPartnerProfile?.isAvailable) {
    const error = new Error("You already have an active delivery. Complete it first.");
    error.statusCode = 400;
    throw error;
  }

  // Atomic acceptance — only succeeds if no one else claimed it
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      deliveryPartner: null,          // CRITICAL: only if no one claimed it yet
      deliveryStatus: "WAITING",
      vendorStatus: "READY",
    },
    {
      $set: {
        deliveryPartner: partnerId,
        deliveryStatus: "ASSIGNED",
        assignedAt: new Date(),
      },
      $push: {
        statusHistory: {
          status: "ASSIGNED",
          updatedBy: "deliveryPartner",
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  )
    .populate("store", "name location address storePhoto emergencyContact")
    .populate("customer", "name phoneNumber profilePhoto");

  if (!order) {
    const error = new Error("Order already accepted by another delivery partner or is no longer available");
    error.statusCode = 409;
    throw error;
  }

  // Update partner availability
  await User.findByIdAndUpdate(partnerId, {
    $set: {
      "deliveryPartnerProfile.isAvailable": false,
      "deliveryPartnerProfile.currentOrderId": orderId,
    },
  });

  return order;
};

/**
 * Update delivery status with state machine validation and OTP verification.
 */
const updateDeliveryStatus = async (partnerId, orderId, newStatus, otp = null) => {
  const order = await Order.findOne({
    _id: orderId,
    deliveryPartner: partnerId,
  }).select("+deliveryOtp");

  if (!order) {
    const error = new Error("Order not found or not assigned to you");
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = order.deliveryStatus;
  const validNext = DELIVERY_TRANSITIONS[currentStatus] || [];

  if (!validNext.includes(newStatus)) {
    const error = new Error(
      `Invalid delivery status transition from ${currentStatus} to ${newStatus}. Allowed: [${validNext.join(", ")}]`
    );
    error.statusCode = 400;
    throw error;
  }

  // Mandatory 4-digit Delivery OTP Verification for completion
  if (newStatus === "DELIVERED") {
    if (!otp || String(otp).trim() !== String(order.deliveryOtp).trim()) {
      const error = new Error("Invalid 4-digit Delivery OTP. Please ask the customer for the correct code.");
      error.statusCode = 400;
      throw error;
    }
  }

  // Update delivery status
  order.deliveryStatus = newStatus;

  // Also sync vendorStatus for the vendor's view
  if (newStatus === "PICKED_UP") {
    order.vendorStatus = "PICKED_UP";
    order.pickedUpAt = new Date();
  } else if (newStatus === "OUT_FOR_DELIVERY") {
    order.vendorStatus = "OUT_FOR_DELIVERY";
  } else if (newStatus === "DELIVERED") {
    order.vendorStatus = "DELIVERED";
    order.deliveredAt = new Date();
    if (order.paymentType === "COD") {
      order.paymentStatus = "PAID";
    }

    // Reset partner availability
    await User.findByIdAndUpdate(partnerId, {
      $set: {
        "deliveryPartnerProfile.isAvailable": true,
        "deliveryPartnerProfile.currentOrderId": null,
      },
    });
  }

  order.statusHistory.push({
    status: newStatus,
    updatedBy: "deliveryPartner",
    timestamp: new Date(),
  });

  await order.save();

  return Order.findById(order._id)
    .populate("store", "name location address storePhoto emergencyContact")
    .populate("customer", "name phoneNumber profilePhoto");
};

/**
 * Get delivery partner dashboard stats.
 */
const getDashboardStats = async (partnerId) => {
  const [totalDeliveries, activeOrder] = await Promise.all([
    Order.countDocuments({ deliveryPartner: partnerId, deliveryStatus: "DELIVERED" }),
    getMyActiveOrder(partnerId),
  ]);

  const partner = await User.findById(partnerId).select("deliveryPartnerProfile.isAvailable deliveryPartnerProfile.isVerified");

  return {
    totalDeliveries,
    activeOrder,
    isAvailable: partner?.deliveryPartnerProfile?.isAvailable ?? true,
    isVerified: partner?.deliveryPartnerProfile?.isVerified ?? false,
  };
};

module.exports = {
  getAvailableOrders,
  getMyActiveOrder,
  getMyOrderHistory,
  acceptDelivery,
  updateDeliveryStatus,
  getDashboardStats,
  haversineDistance,
};
