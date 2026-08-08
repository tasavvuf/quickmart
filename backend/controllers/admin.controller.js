const adminService = require("../services/admin.service");

// @desc    Get Admin Dashboard Overview Analytics
// @route   GET /api/admin/overview
// @access  Private (Admin only)
const getDashboardOverview = async (req, res) => {
  try {
    const data = await adminService.getDashboardOverview();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Stores (with optional status filter)
// @route   GET /api/admin/stores
// @access  Private (Admin only)
const getAllStores = async (req, res) => {
  try {
    const { status } = req.query;
    const stores = await adminService.getAllStores(status);
    res.status(200).json({ success: true, stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify or Reject Store Approval
// @route   PATCH /api/admin/stores/:storeId/verify
// @access  Private (Admin only)
const verifyStore = async (req, res) => {
  try {
    const { isApproved } = req.body;
    if (isApproved === undefined) {
      return res.status(400).json({ success: false, message: "isApproved parameter is required" });
    }
    const store = await adminService.verifyStore(req.params.storeId, isApproved);
    res.status(200).json({
      success: true,
      message: `Store ${isApproved ? "approved and activated" : "rejected"} successfully`,
      store,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Registered Vendors
// @route   GET /api/admin/vendors
// @access  Private (Admin only)
const getAllVendors = async (req, res) => {
  try {
    const vendors = await adminService.getAllVendors();
    res.status(200).json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Delivery Partners with Verification Documents
// @route   GET /api/admin/delivery-partners
// @access  Private (Admin only)
const getAllDeliveryPartners = async (req, res) => {
  try {
    const partners = await adminService.getAllDeliveryPartners();
    res.status(200).json({ success: true, partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / Verify Delivery Partner
// @route   PATCH /api/admin/delivery-partners/:partnerId/verify
// @access  Private (Admin only)
const verifyDeliveryPartner = async (req, res) => {
  try {
    const { isVerified } = req.body;
    if (isVerified === undefined) {
      return res.status(400).json({ success: false, message: "isVerified parameter is required" });
    }
    const user = await adminService.verifyDeliveryPartner(req.params.partnerId, isVerified);
    res.status(200).json({
      success: true,
      message: `Delivery partner ${isVerified ? "verified" : "unverified"} successfully`,
      user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Platform Orders Across Stores
// @route   GET /api/admin/orders
// @access  Private (Admin only)
const getAllPlatformOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const orders = await adminService.getAllPlatformOrders(status);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardOverview,
  getAllStores,
  verifyStore,
  getAllVendors,
  getAllDeliveryPartners,
  verifyDeliveryPartner,
  getAllPlatformOrders,
};
