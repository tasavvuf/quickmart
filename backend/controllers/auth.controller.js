const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const { uploadProfilePhoto } = require("../services/imagekit.service.js")

const parseLocation = (location) => {
  if (!location) {
    return { lat: 22.2904, lng: 70.7915 }
  }

  if (typeof location === "string") {
    try {
      return JSON.parse(location)
    } catch {
      return { lat: 22.2904, lng: 70.7915 }
    }
  }

  return location
}

const formatUserResponse = (user) => ({
  _id: user._id,
  userName: user.userName,
  email: user.email,
  location: user.location,
  address: user.address,
  profilePhoto: user.profilePhoto
})

// @desc    Register User
// @access  Public
const regUser = async (req, res) => {
  try {
    const { userName, email, password, location, address } = req.body

    // Validate required fields
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "userName, email, and password are required" })
    }

    // Check if user already exists
    const isExists = await userModel.findOne({ email })
    if (isExists) {
      return res.status(400).json({ message: "user already exists with this email" })
    }

    const user = new userModel({
      userName,
      email,
      password,
      location: parseLocation(location),
      address: address || "Surat, Gujarat, India"
    })

    if (req.file) {
      user.profilePhoto = await uploadProfilePhoto(req.file, user._id)
    }

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Set token in cookies (httpOnly for security)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(201).json({
      message: "user created and token generated in cookies",
      user: formatUserResponse(user),
      token
    })
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message })
  }
}

// @desc    Login User
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, userName, password } = req.body

    // Validate required fields
    if (!password || (!email && !userName)) {
      return res.status(400).json({ message: "email/userName and password are required" })
    }

    // Find user by email or userName
    const user = await userModel.findOne({
      $or: [{ email }, { userName }]
    })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password (plain text for now - consider hashing in production)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({
      message: "Login successful",
      user: formatUserResponse(user),
      token
    })
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message })
  }
}

module.exports = { regUser, loginUser }
