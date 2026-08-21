const express = require("express");
const router = express.Router();
const { verifyToken, verifyVendor } = require("../middleware/auth.middleware");
const { uploadProductImages, uploadStoreMedia } = require("../middleware/upload.middleware");
const vendorController = require("../controllers/vendor.controller");

// Apply verifyToken & verifyVendor middleware to all vendor endpoints
router.use(verifyToken, verifyVendor);

// Vendor Store & Dashboard APIs
router.get("/dashboard", vendorController.getDashboard);
router.get("/store", vendorController.getStore);
router.patch("/store", uploadStoreMedia, vendorController.updateStore);

// Products APIs
router.get("/products", vendorController.getProducts);
router.post("/products", uploadProductImages, vendorController.createProduct);
router.patch("/products/:id", uploadProductImages, vendorController.updateProduct);
router.delete("/products/:id", vendorController.deleteProduct);

// Orders APIs
router.get("/orders", vendorController.getOrders);
router.get("/orders/:id", vendorController.getOrderById);
router.patch("/orders/:id/status", vendorController.updateOrderStatus);

module.exports = router;
