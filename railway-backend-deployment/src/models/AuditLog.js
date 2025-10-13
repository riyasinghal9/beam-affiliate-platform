const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  level: {
    type: String,
    required: true,
    enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'],
    default: 'INFO'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  sessionId: {
    type: String,
    default: null
  },
  requestId: {
    type: String,
    default: null
  },
  metadata: {
    timestamp: {
      type: Date,
      default: Date.now
    },
    hash: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [
        'authentication',
        'authorization',
        'data_access',
        'financial',
        'security',
        'system',
        'user_management',
        'training',
        'marketing'
      ],
      default: 'system'
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    source: {
      type: String,
      default: 'api'
    },
    version: {
      type: String,
      default: '1.0'
    },
    environment: {
      type: String,
      default: process.env.NODE_ENV || 'development'
    },
    tags: [{
      type: String
    }],
    correlationId: {
      type: String,
      default: null
    },
    duration: {
      type: Number, // in milliseconds
      default: null
    },
    statusCode: {
      type: Number,
      default: null
    },
    errorCode: {
      type: String,
      default: null
    },
    stackTrace: {
      type: String,
      default: null
    }
  },
  context: {
    url: {
      type: String,
      default: null
    },
    method: {
      type: String,
      default: null
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    params: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  security: {
    encrypted: {
      type: Boolean,
      default: false
    },
    sensitiveDataMasked: {
      type: Boolean,
      default: true
    },
    piiDetected: {
      type: Boolean,
      default: false
    },
    complianceFlags: [{
      type: String,
      enum: ['gdpr', 'pci_dss', 'sox', 'hipaa']
    }]
  },
  performance: {
    responseTime: {
      type: Number, // in milliseconds
      default: null
    },
    memoryUsage: {
      type: Number, // in bytes
      default: null
    },
    cpuUsage: {
      type: Number, // percentage
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for performance and querying
auditLogSchema.index({ 'metadata.timestamp': -1 });
auditLogSchema.index({ userId: 1, 'metadata.timestamp': -1 });
auditLogSchema.index({ level: 1, 'metadata.timestamp': -1 });
auditLogSchema.index({ 'metadata.category': 1, 'metadata.timestamp': -1 });
auditLogSchema.index({ eventType: 1, 'metadata.timestamp': -1 });
auditLogSchema.index({ ipAddress: 1, 'metadata.timestamp': -1 });
auditLogSchema.index({ 'metadata.correlationId': 1 });
auditLogSchema.index({ 'security.complianceFlags': 1 });

// Pre-save middleware to set severity based on level
auditLogSchema.pre('save', function(next) {
  // Set severity based on level
  const severityMap = {
    'DEBUG': 'low',
    'INFO': 'low',
    'WARN': 'medium',
    'ERROR': 'high',
    'CRITICAL': 'critical'
  };
  
  this.metadata.severity = severityMap[this.level] || 'low';
  
  // Detect PII in message and details
  const piiPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/ // Phone
  ];
  
  const messageStr = JSON.stringify(this.message) + JSON.stringify(this.details);
  this.security.piiDetected = piiPatterns.some(pattern => pattern.test(messageStr));
  
  next();
});

// Instance methods
auditLogSchema.methods.isCritical = function() {
  return this.level === 'CRITICAL' || this.level === 'ERROR';
};

auditLogSchema.methods.isSecurityEvent = function() {
  return this.metadata.category === 'security' || this.metadata.category === 'authentication';
};

auditLogSchema.methods.getFormattedTimestamp = function() {
  return this.metadata.timestamp.toISOString();
};

auditLogSchema.methods.getDurationInSeconds = function() {
  return this.metadata.duration ? this.metadata.duration / 1000 : null;
};

// Static methods
auditLogSchema.statics.getRecentEvents = function(limit = 100) {
  return this.find()
    .populate('userId', 'firstName lastName email')
    .sort({ 'metadata.timestamp': -1 })
    .limit(limit);
};

auditLogSchema.statics.getEventsByLevel = function(level, limit = 100) {
  return this.find({ level: level.toUpperCase() })
    .populate('userId', 'firstName lastName email')
    .sort({ 'metadata.timestamp': -1 })
    .limit(limit);
};

auditLogSchema.statics.getSecurityEvents = function(limit = 100) {
  return this.find({
    'metadata.category': { $in: ['security', 'authentication'] }
  })
    .populate('userId', 'firstName lastName email')
    .sort({ 'metadata.timestamp': -1 })
    .limit(limit);
};

auditLogSchema.statics.getUserEvents = function(userId, limit = 100) {
  return this.find({ userId })
    .populate('userId', 'firstName lastName email')
    .sort({ 'metadata.timestamp': -1 })
    .limit(limit);
};

auditLogSchema.statics.getEventsByDateRange = function(startDate, endDate, limit = 1000) {
  return this.find({
    'metadata.timestamp': {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
    .populate('userId', 'firstName lastName email')
    .sort({ 'metadata.timestamp': -1 })
    .limit(limit);
};

auditLogSchema.statics.getPerformanceMetrics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'metadata.timestamp': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        'performance.responseTime': { $exists: true }
      }
    },
    {
      $group: {
        _id: {
          level: '$level',
          category: '$metadata.category'
        },
        avgResponseTime: { $avg: '$performance.responseTime' },
        maxResponseTime: { $max: '$performance.responseTime' },
        minResponseTime: { $min: '$performance.responseTime' },
        count: { $sum: 1 }
      }
    }
  ]);
};

auditLogSchema.statics.getErrorTrends = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        'metadata.timestamp': { $gte: startDate },
        level: { $in: ['ERROR', 'CRITICAL'] }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$metadata.timestamp' } },
          eventType: '$eventType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

auditLogSchema.statics.getComplianceReport = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'metadata.timestamp': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          compliance: '$security.complianceFlags',
          category: '$metadata.category'
        },
        count: { $sum: 1 },
        events: { $push: '$$ROOT' }
      }
    }
  ]);
};

// Virtual for formatted message
auditLogSchema.virtual('formattedMessage').get(function() {
  return `${this.level}: ${this.message}`;
});

// Virtual for time since event
auditLogSchema.virtual('timeSinceEvent').get(function() {
  const now = new Date();
  const diff = now - this.metadata.timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day(s) ago`;
  if (hours > 0) return `${hours} hour(s) ago`;
  if (minutes > 0) return `${minutes} minute(s) ago`;
  return 'Just now';
});

// Virtual for risk level
auditLogSchema.virtual('riskLevel').get(function() {
  if (this.level === 'CRITICAL') return 'high';
  if (this.level === 'ERROR') return 'medium';
  if (this.level === 'WARN') return 'low';
  return 'none';
});

module.exports = mongoose.model('AuditLog', auditLogSchema); 