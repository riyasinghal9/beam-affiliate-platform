const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

class AuditLogService {
  constructor() {
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };
    
    this.eventTypes = {
      // Authentication events
      LOGIN: 'authentication.login',
      LOGOUT: 'authentication.logout',
      LOGIN_FAILED: 'authentication.login_failed',
      PASSWORD_CHANGE: 'authentication.password_change',
      PASSWORD_RESET: 'authentication.password_reset',
      
      // User management events
      USER_CREATED: 'user.created',
      USER_UPDATED: 'user.updated',
      USER_DELETED: 'user.deleted',
      USER_ACTIVATED: 'user.activated',
      USER_DEACTIVATED: 'user.deactivated',
      
      // Financial events
      PAYMENT_PROCESSED: 'payment.processed',
      PAYMENT_FAILED: 'payment.failed',
      COMMISSION_EARNED: 'commission.earned',
      WITHDRAWAL_REQUESTED: 'withdrawal.requested',
      WITHDRAWAL_PROCESSED: 'withdrawal.processed',
      
      // Security events
      SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
      FRAUD_DETECTED: 'security.fraud_detected',
      ACCESS_DENIED: 'security.access_denied',
      PERMISSION_CHANGED: 'security.permission_changed',
      
      // System events
      SYSTEM_STARTUP: 'system.startup',
      SYSTEM_SHUTDOWN: 'system.shutdown',
      BACKUP_CREATED: 'system.backup_created',
      CONFIGURATION_CHANGED: 'system.configuration_changed',
      
      // Data events
      DATA_EXPORTED: 'data.exported',
      DATA_IMPORTED: 'data.imported',
      DATA_DELETED: 'data.deleted',
      GDPR_REQUEST: 'data.gdpr_request',
      
      // Training events
      COURSE_ENROLLED: 'training.course_enrolled',
      LESSON_COMPLETED: 'training.lesson_completed',
      CERTIFICATE_EARNED: 'training.certificate_earned',
      
      // Marketing events
      CAMPAIGN_CREATED: 'marketing.campaign_created',
      EMAIL_SENT: 'marketing.email_sent',
      LEAD_SCORED: 'marketing.lead_scored'
    };
  }

  // Log an event
  async logEvent(eventData) {
    try {
      const {
        userId,
        eventType,
        level = 'INFO',
        message,
        details = {},
        ipAddress,
        userAgent,
        sessionId,
        requestId,
        metadata = {}
      } = eventData;

      // Validate event type
      if (!Object.values(this.eventTypes).includes(eventType)) {
        console.warn(`Invalid event type: ${eventType}`);
      }

      // Create audit log entry
      const auditLog = new AuditLog({
        userId,
        eventType,
        level: level.toUpperCase(),
        message,
        details,
        ipAddress,
        userAgent,
        sessionId,
        requestId,
        metadata: {
          ...metadata,
          timestamp: new Date(),
          hash: this.generateEventHash(eventData)
        }
      });

      await auditLog.save();

      // Trigger real-time alerts for critical events
      if (level === 'CRITICAL' || level === 'ERROR') {
        await this.triggerAlert(auditLog);
      }

      return {
        success: true,
        logId: auditLog._id
      };
    } catch (error) {
      console.error('Audit log error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Log authentication events
  async logAuthentication(userId, eventType, details = {}) {
    return this.logEvent({
      userId,
      eventType,
      level: 'INFO',
      message: `Authentication event: ${eventType}`,
      details,
      metadata: {
        category: 'authentication',
        severity: eventType.includes('failed') ? 'WARN' : 'INFO'
      }
    });
  }

  // Log security events
  async logSecurityEvent(userId, eventType, details = {}) {
    return this.logEvent({
      userId,
      eventType,
      level: 'WARN',
      message: `Security event: ${eventType}`,
      details,
      metadata: {
        category: 'security',
        severity: 'WARN'
      }
    });
  }

  // Log financial events
  async logFinancialEvent(userId, eventType, details = {}) {
    return this.logEvent({
      userId,
      eventType,
      level: 'INFO',
      message: `Financial event: ${eventType}`,
      details,
      metadata: {
        category: 'financial',
        severity: 'INFO'
      }
    });
  }

  // Log system events
  async logSystemEvent(eventType, details = {}) {
    return this.logEvent({
      userId: null,
      eventType,
      level: 'INFO',
      message: `System event: ${eventType}`,
      details,
      metadata: {
        category: 'system',
        severity: 'INFO'
      }
    });
  }

  // Log data access events
  async logDataAccess(userId, eventType, details = {}) {
    return this.logEvent({
      userId,
      eventType,
      level: 'INFO',
      message: `Data access event: ${eventType}`,
      details,
      metadata: {
        category: 'data_access',
        severity: 'INFO'
      }
    });
  }

  // Generate event hash for integrity
  generateEventHash(eventData) {
    const dataString = JSON.stringify({
      userId: eventData.userId,
      eventType: eventData.eventType,
      message: eventData.message,
      timestamp: new Date().toISOString()
    });
    
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Trigger alerts for critical events
  async triggerAlert(auditLog) {
    try {
      // Send real-time notification
      const realtimeService = require('./realtimeService');
      await realtimeService.sendToAdmins('security_alert', {
        type: 'audit_alert',
        level: auditLog.level,
        eventType: auditLog.eventType,
        message: auditLog.message,
        timestamp: auditLog.metadata.timestamp
      });

      // Log alert
      console.log(`🚨 SECURITY ALERT: ${auditLog.level} - ${auditLog.eventType} - ${auditLog.message}`);
    } catch (error) {
      console.error('Alert trigger error:', error);
    }
  }

  // Get audit logs with filtering
  async getAuditLogs(filters = {}) {
    try {
      const {
        userId,
        eventType,
        level,
        startDate,
        endDate,
        category,
        limit = 100,
        page = 1
      } = filters;

      const query = {};

      if (userId) query.userId = userId;
      if (eventType) query.eventType = eventType;
      if (level) query.level = level.toUpperCase();
      if (category) query['metadata.category'] = category;
      if (startDate || endDate) {
        query['metadata.timestamp'] = {};
        if (startDate) query['metadata.timestamp'].$gte = new Date(startDate);
        if (endDate) query['metadata.timestamp'].$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const logs = await AuditLog.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ 'metadata.timestamp': -1 })
        .skip(skip)
        .limit(limit);

      const total = await AuditLog.countDocuments(query);

      return {
        success: true,
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get audit logs error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get audit statistics
  async getAuditStats(startDate = null, endDate = null) {
    try {
      const match = {};
      if (startDate || endDate) {
        match['metadata.timestamp'] = {};
        if (startDate) match['metadata.timestamp'].$gte = new Date(startDate);
        if (endDate) match['metadata.timestamp'].$lte = new Date(endDate);
      }

      const stats = await AuditLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              level: '$level',
              category: '$metadata.category'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.level',
            categories: {
              $push: {
                category: '$_id.category',
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
      console.error('Get audit stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export audit logs
  async exportAuditLogs(filters = {}) {
    try {
      const { logs } = await this.getAuditLogs({ ...filters, limit: 10000 });

      const exportData = logs.map(log => ({
        timestamp: log.metadata.timestamp,
        level: log.level,
        eventType: log.eventType,
        message: log.message,
        userId: log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'System',
        ipAddress: log.ipAddress,
        details: log.details,
        category: log.metadata.category
      }));

      return {
        success: true,
        data: exportData,
        format: 'json',
        recordCount: exportData.length
      };
    } catch (error) {
      console.error('Export audit logs error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search audit logs
  async searchAuditLogs(searchTerm, filters = {}) {
    try {
      const query = {
        $or: [
          { message: { $regex: searchTerm, $options: 'i' } },
          { eventType: { $regex: searchTerm, $options: 'i' } },
          { 'details.description': { $regex: searchTerm, $options: 'i' } }
        ]
      };

      // Add additional filters
      if (filters.userId) query.userId = filters.userId;
      if (filters.level) query.level = filters.level.toUpperCase();
      if (filters.startDate || filters.endDate) {
        query['metadata.timestamp'] = {};
        if (filters.startDate) query['metadata.timestamp'].$gte = new Date(filters.startDate);
        if (filters.endDate) query['metadata.timestamp'].$lte = new Date(filters.endDate);
      }

      const logs = await AuditLog.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ 'metadata.timestamp': -1 })
        .limit(filters.limit || 100);

      return {
        success: true,
        logs,
        searchTerm
      };
    } catch (error) {
      console.error('Search audit logs error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user activity timeline
  async getUserActivityTimeline(userId, limit = 50) {
    try {
      const logs = await AuditLog.find({ userId })
        .populate('userId', 'firstName lastName email')
        .sort({ 'metadata.timestamp': -1 })
        .limit(limit);

      const timeline = logs.map(log => ({
        timestamp: log.metadata.timestamp,
        eventType: log.eventType,
        message: log.message,
        level: log.level,
        category: log.metadata.category,
        details: log.details
      }));

      return {
        success: true,
        timeline
      };
    } catch (error) {
      console.error('Get user activity timeline error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clean up old audit logs
  async cleanupOldLogs(retentionDays = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await AuditLog.deleteMany({
        'metadata.timestamp': { $lt: cutoffDate }
      });

      console.log(`Cleaned up ${result.deletedCount} old audit logs`);

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Cleanup old logs error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify log integrity
  async verifyLogIntegrity() {
    try {
      const logs = await AuditLog.find().limit(1000);
      const integrityIssues = [];

      for (const log of logs) {
        const expectedHash = this.generateEventHash({
          userId: log.userId,
          eventType: log.eventType,
          message: log.message,
          timestamp: log.metadata.timestamp
        });

        if (log.metadata.hash !== expectedHash) {
          integrityIssues.push({
            logId: log._id,
            expectedHash,
            actualHash: log.metadata.hash
          });
        }
      }

      return {
        success: true,
        totalChecked: logs.length,
        integrityIssues,
        isIntegrityValid: integrityIssues.length === 0
      };
    } catch (error) {
      console.error('Verify log integrity error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AuditLogService(); 