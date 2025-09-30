const express = require('express');
const router = express.Router();
const trackingService = require('../services/trackingService');
const beamWalletService = require('../services/beamWalletService');
const gamificationService = require('../services/gamificationService');
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Click = require('../models/Click');
const User = require('../models/User'); // Added missing import for User

// POST endpoint for tracking clicks (used by frontend)
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
      utmCampaign,
      timestamp
    } = req.body;

    // Validate required fields
    if (!resellerId || !productId || !linkUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required tracking data'
      });
    }

    // Verify reseller exists
    const reseller = await User.findOne({ resellerId, isActive: true });
    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    // Create click record
    const click = new Click({
      resellerId: reseller._id,
      productId: productId, // Keep as string for now
      source: 'referral',
      ip: ipAddress || req.ip,
      userAgent: userAgent || req.headers['user-agent'],
      referrer: referrer || req.headers.referer,
      utmSource,
      utmMedium,
      utmCampaign,
      converted: false
    });

    await click.save();

    // Update reseller's total clicks
    await User.findByIdAndUpdate(reseller._id, {
      $inc: { totalClicks: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Click tracked successfully',
      clickId: click._id
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
});

// POST endpoint for tracking sales (used by frontend)
router.post('/sale', async (req, res) => {
  try {
    const {
      resellerId,
      productId,
      customerEmail,
      customerName,
      amount,
      commission,
      clickId,
      paymentMethod,
      timestamp
    } = req.body;

    // Validate required fields
    if (!resellerId || !productId || !customerEmail || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required sale data'
      });
    }

    // Verify reseller exists
    const reseller = await User.findOne({ resellerId, isActive: true });
    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    // Get product information
    let product = null;
    let productName = 'Unknown Product';
    let commissionRate = 50;

    try {
      // Try to find product by ID (handle both ObjectId and string IDs)
      if (productId.match(/^[0-9a-fA-F]{24}$/)) {
        // Valid ObjectId format
        product = await Product.findById(productId);
      } else {
        // String ID - try to find by productId field or use default
        product = await Product.findOne({ productId: productId });
      }
      
      if (product) {
        productName = product.name;
        commissionRate = product.commission || 50;
      }
    } catch (error) {
      console.log('Product lookup failed, using defaults:', error.message);
      // Use defaults if product lookup fails
    }

    // Calculate commission if not provided
    const commissionAmount = commission || (amount * commissionRate / 100);

    // Generate tracking ID
    const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create sale record with all required fields
    const sale = new Sale({
      trackingId: trackingId,
      resellerId: resellerId, // Use string resellerId
      productId: productId.toString(), // Convert to string
      productName: productName,
      saleAmount: amount,
      commissionAmount: commissionAmount,
      commissionRate: commissionRate,
      customerEmail: customerEmail,
      customerName: customerName || 'Unknown Customer',
      customerPhone: '', // Optional field
      paymentMethod: paymentMethod || 'unknown',
      paymentStatus: 'completed',
      paymentId: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      commissionStatus: 'pending',
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: timestamp || new Date()
    });

    await sale.save();

    // Update reseller's total sales
    await User.findByIdAndUpdate(reseller._id, {
      $inc: { totalSales: 1, totalEarnings: commissionAmount }
    });

    res.status(201).json({
      success: true,
      message: 'Sale tracked successfully',
      saleId: sale._id
    });
  } catch (error) {
    console.error('Error tracking sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track sale'
    });
  }
});

