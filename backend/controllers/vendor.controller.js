const vendorService = require("../services/vendor.service");
const productService = require("../services/product.service");
const orderService = require("../services/order.service");
const {
  uploadProductImage,
  uploadStoreLogo,
  uploadStoreBanner,
  uploadStorePhoto,
} = require("../services/imagekit.service");

// Helper to extract store for current authenticated user
const getStoreForUser = async (req) => {
  return vendorService.getStoreByOwner(req.user._id);
};

const processUploadedProductImages = async (req, storeId) => {
  const uploadedUrls = [];

  const imageFiles = [];
  if (req.files) {
    if (Array.isArray(req.files.images)) imageFiles.push(...req.files.images);
    if (Array.isArray(req.files.image)) imageFiles.push(...req.files.image);
  } else if (req.file) {
    imageFiles.push(req.file);
  }

  for (const file of imageFiles) {
    const uploaded = await uploadProductImage(file, storeId);
    if (uploaded?.url) {
      uploadedUrls.push(uploaded.url);
    }
  }

  let existingImages = [];
  if (req.body.images) {
    if (Array.isArray(req.body.images)) {
      existingImages = req.body.images;
    } else if (typeof req.body.images === "string") {
      try {
        const parsed = JSON.parse(req.body.images);
        existingImages = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        existingImages = [req.body.images];
      }
    }
  } else if (req.body.imageUrl) {
    existingImages = [req.body.imageUrl];
  }

  return [...uploadedUrls, ...existingImages].filter(Boolean);
};

const getDashboard = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const stats = await vendorService.getDashboardStats(store._id);
    res.status(200).json({ success: true, ...stats });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard data",
    });
  }
};

const getStore = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    res.status(200).json({ success: true, store });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch store details",
    });
  }
};

const updateStore = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const updateData = { ...req.body };

    // Handle uploaded logo
    if (req.files?.logo?.[0]) {
      const uploadedLogo = await uploadStoreLogo(req.files.logo[0], store._id);
      if (uploadedLogo?.url) updateData.logo = uploadedLogo.url;
    }

    // Handle uploaded banner
    if (req.files?.banner?.[0]) {
      const uploadedBanner = await uploadStoreBanner(req.files.banner[0], store._id);
      if (uploadedBanner?.url) updateData.banner = uploadedBanner.url;
    }

    // Handle uploaded storePhoto
    if (req.files?.storePhoto?.[0]) {
      const uploadedPhoto = await uploadStorePhoto(req.files.storePhoto[0], store._id);
      if (uploadedPhoto) updateData.storePhoto = uploadedPhoto;
    }

    // Parse stringified JSON fields if sent via FormData
    if (typeof updateData.address === "string") {
      try {
        updateData.address = JSON.parse(updateData.address);
      } catch (e) {}
    }
    if (typeof updateData.openingHours === "string") {
      try {
        updateData.openingHours = JSON.parse(updateData.openingHours);
      } catch (e) {}
    }
    if (typeof updateData.categories === "string") {
      try {
        updateData.categories = JSON.parse(updateData.categories);
      } catch (e) {}
    }

    const updatedStore = await vendorService.updateStore(store._id, updateData);
    res.status(200).json({ success: true, store: updatedStore });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update store details",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const products = await productService.getVendorProducts(store._id, req.query);
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const images = await processUploadedProductImages(req, store._id);

    const productPayload = {
      name: req.body.name,
      description: req.body.description || "",
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      images,
      featured: req.body.featured === true || req.body.featured === "true",
      status: req.body.status || "active",
    };

    const product = await productService.createProduct(store._id, productPayload);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const updatePayload = { ...req.body };

    const images = await processUploadedProductImages(req, store._id);
    if (images.length > 0 || req.files?.images || req.files?.image) {
      updatePayload.images = images;
    }

    if (updatePayload.price !== undefined) updatePayload.price = Number(updatePayload.price);
    if (updatePayload.stock !== undefined) updatePayload.stock = Number(updatePayload.stock);
    if (updatePayload.featured !== undefined) {
      updatePayload.featured = updatePayload.featured === true || updatePayload.featured === "true";
    }

    const product = await productService.updateProduct(
      store._id,
      req.params.id,
      updatePayload
    );
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const product = await productService.deleteProduct(store._id, req.params.id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const orders = await orderService.getVendorOrders(store._id, req.query);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const order = await orderService.getOrderById(store._id, req.params.id);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch order details",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status field is required",
      });
    }

    const order = await orderService.updateOrderStatus(
      store._id,
      req.params.id,
      status,
      req.user?.name || "vendor"
    );

    const { broadcastOrderUpdate } = require("../lib/socketHelper");
    broadcastOrderUpdate(order);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const { startDate, endDate } = req.query;
    const analytics = await vendorService.getVendorRevenueAnalytics(store._id, {
      startDate,
      endDate,
    });
    res.status(200).json({ success: true, ...analytics });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch revenue analytics",
    });
  }
};

module.exports = {
  getDashboard,
  getStore,
  updateStore,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getRevenueAnalytics,
};
