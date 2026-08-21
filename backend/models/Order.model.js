const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        productImage: {
          type: String,
          default: "",
        },
        priceAtPurchase: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    userStatus: {
      type: String,
      enum: ["ACTIVE", "CANCELLED_BY_USER", "CANCELLED_BY_VENDOR"],
      default: "ACTIVE",
    },
    vendorStatus: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "PREPARING", "READY", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    deliveryStatus: {
      type: String,
      enum: ["WAITING", "ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "WAITING",
    },
    cancelReason: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
    },
    deliveryAddress: {
      street: { type: String, default: "" },
      area: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      fullAddress: { type: String, required: true },
      customerName: { type: String, required: true },
      phone: { type: String, required: true },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },
        coordinates: {
          type: [Number],
          default: [70.7915, 22.2904]
        }
      }
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedBy: { type: String, default: "system" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    acceptedAt: { type: Date },
    assignedAt: { type: Date },
    preparedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    // 4-digit delivery verification OTP (hidden by default via select: false)
    deliveryOtp: { type: String, select: false },
    // Real-time live delivery partner GPS location
    liveDeliveryLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

OrderSchema.index({ "liveDeliveryLocation.coordinates": "2dsphere" });

module.exports = mongoose.model("Order", OrderSchema);
