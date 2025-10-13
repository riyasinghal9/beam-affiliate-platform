const mongoose = require('mongoose');

const paymentFailureSchema = new mongoose.Schema({
  resellerId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  error: {
    type: String,
    required: true
  },
  errorCode: {
    type: String,
    default: null
  },
  errorDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['beam_wallet', 'stripe', 'bank_transfer', 'other'],
    default: 'beam_wallet'
  },
  retryCount: {
    type: Number,
    default: 0
  },
  lastRetryAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending_retry', 'failed', 'resolved', 'manual_review'],
    default: 'failed'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolutionNotes: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentFailureSchema.index({ resellerId: 1, timestamp: -1 });
paymentFailureSchema.index({ status: 1, timestamp: -1 });
paymentFailureSchema.index({ paymentMethod: 1, timestamp: -1 });

// Virtual for formatted error message
paymentFailureSchema.virtual('formattedError').get(function() {
  return `${this.error}${this.errorCode ? ` (Code: ${this.errorCode})` : ''}`;
});

// Static method to get failure statistics
paymentFailureSchema.statics.getFailureStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          status: '$status',
          paymentMethod: '$paymentMethod'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get failures by reseller
paymentFailureSchema.statics.getFailuresByReseller = function(resellerId, limit = 20) {
  return this.find({ resellerId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('resolvedBy', 'firstName lastName email');
};

// Static method to get pending retries
paymentFailureSchema.statics.getPendingRetries = function() {
  return this.find({ 
    status: 'pending_retry',
    retryCount: { $lt: 3 }
  }).sort({ timestamp: 1 });
};

// Instance method to retry payment
paymentFailureSchema.methods.retryPayment = async function() {
  if (this.retryCount >= 3) {
    this.status = 'manual_review';
    await this.save();
    return { success: false, error: 'Max retries exceeded' };
  }

  this.retryCount += 1;
  this.lastRetryAt = new Date();
  this.status = 'pending_retry';
  await this.save();

  // Here you would implement the actual retry logic
  // For now, we'll just update the status
  return { success: true, retryCount: this.retryCount };
};

module.exports = mongoose.model('PaymentFailure', paymentFailureSchema); 