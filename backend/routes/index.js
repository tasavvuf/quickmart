const express = require('express');
const router = express.Router();

// Import routes
const cartRoutes = require('./cart');
const authRoutes = require('./auth');

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

// Public product routes
const productRoutes = require('./product');
router.use('/products', productRoutes);

// Cart routes
router.use('/cart', cartRoutes);

module.exports = router;
