const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const Session = require('../models/Session');
const SecurityLog = require('../models/SecurityLog');

class AdvancedSecurityService {
  constructor() {
    this.rateLimitStore = new Map();
    this.blockedIPs = new Set();
    this.suspiciousPatterns = new Map();
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
  }

  // Two-Factor Authentication
  async setup2FA(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Beam Affiliate (${user.email})`,
        issuer: 'Beam Affiliate Platform'
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Store secret temporarily (should be encrypted in production)
      user.twoFactorSecret = secret.base32;
      user.twoFactorEnabled = false;
      await user.save();

      return {
        success: true,
        secret: secret.base32,
        qrCodeUrl,
        backupCodes: this.generateBackupCodes()
      };
    } catch (error) {
      console.error('Setup 2FA error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify 2FA token
  async verify2FA(userId, token) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.twoFactorSecret) {
        return { success: false, error: '2FA not configured' };
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps tolerance
      });

      if (verified) {
        // Enable 2FA if not already enabled
        if (!user.twoFactorEnabled) {
          user.twoFactorEnabled = true;
          await user.save();
        }

        await this.logSecurityEvent(userId, '2FA_VERIFIED', { token });
        return { success: true };
      } else {
        await this.logSecurityEvent(userId, '2FA_FAILED', { token });
        return { success: false, error: 'Invalid 2FA token' };
      }
    } catch (error) {
      console.error('Verify 2FA error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Disable 2FA
  async disable2FA(userId, token) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.twoFactorEnabled) {
        return { success: false, error: '2FA not enabled' };
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (verified) {
        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        await user.save();

        await this.logSecurityEvent(userId, '2FA_DISABLED');
        return { success: true };
      } else {
        await this.logSecurityEvent(userId, '2FA_DISABLE_FAILED', { token });
        return { success: false, error: 'Invalid 2FA token' };
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate backup codes
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Session Management
  async createSession(userId, ipAddress, userAgent) {
    try {
      const sessionId = crypto.randomBytes(32).toString('hex');
      const session = new Session({
        userId,
        sessionId,
        ipAddress,
        userAgent,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.sessionTimeout),
        isActive: true
      });

      await session.save();
      await this.logSecurityEvent(userId, 'SESSION_CREATED', { sessionId, ipAddress });

      return {
        success: true,
        sessionId,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      console.error('Create session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate session
  async validateSession(sessionId) {
    try {
      const session = await Session.findOne({
        sessionId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        return { success: false, error: 'Invalid or expired session' };
      }

      // Update last activity
      session.lastActivity = new Date();
      await session.save();

      return {
        success: true,
        userId: session.userId,
        session: session
      };
    } catch (error) {
      console.error('Validate session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Invalidate session
  async invalidateSession(sessionId) {
    try {
      const session = await Session.findOne({ sessionId });
      if (session) {
        session.isActive = false;
        session.invalidatedAt = new Date();
        await session.save();

        await this.logSecurityEvent(session.userId, 'SESSION_INVALIDATED', { sessionId });
      }

      return { success: true };
    } catch (error) {
      console.error('Invalidate session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Invalidate all user sessions
  async invalidateAllUserSessions(userId) {
    try {
      await Session.updateMany(
        { userId, isActive: true },
        { 
          isActive: false,
          invalidatedAt: new Date()
        }
      );

      await this.logSecurityEvent(userId, 'ALL_SESSIONS_INVALIDATED');
      return { success: true };
    } catch (error) {
      console.error('Invalidate all sessions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Rate Limiting
  async checkRateLimit(identifier, action, limit, windowMs) {
    try {
      const key = `${identifier}:${action}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get current requests
      const requests = this.rateLimitStore.get(key) || [];
      const validRequests = requests.filter(timestamp => timestamp > windowStart);

      if (validRequests.length >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: validRequests[0] + windowMs
        };
      }

      // Add current request
      validRequests.push(now);
      this.rateLimitStore.set(key, validRequests);

