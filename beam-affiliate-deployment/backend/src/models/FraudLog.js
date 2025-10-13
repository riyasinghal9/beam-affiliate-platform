const mongoose = require('mongoose');

const fraudLogSchema = new mongoose.Schema({
  transactionData: {
    resellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    customerData: {
      name: String,
      email: String,
      phone: String
    },
    productData: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number
    },
    amount: Number,
    ip: String,
    userAgent: String,
    timestamp: Date,
    paymentMethod: String
  },
  analysis: {
    fraudScore: {
      type: Number,
      min: 0,
      max: 1
    },
    riskFactors: [String],
    isSuspicious: Boolean,
    recommendations: [String],
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['flagged', 'reviewed', 'approved', 'rejected', 'blocked'],
    default: 'flagged'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  action: {
    type: String,
    enum: ['none', 'blocked', 'flagged', 'approved', 'manual_review'],
    default: 'none'
  },
  resolution: {
    type: String,
    enum: ['pending', 'false_positive', 'confirmed_fraud', 'legitimate'],
    default: 'pending'
  },
  metadata: {
    deviceFingerprint: String,
    geographicLocation: {
      country: String,
      region: String,
      city: String
    },
    velocityData: {
      hourlyAttempts: Number,
      dailyAttempts: Number,
      recentTransactions: Number
    },
    behavioralData: {
      avgOrderValue: Number,
      customerHistory: Number,
      timePattern: String
    }
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  automatedActions: [{
    action: String,
    timestamp: Date,
    details: String
  }],
  manualActions: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    notes: String
  }],
  relatedTransactions: [{
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale'
    },
    similarity: Number
  }],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  }
}, {
  timestamps: true
});

// Indexes for performance
fraudLogSchema.index({ 'transactionData.resellerId': 1, createdAt: -1 });
fraudLogSchema.index({ status: 1, createdAt: -1 });
fraudLogSchema.index({ 'analysis.fraudScore': -1 });
fraudLogSchema.index({ 'transactionData.ip': 1 });
fraudLogSchema.index({ priority: 1, status: 1 });
fraudLogSchema.index({ 'metadata.deviceFingerprint': 1 });

// Pre-save middleware to set priority based on fraud score
fraudLogSchema.pre('save', function(next) {
  if (this.analysis && this.analysis.fraudScore) {
    if (this.analysis.fraudScore >= 0.8) {
      this.priority = 'critical';
      this.riskLevel = 'critical';
    } else if (this.analysis.fraudScore >= 0.6) {
      this.priority = 'high';
      this.riskLevel = 'high';
    } else if (this.analysis.fraudScore >= 0.4) {
      this.priority = 'medium';
      this.riskLevel = 'medium';
    } else {
      this.priority = 'low';
      this.riskLevel = 'low';
    }
  }
  next();
});

// Instance methods
fraudLogSchema.methods.review = function(adminId, status, notes, action) {
  this.status = status;
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  this.action = action;

  this.manualActions.push({
    action: 'reviewed',
    performedBy: adminId,
    timestamp: new Date(),
    notes: notes
  });
};

fraudLogSchema.methods.addAutomatedAction = function(action, details) {
  this.automatedActions.push({
    action,
    timestamp: new Date(),
    details
  });
};

fraudLogSchema.methods.addManualAction = function(action, adminId, notes) {
  this.manualActions.push({
    action,
    performedBy: adminId,
    timestamp: new Date(),
    notes
  });
};

fraudLogSchema.methods.updateResolution = function(resolution) {
  this.resolution = resolution;
  this.status = resolution === 'confirmed_fraud' ? 'rejected' : 'reviewed';
};

// Static methods
fraudLogSchema.statics.getPendingReviews = function(limit = 50) {
  return this.find({ status: 'flagged' })
    .populate('transactionData.resellerId', 'firstName lastName email resellerId')
    .populate('reviewedBy', 'firstName lastName')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit);
};

fraudLogSchema.statics.getFraudStats = function(resellerId = null, startDate = null, endDate = null) {
  const match = {};
  
  if (resellerId) match['transactionData.resellerId'] = resellerId;
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalLogs: { $sum: 1 },
        flaggedLogs: { $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] } },
        confirmedFraud: { $sum: { $cond: [{ $eq: ['$resolution', 'confirmed_fraud'] }, 1, 0] } },
        falsePositives: { $sum: { $cond: [{ $eq: ['$resolution', 'false_positive'] }, 1, 0] } },
        avgFraudScore: { $avg: '$analysis.fraudScore' },
        totalAmount: { $sum: '$transactionData.amount' },
        fraudAmount: {
          $sum: {
            $cond: [
              { $eq: ['$resolution', 'confirmed_fraud'] },
              '$transactionData.amount',
              0
            ]
          }
        }
      }
    }
  ]);
};

fraudLogSchema.statics.getSuspiciousPatterns = function() {
  return this.aggregate([
    { $match: { 'analysis.isSuspicious': true } },
    {
      $group: {
        _id: {
          ip: '$transactionData.ip',
          resellerId: '$transactionData.resellerId',
          riskFactor: '$analysis.riskFactors'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$transactionData.amount' },
        avgFraudScore: { $avg: '$analysis.fraudScore' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
};

fraudLogSchema.statics.getRiskFactors = function() {
  return this.aggregate([
    { $match: { 'analysis.isSuspicious': true } },
    { $unwind: '$analysis.riskFactors' },
    {
      $group: {
        _id: '$analysis.riskFactors',
        count: { $sum: 1 },
        avgFraudScore: { $avg: '$analysis.fraudScore' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Virtual for formatted fraud score
fraudLogSchema.virtual('formattedFraudScore').get(function() {
  return this.analysis ? `${(this.analysis.fraudScore * 100).toFixed(1)}%` : 'N/A';
});

// Virtual for time since creation
fraudLogSchema.virtual('timeSinceCreation').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day(s) ago`;
  if (hours > 0) return `${hours} hour(s) ago`;
  return 'Just now';
});

// Virtual for risk assessment
fraudLogSchema.virtual('riskAssessment').get(function() {
  if (!this.analysis) return 'Unknown';
  
  const score = this.analysis.fraudScore;
  if (score >= 0.8) return 'Critical Risk';
  if (score >= 0.6) return 'High Risk';
  if (score >= 0.4) return 'Medium Risk';
  return 'Low Risk';
});

module.exports = mongoose.model('FraudLog', fraudLogSchema); 