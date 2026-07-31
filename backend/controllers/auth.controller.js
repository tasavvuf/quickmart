const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const {
  uploadProfilePhoto,
  uploadStorePhoto
} = require("../services/imagekit.service.js")
const {
  createStoreForVendor,
  parseStorePayload,
  validateVendorStorePayload
} = require("./store.controller.js")

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
  name: user.name,
  phoneNumber: user.phoneNumber,
  email: user.email,
  location: user.location,
  address: user.address,
  profilePhoto: user.profilePhoto,
  role: user.role
})

const PUBLIC_AUTH_ROLES = ["user", "vendor"]

const normalizeAuthRole = (role = "user") => {
  const normalizedRole = String(role || "user").trim().toLowerCase()
  return PUBLIC_AUTH_ROLES.includes(normalizedRole) ? normalizedRole : null
}

const getRoleMismatchMessage = (actualRole, requestedRole) => {
  if (requestedRole === "vendor" && actualRole !== "vendor") {
    return "Only vendor accounts can login from the vendor login page"
  }

  if (requestedRole === "user" && actualRole === "vendor") {
    return "Vendor accounts cannot login from the user login page"
  }

  return `This login page is only for ${requestedRole} accounts`
}

// @desc    Register User
// @access  Public
const regUser = async (req, res) => {
  try {
    const { userName, name, phoneNumber, email, password, location, address, role } = req.body
    const requestedRole = normalizeAuthRole(role)

    // Validate required fields
    if (!userName || !name || !phoneNumber || !email || !password) {
      return res.status(400).json({ message: "name, phoneNumber, userName, email, and password are required" })
    }

    if (!requestedRole) {
      return res.status(400).json({ message: "Role must be either user or vendor" })
    }

    if (requestedRole === "vendor") {
      const storeValidationMessage = validateVendorStorePayload(parseStorePayload(req.body.store))

      if (storeValidationMessage) {
        return res.status(400).json({ message: storeValidationMessage })
      }
    }

    // Check if user already exists
    const isExists = await userModel.findOne({ email })
    if (isExists) {
      return res.status(400).json({ message: "user already exists with this email" })
    }

    const parsedLocation = parseLocation(location)
    const user = new userModel({
      userName,
      name,
      phoneNumber,
      email,
      password,
      role: requestedRole,
      location: parsedLocation,
      address: address || "Surat, Gujarat, India"
    })

    const profilePhotoFile = req.files?.profilePhoto?.[0]
    const storePhotoFile = req.files?.storePhoto?.[0]

    if (requestedRole === "user" && profilePhotoFile) {
      user.profilePhoto = await uploadProfilePhoto(profilePhotoFile, user._id)
    }

    await user.save()

    const storePhoto = requestedRole === "vendor"
      ? await uploadStorePhoto(storePhotoFile, user._id)
      : null

    const store = requestedRole === "vendor"
      ? await createStoreForVendor({
          user,
          store: req.body.store,
          userLocation: parsedLocation,
          storePhoto
        })
      : null

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
      store,
      token
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Registration failed",
      error: error.message
    })
  }
}

// @desc    Login User
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, userName, password, role } = req.body
    const requestedRole = normalizeAuthRole(role)

    // Validate required fields
    if (!password || (!email && !userName)) {
      return res.status(400).json({ message: "email/userName and password are required" })
    }

    if (!requestedRole) {
      return res.status(400).json({ message: "Role must be either user or vendor" })
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

    if (user.role !== requestedRole) {
      return res.status(403).json({
        message: getRoleMismatchMessage(user.role, requestedRole)
      })
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
