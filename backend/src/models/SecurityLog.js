const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      // Authentication events
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      '2FA_ENABLED',
      '2FA_DISABLED',
      '2FA_VERIFIED',
      '2FA_FAILED',
      
      // Session events
      'SESSION_CREATED',
      'SESSION_INVALIDATED',
      'SESSION_EXPIRED',
      'ALL_SESSIONS_INVALIDATED',
      
      // Account events
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      'ACCOUNT_SUSPENDED',
      'ACCOUNT_DELETED',
      
      // Security events
      'SUSPICIOUS_ACTIVITY',
      'THREAT_DETECTED',
      'FRAUD_DETECTED',
      'ACCESS_DENIED',
      'PERMISSION_CHANGED',
      'RATE_LIMIT_EXCEEDED',
      
      // Data events
      'DATA_ACCESS',
      'DATA_EXPORT',
      'DATA_DELETION',
      'GDPR_REQUEST',
      
      // System events
      'SYSTEM_BREACH',
      'MALWARE_DETECTED',
      'VULNERABILITY_FOUND',
      'SECURITY_PATCH_APPLIED'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: String,
    os: String,
    fingerprint: String
  },
  session: {
    sessionId: String,
    isNewSession: Boolean,
    sessionAge: Number // in milliseconds
  },
  risk: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    factors: [{
      factor: String,
      weight: Number,
      description: String
    }],
    threshold: {
      type: Number,
      default: 50
    }
  },
  response: {
    action: {
      type: String,
      enum: [
        'none',
        'alert',
        'block',
        'lock_account',
        'require_2fa',
        'flag_for_review',
        'notify_admin'
      ],
      default: 'none'
    },
    automated: {
      type: Boolean,
      default: false
    },
    executedAt: {
      type: Date,
      default: null
    },
    notes: String
  },
  investigation: {
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'false_positive'],
      default: 'open'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolution: String,
    tags: [String]
  },
  metadata: {
    correlationId: String,
    requestId: String,
    source: {
      type: String,
      enum: ['api', 'web', 'mobile', 'system'],
      default: 'api'
    },
    version: String,
    environment: {
      type: String,
      default: process.env.NODE_ENV || 'development'
    },
    tags: [String],
    relatedEvents: [{
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SecurityLog'
      },
      relationship: String
    }]
  }
}, {
  timestamps: true
});

// Indexes for performance and querying
securityLogSchema.index({ timestamp: -1 });
securityLogSchema.index({ userId: 1, timestamp: -1 });
securityLogSchema.index({ eventType: 1, timestamp: -1 });
securityLogSchema.index({ severity: 1, timestamp: -1 });
securityLogSchema.index({ ipAddress: 1, timestamp: -1 });
securityLogSchema.index({ 'investigation.status': 1 });
securityLogSchema.index({ 'risk.score': -1 });
securityLogSchema.index({ 'metadata.correlationId': 1 });

// Pre-save middleware
securityLogSchema.pre('save', function(next) {
  // Set severity based on event type if not provided
  if (!this.severity || this.severity === 'low') {
    this.severity = this.getSeverityFromEventType();
  }
  
  // Calculate risk score if not provided
  if (!this.risk.score || this.risk.score === 0) {
    this.risk.score = this.calculateRiskScore();
  }
  
  // Set default response action based on severity
  if (!this.response.action || this.response.action === 'none') {
    this.response.action = this.getDefaultResponseAction();
  }
  
  next();
});

// Instance methods
securityLogSchema.methods.getSeverityFromEventType = function() {
  const severityMap = {
    'LOGIN_SUCCESS': 'low',
    'LOGIN_FAILED': 'medium',
    '2FA_FAILED': 'high',
    'ACCOUNT_LOCKED': 'high',
    'SUSPICIOUS_ACTIVITY': 'medium',
    'THREAT_DETECTED': 'high',
    'FRAUD_DETECTED': 'critical',
    'SYSTEM_BREACH': 'critical',
    'MALWARE_DETECTED': 'critical'
  };
  
  return severityMap[this.eventType] || 'low';
};

