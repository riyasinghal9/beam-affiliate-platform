const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  resellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['direct', 'social', 'email', 'website', 'referral', 'other'],
    default: 'direct'
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  referrer: {
    type: String
  },
  utmSource: {
    type: String
  },
  utmMedium: {
    type: String
  },
  utmCampaign: {
    type: String
  },
  utmTerm: {
    type: String
  },
  utmContent: {
    type: String
  },
  converted: {
    type: Boolean,
    default: false
  },
  conversionDate: {
    type: Date
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale'
  },
  fraudScore: {
    type: Number,
    default: 0
  },
  isSuspicious: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for performance
clickSchema.index({ resellerId: 1, createdAt: -1 });
clickSchema.index({ productId: 1, createdAt: -1 });
clickSchema.index({ ip: 1, createdAt: -1 });
clickSchema.index({ converted: 1 });

// Calculate fraud score
clickSchema.methods.calculateFraudScore = function() {
  let score = 0;
  
  // Check for suspicious patterns
  if (this.ip) {
    // Add logic for IP-based fraud detection
    score += 0;
  }
  
  if (this.userAgent) {
    // Add logic for user agent analysis
    score += 0;
  }
  
  this.fraudScore = score;
  this.isSuspicious = score > 0.7;
  
  return score;
};

// Mark as converted
clickSchema.methods.markAsConverted = function(saleId) {
  this.converted = true;
  this.conversionDate = new Date();
  this.saleId = saleId;
};

module.exports = mongoose.model('Click', clickSchema); 