const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Click = require('../models/Click');
const Sale = require('../models/Sale');

// Track click on affiliate link
router.post('/click', async (req, res) => {
  try {
    const {
      resellerId,
      productId,
      linkUrl,
      userAgent,
      ipAddress,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign
    } = req.body;

    // Get real IP address
    const realIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

    const click = new Click({
      resellerId,
      productId,
      linkUrl,
      userAgent: userAgent || req.headers['user-agent'],
      ipAddress: ipAddress || realIp,
      referrer: referrer || req.headers.referer,
      utmSource,
      utmMedium,
      utmCampaign,
      timestamp: new Date()
    });

    await click.save();

    res.json({ 
      success: true, 
      clickId: click._id,
      message: 'Click tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ success: false, message: 'Failed to track click' });
  }
});

// Track sale conversion
router.post('/sale', auth, async (req, res) => {
  try {
    const {
      resellerId,
      productId,
      customerEmail,
      customerName,
      amount,
      commission,
      clickId,
      paymentMethod
    } = req.body;

    const sale = new Sale({
      resellerId,
      productId,
      customerEmail,
      customerName,
      amount,
      commission,
      clickId,
      paymentMethod,
      timestamp: new Date()
    });

    await sale.save();

    res.json({ 
      success: true, 
      saleId: sale._id,
      message: 'Sale tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking sale:', error);
    res.status(500).json({ success: false, message: 'Failed to track sale' });
  }
});

// Get tracking statistics for reseller
router.get('/stats/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { period = 'month' } = req.query;

    // Calculate date range based on period
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

    // Get clicks and sales for the period
    const clicks = await Click.find({
      resellerId,
      timestamp: { $gte: startDate }
    });

    const sales = await Sale.find({
      resellerId,
      timestamp: { $gte: startDate }
    });

    // Calculate statistics
    const totalClicks = clicks.length;
    const totalSales = sales.length;
    const totalEarnings = sales.reduce((sum, sale) => sum + sale.commission, 0);
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;
    const uniqueVisitors = new Set(clicks.map(click => click.ipAddress)).size;

    // Get top products
    const productStats = await Sale.aggregate([
      {
        $match: {
          resellerId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$productId',
          sales: { $sum: 1 },
          earnings: { $sum: '$commission' }
        }
      },
      {
        $sort: { earnings: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalClicks,
        totalSales,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        uniqueVisitors,
        topProducts: productStats
      }
    });
  } catch (error) {
    console.error('Error getting tracking stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get statistics' });
  }
});

// Get click history for reseller
router.get('/clicks/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { limit = 50 } = req.query;

    const clicks = await Click.find({ resellerId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, clicks });
  } catch (error) {
    console.error('Error getting click history:', error);
    res.status(500).json({ success: false, message: 'Failed to get click history' });
  }
});

// Get conversion history for reseller
router.get('/conversions/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { limit = 50 } = req.query;

    const conversions = await Sale.find({ resellerId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, conversions });
  } catch (error) {
    console.error('Error getting conversion history:', error);
    res.status(500).json({ success: false, message: 'Failed to get conversion history' });
  }
});

// Validate reseller ID from URL
router.get('/validate/:resellerId', async (req, res) => {
  try {
    const { resellerId } = req.params;

    // Check if reseller exists (you might want to check against User model)
    // For now, we'll just validate the format
    if (!resellerId || resellerId.length < 3) {
      return res.json({ success: false, message: 'Invalid reseller ID' });
    }

    res.json({ success: true, message: 'Valid reseller ID' });
  } catch (error) {
    console.error('Error validating reseller ID:', error);
    res.status(500).json({ success: false, message: 'Failed to validate reseller ID' });
  }
});

// Get fraud detection data
router.get('/fraud/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;

    // Get recent clicks for fraud analysis
    const recentClicks = await Click.find({ resellerId })
      .sort({ timestamp: -1 })
      .limit(100);

    // Simple fraud detection logic
    const fraudIndicators = {
      multipleClicksFromSameIP: false,
      suspiciousUserAgents: false,
      rapidClicking: false
    };

    // Check for multiple clicks from same IP
    const ipCounts = {};
    recentClicks.forEach(click => {
      ipCounts[click.ipAddress] = (ipCounts[click.ipAddress] || 0) + 1;
    });

    const suspiciousIPs = Object.entries(ipCounts)
      .filter(([ip, count]) => count > 10)
      .map(([ip, count]) => ({ ip, count }));

    if (suspiciousIPs.length > 0) {
      fraudIndicators.multipleClicksFromSameIP = true;
    }

    // Check for rapid clicking (more than 5 clicks in 1 minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const rapidClicks = recentClicks.filter(click => 
      click.timestamp > oneMinuteAgo
    );

    if (rapidClicks.length > 5) {
      fraudIndicators.rapidClicking = true;
    }

    res.json({
      success: true,
      fraudIndicators,
      suspiciousIPs,
      recentClicksCount: recentClicks.length
    });
  } catch (error) {
    console.error('Error getting fraud data:', error);
    res.status(500).json({ success: false, message: 'Failed to get fraud data' });
  }
});

module.exports = router; 