      return {
        allowed: true,
        remaining: limit - validRequests.length,
        resetTime: now + windowMs
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Fail open
    }
  }

  // Login attempt tracking
  async trackLoginAttempt(identifier, success, ipAddress) {
    try {
      const key = `login:${identifier}`;
      const attempts = this.rateLimitStore.get(key) || [];

      if (success) {
        // Clear attempts on successful login
        this.rateLimitStore.delete(key);
        await this.logSecurityEvent(null, 'LOGIN_SUCCESS', { identifier, ipAddress });
      } else {
        // Add failed attempt
        attempts.push(Date.now());
        this.rateLimitStore.set(key, attempts);

        if (attempts.length >= this.maxLoginAttempts) {
          // Lock out account
          await this.lockAccount(identifier, ipAddress);
          await this.logSecurityEvent(null, 'ACCOUNT_LOCKED', { identifier, ipAddress });
        } else {
          await this.logSecurityEvent(null, 'LOGIN_FAILED', { identifier, ipAddress });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Track login attempt error:', error);
      return { success: false };
    }
  }

  // Lock account
  async lockAccount(identifier, ipAddress) {
    try {
      const user = await User.findOne({
        $or: [{ email: identifier }, { resellerId: identifier }]
      });

      if (user) {
        user.isLocked = true;
        user.lockedAt = new Date();
        user.lockReason = 'Too many failed login attempts';
        await user.save();
      }
    } catch (error) {
      console.error('Lock account error:', error);
    }
  }

  // Unlock account
  async unlockAccount(userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.isLocked = false;
        user.lockedAt = null;
        user.lockReason = null;
        await user.save();

        await this.logSecurityEvent(userId, 'ACCOUNT_UNLOCKED');
        return { success: true };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Unlock account error:', error);
      return { success: false, error: error.message };
    }
  }

  // Threat Detection
  async detectThreats(userId, action, data) {
    try {
      const threats = [];

      // Check for suspicious patterns
      const userPatterns = this.suspiciousPatterns.get(userId) || [];
      
      // Rate-based threats
      const rateLimit = await this.checkRateLimit(userId, action, 100, 60000); // 100 requests per minute
      if (!rateLimit.allowed) {
        threats.push({
          type: 'RATE_LIMIT_EXCEEDED',
          severity: 'medium',
          action,
          details: 'Too many requests in short time'
        });
      }

      // Geographic anomalies
      if (data.ipAddress) {
        const geoThreat = await this.detectGeographicAnomaly(userId, data.ipAddress);
        if (geoThreat) {
          threats.push(geoThreat);
        }
      }

      // Time-based anomalies
      const timeThreat = this.detectTimeAnomaly(userId, action);
      if (timeThreat) {
        threats.push(timeThreat);
      }

      // Update patterns
      userPatterns.push({
        action,
        timestamp: Date.now(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      });

      // Keep only recent patterns
      const recentPatterns = userPatterns.filter(
        pattern => Date.now() - pattern.timestamp < 24 * 60 * 60 * 1000
      );
      this.suspiciousPatterns.set(userId, recentPatterns);

      // Log threats
      if (threats.length > 0) {
        await this.logSecurityEvent(userId, 'THREAT_DETECTED', { threats });
      }

      return {
        success: true,
        threats,
        riskScore: this.calculateRiskScore(threats)
      };
    } catch (error) {
      console.error('Detect threats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Detect geographic anomalies
  async detectGeographicAnomaly(userId, ipAddress) {
    // This would integrate with a geo-location service
    // For now, return null (no anomaly detected)
    return null;
  }

  // Detect time-based anomalies
  detectTimeAnomaly(userId, action) {
    const now = new Date();
    const hour = now.getHours();

    // Detect unusual activity hours (2 AM - 6 AM)
    if (hour >= 2 && hour <= 6) {
      return {
        type: 'UNUSUAL_ACTIVITY_HOURS',
        severity: 'low',
        action,
        details: 'Activity during unusual hours'
      };
    }

    return null;
  }

  // Calculate risk score
  calculateRiskScore(threats) {
    let score = 0;
    
    threats.forEach(threat => {
      switch (threat.severity) {
        case 'low':
          score += 10;
          break;
        case 'medium':
          score += 25;
          break;
        case 'high':
          score += 50;
          break;
        case 'critical':
          score += 100;
          break;
      }
    });

    return Math.min(score, 100);
  }

  // Log security events
  async logSecurityEvent(userId, eventType, details = {}) {
    try {
      const securityLog = new SecurityLog({
        userId,
        eventType,
        details,
        timestamp: new Date(),
        ipAddress: details.ipAddress,
        userAgent: details.userAgent
      });

      await securityLog.save();
    } catch (error) {
      console.error('Log security event error:', error);
    }
  }

  // Get security statistics
  async getSecurityStats(userId = null) {
    try {
      const match = userId ? { userId } : {};

      const stats = await SecurityLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              eventType: '$eventType',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.eventType',
            dailyStats: {
              $push: {
                date: '$_id.date',
                count: '$count'
              }
            },
            totalCount: { $sum: '$count' }
          }
        }
      ]);

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get security stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions() {
    try {
      const result = await Session.updateMany(
        { expiresAt: { $lt: new Date() }, isActive: true },
        { isActive: false, invalidatedAt: new Date() }
      );

      console.log(`Cleaned up ${result.modifiedCount} expired sessions`);
      return { success: true, cleanedCount: result.modifiedCount };
    } catch (error) {
      console.error('Cleanup expired sessions error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get active sessions for user
  async getUserActiveSessions(userId) {
    try {
      const sessions = await Session.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      return {
        success: true,
        sessions
      };
    } catch (error) {
      console.error('Get user active sessions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AdvancedSecurityService(); 