const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  resellerId: {
    type: String,
    required: true,
    index: true
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
  commission: {
    type: Number,
    required: true
  },
  clickId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Click',
    default: null
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'beam', 'bank']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  commissionStatus: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending'
  },
  commissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commission',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
saleSchema.index({ resellerId: 1, timestamp: -1 });
saleSchema.index({ productId: 1, timestamp: -1 });
saleSchema.index({ status: 1, timestamp: -1 });
saleSchema.index({ commissionStatus: 1, timestamp: -1 });

module.exports = mongoose.model('Sale', saleSchema); 