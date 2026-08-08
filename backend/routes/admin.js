const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

// Enforce authentication AND admin role authorization across ALL admin endpoints
router.use(verifyToken);
router.use(verifyAdmin);

// 1. Overview Analytics
router.get("/overview", adminController.getDashboardOverview);

// 2. Store Approvals & Management
router.get("/stores", adminController.getAllStores);
router.patch("/stores/:storeId/verify", adminController.verifyStore);

// 3. Vendor Accounts
router.get("/vendors", adminController.getAllVendors);

// 4. Delivery Partner Verification & Document Viewing
router.get("/delivery-partners", adminController.getAllDeliveryPartners);
router.patch("/delivery-partners/:partnerId/verify", adminController.verifyDeliveryPartner);

// 5. Cross-Store Platform Order Tracking
router.get("/orders", adminController.getAllPlatformOrders);

module.exports = router;
