const express = require('express');
const router = express.Router();

// Import routes
const cartRoutes = require('./cart');
const authRoutes = require('./auth');
const storeRoutes = require('./store');
const vendorRoutes = require('./vendor');
const orderRoutes = require('./order');
const deliveryRoutes = require('./delivery');
const adminRoutes = require('./admin');

// Basic test route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
router.use('/auth', authRoutes);

// Public store routes
router.use('/stores', storeRoutes);

// Cart routes
router.use('/cart', cartRoutes);

// Customer Order routes
router.use('/orders', orderRoutes);

// Vendor module routes
router.use('/vendor', vendorRoutes);

// Delivery partner routes
router.use('/delivery', deliveryRoutes);

// Admin dashboard routes (Protected by verifyAdmin)
router.use('/admin', adminRoutes);

module.exports = router;
