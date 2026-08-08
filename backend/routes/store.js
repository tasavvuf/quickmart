/**
 * @swagger
 * tags:
 *   - name: Stores
 *     description: Store listing and browsing
 */

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get nearby open stores with featured products
 *     tags: [Stores]
 *     description: Retrieve open and admin-verified stores within 10km of the provided coordinates along with their active featured products. Public endpoint - no authentication required.
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: User's current latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: User's current longitude
 *     responses:
 *       200:
 *         description: List of nearby stores with products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *       400:
 *         description: Missing or invalid coordinates
 *         content:
 *           application/json:
 *             example:
 *               message: "Latitude and Longitude are required"
 *       500:
 *         description: Server error
 */

const express = require('express');
const { getAllStores, getStoreById } = require('../controllers/store.controller');
const router = express.Router();

router.get('/', getAllStores);
router.get('/:storeId', getStoreById);

module.exports = router;
