const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
    required: true,
    min: 0
  },
  commission: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['Installation', 'License', 'Service', 'Other']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String
  },
  features: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for commission amount
productSchema.virtual('commissionAmount').get(function() {
  return (this.price * this.commission) / 100;
});

module.exports = mongoose.model('Product', productSchema); 