const cartService = require('../services/cart.service');

// @desc    Get current cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await cartService.getCartByUserId(userId);
    res.json(cart);
  } catch (error) {
    const statusCode = error.message === 'Cart not found' ? 404 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @access  Private
exports.addItem = async (req, res) => {
  try {
    // here we use this to only addTOCart, we don't need to check for quantity cause its 1 by default, and we will check for stock in the service layer
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
    }

    const cart = await cartService.addToCart(userId, productId , 1);
    res.status(201).json(cart);
  } catch (error) {
    const statusCode = error.message.includes('not found') || error.message.includes('Insufficient') || error.message.includes('same store') ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Update item quantity
// @access  Private
exports.updateItemQuantity = async (req, res) => {
  try {
    const { userId } = req.query;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await cartService.updateQuantity(userId, productId, quantity);
    res.json(cart);
  } catch (error) {
    const statusCode = error.message.includes('not found') || error.message.includes('Insufficient') ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @access  Private
exports.removeItem = async (req, res) => {
  try {
    const { userId } = req.query;
    const { productId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await cartService.removeFromCart(userId, productId);
    res.json(cart);
  } catch (error) {
    const statusCode = error.message === 'Cart not found' ? 404 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Clear entire cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await cartService.clearCart(userId);
    res.json(cart);
  } catch (error) {
    const statusCode = error.message === 'Cart not found' ? 404 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Increase item quantity
// @access  Private
exports.increaseQuantity = async (req, res) => {
  try {
    const { userId } = req.query;
    const { productId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await cartService.increaseQuantity(userId, productId);
    res.json(cart);
  } catch (error) {
    const statusCode = error.message.includes('not found') || error.message.includes('Insufficient') ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Decrease item quantity
// @access  Private
exports.decreaseQuantity = async (req, res) => {
  try {
    const { userId } = req.query;
    const { productId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await cartService.decreaseQuantity(userId, productId);
    res.json(cart);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};
