const Cart = require('../models/CartModel.model');
const Product = require('../models/Product.model');

const buildResult = (success, code, message, extra = {}) => ({
  success,
  code,
  message,
  ...extra
});

const populateCart = async (cart) => {
  return await Cart.findById(cart._id).populate('activeStore').populate('items.product');
};

// @desc    Add item to cart
// @access  Private
exports.addToCart = async (userId, productId) => {
  const quantity = 1;

  const product = await Product.findById(productId);
  if (!product) {
    return buildResult(false, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  if (product.stock < quantity) {
    return buildResult(false, 'OUT_OF_STOCK', 'Insufficient stock', { availableStock: product.stock });
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      activeStore: product.store,
      items: [{ product: productId, quantity }]
    });

    await cart.save();
    const populatedCart = await populateCart(cart);
    return buildResult(true, 'SUCCESS', 'Item added to cart', { cart: populatedCart });
  }

  if (product.store.toString() !== cart.activeStore.toString()) {
    return buildResult(false, 'DIFFERENT_STORE', 'Cart contains items from another store.');
  }

  const existingItem = cart.items.find(
    item => item.product.toString() === productId
  );

  if (existingItem) {
    return buildResult(false, 'PRODUCT_ALREADY_IN_CART', 'Product is already in the cart. Update quantity instead.');
  }

  cart.items.push({ product: productId, quantity });
  await cart.save();
  const populatedCart = await populateCart(cart);
  return buildResult(true, 'SUCCESS', 'Item added to cart', { cart: populatedCart });
};

// @desc    Remove item from cart
// @access  Private
exports.removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return buildResult(false, 'CART_NOT_FOUND', 'Cart not found');
  }

  const existingItem = cart.items.find(item => item.product.toString() === productId);
  if (!existingItem) {
    return buildResult(false, 'ITEM_NOT_FOUND', 'Item not found in cart');
  }

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  const populatedCart = await populateCart(cart);
  return buildResult(true, 'SUCCESS', 'Item removed from cart', { cart: populatedCart });
};

// @desc    Clear entire cart
// @access  Private
exports.clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return buildResult(false, 'CART_NOT_FOUND', 'Cart not found');
  }

  cart.items = [];
  await cart.save();
  const populatedCart = await populateCart(cart);
  return buildResult(true, 'SUCCESS', 'Cart cleared', { cart: populatedCart });
};

// @desc    Increase quantity of item in cart
// @access  Private
exports.increaseQuantity = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return buildResult(false, 'CART_NOT_FOUND', 'Cart not found');
  }

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) {
    return buildResult(false, 'ITEM_NOT_FOUND', 'Item not found in cart');
  }

  const product = await Product.findById(productId);
  if (!product) {
    return buildResult(false, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  if (product.stock < item.quantity + 1) {
    return buildResult(false, 'OUT_OF_STOCK', 'Insufficient stock', { availableStock: product.stock });
  }

  item.quantity += 1;
  await cart.save();
  const populatedCart = await populateCart(cart);
  return buildResult(true, 'SUCCESS', 'Item quantity increased', { cart: populatedCart });
};

// @desc    Decrease quantity of item in cart
// @access  Private
exports.decreaseQuantity = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return buildResult(false, 'CART_NOT_FOUND', 'Cart not found');
  }

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) {
    return buildResult(false, 'ITEM_NOT_FOUND', 'Item not found in cart');
  }

  if (item.quantity <= 1) {
    return buildResult(false, 'QUANTITY_MINIMUM', 'Cannot decrease quantity below 1. Use remove to delete item.');
  }

  item.quantity -= 1;
  await cart.save();
  const populatedCart = await populateCart(cart);
  return buildResult(true, 'SUCCESS', 'Item quantity decreased', { cart: populatedCart });
};

// @desc    Update quantity of item in cart
// @access  Private
exports.updateQuantity = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return buildResult(false, 'CART_NOT_FOUND', 'Cart not found');
  }

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) {
    return buildResult(false, 'ITEM_NOT_FOUND', 'Item not found in cart');
  }

  if (quantity < 1) {
    return buildResult(false, 'QUANTITY_INVALID', 'Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    return buildResult(false, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  if (product.stock < quantity) {
    return buildResult(false, 'OUT_OF_STOCK', 'Insufficient stock', { availableStock: product.stock });
  }

  item.quantity = quantity;
  await cart.save();
  const populatedCart = await populateCart(cart);
  return buildResult(true, 'SUCCESS', 'Item quantity updated', { cart: populatedCart });
};

// @desc    Get cart by user ID
// @access  Private
exports.getCartByUserId = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('activeStore').populate('items.product');

  if (!cart) {
    return buildResult(false, 'CART_NOT_FOUND', 'Cart not found');
  }

  return buildResult(true, 'SUCCESS', 'Cart loaded', { cart });
};
