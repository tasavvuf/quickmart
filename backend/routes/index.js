const express = require('express');
const router = express.Router();

// Import routes
const cartRoutes = require('./cart');
const authRoutes = require('./auth');
const storeRoutes = require('./store');
const vendorRoutes = require('./vendor');

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

// Vendor module routes
router.use('/vendor', vendorRoutes);

module.exports = router;
