const cartService = require('../services/cart.service');

const handleResult = (res, result, successStatus = 200) => {
  if (!result.success) {
    const errorCodeMap = {
      CART_NOT_FOUND: 404,
      PRODUCT_NOT_FOUND: 404,
      ITEM_NOT_FOUND: 404,
      DIFFERENT_STORE: 400,
      PRODUCT_ALREADY_IN_CART: 400,
      OUT_OF_STOCK: 400,
      QUANTITY_INVALID: 400,
      QUANTITY_MINIMUM: 400
    };
    const statusCode = errorCodeMap[result.code] || 400;
    return res.status(statusCode).json(result);
  }

  return res.status(successStatus).json(result);
};

// @desc    Get current cart
// @access  Private
exports.getCart = async (req, res) => {
  const userId = req.user._id;
  const result = await cartService.getCartByUserId(userId);
  return handleResult(res, result);
};

// @desc    Add item to cart
// @access  Private
exports.addItem = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, code: 'PRODUCT_ID_REQUIRED', message: 'Product ID is required' });
  }

  const result = await cartService.addToCart(userId, productId);
  return handleResult(res, result, 201);
};


// @desc    Remove item from cart
// @access  Private
exports.removeItem = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await cartService.removeFromCart(userId, productId);
  return handleResult(res, result);
};

// @desc    Clear entire cart
// @access  Private
exports.clearCart = async (req, res) => {
  const userId = req.user._id;

  const result = await cartService.clearCart(userId);
  return handleResult(res, result);
};

// @desc    Increase item quantity
// @access  Private
exports.increaseQuantity = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await cartService.increaseQuantity(userId, productId);
  return handleResult(res, result);
};

// @desc    Decrease item quantity
// @access  Private
exports.decreaseQuantity = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await cartService.decreaseQuantity(userId, productId);
  return handleResult(res, result);
};

exports.replaceCart = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await cartService.replaceCart(userId, productId);
  return handleResult(res, result);
};
