/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Shopping cart operations (all protected - require authentication)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product:
 *           type: string
 *         quantity:
 *           type: integer
 *       example:
 *         _id: "6a65a546e2e083432315a4e6"
 *         product: "6a65a36a701b4f159a21635a"
 *         quantity: 2
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         activeStore:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *       example:
 *         _id: "6a65a546e2e083432315a4e7"
 *         userId: "6a65a546e2e083432315a4e8"
 *         activeStore: "6a65a546e2e083432315a4e9"
 *         items:
 *           - _id: "6a65a546e2e083432315a4e6"
 *             product: "6a65a36a701b4f159a21635a"
 *             quantity: 2
 */

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     description: Add a new product to the cart. Product must not already exist in cart. All items must be from the same store.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 6a65a36a701b4f159a21635a
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - product already in cart, different store, or out of stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   enum:
 *                     - PRODUCT_ALREADY_IN_CART
 *                     - DIFFERENT_STORE
 *                     - OUT_OF_STOCK
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 */

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6a65a36a701b4f159a21635a
 *         description: Product ID to remove
 *     responses:
 *       200:
 *         description: Item removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item or cart not found
 */

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     description: Remove all items from cart in one operation
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 */

/**
 * @swagger
 * /api/cart/items/{productId}/increase:
 *   post:
 *     summary: Increase item quantity by 1
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6a65a36a701b4f159a21635a
 *     responses:
 *       200:
 *         description: Item quantity increased
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Out of stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /api/cart/items/{productId}/decrease:
 *   post:
 *     summary: Decrease item quantity by 1
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6a65a36a701b4f159a21635a
 *     responses:
 *       200:
 *         description: Item quantity decreased, or item removed if quantity reached zero
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */

/**
 * @swagger
 * /api/cart/items/{productId}/replacecart:
 *   post:
 *     summary: Replace cart with one item
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     description: Replaces the current cart contents with the product from the path parameter. The replacement item quantity is always set to 1.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6a65a36a701b4f159a21635a
 *         description: Product ID to place in the cart
 *     responses:
 *       200:
 *         description: Cart replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Product ID missing or product is out of stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart or product not found
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);//add item
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);
router.post('/items/:productId/increase', cartController.increaseQuantity);
router.post('/items/:productId/decrease', cartController.decreaseQuantity);
router.post('/items/:productId/replacecart', cartController.replaceCart);
router.post('/checkout', cartController.checkout);

module.exports = router;
