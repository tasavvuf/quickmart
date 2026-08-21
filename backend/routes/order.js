const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const orderController = require("../controllers/order.controller");

// Apply verifyToken to all customer order routes
router.use(verifyToken);

router.get("/", orderController.getUserOrders);
router.get("/:orderId", orderController.getOrderById);
router.patch("/:orderId/cancel", orderController.cancelUserOrder);
router.post("/:orderId/cancel", orderController.cancelUserOrder);

module.exports = router;
