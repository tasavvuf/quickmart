const express = require("express");
const router = express.Router();
const { verifyToken, verifyDeliveryPartner } = require("../middleware/auth.middleware");
const deliveryController = require("../controllers/delivery.controller");

// All delivery routes require authentication + deliveryPartner role
router.use(verifyToken, verifyDeliveryPartner);

// Dashboard & Stats
router.get("/dashboard", deliveryController.getDashboard);

// Available orders (geo-filtered within 20km)
router.get("/available-orders", deliveryController.getAvailableOrders);

// Active delivery
router.get("/active", deliveryController.getActiveOrder);

// Accept a delivery (atomic)
router.post("/accept/:orderId", deliveryController.acceptOrder);

// Update delivery status
router.patch("/orders/:orderId/status", deliveryController.updateDeliveryStatus);

// Completed delivery history
router.get("/my-orders", deliveryController.getMyOrders);

module.exports = router;
