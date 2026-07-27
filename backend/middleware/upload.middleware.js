const multer = require("multer")

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    return cb(null, true)
  }

  return cb(new Error("Only image files are allowed"))
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: imageFileFilter
})

const uploadProfilePhoto = (req, res, next) => {
  upload.single("profilePhoto")(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: "Profile photo upload failed", error: error.message })
    }

    return res.status(400).json({ message: error.message })
  })
}

module.exports = { uploadProfilePhoto }
