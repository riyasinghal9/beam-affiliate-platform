const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Commission = require('../models/Commission');
const CommissionRule = require('../models/CommissionRule');

// Calculate commission for a sale
router.post('/calculate', auth, async (req, res) => {
  try {
    const { resellerId, productId, saleAmount, resellerLevel } = req.body;

    // Get commission rule for the product
    const commissionRule = await CommissionRule.findOne({ productId });
    if (!commissionRule) {
      return res.status(404).json({ 
        success: false, 
        message: 'Commission rule not found for this product' 
      });
    }

    // Calculate base commission
    let commissionAmount = (saleAmount * commissionRule.baseCommission) / 100;

    // Apply level-based bonuses
    let bonusMultiplier = 1;
    switch (resellerLevel) {
      case 'Ambassador':
        bonusMultiplier = 1.5;
        break;
      case 'Active':
        bonusMultiplier = 1.25;
        break;
      case 'Beginner':
        bonusMultiplier = 1.0;
        break;
    }

    // Apply volume bonuses (you might want to get actual sales count from database)
    const salesCount = 0; // This should be fetched from database
    if (salesCount >= 50) {
      bonusMultiplier += 0.5;
    } else if (salesCount >= 20) {
      bonusMultiplier += 0.25;
    } else if (salesCount >= 10) {
      bonusMultiplier += 0.1;
    }

    commissionAmount *= bonusMultiplier;

    // Apply maximum commission cap if set
    if (commissionRule.maxCommission) {
      commissionAmount = Math.min(commissionAmount, commissionRule.maxCommission);
    }

    res.json({
      success: true,
      commissionData: {
        baseCommission: commissionRule.baseCommission,
        commissionAmount: parseFloat(commissionAmount.toFixed(2)),
        bonusMultiplier: parseFloat(bonusMultiplier.toFixed(2)),
        finalCommission: parseFloat(commissionAmount.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate commission' });
  }
});

// Get commission rules for products
router.get('/rules', auth, async (req, res) => {
  try {
    const rules = await CommissionRule.find().sort({ productId: 1 });
    res.json({ success: true, rules });
  } catch (error) {
    console.error('Error getting commission rules:', error);
    res.status(500).json({ success: false, message: 'Failed to get commission rules' });
  }
});

// Update commission rules (admin only)
router.put('/rules', auth, async (req, res) => {
  try {
    const { rules } = req.body;

    // Validate user is admin (you should implement proper admin check)
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Clear existing rules and insert new ones
    await CommissionRule.deleteMany({});
    await CommissionRule.insertMany(rules);

    res.json({ success: true, message: 'Commission rules updated successfully' });
  } catch (error) {
    console.error('Error updating commission rules:', error);
    res.status(500).json({ success: false, message: 'Failed to update commission rules' });
  }
});

// Get commission statistics for reseller
router.get('/stats/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { period = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const commissions = await Commission.find({
      resellerId,
      createdAt: { $gte: startDate }
    });

    const totalEarnings = commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
    const pendingCommissions = commissions.filter(comm => comm.status === 'pending');
    const paidCommissions = commissions.filter(comm => comm.status === 'paid');
    const totalSales = commissions.length;
    const averageCommission = totalSales > 0 ? totalEarnings / totalSales : 0;

    res.json({
      success: true,
      stats: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        pendingCommissions: pendingCommissions.length,
        paidCommissions: paidCommissions.length,
        totalSales,
        averageCommission: parseFloat(averageCommission.toFixed(2)),
        commissionHistory: commissions.slice(0, 10) // Last 10 commissions
      }
    });
  } catch (error) {
    console.error('Error getting commission stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get commission statistics' });
  }
});

// Get commission history for reseller
router.get('/history/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { limit = 50 } = req.query;

    const commissions = await Commission.find({ resellerId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, commissions });
  } catch (error) {
    console.error('Error getting commission history:', error);
    res.status(500).json({ success: false, message: 'Failed to get commission history' });
  }
});

// Approve commission for payment (admin only)
router.post('/:commissionId/approve', auth, async (req, res) => {
  try {
    const { commissionId } = req.params;
    const { adminNotes } = req.body;

    // Validate user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const commission = await Commission.findById(commissionId);
    if (!commission) {
      return res.status(404).json({ success: false, message: 'Commission not found' });
    }

    commission.status = 'approved';
    commission.adminNotes = adminNotes;
    commission.approvedAt = new Date();
    await commission.save();

    res.json({ success: true, message: 'Commission approved successfully' });
  } catch (error) {
    console.error('Error approving commission:', error);
    res.status(500).json({ success: false, message: 'Failed to approve commission' });
  }
});

// Reject commission (admin only)
router.post('/:commissionId/reject', auth, async (req, res) => {
  try {
    const { commissionId } = req.params;
    const { reason } = req.body;

    // Validate user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const commission = await Commission.findById(commissionId);
    if (!commission) {
      return res.status(404).json({ success: false, message: 'Commission not found' });
    }

    commission.status = 'rejected';
    commission.rejectionReason = reason;
    commission.rejectedAt = new Date();
    await commission.save();

    res.json({ success: true, message: 'Commission rejected successfully' });
  } catch (error) {
    console.error('Error rejecting commission:', error);
    res.status(500).json({ success: false, message: 'Failed to reject commission' });
  }
});

// Process commission payment
router.post('/:commissionId/pay', auth, async (req, res) => {
  try {
    const { commissionId } = req.params;

    // Validate user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const commission = await Commission.findById(commissionId);
    if (!commission) {
      return res.status(404).json({ success: false, message: 'Commission not found' });
    }

    if (commission.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Commission must be approved before payment' });
    }

    // Here you would integrate with Beam Wallet API for actual payment
    // For now, we'll simulate the payment
    commission.status = 'paid';
    commission.paidAt = new Date();
    commission.paymentReference = `BW-${Date.now()}-${commissionId}`;
    await commission.save();

    res.json({ 
      success: true, 
      message: 'Commission payment processed successfully',
      paymentReference: commission.paymentReference
    });
  } catch (error) {
    console.error('Error processing commission payment:', error);
    res.status(500).json({ success: false, message: 'Failed to process commission payment' });
  }
});

// Get pending commissions for admin
router.get('/pending', auth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Validate user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const pendingCommissions = await Commission.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('resellerId', 'firstName lastName email resellerId');

    res.json({ success: true, pendingCommissions });
  } catch (error) {
    console.error('Error getting pending commissions:', error);
    res.status(500).json({ success: false, message: 'Failed to get pending commissions' });
  }
});

// Get commission summary for dashboard
router.get('/summary/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;

    const [totalEarnings, pendingCommissions, paidCommissions] = await Promise.all([
      Commission.aggregate([
        { $match: { resellerId } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]),
      Commission.countDocuments({ resellerId, status: 'pending' }),
      Commission.countDocuments({ resellerId, status: 'paid' })
    ]);

    res.json({
      success: true,
      summary: {
        totalEarnings: parseFloat((totalEarnings[0]?.total || 0).toFixed(2)),
        pendingCommissions,
        paidCommissions
      }
    });
  } catch (error) {
    console.error('Error getting commission summary:', error);
    res.status(500).json({ success: false, message: 'Failed to get commission summary' });
  }
});

module.exports = router; 