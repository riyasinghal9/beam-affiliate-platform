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
  saleId: {
    type: String,
    required: true
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'paid', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['beam_wallet', 'bank_transfer', 'paypal', 'stripe'],
    default: 'beam_wallet'
  },
  transferId: {
    type: String,
    sparse: true
  },
  paymentProof: {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fileUrl: String,
    fileName: String,
    uploadedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verificationNotes: String
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  productInfo: {
    name: String,
    price: Number,
    category: String
  },
  saleInfo: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    saleDate: Date,
    paymentMethod: String
  },
  fraudScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  isSuspicious: {
    type: Boolean,
    default: false
  },
  fraudReasons: [{
    type: String
  }],
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: [{
    action: {
      type: String,
      enum: ['created', 'pending', 'approved', 'processing', 'paid', 'rejected', 'cancelled', 'proof_uploaded', 'proof_verified']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String
  }],
  scheduledPayoutDate: {
    type: Date
  },
  paidAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: String,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  nextRetryDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
commissionSchema.index({ resellerId: 1, status: 1 });
commissionSchema.index({ status: 1, scheduledPayoutDate: 1 });
commissionSchema.index({ createdAt: -1 });
commissionSchema.index({ 'paymentProof.verificationStatus': 1 });

// Pre-save middleware to add timeline entry
commissionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      action: 'created',
      performedBy: this.resellerId,
      details: 'Commission created for sale'
    });
  }
  
  // Track status changes
  if (this.isModified('status')) {
    this.timeline.push({
      action: this.status,
      performedBy: this.resellerId,
      details: `Commission status changed to ${this.status}`
    });
  }
  
  next();
});

// Instance methods
commissionSchema.methods.approve = function(adminId, notes = '') {
  this.status = 'approved';
  this.timeline.push({
    action: 'approved',
    performedBy: adminId,
    details: notes || 'Commission approved by admin'
  });
  
  if (notes) {
    this.adminNotes.push({
      note: notes,
      addedBy: adminId
    });
  }
};

commissionSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.rejectedAt = new Date();
  this.timeline.push({
    action: 'rejected',
    performedBy: adminId,
    details: reason
  });
  
  this.adminNotes.push({
    note: `Rejected: ${reason}`,
    addedBy: adminId
  });
};

commissionSchema.methods.markAsPaid = function(transferId) {
  this.status = 'paid';
  this.transferId = transferId;
  this.paidAt = new Date();
  this.timeline.push({
    action: 'paid',
    performedBy: this.resellerId,
    details: `Payment completed via ${this.paymentMethod}`
  });
};

commissionSchema.methods.uploadProof = function(userId, fileUrl, fileName) {
  this.paymentProof = {
    uploadedBy: userId,
    fileUrl,
    fileName,
    uploadedAt: new Date(),
    verificationStatus: 'pending'
  };
  
  this.timeline.push({
    action: 'proof_uploaded',
    performedBy: userId,
    details: 'Payment proof uploaded'
  });
};

commissionSchema.methods.verifyProof = function(adminId, status, notes = '') {
  if (this.paymentProof) {
    this.paymentProof.verifiedBy = adminId;
    this.paymentProof.verifiedAt = new Date();
    this.paymentProof.verificationStatus = status;
    this.paymentProof.verificationNotes = notes;
    
    if (status === 'approved') {
      this.status = 'approved';
    } else if (status === 'rejected') {
      this.status = 'rejected';
      this.rejectionReason = notes;
    }
    
    this.timeline.push({
      action: 'proof_verified',
      performedBy: adminId,
      details: `Proof verification: ${status} - ${notes}`
    });
  }
};

commissionSchema.methods.retryPayment = function() {
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    this.nextRetryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    this.status = 'pending';
    
    this.timeline.push({
      action: 'processing',
      performedBy: this.resellerId,
      details: `Payment retry attempt ${this.retryCount}`
    });
  } else {
    this.status = 'cancelled';
    this.timeline.push({
      action: 'cancelled',
      performedBy: this.resellerId,
      details: 'Payment cancelled after max retries'
    });
  }
};

// Static methods
commissionSchema.statics.getPendingCommissions = function() {
  return this.find({
    status: 'pending',
    'paymentProof.verificationStatus': { $ne: 'rejected' }
  }).populate('resellerId', 'firstName lastName email resellerId');
};

commissionSchema.statics.getCommissionsByReseller = function(resellerId, status = null) {
  const query = { resellerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('productId', 'name price category')
    .populate('saleId', 'amount customerName createdAt')
    .sort({ createdAt: -1 });
};

commissionSchema.statics.getCommissionsForPayout = function(minAmount = 10) {
  return this.find({
    status: 'approved',
    commissionAmount: { $gte: minAmount }
  }).populate('resellerId', 'beamWalletId firstName lastName email');
};

commissionSchema.statics.getCommissionStats = function(resellerId = null) {
  const match = resellerId ? { resellerId } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$commissionAmount' }
      }
    }
  ]);
};

// Virtual for formatted amount
commissionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.saleInfo?.currency || 'USD'
  }).format(this.commissionAmount);
});

// Virtual for days since creation
commissionSchema.virtual('daysSinceCreation').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Commission', commissionSchema); 