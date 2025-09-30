const User = require('../models/User');
const Sale = require('../models/Sale');
const Click = require('../models/Click');
const Commission = require('../models/Commission');
const Achievement = require('../models/Achievement');

class AnalyticsService {
  constructor() {
    this.insights = {
      performanceThresholds: {
        highPerformer: 0.8, // Top 20%
        mediumPerformer: 0.5, // Top 50%
        lowPerformer: 0.2 // Bottom 20%
      },
      conversionRates: {
        excellent: 0.15, // 15%+
        good: 0.08, // 8-15%
        average: 0.04, // 4-8%
        poor: 0.02 // <4%
      }
    };
  }

  // Get comprehensive user analytics
  async getUserAnalytics(userId, timeRange = '30d') {
    try {
      const startDate = this.getStartDate(timeRange);
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const [
        salesData,
        clicksData,
        commissionsData,
        achievementsData,
        performanceRanking,
        predictions
      ] = await Promise.all([
        this.getSalesAnalytics(userId, startDate),
        this.getClicksAnalytics(userId, startDate),
        this.getCommissionsAnalytics(userId, startDate),
        this.getAchievementsAnalytics(userId, startDate),
        this.getPerformanceRanking(userId, startDate),
        this.getPredictiveInsights(userId, startDate)
      ]);

      return {
        success: true,
        analytics: {
          overview: {
            totalSales: salesData.totalSales,
            totalRevenue: salesData.totalRevenue,
            totalClicks: clicksData.totalClicks,
            totalCommissions: commissionsData.totalCommissions,
            conversionRate: clicksData.totalClicks > 0 ? (salesData.totalSales / clicksData.totalClicks) : 0,
            averageOrderValue: salesData.totalSales > 0 ? (salesData.totalRevenue / salesData.totalSales) : 0
          },
          sales: salesData,
          clicks: clicksData,
          commissions: commissionsData,
          achievements: achievementsData,
          performance: performanceRanking,
          predictions: predictions,
          insights: await this.generateInsights(userId, startDate)
        }
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get sales analytics with trends
  async getSalesAnalytics(userId, startDate) {
    const sales = await Sale.find({
      resellerId: userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    const dailySales = this.groupByDate(sales, 'timestamp');
    const productPerformance = this.groupByField(sales, 'productName');
    const sourcePerformance = this.groupByField(sales, 'utmSource');

    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.saleAmount, 0),
      dailySales,
      productPerformance,
      sourcePerformance,
      trends: this.calculateTrends(dailySales),
      topProducts: this.getTopItems(productPerformance, 5),
      topSources: this.getTopItems(sourcePerformance, 5)
    };
  }

  // Get clicks analytics with engagement metrics
  async getClicksAnalytics(userId, startDate) {
    const clicks = await Click.find({
      resellerId: userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    const dailyClicks = this.groupByDate(clicks, 'timestamp');
    const deviceBreakdown = this.groupByField(clicks, 'deviceType');
    const browserBreakdown = this.groupByField(clicks, 'browser');
    const geographicBreakdown = this.groupByField(clicks, 'country');

    return {
      totalClicks: clicks.length,
      dailyClicks,
      deviceBreakdown,
      browserBreakdown,
      geographicBreakdown,
      engagement: {
        averageTimeOnPage: clicks.reduce((sum, click) => sum + (click.timeOnPage || 0), 0) / clicks.length,
        bounceRate: clicks.filter(click => click.bounceRate).length / clicks.length,
        mobilePercentage: clicks.filter(click => click.isMobile).length / clicks.length
      },
      trends: this.calculateTrends(dailyClicks)
    };
  }

  // Get commissions analytics
  async getCommissionsAnalytics(userId, startDate) {
    const commissions = await Commission.find({
      resellerId: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const dailyCommissions = this.groupByDate(commissions, 'createdAt');
    const statusBreakdown = this.groupByField(commissions, 'status');

    return {
      totalCommissions: commissions.length,
      totalAmount: commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0),
      dailyCommissions,
      statusBreakdown,
      averageCommission: commissions.length > 0 ? 
        commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0) / commissions.length : 0,
      trends: this.calculateTrends(dailyCommissions)
    };
  }

  // Get achievements analytics
  async getAchievementsAnalytics(userId, startDate) {
    const achievements = await Achievement.find({
      resellerId: userId,
      awardedAt: { $gte: startDate }
    }).sort({ awardedAt: 1 });

    const categoryBreakdown = this.groupByField(achievements, 'category');
    const rarityBreakdown = this.groupByField(achievements, 'rarity');

    return {
      totalAchievements: achievements.length,
      totalPoints: achievements.reduce((sum, achievement) => sum + achievement.points, 0),
      categoryBreakdown,
      rarityBreakdown,
      recentAchievements: achievements.slice(-5)
    };
  }

  // Get performance ranking among all users
  async getPerformanceRanking(userId, startDate) {
    const allUsers = await User.find({ isActive: true });
    const userStats = [];

    for (const user of allUsers) {
      const sales = await Sale.countDocuments({
        resellerId: user.resellerId,
        timestamp: { $gte: startDate }
      });
      const revenue = await Sale.aggregate([
        {
          $match: {
            resellerId: user.resellerId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$saleAmount' }
          }
        }
      ]);

      userStats.push({
        userId: user._id,
        resellerId: user.resellerId,
        sales,
        revenue: revenue[0]?.total || 0
      });
    }

    // Sort by revenue
    userStats.sort((a, b) => b.revenue - a.revenue);
    
    const userRank = userStats.findIndex(stat => stat.userId.toString() === userId) + 1;
    const totalUsers = userStats.length;
    const percentile = totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers) * 100 : 0;

    return {
      rank: userRank,
      totalUsers,
      percentile,
      performance: this.getPerformanceLevel(percentile),
      topPerformers: userStats.slice(0, 10)
    };
  }

  // Get predictive insights using simple ML algorithms
  async getPredictiveInsights(userId, startDate) {
    const sales = await Sale.find({
      resellerId: userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    const clicks = await Click.find({
      resellerId: userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    // Simple linear regression for sales prediction
    const salesPrediction = this.predictLinearTrend(sales.map(sale => ({
      x: new Date(sale.timestamp).getTime(),
      y: sale.saleAmount
    })));

    // Conversion rate prediction
    const conversionRate = clicks.length > 0 ? sales.length / clicks.length : 0;
    const conversionPrediction = this.predictConversionRate(conversionRate, clicks.length);

    // Revenue prediction for next 30 days
    const next30Days = 30;
    const predictedRevenue = salesPrediction.slope * next30Days + salesPrediction.intercept;

    return {
      salesPrediction: {
        trend: salesPrediction.slope > 0 ? 'increasing' : 'decreasing',
        slope: salesPrediction.slope,
        confidence: salesPrediction.confidence
      },
      conversionPrediction: {
        currentRate: conversionRate,
        predictedRate: conversionPrediction,
        improvement: conversionPrediction - conversionRate
      },
      revenuePrediction: {
        next30Days: Math.max(0, predictedRevenue),
        next90Days: Math.max(0, predictedRevenue * 3),
        growthRate: salesPrediction.slope
      },
      recommendations: await this.generateRecommendations(userId, startDate)
    };
  }

  // Generate AI-powered insights
  async generateInsights(userId, startDate) {
    const insights = [];
    
    const sales = await Sale.countDocuments({
      resellerId: userId,
      timestamp: { $gte: startDate }
    });
    
    const clicks = await Click.countDocuments({
      resellerId: userId,
      timestamp: { $gte: startDate }
    });

    const conversionRate = clicks > 0 ? sales / clicks : 0;

    // Performance insights
    if (conversionRate < this.insights.conversionRates.poor) {
      insights.push({
        type: 'warning',
        title: 'Low Conversion Rate',
        message: 'Your conversion rate is below average. Consider improving your marketing materials or targeting.',
        priority: 'high',
        action: 'Review marketing strategy'
      });
    }

    if (sales === 0) {
      insights.push({
        type: 'critical',
        title: 'No Sales This Period',
        message: 'You haven\'t made any sales recently. Consider increasing your marketing efforts.',
        priority: 'critical',
        action: 'Increase marketing activity'
      });
    }

    // Growth insights
    const recentSales = await Sale.find({
      resellerId: userId,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const previousSales = await Sale.find({
      resellerId: userId,
      timestamp: { 
        $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    if (recentSales.length > previousSales.length * 1.5) {
      insights.push({
        type: 'success',
        title: 'Strong Growth',
        message: 'Your sales have increased significantly this week! Keep up the great work.',
        priority: 'medium',
        action: 'Continue current strategy'
      });
    }

    return insights;
  }

  // Generate personalized recommendations
  async generateRecommendations(userId, startDate) {
    const recommendations = [];

    const user = await User.findById(userId);
    const sales = await Sale.find({
      resellerId: userId,
      timestamp: { $gte: startDate }
    });

    // Level-based recommendations
    if (user.level === 'Beginner' && sales.length < 5) {
      recommendations.push({
        type: 'beginner',
        title: 'Complete Your First Sales',
        description: 'Focus on making your first 5 sales to unlock more features.',
        priority: 'high',
        estimatedImpact: 'High'
      });
    }

    // Product diversification
    const productCount = new Set(sales.map(sale => sale.productName)).size;
    if (productCount < 3) {
      recommendations.push({
        type: 'diversification',
        title: 'Diversify Your Product Portfolio',
        description: 'Promote different products to increase your earning potential.',
        priority: 'medium',
        estimatedImpact: 'Medium'
      });
    }

    // Marketing optimization
    const clicks = await Click.find({
      resellerId: userId,
      timestamp: { $gte: startDate }
    });

    if (clicks.length > 100 && sales.length < clicks.length * 0.05) {
      recommendations.push({
        type: 'optimization',
        title: 'Optimize Your Marketing',
        description: 'Your click-to-sale conversion rate is low. Review your marketing materials.',
        priority: 'high',
        estimatedImpact: 'High'
      });
    }

    return recommendations;
  }

  // Helper methods
  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  groupByDate(data, dateField) {
    const grouped = {};
    data.forEach(item => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
  }

  groupByField(data, field) {
    const grouped = {};
    data.forEach(item => {
      const value = item[field] || 'Unknown';
      grouped[value] = (grouped[value] || 0) + 1;
    });
    return grouped;
  }

  calculateTrends(data) {
    const dates = Object.keys(data).sort();
    if (dates.length < 2) return { trend: 'stable', growth: 0 };

    const values = dates.map(date => data[date]);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const growth = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return {
      trend: growth > 5 ? 'increasing' : growth < -5 ? 'decreasing' : 'stable',
      growth: Math.round(growth * 100) / 100
    };
  }

  getTopItems(data, limit) {
    return Object.entries(data)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  getPerformanceLevel(percentile) {
    if (percentile >= 80) return 'excellent';
    if (percentile >= 60) return 'good';
    if (percentile >= 40) return 'average';
    if (percentile >= 20) return 'below_average';
    return 'poor';
  }

  predictLinearTrend(data) {
    if (data.length < 2) {
      return { slope: 0, intercept: 0, confidence: 0 };
    }

    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Simple confidence calculation
    const confidence = Math.min(0.95, Math.max(0.1, n / 100));

    return { slope, intercept, confidence };
  }

  predictConversionRate(currentRate, clicks) {
    // Simple prediction based on current rate and volume
    const baseRate = 0.05; // 5% baseline
    const volumeFactor = Math.min(1, clicks / 1000); // More clicks = better prediction
    
    return currentRate * 0.7 + baseRate * 0.3 * volumeFactor;
  }
}

module.exports = new AnalyticsService(); 