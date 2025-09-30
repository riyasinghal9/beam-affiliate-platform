const User = require('../models/User');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const Click = require('../models/Click');
const UserProgress = require('../models/UserProgress');
const crypto = require('crypto');

class GDPRService {
  constructor() {
    this.dataRetentionPolicies = {
      userData: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      transactionData: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
      clickData: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
      trainingData: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
      logs: 1 * 365 * 24 * 60 * 60 * 1000 // 1 year
    };
  }

  // Handle right to be forgotten (data deletion)
  async handleRightToBeForgotten(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Anonymize user data instead of complete deletion
      const anonymizedData = {
        firstName: 'ANONYMIZED',
        lastName: 'USER',
        email: `anonymized_${crypto.randomBytes(8).toString('hex')}@deleted.com`,
        phone: null,
        address: null,
        beamNumber: null,
        isActive: false,
        deletedAt: new Date(),
        deletionReason: 'GDPR_RIGHT_TO_BE_FORGOTTEN'
      };

      // Update user data
      await User.findByIdAndUpdate(userId, anonymizedData);

      // Anonymize related data
      await this.anonymizeUserData(userId);

      // Log the deletion request
      await this.logDataRequest(userId, 'RIGHT_TO_BE_FORGOTTEN', 'Data anonymized');

      return {
        success: true,
        message: 'User data has been anonymized in accordance with GDPR requirements'
      };
    } catch (error) {
      console.error('Handle right to be forgotten error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle right to data portability
  async handleDataPortability(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Collect all user data
      const userData = await this.collectUserData(userId);

      // Generate export file
      const exportData = {
        exportedAt: new Date(),
        user: {
          profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            resellerId: user.resellerId,
            level: user.level,
            createdAt: user.createdAt
          },
          financial: {
            balance: user.balance,
            totalSales: user.totalSales,
            totalEarnings: user.totalEarnings
          }
        },
        transactions: userData.transactions,
        commissions: userData.commissions,
        clicks: userData.clicks,
        training: userData.training,
        preferences: userData.preferences
      };

      // Log the data request
      await this.logDataRequest(userId, 'DATA_PORTABILITY', 'Data exported');

      return {
        success: true,
        data: exportData,
        message: 'User data exported successfully'
      };
    } catch (error) {
      console.error('Handle data portability error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle right to access (data subject access request)
  async handleDataAccessRequest(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Collect user data
      const userData = await this.collectUserData(userId);

      // Log the access request
      await this.logDataRequest(userId, 'DATA_ACCESS', 'Data accessed');

      return {
        success: true,
        data: userData,
        message: 'Data access request fulfilled'
      };
    } catch (error) {
      console.error('Handle data access request error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle right to rectification
  async handleDataRectification(userId, updates) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Validate updates
      const allowedFields = ['firstName', 'lastName', 'phone', 'address'];
      const validUpdates = {};

      for (const [field, value] of Object.entries(updates)) {
        if (allowedFields.includes(field)) {
          validUpdates[field] = value;
        }
      }

      // Update user data
      await User.findByIdAndUpdate(userId, validUpdates);

      // Log the rectification request
      await this.logDataRequest(userId, 'DATA_RECTIFICATION', `Fields updated: ${Object.keys(validUpdates).join(', ')}`);

      return {
        success: true,
        message: 'Data rectification completed successfully'
      };
    } catch (error) {
      console.error('Handle data rectification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle consent management
  async updateConsent(userId, consentData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const consent = {
        marketing: consentData.marketing || false,
        analytics: consentData.analytics || false,
        thirdParty: consentData.thirdParty || false,
        cookies: consentData.cookies || false,
        updatedAt: new Date(),
        ipAddress: consentData.ipAddress,
        userAgent: consentData.userAgent
      };

      // Update user consent
      await User.findByIdAndUpdate(userId, { consent });

      // Log consent update
      await this.logDataRequest(userId, 'CONSENT_UPDATE', `Consent updated: ${JSON.stringify(consent)}`);

      return {
        success: true,
        message: 'Consent updated successfully'
      };
    } catch (error) {
      console.error('Update consent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get consent status
  async getConsentStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        consent: user.consent || {
          marketing: false,
          analytics: false,
          thirdParty: false,
          cookies: false
        }
      };
    } catch (error) {
      console.error('Get consent status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Data retention cleanup
  async performDataRetentionCleanup() {
    try {
      const now = new Date();
      const results = {
        usersDeleted: 0,
        transactionsDeleted: 0,
        clicksDeleted: 0,
        logsDeleted: 0
      };

      // Clean up old user data
      const userRetentionDate = new Date(now.getTime() - this.dataRetentionPolicies.userData);
      const oldUsers = await User.find({
        deletedAt: { $lt: userRetentionDate },
        deletionReason: 'GDPR_RIGHT_TO_BE_FORGOTTEN'
      });

      for (const user of oldUsers) {
        await this.permanentlyDeleteUserData(user._id);
        results.usersDeleted++;
      }

      // Clean up old transaction data
      const transactionRetentionDate = new Date(now.getTime() - this.dataRetentionPolicies.transactionData);
      const oldTransactions = await Sale.find({
        createdAt: { $lt: transactionRetentionDate }
      });

      if (oldTransactions.length > 0) {
        await Sale.deleteMany({ _id: { $in: oldTransactions.map(t => t._id) } });
        results.transactionsDeleted = oldTransactions.length;
      }

      // Clean up old click data
      const clickRetentionDate = new Date(now.getTime() - this.dataRetentionPolicies.clickData);
      const oldClicks = await Click.find({
        timestamp: { $lt: clickRetentionDate }
      });

      if (oldClicks.length > 0) {
        await Click.deleteMany({ _id: { $in: oldClicks.map(c => c._id) } });
        results.clicksDeleted = oldClicks.length;
      }

      console.log('Data retention cleanup completed:', results);
      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Data retention cleanup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Collect all user data
  async collectUserData(userId) {
    const [user, sales, commissions, clicks, trainingProgress] = await Promise.all([
      User.findById(userId),
      Sale.find({ resellerId: userId }),
      Commission.find({ resellerId: userId }),
      Click.find({ resellerId: userId }),
      UserProgress.findOne({ userId })
    ]);

    return {
      user: {
        profile: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          resellerId: user.resellerId,
          level: user.level,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        financial: {
          balance: user.balance,
          totalSales: user.totalSales,
          totalEarnings: user.totalEarnings
        },
        consent: user.consent
      },
      transactions: sales.map(sale => ({
        id: sale._id,
        amount: sale.amount,
        product: sale.productId,
        customerData: sale.customerData,
        createdAt: sale.createdAt
      })),
      commissions: commissions.map(commission => ({
        id: commission._id,
        amount: commission.commissionAmount,
        product: commission.productId,
        status: commission.status,
        createdAt: commission.createdAt
      })),
      clicks: clicks.map(click => ({
        id: click._id,
        product: click.productId,
        source: click.source,
        timestamp: click.timestamp
      })),
      training: trainingProgress ? {
        totalStudyTime: trainingProgress.totalStudyTime,
        completedCourses: trainingProgress.totalCoursesCompleted,
        completedLessons: trainingProgress.totalLessonsCompleted,
        certificates: trainingProgress.certificates,
        achievements: trainingProgress.achievements
      } : null
    };
  }

  // Anonymize user data
  async anonymizeUserData(userId) {
    const anonymizedFields = {
      'customerData.name': 'ANONYMIZED',
      'customerData.email': `anonymized_${crypto.randomBytes(8).toString('hex')}@deleted.com`,
      'customerData.phone': null
    };

    // Anonymize sales data
    await Sale.updateMany(
      { resellerId: userId },
      { $set: anonymizedFields }
    );

    // Anonymize click data
    await Click.updateMany(
      { resellerId: userId },
      { 
        $set: {
          ip: 'ANONYMIZED',
          userAgent: 'ANONYMIZED'
        }
      }
    );
  }

  // Permanently delete user data
  async permanentlyDeleteUserData(userId) {
    await Promise.all([
      User.findByIdAndDelete(userId),
      Sale.deleteMany({ resellerId: userId }),
      Commission.deleteMany({ resellerId: userId }),
      Click.deleteMany({ resellerId: userId }),
      UserProgress.findOneAndDelete({ userId })
    ]);
  }

  // Log data requests for audit trail
  async logDataRequest(userId, requestType, details) {
    try {
      const DataRequestLog = require('../models/DataRequestLog');
      
      await DataRequestLog.create({
        userId,
        requestType,
        details,
        timestamp: new Date(),
        status: 'completed'
      });
    } catch (error) {
      console.error('Log data request error:', error);
    }
  }

  // Get data request history
  async getDataRequestHistory(userId) {
    try {
      const DataRequestLog = require('../models/DataRequestLog');
      
      const requests = await DataRequestLog.find({ userId })
        .sort({ timestamp: -1 });

      return {
        success: true,
        requests
      };
    } catch (error) {
      console.error('Get data request history error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if user has valid consent
  async hasValidConsent(userId, consentType) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.consent) {
        return false;
      }

      return user.consent[consentType] === true;
    } catch (error) {
      console.error('Check consent error:', error);
      return false;
    }
  }

  // Generate privacy policy
  generatePrivacyPolicy() {
    return {
      lastUpdated: new Date(),
      dataController: 'Beam Affiliate Platform',
      dataProcessing: {
        purposes: [
          'Account management and authentication',
          'Commission tracking and payments',
          'Training and educational content',
          'Analytics and performance improvement',
          'Marketing communications (with consent)'
        ],
        legalBasis: [
          'Contract performance',
          'Legitimate interest',
          'Consent (for marketing)'
        ]
      },
      dataRetention: this.dataRetentionPolicies,
      userRights: [
        'Right to access',
        'Right to rectification',
        'Right to erasure',
        'Right to data portability',
        'Right to restrict processing',
        'Right to object'
      ],
      contactInformation: {
        email: 'privacy@beamaffiliate.com',
        address: 'Privacy Team, Beam Affiliate Platform'
      }
    };
  }
}

module.exports = new GDPRService(); 