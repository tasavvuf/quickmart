const express = require("express")
const authController = require("../controllers/auth.controller.js")
const { verifyToken } = require("../middleware/auth.middleware.js")
const router = express.Router()

// Public routes
router.post("/reg", authController.regUser)
router.post("/login", authController.loginUser)

// Protected routes
router.get("/test", verifyToken, async (req, res) => {
  res.json({
    message: "Token verified successfully",
    user: req.user
  })
})

// Logout route (clears cookie)
router.get("/logout", (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logged out successfully" })
})

module.exports = router
