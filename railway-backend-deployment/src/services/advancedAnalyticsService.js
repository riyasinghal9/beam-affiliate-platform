const User = require('../models/User');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const Click = require('../models/Click');
const Product = require('../models/Product');

class AdvancedAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get cached data or fetch fresh data
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFunction();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  // Generate predictive insights
  async generatePredictiveInsights(resellerId = null) {
    try {
      const insights = {
        salesPrediction: await this.predictSales(resellerId),
        revenueForecast: await this.forecastRevenue(resellerId),
        userSegmentation: await this.segmentUsers(resellerId),
        productPerformance: await this.analyzeProductPerformance(resellerId),
        conversionOptimization: await this.analyzeConversionOptimization(resellerId),
        seasonalTrends: await this.analyzeSeasonalTrends(resellerId),
        riskAssessment: await this.assessRisk(resellerId)
      };

      return {
        success: true,
        insights,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Generate predictive insights error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Predict future sales
  async predictSales(resellerId = null) {
    const match = resellerId ? { resellerId } : {};
    
    // Get historical sales data
    const sales = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Simple linear regression for prediction
    const predictions = this.calculateLinearRegression(sales, 30); // Predict next 30 days

    return {
      historicalData: sales,
      predictions,
      confidence: this.calculateConfidence(sales)
    };
  }

  // Forecast revenue
  async forecastRevenue(resellerId = null) {
    const match = resellerId ? { resellerId } : {};
    
    const revenue = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$amount' },
          avgOrderValue: { $avg: '$amount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const forecast = this.calculateRevenueForecast(revenue, 12); // Forecast next 12 months

    return {
      historicalRevenue: revenue,
      forecast,
      growthRate: this.calculateGrowthRate(revenue)
    };
  }

  // Segment users based on behavior
  async segmentUsers(resellerId = null) {
    const match = resellerId ? { resellerId } : {};
    
    const userSegments = await User.aggregate([
      { $match: { ...match, isReseller: true } },
      {
        $lookup: {
          from: 'sales',
          localField: '_id',
          foreignField: 'resellerId',
          as: 'sales'
        }
      },
      {
        $lookup: {
          from: 'commissions',
          localField: '_id',
          foreignField: 'resellerId',
          as: 'commissions'
        }
      },
      {
        $addFields: {
          totalSales: { $size: '$sales' },
          totalRevenue: { $sum: '$sales.amount' },
          totalCommissions: { $sum: '$commissions.commissionAmount' },
          avgOrderValue: { $avg: '$sales.amount' },
          lastActivity: { $max: '$sales.createdAt' }
        }
      },
      {
        $addFields: {
          segment: {
            $cond: {
              if: { $gte: ['$totalRevenue', 1000] },
              then: 'High Performers',
              else: {
                $cond: {
                  if: { $gte: ['$totalRevenue', 500] },
                  then: 'Active Sellers',
                  else: {
                    $cond: {
                      if: { $gte: ['$totalSales', 5] },
                      then: 'Growing',
                      else: 'Newcomers'
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          avgRevenue: { $avg: '$totalRevenue' },
          avgCommissions: { $avg: '$totalCommissions' },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      }
    ]);

    return {
      segments: userSegments,
      totalUsers: userSegments.reduce((sum, seg) => sum + seg.count, 0),
      topSegment: userSegments.reduce((top, seg) => 
        seg.totalRevenue > top.totalRevenue ? seg : top
      )
    };
  }

  // Analyze product performance
  async analyzeProductPerformance(resellerId = null) {
    const match = resellerId ? { resellerId } : {};
    
    const productPerformance = await Sale.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$productId',
          productName: { $first: '$product.name' },
          category: { $first: '$product.category' },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          avgOrderValue: { $avg: '$amount' },
          commissionRate: { $first: '$product.commission' },
          totalCommissions: { $sum: { $multiply: ['$amount', { $divide: ['$product.commission', 100] }] } }
        }
      },
      {
        $addFields: {
          conversionRate: { $divide: ['$totalSales', 100] }, // Simplified calculation
          roi: { $divide: ['$totalCommissions', { $multiply: ['$totalRevenue', 0.1] }] } // Assuming 10% marketing cost
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return {
      products: productPerformance,
      topPerformer: productPerformance[0],
      totalProducts: productPerformance.length,
      avgRevenuePerProduct: productPerformance.reduce((sum, p) => sum + p.totalRevenue, 0) / productPerformance.length
    };
  }

  // Analyze conversion optimization
  async analyzeConversionOptimization(resellerId = null) {
    const match = resellerId ? { resellerId } : {};
    
    const conversionData = await Click.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'sales',
          localField: 'productId',
          foreignField: 'productId',
          as: 'sales'
        }
      },
      {
        $addFields: {
          converted: { $gt: [{ $size: '$sales' }, 0] }
        }
      },
      {
        $group: {
          _id: {
            source: '$source',
            productId: '$productId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          clicks: { $sum: 1 },
          conversions: { $sum: { $cond: ['$converted', 1, 0] } }
        }
      },
      {
        $addFields: {
          conversionRate: { $divide: ['$conversions', '$clicks'] }
        }
      },
      { $sort: { conversionRate: -1 } }
    ]);

    const optimizationSuggestions = this.generateOptimizationSuggestions(conversionData);

    return {
      conversionData,
      suggestions: optimizationSuggestions,
      avgConversionRate: conversionData.reduce((sum, d) => sum + d.conversionRate, 0) / conversionData.length
    };
  }

  // Analyze seasonal trends
  async analyzeSeasonalTrends(resellerId = null) {
    const match = resellerId ? { resellerId } : {};
    
    const seasonalData = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            dayOfWeek: { $dayOfWeek: '$createdAt' },
            hour: { $hour: '$createdAt' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);

    const trends = {
      monthly: this.analyzeMonthlyTrends(seasonalData),
      weekly: this.analyzeWeeklyTrends(seasonalData),
      hourly: this.analyzeHourlyTrends(seasonalData),
      seasonal: this.analyzeSeasonalPatterns(seasonalData)
    };

    return trends;
  }

  // Assess risk for fraud detection
  async assessRisk(resellerId = null) {
    const match = resellerId ? { resellerId } : {};
    
    const riskFactors = await Sale.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'clicks',
          localField: 'productId',
          foreignField: 'productId',
          as: 'clicks'
        }
      },
      {
        $addFields: {
          clickToSaleRatio: { $divide: [{ $size: '$clicks' }, 1] },
          avgOrderValue: '$amount',
          timeToConversion: { $subtract: ['$createdAt', { $min: '$clicks.timestamp' }] }
        }
      },
      {
        $group: {
          _id: null,
          avgClickToSaleRatio: { $avg: '$clickToSaleRatio' },
          avgOrderValue: { $avg: '$avgOrderValue' },
          totalSales: { $sum: 1 },
          suspiciousPatterns: {
            $sum: {
              $cond: [
                { $or: [
                  { $lt: ['$clickToSaleRatio', 0.1] },
                  { $gt: ['$avgOrderValue', 1000] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const riskScore = this.calculateRiskScore(riskFactors[0] || {});

    return {
      riskFactors: riskFactors[0] || {},
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      recommendations: this.getRiskRecommendations(riskScore)
    };
  }

  // Helper methods for calculations
  calculateLinearRegression(data, periods) {
    if (data.length < 2) return [];

    const n = data.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = data.map(d => d.count || 0);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions = [];
    for (let i = n; i < n + periods; i++) {
      predictions.push({
        period: i,
        predicted: Math.max(0, slope * i + intercept)
      });
    }

    return predictions;
  }

  calculateConfidence(data) {
    if (data.length < 2) return 0;
    
    const values = data.map(d => d.count || 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.max(0, Math.min(1, 1 - (stdDev / mean)));
  }

  calculateRevenueForecast(data, periods) {
    if (data.length < 2) return [];

    const revenue = data.map(d => d.totalRevenue || 0);
    const growthRate = this.calculateGrowthRate(data);
    
    const forecast = [];
    let currentRevenue = revenue[revenue.length - 1];
    
    for (let i = 1; i <= periods; i++) {
      currentRevenue *= (1 + growthRate);
      forecast.push({
        period: i,
        predictedRevenue: currentRevenue
      });
    }

    return forecast;
  }

  calculateGrowthRate(data) {
    if (data.length < 2) return 0;
    
    const recent = data.slice(-3);
    const older = data.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, d) => sum + (d.totalRevenue || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + (d.totalRevenue || 0), 0) / older.length;
    
    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  }

  generateOptimizationSuggestions(conversionData) {
    const suggestions = [];
    
    const lowConversionSources = conversionData.filter(d => d.conversionRate < 0.02);
    if (lowConversionSources.length > 0) {
      suggestions.push({
        type: 'conversion',
        priority: 'high',
        message: 'Low conversion rates detected. Consider improving landing pages and call-to-action buttons.',
        sources: lowConversionSources.map(d => d._id.source)
      });
    }

    const highPerformingSources = conversionData.filter(d => d.conversionRate > 0.1);
    if (highPerformingSources.length > 0) {
      suggestions.push({
        type: 'optimization',
        priority: 'medium',
        message: 'High-performing traffic sources identified. Consider increasing investment in these channels.',
        sources: highPerformingSources.map(d => d._id.source)
      });
    }

    return suggestions;
  }

  analyzeMonthlyTrends(data) {
    const monthly = {};
    data.forEach(d => {
      const month = d._id.month;
      if (!monthly[month]) monthly[month] = { sales: 0, revenue: 0 };
      monthly[month].sales += d.sales;
      monthly[month].revenue += d.revenue;
    });
    return monthly;
  }

  analyzeWeeklyTrends(data) {
    const weekly = {};
    data.forEach(d => {
      const day = d._id.dayOfWeek;
      if (!weekly[day]) weekly[day] = { sales: 0, revenue: 0 };
      weekly[day].sales += d.sales;
      weekly[day].revenue += d.revenue;
    });
    return weekly;
  }

  analyzeHourlyTrends(data) {
    const hourly = {};
    data.forEach(d => {
      const hour = d._id.hour;
      if (!hourly[hour]) hourly[hour] = { sales: 0, revenue: 0 };
      hourly[hour].sales += d.sales;
      hourly[hour].revenue += d.revenue;
    });
    return hourly;
  }

  analyzeSeasonalPatterns(data) {
    // Identify peak seasons and patterns
    const monthly = this.analyzeMonthlyTrends(data);
    const peakMonths = Object.entries(monthly)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 3)
      .map(([month]) => parseInt(month));

    return {
      peakMonths,
      seasonalStrength: this.calculateSeasonalStrength(monthly)
    };
  }

  calculateSeasonalStrength(monthly) {
    const values = Object.values(monthly).map(m => m.revenue);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  }

  calculateRiskScore(factors) {
    let score = 0;
    
    if (factors.avgClickToSaleRatio < 0.1) score += 30;
    if (factors.avgOrderValue > 1000) score += 25;
    if (factors.suspiciousPatterns > factors.totalSales * 0.1) score += 45;
    
    return Math.min(100, score);
  }

  getRiskLevel(score) {
    if (score < 20) return 'low';
    if (score < 50) return 'medium';
    return 'high';
  }

  getRiskRecommendations(score) {
    const recommendations = [];
    
    if (score > 50) {
      recommendations.push('Implement additional fraud detection measures');
      recommendations.push('Review high-value transactions manually');
      recommendations.push('Consider implementing 2FA for resellers');
    }
    
    if (score > 30) {
      recommendations.push('Monitor conversion patterns closely');
      recommendations.push('Set up automated alerts for suspicious activity');
    }
    
    return recommendations;
  }

  // Get real-time analytics
  async getRealTimeAnalytics(resellerId = null) {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const match = resellerId ? { resellerId } : {};

      const [hourlyStats, dailyStats, recentActivity] = await Promise.all([
        // Hourly stats
        Sale.aggregate([
          { $match: { ...match, createdAt: { $gte: oneHourAgo } } },
          {
            $group: {
              _id: null,
              sales: { $sum: 1 },
              revenue: { $sum: '$amount' }
            }
          }
        ]),

        // Daily stats
        Sale.aggregate([
          { $match: { ...match, createdAt: { $gte: oneDayAgo } } },
          {
            $group: {
              _id: null,
              sales: { $sum: 1 },
              revenue: { $sum: '$amount' }
            }
          }
        ]),

        // Recent activity
        Sale.find({ ...match, createdAt: { $gte: oneHourAgo } })
          .populate('productId', 'name')
          .populate('resellerId', 'firstName lastName')
          .sort({ createdAt: -1 })
          .limit(10)
      ]);

      return {
        success: true,
        realTime: {
          hourly: hourlyStats[0] || { sales: 0, revenue: 0 },
          daily: dailyStats[0] || { sales: 0, revenue: 0 },
          recentActivity
        },
        timestamp: now
      };
    } catch (error) {
      console.error('Get real-time analytics error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AdvancedAnalyticsService(); 