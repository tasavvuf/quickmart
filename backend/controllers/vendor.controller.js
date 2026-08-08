const vendorService = require("../services/vendor.service");
const productService = require("../services/product.service");
const orderService = require("../services/order.service");

// Helper to extract store for current authenticated user
const getStoreForUser = async (req) => {
  return vendorService.getStoreByOwner(req.user._id);
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
    const updatedStore = await vendorService.updateStore(store._id, req.body);
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
    const product = await productService.createProduct(store._id, req.body);
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
    const product = await productService.updateProduct(
      store._id,
      req.params.id,
      req.body
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

const triggerSimulator = async (req, res) => {
  try {
    const store = await getStoreForUser(req);
    const count = Math.min(Number(req.body.count) || 1, 5);
    const orders = [];

    for (let i = 0; i < count; i++) {
      const order = await orderService.generateFakeOrder(store._id);
      orders.push(order);
    }

    res.status(201).json({
      success: true,
      message: `Generated ${orders.length} fake order(s)`,
      orders,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to generate fake order",
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
  triggerSimulator,
};
