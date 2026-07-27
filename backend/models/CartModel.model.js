const { default: mongoose } = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  activeStore: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Store'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    }
  }]
});

module.exports = mongoose.model('Cart', CartSchema);
