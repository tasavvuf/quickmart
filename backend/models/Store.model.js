const mongoose = require('mongoose');
// store contains Store

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

  location: {
    type: mongoose.Schema.Types.Mixed,
    required: true
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
  isVerifiedByAdmin: {
    type: Boolean,
    default: false
  },

  rating: {
    type: Number,
    default: 0
  },

  isOpen: {
    type: Boolean,
    default: true
  },

}, {
  timestamps: true
});

module.exports = mongoose.model('Store', StoreSchema);
