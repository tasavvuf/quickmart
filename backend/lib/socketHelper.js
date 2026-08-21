let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

/**
 * Broadcasts order status changes to Customer, Vendor, Delivery Partner, and Admin rooms in real-time.
 */
const broadcastOrderUpdate = (order, eventType = "order:status_updated") => {
  if (!ioInstance || !order) return;

  const orderId = String(order._id || order.id);
  const storeId = order.store ? String(order.store._id || order.store) : null;
  const partnerId = order.deliveryPartner ? String(order.deliveryPartner._id || order.deliveryPartner) : null;

  const payload = {
    orderId,
    vendorStatus: order.vendorStatus,
    deliveryStatus: order.deliveryStatus,
    paymentStatus: order.paymentStatus,
    eventType,
    updatedAt: new Date(),
    order,
  };

  // 1. Order Room (Customer & Rider tracking page)
  ioInstance.to(`order:${orderId}`).emit(eventType, payload);

  // 2. Vendor Store Room
  if (storeId) {
    ioInstance.to(`store:${storeId}`).emit(eventType, payload);
    if (order.vendorStatus === "PENDING") {
      ioInstance.to(`store:${storeId}`).emit("order:new_placed", payload);
    }
  }

  // 3. Delivery Partner Personal Room
  if (partnerId) {
    ioInstance.to(`partner:${partnerId}`).emit(eventType, payload);
  }

  // 4. Delivery Pool (When vendor sets READY & status is WAITING, or remove if REJECTED/CANCELLED)
  if (order.vendorStatus === "READY" && order.deliveryStatus === "WAITING") {
    ioInstance.to("delivery:available").emit("order:available_new", payload);
  } else if (
    order.vendorStatus === "REJECTED" ||
    order.vendorStatus === "CANCELLED" ||
    order.deliveryStatus === "CANCELLED" ||
    order.userStatus === "CANCELLED_BY_USER" ||
    order.userStatus === "CANCELLED_BY_VENDOR"
  ) {
    ioInstance.to("delivery:available").emit("order:removed", { orderId, order });
    ioInstance.to("delivery:available").emit("order:status_updated", payload);
  }

  // 5. Admin Dashboard Room
  ioInstance.to("admin:dashboard").emit(eventType, payload);
};

module.exports = {
  setIO,
  getIO,
  broadcastOrderUpdate,
};
