const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  resellerId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: ''
  },
  utmSource: {
    type: String,
    default: ''
  },
  utmMedium: {
    type: String,
    default: ''
  },
  utmCampaign: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  converted: {
    type: Boolean,
    default: false
  },
  conversionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
clickSchema.index({ resellerId: 1, timestamp: -1 });
clickSchema.index({ productId: 1, timestamp: -1 });
clickSchema.index({ ipAddress: 1, timestamp: -1 });

module.exports = mongoose.model('Click', clickSchema); 