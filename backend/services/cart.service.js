const Cart = require('../models/CartModel.model');
const Product = require('../models/Product.model');
const Store = require('../models/Store.model');

// @desc    Add item to cart
// @access  Private
exports.addToCart = async (userId, productId) => {
    const quantity = 1; // Default quantity to add is 1
       
    try {
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Check stock
        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }

        // Get or create cart
        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            // Create new cart with product's store as active store
            cart = new Cart({
                userId,
                activeStore: product.store,
                items: [{ product: productId, quantity }]
            });
        } else {
            // Check if product belongs to active store
            if (product.store.toString() !== cart.activeStore.toString()) {
                throw new Error('Product must be from the same store as active cart');
            }

            // Check if item already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                // Merge quantity
                cart.items[existingItemIndex].quantity += quantity;
                
                // Check stock again with new quantity
                if (product.stock < cart.items[existingItemIndex].quantity) {
                    throw new Error('Insufficient stock for requested quantity');
                }
            } else {
                // Add new item
                cart.items.push({ product: productId, quantity });
            }
        }

        await cart.save();
        return await Cart.findById(cart._id).populate('activeStore').populate('items.product');
    } catch (error) {
        throw error;
    }
};

// @desc    Remove item from cart
// @access  Private
exports.removeFromCart = async (userId, productId) => {
    try {
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            throw new Error('Cart not found');
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        await cart.save();
        return await Cart.findById(cart._id).populate('activeStore').populate('items.product');
    } catch (error) {
        throw error;
    }
};

// @desc    Clear entire cart
// @access  Private
exports.clearCart = async (userId) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { items: [] },
            { new: true }
        );
        
        if (!cart) {
            throw new Error('Cart not found');
        }

        return await Cart.findById(cart._id).populate('activeStore').populate('items.product');
    } catch (error) {
        throw error;
    }
};

// @desc    Increase quantity of item in cart
// @access  Private
exports.increaseQuantity = async (userId, productId) => {
    try {
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            throw new Error('Cart not found');
        }

        const item = cart.items.find(item => item.product.toString() === productId);
        
        if (!item) {
            throw new Error('Item not found in cart');
        }

        // Check stock
        const product = await Product.findById(productId);
        if (product.stock < item.quantity + 1) {
            throw new Error('Insufficient stock');
        }

        item.quantity += 1;
        
        await cart.save();
        return await Cart.findById(cart._id).populate('activeStore').populate('items.product');
    } catch (error) {
        throw error;
    }
};

// @desc    Decrease quantity of item in cart
// @access  Private
exports.decreaseQuantity = async (userId, productId) => {
    try {
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            throw new Error('Cart not found');
        }

        const item = cart.items.find(item => item.product.toString() === productId);
        
        if (!item) {
            throw new Error('Item not found in cart');
        }

        if (item.quantity <= 1) {
            throw new Error('Cannot decrease quantity below 1. Use remove to delete item.');
        }

        item.quantity -= 1;
        
        await cart.save();
        return await Cart.findById(cart._id).populate('activeStore').populate('items.product');
    } catch (error) {
        throw error;
    }
};

// @desc    Update quantity of item in cart
// @access  Private
exports.updateQuantity = async (userId, productId, quantity) => {
    try {
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            throw new Error('Cart not found');
        }

        const item = cart.items.find(item => item.product.toString() === productId);
        
        if (!item) {
            throw new Error('Item not found in cart');
        }

        if (quantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        // Check stock
        const product = await Product.findById(productId);
        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }

        item.quantity = quantity;
        
        await cart.save();
        return await Cart.findById(cart._id).populate('activeStore').populate('items.product');
    } catch (error) {
        throw error;
    }
};

// @desc    Get cart by user ID
// @access  Private
exports.getCartByUserId = async (userId) => {
    try {
        const cart = await Cart.findOne({ userId }).populate('activeStore').populate('items.product');
        
        if (!cart) {
            throw new Error('Cart not found');
        }

        return cart;
    } catch (error) {
        throw error;
    }
};
