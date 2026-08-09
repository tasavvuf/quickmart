const Order = require("../models/Order.model");

// @desc    Get all orders for authenticated customer
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .select("+deliveryOtp")
      .populate("store", "name storePhoto logo address location emergencyContact")
      .populate("deliveryPartner", "name phoneNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

// @desc    Get single order details for tracking
// @route   GET /api/orders/:orderId
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.user._id,
    })
      .select("+deliveryOtp")
      .populate("store", "name storePhoto logo address location emergencyContact")
      .populate("deliveryPartner", "name phoneNumber");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order details",
    });
  }
};
