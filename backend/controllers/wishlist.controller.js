const Wishlist = require("../models/Wishlist.model");

/**
 * @desc Add user email and location coordinates to out-of-delivery-area wishlist
 * @route POST /api/wishlist
 * @access Public
 */
const addToWishlist = async (req, res) => {
  try {
    const { email, lat, lng } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const updateDoc = {
      email: cleanEmail,
    };

    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      updateDoc.location = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)], // GeoJSON convention: [longitude, latitude]
      };
    }

    // Upsert so if the user re-enters their email, it refreshes their location coordinates
    const entry = await Wishlist.findOneAndUpdate(
      { email: cleanEmail },
      { $set: updateDoc },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: "You've been added to our area expansion wishlist! We'll notify you when we launch nearby.",
      wishlist: entry,
    });
  } catch (error) {
    console.error("Wishlist addition error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc Get all wishlist entries for Admin inspection
 * @route GET /api/wishlist
 * @access Admin only
 */
const getWishlistEntries = async (req, res) => {
  try {
    const wishlist = await Wishlist.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist entries",
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlistEntries,
};
