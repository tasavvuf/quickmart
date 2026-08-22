const Order = require("../models/Order.model");
const Product = require("../models/Product.model");

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

// @desc    Cancel order by authenticated customer (Allowed until store marks READY)
// @route   PATCH /api/orders/:orderId/cancel
// @access  Private (Customer)
exports.cancelUserOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body || {};

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized",
      });
    }

    // Check if already finished or cancelled
    if (
      order.vendorStatus === "CANCELLED" ||
      order.userStatus === "CANCELLED_BY_USER" ||
      order.userStatus === "CANCELLED_BY_VENDOR" ||
      order.vendorStatus === "REJECTED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Strict Invariant: User can only cancel BEFORE order is set to READY
    const cancellableStatuses = ["PENDING", "ACCEPTED", "PREPARING"];
    if (!cancellableStatuses.includes(order.vendorStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already marked as "${order.vendorStatus}". Once the store marks an order Ready for Delivery, cancellation and denial of payment are strictly prohibited.`,
      });
    }

    // Restore inventory if stock was reserved during ACCEPTED or PREPARING
    if (order.vendorStatus === "ACCEPTED" || order.vendorStatus === "PREPARING") {
      for (const item of order.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    const cancelReason = reason || "Cancelled by customer before store readiness";

    order.userStatus = "CANCELLED_BY_USER";
    order.vendorStatus = "CANCELLED";
    order.deliveryStatus = "CANCELLED";
    order.paymentStatus = "CANCELLED";
    order.cancelReason = cancelReason;
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: "CANCELLED_BY_USER",
      updatedBy: "customer",
      timestamp: new Date(),
      reason: cancelReason,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .select("+deliveryOtp")
      .populate("store", "name storePhoto logo address location emergencyContact")
      .populate("deliveryPartner", "name phoneNumber");

    const { broadcastOrderUpdate } = require("../lib/socketHelper");
    broadcastOrderUpdate(populatedOrder, "order:cancelled");
    broadcastOrderUpdate(populatedOrder, "order:status_updated");

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: populatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel order",
    });
  }
};
