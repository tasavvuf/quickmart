/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User registration, login, and authentication
 */

/**
 * @swagger
 * /api/auth/reg:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 22.2904
 *                   lng:
 *                     type: number
 *                     example: 70.7915
 *               address:
 *                 type: string
 *                 example: Surat, Gujarat
 *     responses:
 *       201:
 *         description: User registered successfully with token in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "user created and token generated in cookies"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: User already exists or missing required fields
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user with email or username
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               userName:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 example: password123
 *             description: Provide either email or userName, plus password
 *     responses:
 *       200:
 *         description: Login successful with token in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     summary: Verify user token (protected route)
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token verified successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token missing or invalid
 */

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout user (clears token cookie)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 */

const express = require("express")
const authController = require("../controllers/auth.controller.js")
const { verifyToken } = require("../middleware/auth.middleware.js")
const router = express.Router()

router.post("/reg", authController.regUser)
router.post("/login", authController.loginUser)

router.get("/test", verifyToken, async (req, res) => {
  res.json({
    message: "Token verified successfully",
    user: req.user
  })
})

router.get("/logout", (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logged out successfully" })
})

module.exports = router
