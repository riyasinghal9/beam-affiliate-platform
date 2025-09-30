const mongoose = require('mongoose');

const dataRequestLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    required: true,
    enum: [
      'RIGHT_TO_BE_FORGOTTEN',
      'DATA_PORTABILITY',
      'DATA_ACCESS',
      'DATA_RECTIFICATION',
      'CONSENT_UPDATE',
      'CONSENT_WITHDRAWAL',
      'DATA_RESTRICTION',
      'OBJECTION_TO_PROCESSING'
    ]
  },
  details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    requestId: String,
    processingTime: Number, // in milliseconds
    dataSize: Number, // in bytes
    affectedRecords: Number
  },
  compliance: {
    gdprArticle: {
      type: String,
      enum: ['15', '16', '17', '18', '20', '21'],
      required: true
    },
    responseDeadline: {
      type: Date,
      required: true
    },
    extensionRequested: {
      type: Boolean,
      default: false
    },
    extensionReason: String,
    verificationRequired: {
      type: Boolean,
      default: false
    },
    verificationMethod: {
      type: String,
      enum: ['email', 'phone', 'id_document', 'other'],
      default: null
    }
  },
  audit: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewNotes: String,
    complianceCheck: {
      type: Boolean,
      default: false
    },
    complianceNotes: String
  }
}, {
  timestamps: true
});

// Indexes for performance and compliance
dataRequestLogSchema.index({ userId: 1, timestamp: -1 });
dataRequestLogSchema.index({ requestType: 1, status: 1 });
dataRequestLogSchema.index({ timestamp: 1 });
dataRequestLogSchema.index({ 'compliance.responseDeadline': 1 });
dataRequestLogSchema.index({ status: 1, timestamp: -1 });

// Pre-save middleware to set response deadline
dataRequestLogSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set response deadline based on GDPR requirements
    const deadline = new Date(this.timestamp);
    
    switch (this.requestType) {
      case 'DATA_ACCESS':
      case 'DATA_PORTABILITY':
        deadline.setDate(deadline.getDate() + 30); // 30 days
        break;
      case 'DATA_RECTIFICATION':
        deadline.setDate(deadline.getDate() + 30); // 30 days
        break;
      case 'RIGHT_TO_BE_FORGOTTEN':
        deadline.setDate(deadline.getDate() + 30); // 30 days
        break;
      case 'CONSENT_UPDATE':
        deadline.setDate(deadline.getDate() + 7); // 7 days
        break;
      default:
        deadline.setDate(deadline.getDate() + 30); // Default 30 days
    }
    
    this.compliance.responseDeadline = deadline;
  }
  next();
});

// Instance methods
dataRequestLogSchema.methods.markAsCompleted = function(processedBy, responseData = null) {
  this.status = 'completed';
  this.processedAt = new Date();
  this.processedBy = processedBy;
  this.responseData = responseData;
  
  if (this.metadata.processingTime === null) {
    this.metadata.processingTime = Date.now() - this.timestamp.getTime();
  }
};

dataRequestLogSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.processedAt = new Date();
  this.errorMessage = errorMessage;
};

dataRequestLogSchema.methods.requestExtension = function(reason) {
  this.compliance.extensionRequested = true;
  this.compliance.extensionReason = reason;
  this.compliance.responseDeadline.setDate(this.compliance.responseDeadline.getDate() + 60); // 60 day extension
};

dataRequestLogSchema.methods.isOverdue = function() {
  return new Date() > this.compliance.responseDeadline && this.status !== 'completed';
};

dataRequestLogSchema.methods.daysUntilDeadline = function() {
  const now = new Date();
  const deadline = this.compliance.responseDeadline;
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Static methods
dataRequestLogSchema.statics.getPendingRequests = function() {
  return this.find({ status: 'pending' })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: 1 });
};

dataRequestLogSchema.statics.getOverdueRequests = function() {
  return this.find({
    status: { $ne: 'completed' },
    'compliance.responseDeadline': { $lt: new Date() }
  })
    .populate('userId', 'firstName lastName email')
    .sort({ 'compliance.responseDeadline': 1 });
};

dataRequestLogSchema.statics.getRequestsByType = function(requestType, limit = 100) {
  return this.find({ requestType })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

dataRequestLogSchema.statics.getUserRequestHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

dataRequestLogSchema.statics.getComplianceStats = function(startDate = null, endDate = null) {
  const match = {};
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          requestType: '$requestType',
          status: '$status'
        },
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$metadata.processingTime' }
      }
    },
    {
      $group: {
        _id: '$_id.requestType',
        totalRequests: { $sum: '$count' },
        completedRequests: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', 'completed'] }, '$count', 0]
          }
        },
        avgProcessingTime: { $avg: '$avgProcessingTime' }
      }
    }
  ]);
};

dataRequestLogSchema.statics.getOverdueStats = function() {
  return this.aggregate([
    {
      $match: {
        status: { $ne: 'completed' },
        'compliance.responseDeadline': { $lt: new Date() }
      }
    },
    {
      $group: {
        _id: '$requestType',
        overdueCount: { $sum: 1 },
        avgDaysOverdue: {
          $avg: {
            $divide: [
              { $subtract: [new Date(), '$compliance.responseDeadline'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);
};

// Virtual for formatted deadline
dataRequestLogSchema.virtual('formattedDeadline').get(function() {
  return this.compliance.responseDeadline.toLocaleDateString();
});

// Virtual for request urgency
dataRequestLogSchema.virtual('urgency').get(function() {
  const daysUntilDeadline = this.daysUntilDeadline();
  
  if (daysUntilDeadline < 0) return 'overdue';
  if (daysUntilDeadline <= 3) return 'urgent';
  if (daysUntilDeadline <= 7) return 'high';
  if (daysUntilDeadline <= 14) return 'medium';
  return 'low';
});

// Virtual for GDPR article reference
dataRequestLogSchema.virtual('gdprArticleReference').get(function() {
  const articleMap = {
    'RIGHT_TO_BE_FORGOTTEN': 'Article 17',
    'DATA_PORTABILITY': 'Article 20',
    'DATA_ACCESS': 'Article 15',
    'DATA_RECTIFICATION': 'Article 16',
    'CONSENT_UPDATE': 'Article 7',
    'DATA_RESTRICTION': 'Article 18',
    'OBJECTION_TO_PROCESSING': 'Article 21'
  };
  
  return articleMap[this.requestType] || 'N/A';
});

module.exports = mongoose.model('DataRequestLog', dataRequestLogSchema); 