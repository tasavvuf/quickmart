const { default: mongoose } = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: {
      lat: { type: Number, default: 22.2904 },
      lng: { type: Number, default: 70.7915 }
    },
    profilePhoto: {
      url: { type: String, default: "" },
      fileId: { type: String, default: "" },
      name: { type: String, default: "" },
      thumbnailUrl: { type: String, default: "" }
    },
    address: { type: String, default: "Surat, Gujarat, India" },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

const userModel = mongoose.model("user", userSchema)
module.exports = userModel
