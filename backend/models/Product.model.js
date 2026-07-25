// Product

const { default: mongoose } = require("mongoose");

// store

// name

// description

// price

// stock

// images

// category

// featured

// status


const ProductSchema = new mongoose.Schema({

  store: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Store'
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
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    required: true
  },
  status: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);