const mongoose = require('mongoose');
// store contains Store

const StoreSchema = new mongoose.Schema({

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  banner: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true
  },

  isOpen: {
    type: Boolean,
    required: true
  },

}, {
  timestamps: true
});

module.exports = mongoose.model('Store', StoreSchema);