const Commission = require('../models/Commission');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/payment-proofs';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `proof-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Get user's commissions
const getMyCommissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const commissions = await Commission.find({ resellerId: userId })
      .populate('productId', 'name price category')
      .populate('saleId', 'amount customerName createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      commissions
    });
  } catch (error) {
    console.error('Get my commissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching commissions'
    });
  }
};

// Upload payment proof
const uploadPaymentProof = async (req, res) => {
  try {
    const { commissionId } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Verify commission exists and belongs to user
    const commission = await Commission.findOne({
      _id: commissionId,
      resellerId: userId,
      status: 'pending'
    });

    if (!commission) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Commission not found or not eligible for proof upload'
      });
    }

    // Check if proof already exists
    if (commission.paymentProof) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Payment proof already uploaded for this commission'
      });
    }

    // Update commission with proof
    const fileUrl = `/uploads/payment-proofs/${req.file.filename}`;
    commission.uploadProof(userId, fileUrl, req.file.originalname);
    await commission.save();

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully',
      proof: {
        fileName: req.file.originalname,
        fileUrl,
        uploadedAt: commission.paymentProof.uploadedAt,
        verificationStatus: commission.paymentProof.verificationStatus
      }
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error while uploading proof'
    });
  }
};

// Get commission details
const getCommissionDetails = async (req, res) => {
  try {
    const { commissionId } = req.params;
    const userId = req.user._id;

    const commission = await Commission.findOne({
      _id: commissionId,
      resellerId: userId
    })
    .populate('productId', 'name price category description')
    .populate('saleId', 'amount customerName customerEmail createdAt')
    .populate('paymentProof.uploadedBy', 'firstName lastName')
    .populate('paymentProof.verifiedBy', 'firstName lastName');

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }

    res.json({
      success: true,
      commission
    });
  } catch (error) {
    console.error('Get commission details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching commission details'
    });
  }
};

// Admin: Get all pending commissions
const getPendingCommissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'pending';

    const query = { status };
    if (status === 'pending') {
      query['paymentProof.verificationStatus'] = { $ne: 'rejected' };
    }

    const commissions = await Commission.find(query)
      .populate('resellerId', 'firstName lastName email resellerId')
      .populate('productId', 'name price category')
      .populate('saleId', 'amount customerName createdAt')
      .populate('paymentProof.uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Commission.countDocuments(query);

    res.json({
      success: true,
      commissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending commissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending commissions'
    });
  }
};

// Admin: Verify payment proof
const verifyPaymentProof = async (req, res) => {
  try {
    const { commissionId } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user._id;

    const commission = await Commission.findById(commissionId)
      .populate('resellerId', 'firstName lastName email');

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }

    if (!commission.paymentProof) {
      return res.status(400).json({
        success: false,
        message: 'No payment proof uploaded for this commission'
      });
    }

    // Verify the proof
    commission.verifyProof(adminId, status, notes);
    await commission.save();

    // If approved, trigger payout process
    if (status === 'approved') {
      const beamWalletService = require('../services/beamWalletService');
      const user = await User.findById(commission.resellerId);
      
      if (user && user.beamWalletId) {
        const transfer = await beamWalletService.transferCommission(
          user.beamWalletId,
          commission.commissionAmount,
          commission._id,
          `Commission for ${commission.productInfo?.name || 'Product'}`
        );

        if (transfer.success) {
          commission.markAsPaid(transfer.transferId);
          await commission.save();
        }
      }
    }

    res.json({
      success: true,
      message: `Payment proof ${status}`,
      commission
    });
  } catch (error) {
    console.error('Verify payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying proof'
    });
  }
};

// Admin: Approve commission
const approveCommission = async (req, res) => {
  try {
    const { commissionId } = req.params;
    const { notes } = req.body;
    const adminId = req.user._id;

    const commission = await Commission.findById(commissionId);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }

    commission.approve(adminId, notes);
    await commission.save();

    res.json({
      success: true,
      message: 'Commission approved successfully',
      commission
    });
  } catch (error) {
    console.error('Approve commission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving commission'
    });
  }
};

// Admin: Reject commission
const rejectCommission = async (req, res) => {
  try {
    const { commissionId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    const commission = await Commission.findById(commissionId);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }

    commission.reject(adminId, reason);
    await commission.save();

    res.json({
      success: true,
      message: 'Commission rejected successfully',
      commission
    });
  } catch (error) {
    console.error('Reject commission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting commission'
    });
  }
};

// Get commission statistics
const getCommissionStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = await Commission.getCommissionStats(user.isAdmin ? null : userId);

    // Calculate additional stats
    const totalCommissions = await Commission.countDocuments(
      user.isAdmin ? {} : { resellerId: userId }
    );
    
    const totalAmount = await Commission.aggregate([
      { $match: user.isAdmin ? {} : { resellerId: userId } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);

    const pendingAmount = await Commission.aggregate([
      { 
        $match: { 
          status: 'pending',
          ...(user.isAdmin ? {} : { resellerId: userId })
        } 
      },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        totalCommissions,
        totalAmount: totalAmount[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get commission stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching commission statistics'
    });
  }
};

// Process automatic payouts
const processPayouts = async (req, res) => {
  try {
    const beamWalletService = require('../services/beamWalletService');
    const result = await beamWalletService.schedulePayouts();

    res.json({
      success: true,
      message: 'Payout processing initiated',
      result
    });
  } catch (error) {
    console.error('Process payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payouts'
    });
  }
};

// Get payout schedule
const getPayoutSchedule = async (req, res) => {
  try {
    const beamWalletService = require('../services/beamWalletService');
    const schedule = await beamWalletService.getPayoutSchedule();

    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Get payout schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payout schedule'
    });
  }
};

// Calculate commission for a sale
const calculateCommission = async (req, res) => {
  try {
    const { resellerId, productId, saleAmount, resellerLevel = 'Beginner' } = req.body;

    if (!resellerId || !productId || !saleAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: resellerId, productId, saleAmount'
      });
    }

    // Get commission rule based on product ID
    const CommissionRule = require('../models/CommissionRule');
    const rule = await CommissionRule.findOne({ productId: productId.toString(), isActive: true });

    if (!rule) {
      // Use default commission rate if no rule found
      const defaultCommissionRate = 50;
      const commissionAmount = (saleAmount * defaultCommissionRate) / 100;

      return res.json({
        success: true,
        commissionAmount: Math.round(commissionAmount * 100) / 100,
        commissionRate: defaultCommissionRate,
        resellerLevel,
        saleAmount,
        message: 'Using default commission rate'
      });
    }

    // Calculate commission amount using base commission
    const commissionAmount = (saleAmount * rule.baseCommission) / 100;

    res.json({
      success: true,
      commissionAmount: Math.round(commissionAmount * 100) / 100, // Round to 2 decimal places
      commissionRate: rule.baseCommission,
      resellerLevel,
      saleAmount,
      productName: rule.productName
    });
  } catch (error) {
    console.error('Calculate commission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating commission'
    });
  }
};

module.exports = {
  upload,
  getMyCommissions,
  uploadPaymentProof,
  getCommissionDetails,
  getPendingCommissions,
  verifyPaymentProof,
  approveCommission,
  rejectCommission,
  getCommissionStats,
  processPayouts,
  getPayoutSchedule,
  calculateCommission
}; 