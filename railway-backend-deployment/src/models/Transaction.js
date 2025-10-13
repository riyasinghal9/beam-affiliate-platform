const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  resellerId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  commissionPercentage: {
    type: Number,
    required: true
  },
  commissionAmount: {
    type: Number,
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
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Stripe', 'BeamPay', 'IBAN', 'Manual']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  commissionStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  paymentProof: {
    type: String
  },
  transactionId: {
    type: String,
    unique: true
  },
  customerIp: {
    type: String
  },
  customerDevice: {
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
  notes: {
    type: String
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema); 