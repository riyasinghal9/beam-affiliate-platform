const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  invalidatedAt: {
    type: Date,
    default: null
  },
  invalidatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  invalidationReason: {
    type: String,
    enum: [
      'expired',
      'user_logout',
      'admin_invalidated',
      'security_concern',
      'password_change',
      'account_locked'
    ],
    default: null
  },
  metadata: {
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    browser: String,
    os: String,
    location: {
      country: String,
      city: String,
      timezone: String
    },
    isTrusted: {
      type: Boolean,
      default: false
    },
    fingerprint: String,
    loginMethod: {
      type: String,
      enum: ['password', '2fa', 'social', 'magic_link'],
      default: 'password'
    }
  },
  security: {
    requires2FA: {
      type: Boolean,
      default: false
    },
    twoFactorVerified: {
      type: Boolean,
      default: false
    },
    ipChanged: {
      type: Boolean,
      default: false
    },
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    lastSecurityCheck: {
      type: Date,
      default: Date.now
    }
  },
  permissions: {
    roles: [{
      type: String,
      enum: ['user', 'reseller', 'admin', 'moderator']
    }],
    scopes: [String],
    restrictions: [String]
  },
  activity: [{
    action: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for performance
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ lastActivity: 1 });
sessionSchema.index({ ipAddress: 1 });
sessionSchema.index({ 'metadata.fingerprint': 1 });

// Pre-save middleware
sessionSchema.pre('save', function(next) {
  // Update last activity on save
  this.lastActivity = new Date();
  
  // Detect device type from user agent
  if (this.userAgent) {
    this.metadata.deviceType = this.detectDeviceType(this.userAgent);
    this.metadata.browser = this.detectBrowser(this.userAgent);
    this.metadata.os = this.detectOS(this.userAgent);
  }
  
  // Generate fingerprint
  this.metadata.fingerprint = this.generateFingerprint();
  
  next();
});

// Instance methods
sessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

sessionSchema.methods.isValid = function() {
  return this.isActive && !this.isExpired();
};

sessionSchema.methods.extend = function(duration = 24 * 60 * 60 * 1000) {
  this.expiresAt = new Date(Date.now() + duration);
  this.lastActivity = new Date();
};

sessionSchema.methods.invalidate = function(reason = 'user_logout', invalidatedBy = null) {
  this.isActive = false;
  this.invalidatedAt = new Date();
  this.invalidationReason = reason;
  this.invalidatedBy = invalidatedBy;
};

sessionSchema.methods.addActivity = function(action, details = {}) {
  this.activity.push({
    action,
    timestamp: new Date(),
    ipAddress: details.ipAddress,
    userAgent: details.userAgent,
    details
  });
  
  // Keep only last 100 activities
  if (this.activity.length > 100) {
    this.activity = this.activity.slice(-100);
  }
};

sessionSchema.methods.detectDeviceType = function(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipad|phone/.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/.test(ua)) {
    return 'tablet';
  } else if (/windows|macintosh|linux/.test(ua)) {
    return 'desktop';
  }
  
  return 'unknown';
};

sessionSchema.methods.detectBrowser = function(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';
  
  return 'Unknown';
};

sessionSchema.methods.detectOS = function(userAgent) {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  
  return 'Unknown';
};

sessionSchema.methods.generateFingerprint = function() {
  const data = `${this.userAgent}-${this.ipAddress}-${this.userId}`;
  return require('crypto').createHash('sha256').update(data).digest('hex');
};

// Static methods
sessionSchema.statics.getActiveSessions = function() {
  return this.find({
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('userId', 'firstName lastName email');
};

sessionSchema.statics.getUserSessions = function(userId) {
  return this.find({ userId })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

sessionSchema.statics.getExpiredSessions = function() {
  return this.find({
    isActive: true,
    expiresAt: { $lt: new Date() }
  });
};

sessionSchema.statics.getSessionsByIP = function(ipAddress) {
  return this.find({ ipAddress })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

sessionSchema.statics.getSessionStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          isActive: '$isActive',
          deviceType: '$metadata.deviceType'
        },
        count: { $sum: 1 }
      }
    }
  ]);
};

sessionSchema.statics.cleanupExpiredSessions = function() {
  return this.updateMany(
    {
      isActive: true,
      expiresAt: { $lt: new Date() }
    },
    {
      isActive: false,
      invalidatedAt: new Date(),
      invalidationReason: 'expired'
    }
  );
};

// Virtual for session duration
sessionSchema.virtual('duration').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for time until expiration
sessionSchema.virtual('timeUntilExpiration').get(function() {
  return this.expiresAt.getTime() - Date.now();
});

// Virtual for formatted duration
sessionSchema.virtual('formattedDuration').get(function() {
  const duration = this.duration;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

module.exports = mongoose.model('Session', sessionSchema); 