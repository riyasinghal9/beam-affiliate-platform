const User = require('../models/User');
const Sale = require('../models/Sale');
const Click = require('../models/Click');
const Achievement = require('../models/Achievement');

class GamificationService {
  constructor() {
    this.levels = {
      'Beginner': {
        minSales: 0,
        minEarnings: 0,
        commissionBonus: 0,
        features: ['Basic dashboard', 'Product links', 'Training materials']
      },
      'Active': {
        minSales: 5,
        minEarnings: 100,
        commissionBonus: 5, // 5% bonus
        features: ['Advanced analytics', 'Priority support', 'Marketing materials']
      },
      'Ambassador': {
        minSales: 20,
        minEarnings: 500,
        commissionBonus: 10, // 10% bonus
        features: ['VIP support', 'Custom campaigns', 'Exclusive products']
      },
      'Elite': {
        minSales: 50,
        minEarnings: 1500,
        commissionBonus: 15, // 15% bonus
        features: ['Dedicated manager', 'Custom commission rates', 'Early access']
      },
      'Legend': {
        minSales: 100,
        minEarnings: 5000,
        commissionBonus: 20, // 20% bonus
        features: ['All features', 'Special events', 'Partnership opportunities']
      }
    };

    this.achievements = {
      'first_sale': {
        name: 'First Sale',
        description: 'Complete your first sale',
        icon: '🎯',
        points: 100,
        condition: (stats) => stats.totalSales >= 1
      },
      'sales_milestone_5': {
        name: 'Sales Milestone: 5',
        description: 'Complete 5 sales',
        icon: '🏆',
        points: 250,
        condition: (stats) => stats.totalSales >= 5
      },
      'sales_milestone_10': {
        name: 'Sales Milestone: 10',
        description: 'Complete 10 sales',
        icon: '🏆',
        points: 500,
        condition: (stats) => stats.totalSales >= 10
      },
      'sales_milestone_25': {
        name: 'Sales Milestone: 25',
        description: 'Complete 25 sales',
        icon: '🏆',
        points: 1000,
        condition: (stats) => stats.totalSales >= 25
      },
      'earnings_milestone_100': {
        name: 'Earnings Milestone: $100',
        description: 'Earn $100 in commissions',
        icon: '💰',
        points: 200,
        condition: (stats) => stats.totalEarnings >= 100
      },
      'earnings_milestone_500': {
        name: 'Earnings Milestone: $500',
        description: 'Earn $500 in commissions',
        icon: '💰',
        points: 500,
        condition: (stats) => stats.totalEarnings >= 500
      },
      'earnings_milestone_1000': {
        name: 'Earnings Milestone: $1,000',
        description: 'Earn $1,000 in commissions',
        icon: '💰',
        points: 1000,
        condition: (stats) => stats.totalEarnings >= 1000
      },
      'conversion_master': {
        name: 'Conversion Master',
        description: 'Achieve 10% conversion rate with 50+ clicks',
        icon: '📈',
        points: 750,
        condition: (stats) => stats.totalClicks >= 50 && stats.conversionRate >= 10
      },
      'social_butterfly': {
        name: 'Social Butterfly',
        description: 'Get clicks from 5 different sources',
        icon: '🦋',
        points: 300,
        condition: (stats) => stats.uniqueSources >= 5
      },
      'mobile_expert': {
        name: 'Mobile Expert',
        description: 'Get 50% of clicks from mobile devices',
        icon: '📱',
        points: 400,
        condition: (stats) => stats.mobileClicks >= stats.totalClicks * 0.5
      },
      'international_seller': {
        name: 'International Seller',
        description: 'Make sales in 3 different countries',
        icon: '🌍',
        points: 600,
        condition: (stats) => stats.uniqueCountries >= 3
      },
      'quick_converter': {
        name: 'Quick Converter',
        description: 'Convert a click within 1 hour',
        icon: '⚡',
        points: 200,
        condition: (stats) => stats.hasQuickConversion
      },
      'consistency_king': {
        name: 'Consistency King',
        description: 'Make sales for 7 consecutive days',
        icon: '👑',
        points: 800,
        condition: (stats) => stats.consecutiveSalesDays >= 7
      }
    };

    this.campaigns = {
      'new_year_2024': {
        name: 'New Year 2024 Campaign',
        description: 'Start the year strong with bonus commissions',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        bonus: 20, // 20% bonus
        conditions: {
          minSales: 10,
          minEarnings: 200
        }
      },
      'summer_boost': {
        name: 'Summer Boost Campaign',
        description: 'Summer sales with extra rewards',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        bonus: 15,
        conditions: {
          minSales: 5,
          minEarnings: 100
        }
      },
      'holiday_special': {
        name: 'Holiday Special Campaign',
        description: 'Holiday season with special bonuses',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-31'),
        bonus: 25,
        conditions: {
          minSales: 15,
          minEarnings: 300
        }
      }
    };
  }

