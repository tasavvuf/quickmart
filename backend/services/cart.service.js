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

  if (!cart.activeStore || cart.items.length === 0) {
    cart.activeStore = product.store;
    cart.items = [{ product: productId, quantity }];
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
  // If cart is empty after removal, clear activeStore
  if (cart.items.length === 0) {
    cart.activeStore = null;
  }

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
  // clear active store when cart is emptied
  cart.activeStore = null;
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

  // If quantity is 1 or less, remove the item instead of erroring
  if (item.quantity <= 1) {
    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    // if cart becomes empty, clear activeStore
    if (cart.items.length === 0) {
      cart.activeStore = null;
    }
    await cart.save();
    const populatedCart = await populateCart(cart);
    return buildResult(true, 'ITEM_REMOVED', 'Item removed from cart', { cart: populatedCart });
  }

  item.quantity -= 1;
  await cart.save();
  const populatedCart = await populateCart(cart);
  // if after decrement items length is zero (shouldn't happen here) clear activeStore
  if (populatedCart.items && populatedCart.items.length === 0) {
    const c = await Cart.findById(populatedCart._id);
    c.activeStore = null;
    await c.save();
    const refreshed = await populateCart(c);
    return buildResult(true, 'SUCCESS', 'Item quantity decreased', { cart: refreshed });
  }

  return buildResult(true, 'SUCCESS', 'Item quantity decreased', { cart: populatedCart });
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

exports.replaceCart = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return buildResult(false, 'CART_NOT_FOUND', 'Cart not found');
  }

  if (!productId) {
    return buildResult(false, 'PRODUCT_ID_REQUIRED', 'Product ID is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    return buildResult(false, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  if (product.stock < 1) {
    return buildResult(false, 'OUT_OF_STOCK', 'Insufficient stock', { availableStock: product.stock });
  }

  cart.activeStore = product.store;
  cart.items = [
    {
      product: productId,
      quantity: 1
    }
  ];

  await cart.save();
  const populatedCart = await populateCart(cart);
  return buildResult(true, 'SUCCESS', 'Cart replaced', { cart: populatedCart });
};
