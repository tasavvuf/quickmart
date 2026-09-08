const express = require("express");
const router = express.Router();
const { addToWishlist, getWishlistEntries } = require("../controllers/wishlist.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

// @route   POST /api/wishlist
// @desc    Add out-of-delivery-area user email & location to wishlist
// @access  Public
router.post("/", addToWishlist);

// @route   GET /api/wishlist
// @desc    View all wishlist entries and locations
// @access  Admin only
router.get("/", verifyToken, verifyAdmin, getWishlistEntries);

module.exports = router;
