const express = require('express');
const router = express.Router();

// Import cart routes
const cartRoutes = require('./cart');

// Basic test route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Cart routes
router.use('/cart', cartRoutes);

module.exports = router;