securityLogSchema.methods.calculateRiskScore = function() {
  let score = 0;
  
  // Base score from event type
  const baseScores = {
    'LOGIN_SUCCESS': 0,
    'LOGIN_FAILED': 25,
    '2FA_FAILED': 50,
    'ACCOUNT_LOCKED': 75,
    'SUSPICIOUS_ACTIVITY': 40,
    'THREAT_DETECTED': 60,
    'FRAUD_DETECTED': 90,
    'SYSTEM_BREACH': 100
  };
  
  score += baseScores[this.eventType] || 0;
  
  // Add risk factors
  if (this.risk.factors) {
    this.risk.factors.forEach(factor => {
      score += factor.weight || 0;
    });
  }
  
  // Geographic risk
  if (this.location && this.location.country) {
    const highRiskCountries = ['XX', 'YY', 'ZZ']; // Add actual high-risk countries
    if (highRiskCountries.includes(this.location.country)) {
      score += 20;
    }
  }
  
  // Time-based risk
  const hour = this.timestamp.getHours();
  if (hour >= 2 && hour <= 6) {
    score += 15; // Unusual hours
  }
  
  return Math.min(score, 100);
};

securityLogSchema.methods.getDefaultResponseAction = function() {
  const actionMap = {
    'low': 'none',
    'medium': 'alert',
    'high': 'flag_for_review',
    'critical': 'block'
  };
  
  return actionMap[this.severity] || 'none';
};

securityLogSchema.methods.requiresInvestigation = function() {
  return this.severity === 'high' || this.severity === 'critical' || this.risk.score > 70;
};

securityLogSchema.methods.isResolved = function() {
  return this.investigation.status === 'resolved';
};

securityLogSchema.methods.assignInvestigation = function(adminId) {
  this.investigation.status = 'investigating';
  this.investigation.assignedTo = adminId;
  this.investigation.assignedAt = new Date();
};

securityLogSchema.methods.resolveInvestigation = function(resolution, status = 'resolved') {
  this.investigation.status = status;
  this.investigation.resolution = resolution;
  this.investigation.resolvedAt = new Date();
};

// Static methods
securityLogSchema.statics.getRecentEvents = function(limit = 100) {
  return this.find()
    .populate('userId', 'firstName lastName email')
    .populate('investigation.assignedTo', 'firstName lastName')
    .sort({ timestamp: -1 })
    .limit(limit);
};

securityLogSchema.statics.getEventsBySeverity = function(severity, limit = 100) {
  return this.find({ severity: severity.toUpperCase() })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

securityLogSchema.statics.getHighRiskEvents = function(limit = 50) {
  return this.find({
    $or: [
      { severity: { $in: ['high', 'critical'] } },
      { 'risk.score': { $gte: 70 } }
    ]
  })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

securityLogSchema.statics.getOpenInvestigations = function() {
  return this.find({
    'investigation.status': { $in: ['open', 'investigating'] }
  })
    .populate('userId', 'firstName lastName email')
    .populate('investigation.assignedTo', 'firstName lastName')
    .sort({ timestamp: -1 });
};

securityLogSchema.statics.getEventsByIP = function(ipAddress, limit = 100) {
  return this.find({ ipAddress })
    .populate('userId', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

securityLogSchema.statics.getSecurityStats = function(startDate = null, endDate = null) {
  const match = {};
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = new Date(startDate);
    if (endDate) match.timestamp.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          severity: '$severity',
          eventType: '$eventType'
        },
        count: { $sum: 1 },
        avgRiskScore: { $avg: '$risk.score' }
      }
    },
    {
      $group: {
        _id: '$_id.severity',
        events: {
          $push: {
            eventType: '$_id.eventType',
            count: '$count',
            avgRiskScore: '$avgRiskScore'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

securityLogSchema.statics.getThreatTrends = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        severity: { $in: ['high', 'critical'] }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          eventType: '$eventType'
        },
        count: { $sum: 1 },
        avgRiskScore: { $avg: '$risk.score' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

// Virtual for time since event
securityLogSchema.virtual('timeSinceEvent').get(function() {
  const now = new Date();
  const diff = now - this.timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day(s) ago`;
  if (hours > 0) return `${hours} hour(s) ago`;
  if (minutes > 0) return `${minutes} minute(s) ago`;
  return 'Just now';
});

// Virtual for risk level
securityLogSchema.virtual('riskLevel').get(function() {
  if (this.risk.score >= 80) return 'critical';
  if (this.risk.score >= 60) return 'high';
  if (this.risk.score >= 40) return 'medium';
  return 'low';
});

module.exports = mongoose.model('SecurityLog', securityLogSchema); 