  // Calculate user's current level
  async calculateLevel(resellerId) {
    try {
      const user = await User.findOne({ resellerId });
      if (!user) throw new Error('User not found');

      const stats = await this.getUserStats(resellerId);
      
      // Find the highest level the user qualifies for
      let currentLevel = 'Beginner';
      for (const [level, requirements] of Object.entries(this.levels)) {
        if (stats.totalSales >= requirements.minSales && 
            stats.totalEarnings >= requirements.minEarnings) {
          currentLevel = level;
        } else {
          break; // Stop at first level they don't qualify for
        }
      }

      // Update user's level if it changed
      if (user.level !== currentLevel) {
        user.level = currentLevel;
        await user.save();
        
        // Trigger level up notification
        await this.triggerLevelUpNotification(user, currentLevel);
      }

      return {
        currentLevel,
        nextLevel: this.getNextLevel(currentLevel),
        progress: this.calculateLevelProgress(stats, currentLevel),
        benefits: this.levels[currentLevel]
      };
    } catch (error) {
      console.error('Error calculating level:', error);
      throw error;
    }
  }

  // Get user statistics for gamification
  async getUserStats(resellerId) {
    try {
      const [sales, clicks] = await Promise.all([
        Sale.find({ resellerId, isVerified: true }),
        Click.find({ resellerId })
      ]);

      const totalSales = sales.length;
      const totalEarnings = sales.reduce((sum, sale) => sum + sale.commissionAmount, 0);
      const totalClicks = clicks.length;
      const conversionRate = totalClicks > 0 ? (totalSales / totalClicks * 100) : 0;

      // Get unique sources
      const uniqueSources = new Set(clicks.map(click => click.utmSource || click.referrer || 'Direct')).size;

      // Get mobile clicks
      const mobileClicks = clicks.filter(click => click.isMobile).length;

      // Get unique countries
      const uniqueCountries = new Set(sales.map(sale => sale.country).filter(Boolean)).size;

      // Check for quick conversions
      const hasQuickConversion = sales.some(sale => sale.conversionTime && sale.conversionTime <= 3600000); // 1 hour

      // Calculate consecutive sales days
      const consecutiveSalesDays = this.calculateConsecutiveSalesDays(sales);

      return {
        totalSales,
        totalEarnings,
        totalClicks,
        conversionRate,
        uniqueSources,
        mobileClicks,
        uniqueCountries,
        hasQuickConversion,
        consecutiveSalesDays
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Calculate consecutive sales days
  calculateConsecutiveSalesDays(sales) {
    if (sales.length === 0) return 0;

    const salesDates = sales
      .map(sale => sale.timestamp.toISOString().split('T')[0])
      .sort()
      .filter((date, index, arr) => arr.indexOf(date) === index); // Remove duplicates

    let maxConsecutive = 1;
    let currentConsecutive = 1;

    for (let i = 1; i < salesDates.length; i++) {
      const prevDate = new Date(salesDates[i - 1]);
      const currDate = new Date(salesDates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }

  // Get next level information
  getNextLevel(currentLevel) {
    const levelKeys = Object.keys(this.levels);
    const currentIndex = levelKeys.indexOf(currentLevel);
    
    if (currentIndex === levelKeys.length - 1) {
      return null; // Already at max level
    }

    const nextLevel = levelKeys[currentIndex + 1];
    return {
      name: nextLevel,
      requirements: this.levels[nextLevel]
    };
  }

  // Calculate level progress
  calculateLevelProgress(stats, currentLevel) {
    const levelKeys = Object.keys(this.levels);
    const currentIndex = levelKeys.indexOf(currentLevel);
    
    if (currentIndex === levelKeys.length - 1) {
      return { sales: 100, earnings: 100 }; // Max level
    }

    const nextLevel = levelKeys[currentIndex + 1];
    const nextRequirements = this.levels[nextLevel];

    const salesProgress = Math.min(100, (stats.totalSales / nextRequirements.minSales) * 100);
    const earningsProgress = Math.min(100, (stats.totalEarnings / nextRequirements.minEarnings) * 100);

    return {
      sales: Math.round(salesProgress),
      earnings: Math.round(earningsProgress)
    };
  }

  // Check and award achievements
  async checkAchievements(resellerId) {
    try {
      const user = await User.findOne({ resellerId });
      if (!user) throw new Error('User not found');

      const stats = await this.getUserStats(resellerId);
      const newAchievements = [];

      for (const [achievementId, achievement] of Object.entries(this.achievements)) {
        // Check if user already has this achievement
        const existingAchievement = await Achievement.findOne({
          resellerId,
          achievementId
        });

        if (!existingAchievement && achievement.condition(stats)) {
          // Award the achievement
          const newAchievement = new Achievement({
            resellerId,
            achievementId,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points,
            awardedAt: new Date()
          });

          await newAchievement.save();
          newAchievements.push(newAchievement);

          // Update user's points
          user.points = (user.points || 0) + achievement.points;
          await user.save();

          // Trigger achievement notification
          await this.triggerAchievementNotification(user, newAchievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Get user's achievements
  async getUserAchievements(resellerId) {
    try {
      const achievements = await Achievement.find({ resellerId }).sort({ awardedAt: -1 });
      return achievements;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(period = 'month', limit = 50) {
    try {
      const startDate = this.getStartDate(period);
      
      const leaderboard = await Sale.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            isVerified: true
          }
        },
        {
          $group: {
            _id: '$resellerId',
            totalSales: { $sum: 1 },
            totalEarnings: { $sum: '$commissionAmount' }
          }
        },
        {
          $sort: { totalEarnings: -1 }
        },
        {
          $limit: limit
        }
      ]);

      // Get user details for leaderboard
      const resellerIds = leaderboard.map(item => item._id);
      const users = await User.find({ resellerId: { $in: resellerIds } });

      const userMap = {};
      users.forEach(user => {
        userMap[user.resellerId] = user;
      });

      return leaderboard.map((item, index) => ({
        rank: index + 1,
        resellerId: item._id,
        firstName: userMap[item._id]?.firstName || 'Unknown',
        lastName: userMap[item._id]?.lastName || 'User',
        totalSales: item.totalSales,
        totalEarnings: item.totalEarnings,
        level: userMap[item._id]?.level || 'Beginner'
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Get active campaigns
  async getActiveCampaigns() {
    const now = new Date();
    const activeCampaigns = [];

    for (const [campaignId, campaign] of Object.entries(this.campaigns)) {
      if (now >= campaign.startDate && now <= campaign.endDate) {
        activeCampaigns.push({
          id: campaignId,
          ...campaign
        });
      }
    }

    return activeCampaigns;
  }

  // Check campaign eligibility
  async checkCampaignEligibility(resellerId, campaignId) {
    try {
      const campaign = this.campaigns[campaignId];
      if (!campaign) throw new Error('Campaign not found');

      const stats = await this.getUserStats(resellerId);
      
      return {
        eligible: stats.totalSales >= campaign.conditions.minSales && 
                 stats.totalEarnings >= campaign.conditions.minEarnings,
        requirements: campaign.conditions,
        currentStats: {
          sales: stats.totalSales,
          earnings: stats.totalEarnings
        },
        bonus: campaign.bonus
      };
    } catch (error) {
      console.error('Error checking campaign eligibility:', error);
      throw error;
    }
  }

  // Get start date for period
  getStartDate(period) {
    const now = new Date();
    switch (period) {
      case 'week': return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case 'month': return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case 'quarter': return new Date(now - 90 * 24 * 60 * 60 * 1000);
      case 'year': return new Date(now - 365 * 24 * 60 * 60 * 1000);
      default: return new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Trigger level up notification
  async triggerLevelUpNotification(user, newLevel) {
    // This would integrate with your notification system
    console.log(`🎉 Level Up! ${user.firstName} ${user.lastName} reached ${newLevel} level!`);
    
    // You could send email, push notification, etc.
    // await emailService.sendLevelUpEmail(user.email, newLevel);
    // await notificationService.sendPushNotification(user.id, `Congratulations! You've reached ${newLevel} level!`);
  }

  // Trigger achievement notification
  async triggerAchievementNotification(user, achievement) {
    console.log(`🏆 Achievement Unlocked! ${user.firstName} earned "${achievement.name}" achievement!`);
    
    // You could send email, push notification, etc.
    // await emailService.sendAchievementEmail(user.email, achievement);
    // await notificationService.sendPushNotification(user.id, `Achievement Unlocked: ${achievement.name}!`);
  }
}

module.exports = new GamificationService(); 