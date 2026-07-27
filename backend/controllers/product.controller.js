const Product = require('../models/Product.model');
require('../models/Store.model');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('store');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load products', error: error.message });
  }
};

module.exports = { getAllProducts };