// Track link click
router.get('/click/:resellerId/:productId', async (req, res) => {
  try {
    const { resellerId, productId } = req.params;
    
    // Get product information
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Track the click
    const trackingResult = await trackingService.trackClick(req, resellerId, productId, product.name);
    
    if (!trackingResult.success) {
      return res.status(500).json({ success: false, message: trackingResult.error });
    }

    // Redirect to product page with tracking parameters
    const redirectUrl = new URL(product.purchaseUrl);
    redirectUrl.searchParams.set('tracking_id', trackingResult.trackingId);
    redirectUrl.searchParams.set('reseller_id', resellerId);
    redirectUrl.searchParams.set('product_id', productId);
    
    // Add UTM parameters if present
    if (req.query.utm_source) redirectUrl.searchParams.set('utm_source', req.query.utm_source);
    if (req.query.utm_medium) redirectUrl.searchParams.set('utm_medium', req.query.utm_medium);
    if (req.query.utm_campaign) redirectUrl.searchParams.set('utm_campaign', req.query.utm_campaign);
    if (req.query.utm_term) redirectUrl.searchParams.set('utm_term', req.query.utm_term);
    if (req.query.utm_content) redirectUrl.searchParams.set('utm_content', req.query.utm_content);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Track conversion (webhook from payment processor)
router.post('/conversion', async (req, res) => {
  try {
    const { trackingId, saleData } = req.body;
    
    if (!trackingId || !saleData) {
      return res.status(400).json({ success: false, message: 'Missing required data' });
    }

    // Track the conversion
    const conversionResult = await trackingService.trackConversion(trackingId, saleData);
    
    if (!conversionResult.success) {
      return res.status(500).json({ success: false, message: conversionResult.error });
    }

    // Process commission payment
    const paymentResult = await processCommissionPayment(saleData);
    
    // Check for achievements and level ups
    await gamificationService.checkAchievements(saleData.resellerId);
    await gamificationService.calculateLevel(saleData.resellerId);

    res.json({
      success: true,
      conversionId: conversionResult.saleId,
      paymentStatus: paymentResult.success ? 'processed' : 'pending'
    });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get analytics for authenticated user
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const resellerId = req.user.resellerId;

    const analytics = await trackingService.getResellerAnalytics(resellerId, period);
    
    if (!analytics.success) {
      return res.status(500).json({ success: false, message: analytics.error });
    }

    res.json({ success: true, analytics: analytics.analytics });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get detailed click analytics
router.get('/clicks', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, source, device } = req.query;
    const resellerId = req.user.resellerId;

    const query = { resellerId };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (source) {
      query.$or = [
        { utmSource: source },
        { referrer: { $regex: source, $options: 'i' } }
      ];
    }
    
    if (device) {
      query.deviceType = device;
    }

    const skip = (page - 1) * limit;
    
    const [clicks, total] = await Promise.all([
      Click.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Click.countDocuments(query)
    ]);

    res.json({
      success: true,
      clicks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting clicks:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get detailed sales analytics
router.get('/sales', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, status, product } = req.query;
    const resellerId = req.user.resellerId;

    const query = { resellerId };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) {
      query.paymentStatus = status;
    }
    
    if (product) {
      query.productName = { $regex: product, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const [sales, total] = await Promise.all([
      Sale.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Sale.countDocuments(query)
    ]);

    res.json({
      success: true,
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting sales:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get conversion funnel data
router.get('/funnel', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const resellerId = req.user.resellerId;

    const query = { resellerId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [clicks, sales] = await Promise.all([
      Click.find(query),
      Sale.find({ ...query, isVerified: true })
    ]);

    const funnel = {
      clicks: clicks.length,
      uniqueVisitors: new Set(clicks.map(c => c.ipAddress)).size,
      sales: sales.length,
      conversionRate: clicks.length > 0 ? (sales.length / clicks.length * 100).toFixed(2) : 0,
      revenue: sales.reduce((sum, sale) => sum + sale.saleAmount, 0),
      commission: sales.reduce((sum, sale) => sum + sale.commissionAmount, 0)
    };

    res.json({ success: true, funnel });
  } catch (error) {
    console.error('Error getting funnel data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get geographic analytics
router.get('/geographic', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const resellerId = req.user.resellerId;

    const query = { resellerId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [clickGeo, saleGeo] = await Promise.all([
      Click.aggregate([
        { $match: query },
        { $group: { _id: '$country', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
        { $limit: 10 }
      ]),
      Sale.aggregate([
        { $match: { ...query, isVerified: true } },
        { $group: { _id: '$country', sales: { $sum: 1 }, revenue: { $sum: '$saleAmount' } } },
        { $sort: { sales: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      geographic: {
        clicks: clickGeo,
        sales: saleGeo
      }
    });
  } catch (error) {
    console.error('Error getting geographic data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get device analytics
router.get('/devices', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const resellerId = req.user.resellerId;

    const query = { resellerId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [clickDevices, saleDevices] = await Promise.all([
      Click.aggregate([
        { $match: query },
        { $group: { _id: '$deviceType', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } }
      ]),
      Sale.aggregate([
        { $match: { ...query, isVerified: true } },
        { $group: { _id: '$deviceType', sales: { $sum: 1 }, revenue: { $sum: '$saleAmount' } } },
        { $sort: { sales: -1 } }
      ])
    ]);

    res.json({
      success: true,
      devices: {
        clicks: clickDevices,
        sales: saleDevices
      }
    });
  } catch (error) {
    console.error('Error getting device data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get source analytics
router.get('/sources', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const resellerId = req.user.resellerId;

    const query = { resellerId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [clickSources, saleSources] = await Promise.all([
      Click.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $cond: [
                { $ne: ['$utmSource', null] },
                '$utmSource',
                { $cond: [{ $ne: ['$referrer', null] }, '$referrer', 'Direct'] }
              ]
            },
            clicks: { $sum: 1 }
          }
        },
        { $sort: { clicks: -1 } },
        { $limit: 10 }
      ]),
      Sale.aggregate([
        { $match: { ...query, isVerified: true } },
        {
          $group: {
            _id: {
              $cond: [
                { $ne: ['$utmSource', null] },
                '$utmSource',
                { $cond: [{ $ne: ['$referrer', null] }, '$referrer', 'Direct'] }
              ]
            },
            sales: { $sum: 1 },
            revenue: { $sum: '$saleAmount' }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      sources: {
        clicks: clickSources,
        sales: saleSources
      }
    });
  } catch (error) {
    console.error('Error getting source data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get time series data
router.get('/timeseries', auth, async (req, res) => {
  try {
    const { startDate, endDate, interval = 'day' } = req.query;
    const resellerId = req.user.resellerId;

    const query = { resellerId };
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [clickTimeSeries, saleTimeSeries] = await Promise.all([
      Click.getTimeSeriesData(resellerId, new Date(startDate), new Date(endDate), interval),
      Sale.getTimeSeriesData(resellerId, new Date(startDate), new Date(endDate), interval)
    ]);

    res.json({
      success: true,
      timeSeries: {
        clicks: clickTimeSeries,
        sales: saleTimeSeries
      }
    });
  } catch (error) {
    console.error('Error getting time series data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Process commission payment
async function processCommissionPayment(saleData) {
  try {
    // Calculate commission with level bonuses
    const user = await User.findOne({ resellerId: saleData.resellerId });
    const levelInfo = await gamificationService.calculateLevel(saleData.resellerId);
    
    let commissionAmount = saleData.commissionAmount;
    if (levelInfo.benefits.commissionBonus > 0) {
      commissionAmount += (saleData.commissionAmount * levelInfo.benefits.commissionBonus / 100);
    }

    // Send payment to Beam Wallet
    const paymentResult = await beamWalletService.sendPayment(
      saleData.resellerId,
      commissionAmount,
      saleData.paymentId,
      `Commission for ${saleData.productName}`
    );

    if (paymentResult.success) {
      // Update sale record
      await Sale.findOneAndUpdate(
        { trackingId: saleData.trackingId },
        {
          commissionAmount,
          commissionStatus: 'paid',
          commissionPaidAt: new Date()
        }
      );
    }

    return paymentResult;
  } catch (error) {
    console.error('Error processing commission payment:', error);
    return { success: false, error: error.message };
  }
}

module.exports = router; 