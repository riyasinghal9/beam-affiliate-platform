const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Click = require('../models/Click');
const Sale = require('../models/Sale');
const User = require('../models/User');

// Get comprehensive analytics data
router.get('/dashboard/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get clicks and sales data
    const [clicks, sales] = await Promise.all([
      Click.find({
        resellerId,
        timestamp: { $gte: startDate }
      }),
      Sale.find({
        resellerId,
        timestamp: { $gte: startDate }
      })
    ]);

    // Calculate key metrics
    const totalClicks = clicks.length;
    const totalSales = sales.length;
    const totalEarnings = sales.reduce((sum, sale) => sum + sale.commission, 0);
    const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;
    const averageOrderValue = totalSales > 0 ? totalEarnings / totalSales : 0;
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
          revenue: { $sum: '$amount' },
          commission: { $sum: '$commission' }
        }
      },
      {
        $sort: { commission: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get traffic sources
    const trafficSources = await Click.aggregate([
      {
        $match: {
          resellerId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$utmSource',
          clicks: { $sum: 1 },
          sales: { $sum: { $cond: [{ $in: ['$_id', sales.map(s => s.clickId)] }, 1, 0] } }
        }
      },
      {
        $project: {
          source: '$_id',
          clicks: 1,
          sales: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$sales', '$clicks'] },
              100
            ]
          }
        }
      },
      {
        $sort: { clicks: -1 }
      }
    ]);

    // Generate daily stats
    const dailyStats = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      
      const dayClicks = clicks.filter(click => 
        click.timestamp >= dayStart && click.timestamp < dayEnd
      ).length;
      
      const daySales = sales.filter(sale => 
        sale.timestamp >= dayStart && sale.timestamp < dayEnd
      ).length;
      
      const dayEarnings = sales
        .filter(sale => sale.timestamp >= dayStart && sale.timestamp < dayEnd)
        .reduce((sum, sale) => sum + sale.commission, 0);

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        clicks: dayClicks,
        sales: daySales,
        earnings: parseFloat(dayEarnings.toFixed(2))
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate monthly stats
    const monthlyStats = [];
    const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    while (monthStart <= now) {
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const monthClicks = clicks.filter(click => 
        click.timestamp >= monthStart && click.timestamp <= monthEnd
      ).length;
      
      const monthSales = sales.filter(sale => 
        sale.timestamp >= monthStart && sale.timestamp <= monthEnd
      ).length;
      
      const monthEarnings = sales
        .filter(sale => sale.timestamp >= monthStart && sale.timestamp <= monthEnd)
        .reduce((sum, sale) => sum + sale.commission, 0);

      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        clicks: monthClicks,
        sales: monthSales,
        earnings: parseFloat(monthEarnings.toFixed(2))
      });

      monthStart.setMonth(monthStart.getMonth() + 1);
    }

    res.json({
      success: true,
      analytics: {
        clicks: totalClicks,
        sales: totalSales,
        earnings: parseFloat(totalEarnings.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        uniqueVisitors,
        topProducts: productStats,
        trafficSources,
        dailyStats,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error getting analytics data:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics data' });
  }
});

// Get performance trend
router.get('/trend/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { metric = 'earnings', days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let data;
    if (metric === 'clicks') {
      data = await Click.aggregate([
        {
          $match: {
            resellerId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);
    } else if (metric === 'sales') {
      data = await Sale.aggregate([
        {
          $match: {
            resellerId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);
    } else {
      data = await Sale.aggregate([
        {
          $match: {
            resellerId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            total: { $sum: '$commission' }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);
    }

    res.json({
      success: true,
      trend: data.map(item => ({
        date: item._id,
        value: metric === 'earnings' ? parseFloat(item.total.toFixed(2)) : item.count
      }))
    });
  } catch (error) {
    console.error('Error getting performance trend:', error);
    res.status(500).json({ success: false, message: 'Failed to get performance trend' });
  }
});

// Get traffic source analysis
router.get('/traffic-sources/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { period = '30d' } = req.query;

    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const trafficAnalysis = await Click.aggregate([
      {
        $match: {
          resellerId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            source: '$utmSource',
            medium: '$utmMedium',
            campaign: '$utmCampaign'
          },
          clicks: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' }
        }
      },
      {
        $project: {
          source: '$_id.source',
          medium: '$_id.medium',
          campaign: '$_id.campaign',
          clicks: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      {
        $sort: { clicks: -1 }
      }
    ]);

    res.json({
      success: true,
      trafficSources: trafficAnalysis
    });
  } catch (error) {
    console.error('Error getting traffic source analysis:', error);
    res.status(500).json({ success: false, message: 'Failed to get traffic source analysis' });
  }
});

// Get conversion funnel
router.get('/conversion-funnel/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { period = '30d' } = req.query;

    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const [totalClicks, uniqueVisitors, sales, completedPayments] = await Promise.all([
      Click.countDocuments({ resellerId, timestamp: { $gte: startDate } }),
      Click.distinct('ipAddress', { resellerId, timestamp: { $gte: startDate } }),
      Sale.countDocuments({ resellerId, timestamp: { $gte: startDate } }),
      Sale.countDocuments({ resellerId, timestamp: { $gte: startDate }, status: 'paid' })
    ]);

    const funnel = [
      {
        stage: 'Clicks',
        count: totalClicks,
        percentage: 100
      },
      {
        stage: 'Unique Visitors',
        count: uniqueVisitors.length,
        percentage: totalClicks > 0 ? (uniqueVisitors.length / totalClicks) * 100 : 0
      },
      {
        stage: 'Sales',
        count: sales,
        percentage: totalClicks > 0 ? (sales / totalClicks) * 100 : 0
      },
      {
        stage: 'Completed Payments',
        count: completedPayments,
        percentage: totalClicks > 0 ? (completedPayments / totalClicks) * 100 : 0
      }
    ];

    res.json({
      success: true,
      conversionFunnel: funnel
    });
  } catch (error) {
    console.error('Error getting conversion funnel:', error);
    res.status(500).json({ success: false, message: 'Failed to get conversion funnel' });
  }
});

// Get product performance
router.get('/product-performance/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { period = '30d' } = req.query;

    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const productPerformance = await Sale.aggregate([
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
          revenue: { $sum: '$amount' },
          commission: { $sum: '$commission' },
          averageOrderValue: { $avg: '$amount' }
        }
      },
      {
        $project: {
          productId: '$_id',
          sales: 1,
          revenue: { $round: ['$revenue', 2] },
          commission: { $round: ['$commission', 2] },
          averageOrderValue: { $round: ['$averageOrderValue', 2] }
        }
      },
      {
        $sort: { commission: -1 }
      }
    ]);

    res.json({
      success: true,
      productPerformance
    });
  } catch (error) {
    console.error('Error getting product performance:', error);
    res.status(500).json({ success: false, message: 'Failed to get product performance' });
  }
});

// Export analytics data
router.get('/export/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { format = 'csv', period = '30d' } = req.query;

    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const [clicks, sales] = await Promise.all([
      Click.find({ resellerId, timestamp: { $gte: startDate } }).sort({ timestamp: -1 }),
      Sale.find({ resellerId, timestamp: { $gte: startDate } }).sort({ timestamp: -1 })
    ]);

    if (format === 'csv') {
      // Generate CSV data
      const csvData = [
        ['Date', 'Type', 'Product', 'Amount', 'Commission', 'Status'],
        ...clicks.map(click => [
          click.timestamp.toISOString(),
          'Click',
          click.productId,
          '',
          '',
          'Tracked'
        ]),
        ...sales.map(sale => [
          sale.timestamp.toISOString(),
          'Sale',
          sale.productId,
          sale.amount,
          sale.commission,
          sale.status
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${resellerId}-${period}.csv`);
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: {
          clicks,
          sales,
          summary: {
            totalClicks: clicks.length,
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
            totalCommission: sales.reduce((sum, sale) => sum + sale.commission, 0)
          }
        }
      });
    }
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ success: false, message: 'Failed to export analytics data' });
  }
});

module.exports = router; 