const deliveryService = require("../services/delivery.service");

// @desc    Get delivery partner dashboard stats
// @route   GET /api/delivery/dashboard
const getDashboard = async (req, res) => {
  try {
    const stats = await deliveryService.getDashboardStats(req.user._id);
    res.json(stats);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get available orders within 20km radius
// @route   GET /api/delivery/available-orders
const getAvailableOrders = async (req, res) => {
  try {
    const partnerLocation = req.user.location;
    const orders = await deliveryService.getAvailableOrders(partnerLocation);
    res.json({ orders, count: orders.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Accept a delivery (atomic — returns 409 if already taken)
// @route   POST /api/delivery/accept/:orderId
const acceptOrder = async (req, res) => {
  try {
    const order = await deliveryService.acceptDelivery(req.user._id, req.params.orderId);
    const { broadcastOrderUpdate } = require("../lib/socketHelper");
    broadcastOrderUpdate(order, "order:status_updated");
    res.json({ message: "Delivery accepted successfully", order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get active delivery order
// @route   GET /api/delivery/active
const getActiveOrder = async (req, res) => {
  try {
    const order = await deliveryService.getMyActiveOrder(req.user._id);
    res.json({ order: order || null });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update delivery status
// @route   PATCH /api/delivery/orders/:orderId/status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, otp } = req.body;
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }
    const order = await deliveryService.updateDeliveryStatus(req.user._id, req.params.orderId, status, otp);
    const { broadcastOrderUpdate } = require("../lib/socketHelper");
    broadcastOrderUpdate(order, "order:status_updated");
    res.json({ message: `Delivery status updated to ${status}`, order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get completed delivery history
// @route   GET /api/delivery/my-orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await deliveryService.getMyOrderHistory(req.user._id);
    res.json({ orders, count: orders.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
  getAvailableOrders,
  acceptOrder,
  getActiveOrder,
  updateDeliveryStatus,
  getMyOrders,
};
