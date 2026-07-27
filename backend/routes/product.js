/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product listing and browsing
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all available products
 *     tags: [Products]
 *     description: Retrieve all products from all stores. Public endpoint - no authentication required. Perfect for browsing available items before login.
 *     responses:
 *       200:
 *         description: List of all products with store details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Product'
 *                   - type: object
 *                     properties:
 *                       store:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           category:
 *                             type: string
 *                           rating:
 *                             type: number
 *       500:
 *         description: Server error
 */

const express = require('express');
const { getAllProducts } = require('../controllers/product.controller');
const router = express.Router();

router.get('/', getAllProducts);

module.exports = router;
