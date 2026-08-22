/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Administrative management endpoints (requires role === "admin")
 */

/**
 * @swagger
 * /api/admin/overview:
 *   get:
 *     summary: Get platform analytics overview
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Overview KPIs and recent orders
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/admin/stores:
 *   get:
 *     summary: Get store approval roster
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ALL, PENDING_APPROVAL, VERIFIED]
 *     responses:
 *       200:
 *         description: List of vendor stores
 */

/**
 * @swagger
 * /api/admin/stores/{storeId}/verify:
 *   patch:
 *     summary: Approve or revoke store registration
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Store approval updated
 */

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get registered vendors roster
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of vendor user accounts
 */

/**
 * @swagger
 * /api/admin/delivery-partners:
 *   get:
 *     summary: Get delivery partner fleet with verification documents
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of delivery partners with unredacted document URLs
 */

/**
 * @swagger
 * /api/admin/delivery-partners/{partnerId}/verify:
 *   patch:
 *     summary: Approve or revoke delivery partner verification
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVerified
 *             properties:
 *               isVerified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Delivery partner verification updated
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get cross-store platform order stream
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ALL, PENDING, ACCEPTED, PREPARING, READY, DELIVERED, REJECTED]
 *     responses:
 *       200:
 *         description: List of platform orders populated with customer, store location/phone, rider, and OTP details
 */

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

// Enforce authentication AND admin role authorization across ALL admin endpoints
router.use(verifyToken);
router.use(verifyAdmin);

// 1. Overview Analytics & Revenue
router.get("/overview", adminController.getDashboardOverview);
router.get("/revenue", adminController.getRevenueAnalytics);

// 2. Store Approvals & Management
router.get("/stores", adminController.getAllStores);
router.patch("/stores/:storeId/verify", adminController.verifyStore);

// 3. Vendor Accounts
router.get("/vendors", adminController.getAllVendors);

// 4. Delivery Partner Verification & Document Viewing
router.get("/delivery-partners", adminController.getAllDeliveryPartners);
router.patch("/delivery-partners/:partnerId/verify", adminController.verifyDeliveryPartner);

// 5. Cross-Store Platform Order Tracking & Administration
router.get("/orders", adminController.getAllPlatformOrders);
router.patch("/orders/:orderId/cancel", adminController.cancelOrder);
router.patch("/orders/:orderId/reassign-partner", adminController.reassignDeliveryPartner);

module.exports = router;
