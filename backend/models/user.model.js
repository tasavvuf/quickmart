const { default: mongoose } = require("mongoose")

const imageKitFileSchema = {
  url: { type: String, default: "" },
  fileId: { type: String, default: "" },
  name: { type: String, default: "" },
  thumbnailUrl: { type: String, default: "" }
};

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
 location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required: true
        },

        coordinates: {
            type: [Number],
            required: true
        }
    },
    profilePhoto: imageKitFileSchema,
    address: { type: String, default: "Surat, Gujarat, India" },
    addresses: [
      {
        label: { type: String, default: "Home" },
        fullAddress: { type: String, required: true },
        street: { type: String, default: "" },
        area: { type: String, default: "" },
        city: { type: String, default: "Surat" },
        state: { type: String, default: "Gujarat" },
        pincode: { type: String, default: "" },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point"
          },
          coordinates: {
            type: [Number],
            required: true
          }
        },
        isDefault: { type: Boolean, default: false }
      }
    ],
    selectedAddressId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, default: "user", enum: ["user", "admin", "vendor", "deliveryPartner"] },

    // Delivery Partner Profile — only populated when role === "deliveryPartner"
    deliveryPartnerProfile: {
      // Personal Info
      dateOfBirth: { type: String, default: "" },
      emergencyContactName: { type: String, default: "" },
      emergencyContactNumber: { type: String, default: "" },
      currentAddress: {
        street: { type: String, default: "" },
        area: { type: String, default: "" },
        pincode: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        landmark: { type: String, default: "" }
      },
      // Vehicle Info
      vehicleType: { type: String, enum: ["Motorcycle", "Scooter", "Bicycle", "Car", ""], default: "" },
      vehicleNumber: { type: String, default: "" },
      drivingLicenseNumber: { type: String, default: "" },
      vehicleModel: { type: String, default: "" },
      insuranceNumber: { type: String, default: "" },
      // Documents (ImageKit uploads — visible to admin only)
      documents: {
        drivingLicense: imageKitFileSchema,
        vehicleRC: imageKitFileSchema,
        vehicleInsurance: imageKitFileSchema,
        aadhaarCard: imageKitFileSchema,
        panCard: imageKitFileSchema,
        profilePhoto: imageKitFileSchema,
      },
      // Status
      isVerified: { type: Boolean, default: false },
      isAvailable: { type: Boolean, default: true },
      currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    }
  },
  { timestamps: true }
)
userSchema.index({ location: "2dsphere" });
const userModel = mongoose.model("user", userSchema)
module.exports = userModel
