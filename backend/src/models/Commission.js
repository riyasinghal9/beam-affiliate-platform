const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
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
  saleAmount: {
    type: Number,
    required: true
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  commissionRate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending'
  },
  saleDate: {
    type: Date,
    required: true
  },
  commissionDate: {
    type: Date,
    default: Date.now
  },
  paymentDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  paymentReference: {
    type: String,
    default: ''
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
commissionSchema.index({ resellerId: 1, createdAt: -1 });
commissionSchema.index({ status: 1, createdAt: -1 });
commissionSchema.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model('Commission', commissionSchema); 