const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model.js");

// @desc    Middleware to verify JWT token from cookies or Authorization header
// @access  Private
const verifyToken = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.cookies?.accessToken;

    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.slice(7).trim();
      } else {
        token = req.headers.authorization.trim();
      }
    }

    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};

// @desc    Middleware to verify that authenticated user has vendor role
// @access  Private (Vendor only)
const verifyVendor = (req, res, next) => {
  if (!req.user || req.user.role !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Vendor privileges required. Access restricted to vendor accounts.",
    });
  }
  next();
};

// @desc    Middleware to verify that authenticated user has deliveryPartner role
// @access  Private (Delivery Partner only)
const verifyDeliveryPartner = (req, res, next) => {
  if (!req.user || req.user.role !== "deliveryPartner") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Delivery Partner privileges required.",
    });
  }
  next();
};

// @desc    Middleware to verify that authenticated user has admin role
// @access  Private (Admin only)
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin privileges required. Access restricted to administrator accounts.",
    });
  }
  next();
};

module.exports = { verifyToken, verifyVendor, verifyDeliveryPartner, verifyAdmin };
