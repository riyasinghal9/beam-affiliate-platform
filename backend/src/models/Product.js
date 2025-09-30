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
    enum: ['Installation', 'License', 'Service', 'Token', 'Wallet', 'DeFi', 'Other']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String
  },
  externalUrl: {
    type: String,
    trim: true
  },
  externalShopUrl: {
    type: String,
    trim: true
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
  },
  // Additional Beam Wallet specific fields
  beamWalletProductId: {
    type: String,
    trim: true
  },
  productType: {
    type: String,
    enum: ['service', 'license', 'token', 'installation', 'support'],
    default: 'service'
  },
  tags: [{
    type: String,
    trim: true
  }],
  longDescription: {
    type: String
  },
  thumbnailUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for commission amount
productSchema.virtual('commissionAmount').get(function() {
  return (this.price * this.commission) / 100;
});

module.exports = mongoose.model('Product', productSchema); 