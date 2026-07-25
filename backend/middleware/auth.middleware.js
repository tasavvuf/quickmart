const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model.js")

// @desc    Middleware to verify JWT token from cookies
// @access  Private
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ message: "token cookie is missing" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "user not found" })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: "token is not verified", error: error.message })
  }
}

module.exports = { verifyToken }
