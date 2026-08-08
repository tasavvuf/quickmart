const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  storePhoto: {
    url: { type: String, default: "" },
    fileId: { type: String, default: "" },
    name: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" }
  },
  category: {
    type: String,
    required: true
  },
  categories: {
    type: [String],
    default: []
  },
  openingHours: {
    open: { type: String, default: '09:00 AM' },
    close: { type: String, default: '09:00 PM' }
  },
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
  address: {
    street: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    landmark: { type: String, default: '', trim: true }
  },
  gstNumber: {
    type: String,
    default: '',
    trim: true
  },
  emergencyContact: {
    type: String,
    default: '',
    trim: true
  },
  contactPhone: {
    type: String,
    default: '',
    trim: true
  },
  isVerifiedByAdmin: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  isOpen: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

StoreSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Store', StoreSchema);
