const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

// @route   GET /api/cart
// @desc    Get current cart
// @access  Private
router.get('/', cartController.getCart);

// @route   POST /api/cart/items
// @desc    Add an item to cart
// @access  Private
router.post('/items', cartController.addItem);

// @route   PATCH /api/cart/items/:productId
// @desc    Update item quantity
// @access  Private
router.patch('/items/:productId', cartController.updateItemQuantity);

// @route   DELETE /api/cart/items/:productId
// @desc    Remove one item from cart
// @access  Private
router.delete('/items/:productId', cartController.removeItem);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', cartController.clearCart);

// @route   POST /api/cart/items/:productId/increase
// @desc    Increase item quantity by 1
// @access  Private
router.post('/items/:productId/increase', cartController.increaseQuantity);

// @route   POST /api/cart/items/:productId/decrease
// @desc    Decrease item quantity by 1
// @access  Private
router.post('/items/:productId/decrease', cartController.decreaseQuantity);

module.exports = router;
