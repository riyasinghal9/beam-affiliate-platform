const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  resellerId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'approved', 'rejected', 'refunded'],
    default: 'pending'
  },
  adminApproval: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  approvedBy: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  commissionStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Generate payment ID
paymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    this.paymentId = 'PAY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema); 