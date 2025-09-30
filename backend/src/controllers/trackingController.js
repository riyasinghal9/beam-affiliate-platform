const Click = require('../models/Click');
const Sale = require('../models/Sale');
const User = require('../models/User');
const Product = require('../models/Product');

// Track click on affiliate link
const trackClick = async (req, res) => {
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
      productId,
      linkUrl,
      userAgent: userAgent || req.headers['user-agent'],
      ipAddress: ipAddress || req.ip,
      referrer: referrer || req.headers.referer,
      utmSource,
      utmMedium,
      utmCampaign,
      timestamp: timestamp || new Date(),
      metadata: {
        source: 'affiliate_link',
        resellerId
      }
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
};

// Track sale conversion
const trackSale = async (req, res) => {
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

    // Create sale record
    const sale = new Sale({
      resellerId: reseller._id,
      productId,
      amount,
      customerName,
      customerEmail,
      paymentMethod: paymentMethod || 'unknown',
      status: 'completed',
      metadata: {
        source: 'affiliate_link',
        resellerId,
        clickId,
        commission
      }
    });

    await sale.save();

    // Update reseller's total sales
    await User.findByIdAndUpdate(reseller._id, {
      $inc: { totalSales: 1, totalEarnings: commission || 0 }
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
};

// Get tracking statistics for reseller
const getResellerStats = async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { period = 'month' } = req.query;

    // Verify reseller exists
    const reseller = await User.findOne({ resellerId, isActive: true });
    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate;
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get clicks and sales for the period
    const clicks = await Click.find({
      resellerId: reseller._id,
      timestamp: { $gte: startDate }
    });

    const sales = await Sale.find({
      resellerId: reseller._id,
      createdAt: { $gte: startDate }
    });

    // Calculate statistics
    const totalClicks = clicks.length;
    const totalSales = sales.length;
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;
    const totalEarnings = sales.reduce((sum, sale) => sum + (sale.metadata?.commission || 0), 0);

    // Get unique visitors (based on IP addresses)
    const uniqueVisitors = new Set(clicks.map(click => click.ipAddress)).size;

    // Get top products
    const productStats = await Click.aggregate([
      {
        $match: {
          resellerId: reseller._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$productId',
          clicks: { $sum: 1 }
        }
      },
      {
        $sort: { clicks: -1 }
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
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalEarnings,
        uniqueVisitors,
        topProducts: productStats
      }
    });
  } catch (error) {
    console.error('Error getting tracking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tracking statistics'
    });
  }
};

// Get click history for reseller
const getClickHistory = async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { limit = 50 } = req.query;

    // Verify reseller exists
    const reseller = await User.findOne({ resellerId, isActive: true });
    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    // Get click history
    const clicks = await Click.find({ resellerId: reseller._id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('productId', 'name price');

    res.json({
      success: true,
      clicks: clicks.map(click => ({
        id: click._id,
        productName: click.productId?.name || 'Unknown Product',
        linkUrl: click.linkUrl,
        timestamp: click.timestamp,
        ipAddress: click.ipAddress,
        userAgent: click.userAgent,
        referrer: click.referrer,
        utmSource: click.utmSource,
        utmMedium: click.utmMedium,
        utmCampaign: click.utmCampaign
      }))
    });
  } catch (error) {
    console.error('Error getting click history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get click history'
    });
  }
};

module.exports = {
  trackClick,
  trackSale,
  getResellerStats,
  getClickHistory
}; 