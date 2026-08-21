const multer = require("multer")

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    return cb(null, true)
  }

  return cb(new Error("Only image files are allowed"))
}

const documentFileFilter = (req, file, cb) => {
  if (file.mimetype && (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf")) {
    return cb(null, true)
  }

  return cb(new Error("Only image and PDF files are allowed"))
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: imageFileFilter
})

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: documentFileFilter
})

const uploadProfilePhoto = (req, res, next) => {
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "storePhoto", maxCount: 1 }
  ])(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: "Image upload failed", error: error.message })
    }

    return res.status(400).json({ message: error.message })
  })
}

const uploadDeliveryDocuments = (req, res, next) => {
  documentUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
    { name: "vehicleRC", maxCount: 1 },
    { name: "vehicleInsurance", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
  ])(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: "Document upload failed", error: error.message })
    }

    return res.status(400).json({ message: error.message })
  })
}

const uploadProductImages = (req, res, next) => {
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "image", maxCount: 1 },
  ])(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: "Product image upload failed", error: error.message })
    }

    return res.status(400).json({ success: false, message: error.message })
  })
}

const uploadStoreMedia = (req, res, next) => {
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "storePhoto", maxCount: 1 },
  ])(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: "Store media upload failed", error: error.message })
    }

    return res.status(400).json({ success: false, message: error.message })
  })
}

module.exports = {
  uploadProfilePhoto,
  uploadDeliveryDocuments,
  uploadProductImages,
  uploadStoreMedia,
}
