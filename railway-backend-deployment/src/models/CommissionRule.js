const mongoose = require('mongoose');

const commissionRuleSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  baseCommission: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  bonusCommission: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  minimumSales: {
    type: Number,
    default: 0
  },
  maxCommission: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
commissionRuleSchema.index({ productId: 1 });
commissionRuleSchema.index({ isActive: 1 });

module.exports = mongoose.model('CommissionRule', commissionRuleSchema); 