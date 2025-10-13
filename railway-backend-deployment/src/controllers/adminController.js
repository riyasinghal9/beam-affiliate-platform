const User = require('../models/User');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const Payment = require('../models/Payment');
const PaymentFailure = require('../models/PaymentFailure');
const Click = require('../models/Click');
const Product = require('../models/Product');
const beamWalletService = require('../services/beamWalletService');
const notificationService = require('../services/notificationService');
const gamificationService = require('../services/gamificationService');

const adminController = {
  // Dashboard Statistics
  async getDashboardStats(req, res) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const [
        totalUsers,
        activeUsers,
        totalSales,
        totalRevenue,
        pendingCommissions,
        failedPayments,
        monthlyStats,
        weeklyStats,
        approvedPayments,
        pendingPayments
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        Payment.countDocuments({ adminApproval: 'approved' }),
        Payment.aggregate([
          { $match: { adminApproval: 'approved' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Commission.countDocuments({ status: 'pending' }),
        PaymentFailure.countDocuments({ status: 'failed' }),
        Payment.aggregate([
          { $match: { createdAt: { $gte: startOfMonth }, adminApproval: 'approved' } },
          { $group: { _id: null, sales: { $sum: 1 }, revenue: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
          { $match: { createdAt: { $gte: startOfWeek }, adminApproval: 'approved' } },
          { $group: { _id: null, sales: { $sum: 1 }, revenue: { $sum: '$amount' } } }
        ]),
        Payment.countDocuments({ adminApproval: 'approved' }),
        Payment.countDocuments({ adminApproval: 'pending' })
      ]);

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          totalSales,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingCommissions,
          failedPayments,
          approvedPayments,
          pendingPayments,
          monthlyStats: {
            sales: monthlyStats[0]?.sales || 0,
            revenue: monthlyStats[0]?.revenue || 0
          },
          weeklyStats: {
            sales: weeklyStats[0]?.sales || 0,
            revenue: weeklyStats[0]?.revenue || 0
          }
        }
      });
    } catch (error) {
      console.error('Admin dashboard stats error:', error);
      res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
    }
  },

  // User Management
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, status, level } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { resellerId: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        query.isActive = status === 'active';
      }

      if (level) {
        query.level = level;
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(query)
      ]);

      res.json({
        success: true,
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Failed to get users' });
    }
  },

  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { isActive, level, balance, notes } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updates = {};
      if (typeof isActive === 'boolean') updates.isActive = isActive;
      if (level) updates.level = level;
      if (typeof balance === 'number') updates.balance = balance;
      if (notes) updates.adminNotes = notes;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      // Send notification if account status changed
      if (typeof isActive === 'boolean' && isActive !== user.isActive) {
        await notificationService.sendAccountStatusNotification(
          user.email,
          isActive ? 'activated' : 'deactivated'
        );
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  },

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Soft delete - mark as inactive instead of actually deleting
      user.isActive = false;
      user.deletedAt = new Date();
      user.deletedBy = req.user._id;
      await user.save();

      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  },

  // Commission Management
  async getPendingCommissions(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const [commissions, total] = await Promise.all([
        Commission.find({ status: 'pending' })
          .populate('saleId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Commission.countDocuments({ status: 'pending' })
      ]);

      res.json({
        success: true,
        commissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get pending commissions error:', error);
      res.status(500).json({ success: false, message: 'Failed to get pending commissions' });
    }
  },

  async getAllCommissions(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (status) {
        query.status = status;
      }

      const [commissions, total] = await Promise.all([
        Commission.find(query)
          .populate('saleId')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Commission.countDocuments(query)
      ]);

      res.json({
        success: true,
        commissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all commissions error:', error);
      res.status(500).json({ success: false, message: 'Failed to get commissions' });
    }
  },

  async approveCommission(req, res) {
    try {
      const { commissionId } = req.params;
      const { notes } = req.body;

      const commission = await Commission.findById(commissionId);
      if (!commission) {
        return res.status(404).json({ success: false, message: 'Commission not found' });
      }

      if (commission.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Commission is not pending' });
      }

      // Process payment via Beam Wallet
      const paymentResult = await beamWalletService.sendPayment(
        commission.resellerId,
        commission.commissionAmount,
        `COMM-${commissionId}`,
        `Commission for ${commission.productName}`
      );

      if (paymentResult.success) {
        commission.status = 'paid';
        commission.paidAt = new Date();
        commission.paymentReference = paymentResult.transactionId;
        commission.approvedBy = req.user._id;
        commission.approvalNotes = notes;
        await commission.save();

        // Update user stats
        await User.findOneAndUpdate(
          { resellerId: commission.resellerId },
          { 
            $inc: { 
              totalEarnings: commission.commissionAmount,
              balance: commission.commissionAmount
            }
          }
        );

        res.json({ 
          success: true, 
          message: 'Commission approved and paid',
          paymentReference: paymentResult.transactionId
        });
      } else {
        commission.status = 'failed';
        commission.failureReason = paymentResult.error;
        await commission.save();

        res.status(400).json({ 
          success: false, 
          message: 'Payment failed',
          error: paymentResult.error
        });
      }
    } catch (error) {
      console.error('Approve commission error:', error);
      res.status(500).json({ success: false, message: 'Failed to approve commission' });
    }
  },

  async rejectCommission(req, res) {
    try {
      const { commissionId } = req.params;
      const { reason } = req.body;

      const commission = await Commission.findById(commissionId);
      if (!commission) {
        return res.status(404).json({ success: false, message: 'Commission not found' });
      }

      commission.status = 'rejected';
      commission.rejectionReason = reason;
      commission.rejectedBy = req.user._id;
      commission.rejectedAt = new Date();
      await commission.save();

      // Send notification to reseller
      await notificationService.sendCommissionRejectionNotification(
        commission.resellerId,
        commission.commissionAmount,
        reason
      );

      res.json({ success: true, message: 'Commission rejected' });
    } catch (error) {
      console.error('Reject commission error:', error);
      res.status(500).json({ success: false, message: 'Failed to reject commission' });
    }
  },

  // Fraud Management
  async getFraudAlerts(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const [suspiciousSales, suspiciousClicks] = await Promise.all([
        Sale.find({ isSuspicious: true })
          .populate('resellerId')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Click.find({ isSuspicious: true })
          .populate('resellerId')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit))
      ]);

      res.json({
        success: true,
        fraudAlerts: {
          suspiciousSales,
          suspiciousClicks
        }
      });
    } catch (error) {
      console.error('Get fraud alerts error:', error);
      res.status(500).json({ success: false, message: 'Failed to get fraud alerts' });
    }
  },

  async reviewFraudAlert(req, res) {
    try {
      const { alertId, alertType } = req.params;
      const { action, notes } = req.body;

      let record;
      if (alertType === 'sale') {
        record = await Sale.findById(alertId);
      } else if (alertType === 'click') {
        record = await Click.findById(alertId);
      }

      if (!record) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }

      record.fraudReviewed = true;
      record.fraudReviewBy = req.user._id;
      record.fraudReviewAt = new Date();
      record.fraudReviewNotes = notes;
      record.fraudReviewAction = action;

      if (action === 'approve') {
        record.isSuspicious = false;
        record.fraudScore = 0;
      } else if (action === 'block') {
        // Block the reseller
        await User.findOneAndUpdate(
          { resellerId: record.resellerId },
          { isActive: false, blockedReason: 'Fraud detected' }
        );
      }

      await record.save();

      res.json({ success: true, message: 'Fraud alert reviewed' });
    } catch (error) {
      console.error('Review fraud alert error:', error);
      res.status(500).json({ success: false, message: 'Failed to review fraud alert' });
    }
  },

  // Payment Management
  async getFailedPayments(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const [failures, total] = await Promise.all([
        PaymentFailure.find()
          .populate('resolvedBy', 'firstName lastName')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        PaymentFailure.countDocuments()
      ]);

      res.json({
        success: true,
        failures,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get failed payments error:', error);
      res.status(500).json({ success: false, message: 'Failed to get failed payments' });
    }
  },

  async retryPayment(req, res) {
    try {
      const { failureId } = req.params;

      const failure = await PaymentFailure.findById(failureId);
      if (!failure) {
        return res.status(404).json({ success: false, message: 'Payment failure not found' });
      }

      const retryResult = await failure.retryPayment();

      if (retryResult.success) {
        // Attempt to process the payment again
        const paymentResult = await beamWalletService.sendPayment(
          failure.resellerId,
          failure.amount,
          failure.transactionId,
          'Commission payment retry'
        );

        if (paymentResult.success) {
          failure.status = 'resolved';
          failure.resolvedBy = req.user._id;
          failure.resolvedAt = new Date();
          failure.resolutionNotes = 'Payment successful on retry';
          await failure.save();
        }

        res.json({ 
          success: true, 
          message: 'Payment retry initiated',
          retryCount: retryResult.retryCount
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: retryResult.error 
        });
      }
    } catch (error) {
      console.error('Retry payment error:', error);
      res.status(500).json({ success: false, message: 'Failed to retry payment' });
    }
  },

  // Payment Management
  async getAllPayments(req, res) {
    try {
      const { page = 1, limit = 20, status, adminApproval } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (status) {
        query.status = status;
      }
      if (adminApproval) {
        query.adminApproval = adminApproval;
      }

      const [payments, total] = await Promise.all([
        Payment.find(query)
          .populate('resellerId', 'firstName lastName email resellerId')
          .populate('productId', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Payment.countDocuments(query)
      ]);

      res.json({
        success: true,
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({ success: false, message: 'Failed to get payments' });
    }
  },

  async getPaymentStats(req, res) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const [
        totalPayments,
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        totalRevenue,
        monthlyStats,
        weeklyStats,
        statusBreakdown
      ] = await Promise.all([
        Payment.countDocuments(),
        Payment.countDocuments({ adminApproval: 'pending' }),
        Payment.countDocuments({ adminApproval: 'approved' }),
        Payment.countDocuments({ adminApproval: 'rejected' }),
        Payment.aggregate([
          { $match: { adminApproval: 'approved' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
          { $match: { createdAt: { $gte: startOfMonth }, adminApproval: 'approved' } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
          { $match: { createdAt: { $gte: startOfWeek }, adminApproval: 'approved' } },
          { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
          {
            $group: {
              _id: '$adminApproval',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          }
        ])
      ]);

      res.json({
        success: true,
        stats: {
          totalPayments,
          pendingPayments,
          approvedPayments,
          rejectedPayments,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyStats: {
            payments: monthlyStats[0]?.count || 0,
            revenue: monthlyStats[0]?.revenue || 0
          },
          weeklyStats: {
            payments: weeklyStats[0]?.count || 0,
            revenue: weeklyStats[0]?.revenue || 0
          },
          statusBreakdown
        }
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({ success: false, message: 'Failed to get payment stats' });
    }
  },

  async approvePayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { notes } = req.body;

      console.log('Approving payment:', paymentId);
      const payment = await Payment.findOne({ paymentId: paymentId });
      if (!payment) {
        console.log('Payment not found for ID:', paymentId);
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      if (payment.adminApproval !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment is not pending approval' 
        });
      }

      payment.adminApproval = 'approved';
      payment.approvedBy = req.user._id;
      payment.approvedAt = new Date();
      payment.adminNotes = notes;
      payment.status = 'approved';

      await payment.save();

      // Create commission record
      const commission = new Commission({
        resellerId: payment.resellerId,
        saleId: payment._id.toString(),
        productId: payment.productId,
        commissionAmount: payment.commissionAmount,
        commissionRate: (payment.commissionAmount / payment.amount) * 100, // Calculate commission rate
        status: 'paid',
        paidAt: new Date()
      });

      await commission.save();

      // Update user stats
      await User.findOneAndUpdate(
        { resellerId: payment.resellerId },
        { 
          $inc: { 
            totalEarnings: payment.commissionAmount,
            balance: payment.commissionAmount,
            totalSales: 1
          }
        }
      );

      res.json({ 
        success: true, 
        message: 'Payment approved successfully',
        commissionId: commission._id
      });
    } catch (error) {
      console.error('Approve payment error:', error);
      console.error('Error details:', error.message);
      res.status(500).json({ success: false, message: 'Failed to approve payment', error: error.message });
    }
  },

  async rejectPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      const payment = await Payment.findOne({ paymentId: paymentId });
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      if (payment.adminApproval !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment is not pending approval' 
        });
      }

      payment.adminApproval = 'rejected';
      payment.rejectedBy = req.user._id;
      payment.rejectedAt = new Date();
      payment.adminNotes = reason;
      payment.status = 'rejected';

      await payment.save();

      res.json({ 
        success: true, 
        message: 'Payment rejected successfully' 
      });
    } catch (error) {
      console.error('Reject payment error:', error);
      res.status(500).json({ success: false, message: 'Failed to reject payment' });
    }
  },

  // System Analytics
  async getSystemAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const [
        salesStats,
        userStats,
        commissionStats,
        fraudStats,
        paymentStats
      ] = await Promise.all([
        Sale.aggregate([
          { $match: { timestamp: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: {
                year: { $year: '$timestamp' },
                month: { $month: '$timestamp' },
                day: { $dayOfMonth: '$timestamp' }
              },
              sales: { $sum: 1 },
              revenue: { $sum: '$saleAmount' },
              commissions: { $sum: '$commissionAmount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              newUsers: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        Commission.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$commissionAmount' }
            }
          }
        ]),
        Sale.aggregate([
          { $match: { timestamp: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: null,
              totalSales: { $sum: 1 },
              suspiciousSales: { $sum: { $cond: ['$isSuspicious', 1, 0] } },
              avgFraudScore: { $avg: '$fraudScore' }
            }
          }
        ]),
        PaymentFailure.aggregate([
          { $match: { timestamp: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          }
        ])
      ]);

      res.json({
        success: true,
        analytics: {
          salesStats,
          userStats,
          commissionStats,
          fraudStats: fraudStats[0] || {},
          paymentStats
        }
      });
    } catch (error) {
      console.error('Get system analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to get system analytics' });
    }
  },

  // Product Management
  async getProducts(req, res) {
    try {
      const products = await Product.find().sort({ sortOrder: 1, name: 1 });
      res.json({ success: true, products });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ success: false, message: 'Failed to get products' });
    }
  },

  async createProduct(req, res) {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json({ success: true, product });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ success: false, message: 'Failed to create product' });
    }
  },

  async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const product = await Product.findByIdAndUpdate(
        productId,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({ success: true, product });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ success: false, message: 'Failed to update product' });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { productId } = req.params;
      const product = await Product.findByIdAndDelete(productId);
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
  }
};

module.exports = adminController; 