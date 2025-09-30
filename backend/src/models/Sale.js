const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    index: true
  },
  resellerId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  // Sale Information
  saleAmount: {
    type: Number,
    required: true,
    min: 0
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  currency: {
    type: String,
    default: 'USD'
  },
  // Customer Information
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    default: null
  },
  // Payment Information
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'beam_wallet', 'bank_transfer', 'paypal', 'other']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  // Commission Status
  commissionStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  commissionPaidAt: {
    type: Date,
    default: null
  },
  // Admin Approval
  adminApproval: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  conversionTime: {
    type: Number, // Time in milliseconds from click to conversion
    default: null
  },
  // Tracking Information (from original click)
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: null
  },
  // UTM Parameters
  utmSource: {
    type: String,
    default: null
  },
  utmMedium: {
    type: String,
    default: null
  },
  utmCampaign: {
    type: String,
    default: null
  },
  utmTerm: {
    type: String,
    default: null
  },
  utmContent: {
    type: String,
    default: null
  },
  // Device Information
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  isMobile: {
    type: Boolean,
    default: false
  },
  // Geographic Information
  country: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  // Validation and Security
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['automatic', 'manual', 'proof_upload'],
    default: 'automatic'
  },
  proofOfPayment: {
    type: String, // URL to uploaded proof
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  // Fraud Detection
  fraudScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isSuspicious: {
    type: Boolean,
    default: false
  },
  fraudReasons: [{
    type: String
  }],
  // Additional Information
  notes: {
    type: String,
    default: null
  },
  tags: [{
    type: String
  }],
  // Refund Information
  isRefunded: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
saleSchema.index({ resellerId: 1, timestamp: -1 });
saleSchema.index({ productId: 1, timestamp: -1 });
saleSchema.index({ paymentStatus: 1, timestamp: -1 });
saleSchema.index({ commissionStatus: 1, timestamp: -1 });
saleSchema.index({ isVerified: 1, timestamp: -1 });
saleSchema.index({ isSuspicious: 1, timestamp: -1 });

// Virtual for total commission earned
saleSchema.virtual('totalCommissionEarned').get(function() {
  return this.commissionAmount - (this.refundAmount * (this.commissionRate / 100));
});

// Virtual for UTM string
saleSchema.virtual('utmString').get(function() {
  const utmParams = [];
  if (this.utmSource) utmParams.push(`utm_source=${this.utmSource}`);
  if (this.utmMedium) utmParams.push(`utm_medium=${this.utmMedium}`);
  if (this.utmCampaign) utmParams.push(`utm_campaign=${this.utmCampaign}`);
  if (this.utmTerm) utmParams.push(`utm_term=${this.utmTerm}`);
  if (this.utmContent) utmParams.push(`utm_content=${this.utmContent}`);
  return utmParams.join('&');
});

// Method to mark commission as paid
saleSchema.methods.markCommissionAsPaid = function() {
  this.commissionStatus = 'paid';
  this.commissionPaidAt = new Date();
  return this.save();
};

// Method to verify sale
saleSchema.methods.verifySale = function(verifiedBy, method = 'manual') {
  this.isVerified = true;
  this.verificationMethod = method;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  return this.save();
};

// Method to process refund
saleSchema.methods.processRefund = function(amount, reason) {
  this.isRefunded = true;
  this.refundAmount = amount;
  this.refundReason = reason;
  this.refundedAt = new Date();
  return this.save();
};

// Static method to get sales statistics
saleSchema.statics.getSalesStats = function(resellerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        resellerId,
        timestamp: { $gte: startDate, $lte: endDate },
        isVerified: true
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$saleAmount' },
        totalCommission: { $sum: '$commissionAmount' },
        avgOrderValue: { $avg: '$saleAmount' },
        avgCommission: { $avg: '$commissionAmount' }
      }
    }
  ]);
};

// Static method to get conversion rates by source
saleSchema.statics.getConversionRatesBySource = function(resellerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        resellerId,
        timestamp: { $gte: startDate, $lte: endDate },
        isVerified: true
      }
    },
    {
      $group: {
        _id: '$utmSource',
        sales: { $sum: 1 },
        revenue: { $sum: '$saleAmount' },
        commission: { $sum: '$commissionAmount' }
      }
    },
    {
      $sort: { sales: -1 }
    }
  ]);
};

// Static method to get product performance
saleSchema.statics.getProductPerformance = function(resellerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        resellerId,
        timestamp: { $gte: startDate, $lte: endDate },
        isVerified: true
      }
    },
    {
      $group: {
        _id: '$productName',
        sales: { $sum: 1 },
        revenue: { $sum: '$saleAmount' },
        commission: { $sum: '$commissionAmount' },
        avgCommission: { $avg: '$commissionAmount' }
      }
    },
    {
      $sort: { sales: -1 }
    }
  ]);
};

// Static method to get geographic performance
saleSchema.statics.getGeographicPerformance = function(resellerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        resellerId,
        timestamp: { $gte: startDate, $lte: endDate },
        isVerified: true,
        country: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$country',
        sales: { $sum: 1 },
        revenue: { $sum: '$saleAmount' },
        commission: { $sum: '$commissionAmount' }
      }
    },
    {
      $sort: { sales: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

// Static method to get time series data
saleSchema.statics.getTimeSeriesData = function(resellerId, startDate, endDate, interval = 'day') {
  const groupBy = interval === 'hour' ? {
    year: { $year: '$timestamp' },
    month: { $month: '$timestamp' },
    day: { $dayOfMonth: '$timestamp' },
    hour: { $hour: '$timestamp' }
  } : {
    year: { $year: '$timestamp' },
    month: { $month: '$timestamp' },
    day: { $dayOfMonth: '$timestamp' }
  };

  return this.aggregate([
    {
      $match: {
        resellerId,
        timestamp: { $gte: startDate, $lte: endDate },
        isVerified: true
      }
    },
    {
      $group: {
        _id: groupBy,
        sales: { $sum: 1 },
        revenue: { $sum: '$saleAmount' },
        commission: { $sum: '$commissionAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
    }
  ]);
};

// Static method to get pending commissions
saleSchema.statics.getPendingCommissions = function(resellerId) {
  return this.find({
    resellerId,
    commissionStatus: 'pending',
    isVerified: true
  }).sort({ timestamp: -1 });
};

// Static method to get fraud statistics
saleSchema.statics.getFraudStats = function(resellerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        resellerId,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        suspiciousSales: { $sum: { $cond: ['$isSuspicious', 1, 0] } },
        avgFraudScore: { $avg: '$fraudScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('Sale', saleSchema); 