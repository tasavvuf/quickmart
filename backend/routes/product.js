const express = require('express');
const { getAllProducts } = require('../controllers/product.controller');
const router = express.Router();

// Public product listing
router.get('/', getAllProducts);

module.exports = router;
