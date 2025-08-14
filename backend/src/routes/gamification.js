const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Campaign = require('../models/Campaign');

// Get reseller level information
router.get('/level/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;

    // Get user's sales and earnings data
    const user = await User.findOne({ resellerId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate current level based on performance
    const salesCount = user.totalSales || 0;
    const totalEarnings = user.totalEarnings || 0;

    let currentLevel = {
      id: '1',
      name: 'Beginner',
      minSales: 0,
      minEarnings: 0,
      commissionBonus: 0,
      benefits: ['Access to basic products', 'Standard commission rates'],
      icon: '🌱',
      color: 'text-green-600'
    };

    if (salesCount >= 50 && totalEarnings >= 2500) {
      currentLevel = {
        id: '3',
        name: 'Ambassador',
        minSales: 50,
        minEarnings: 2500,
        commissionBonus: 50,
        benefits: ['VIP support', 'Maximum commission rates', 'Exclusive products', 'Mentorship program'],
        icon: '👑',
        color: 'text-purple-600'
      };
    } else if (salesCount >= 10 && totalEarnings >= 500) {
      currentLevel = {
        id: '2',
        name: 'Active',
        minSales: 10,
        minEarnings: 500,
        commissionBonus: 25,
        benefits: ['Priority support', 'Higher commission rates', 'Access to premium products'],
        icon: '🚀',
        color: 'text-blue-600'
      };
    }

    // Calculate progress to next level
    let nextLevel = null;
    let progress = { salesProgress: 100, earningsProgress: 100, overallProgress: 100 };

    if (currentLevel.name === 'Beginner') {
      nextLevel = {
        id: '2',
        name: 'Active',
        minSales: 10,
        minEarnings: 500,
        commissionBonus: 25
      };
      progress = {
        salesProgress: Math.min((salesCount / 10) * 100, 100),
        earningsProgress: Math.min((totalEarnings / 500) * 100, 100),
        overallProgress: Math.min((salesCount / 10) * 100, (totalEarnings / 500) * 100)
      };
    } else if (currentLevel.name === 'Active') {
      nextLevel = {
        id: '3',
        name: 'Ambassador',
        minSales: 50,
        minEarnings: 2500,
        commissionBonus: 50
      };
      progress = {
        salesProgress: Math.min((salesCount / 50) * 100, 100),
        earningsProgress: Math.min((totalEarnings / 2500) * 100, 100),
        overallProgress: Math.min((salesCount / 50) * 100, (totalEarnings / 2500) * 100)
      };
    }

    res.json({
      success: true,
      currentLevel,
      nextLevel,
      progress,
      stats: {
        salesCount,
        totalEarnings,
        level: currentLevel.name
      }
    });
  } catch (error) {
    console.error('Error getting reseller level:', error);
    res.status(500).json({ success: false, message: 'Failed to get reseller level' });
  }
});

// Get all available levels
router.get('/levels', auth, async (req, res) => {
  try {
    const levels = [
      {
        id: '1',
        name: 'Beginner',
        minSales: 0,
        minEarnings: 0,
        commissionBonus: 0,
        benefits: ['Access to basic products', 'Standard commission rates'],
        icon: '🌱',
        color: 'text-green-600'
      },
      {
        id: '2',
        name: 'Active',
        minSales: 10,
        minEarnings: 500,
        commissionBonus: 25,
        benefits: ['Priority support', 'Higher commission rates', 'Access to premium products'],
        icon: '🚀',
        color: 'text-blue-600'
      },
      {
        id: '3',
        name: 'Ambassador',
        minSales: 50,
        minEarnings: 2500,
        commissionBonus: 50,
        benefits: ['VIP support', 'Maximum commission rates', 'Exclusive products', 'Mentorship program'],
        icon: '👑',
        color: 'text-purple-600'
      }
    ];

    res.json({ success: true, levels });
  } catch (error) {
    console.error('Error getting levels:', error);
    res.status(500).json({ success: false, message: 'Failed to get levels' });
  }
});

// Get achievements for reseller
router.get('/achievements/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;

    // Get user's stats
    const user = await User.findOne({ resellerId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salesCount = user.totalSales || 0;
    const totalEarnings = user.totalEarnings || 0;
    const conversionRate = user.conversionRate || 0;

    // Define achievements
    const achievements = [
      {
        id: '1',
        name: 'First Sale',
        description: 'Complete your first sale',
        icon: '🎯',
        requirement: { type: 'sales', value: 1 },
        reward: { type: 'bonus', value: 10 },
        isUnlocked: salesCount >= 1,
        unlockedAt: salesCount >= 1 ? new Date() : null
      },
      {
        id: '2',
        name: 'Sales Champion',
        description: 'Reach 10 sales',
        icon: '🏆',
        requirement: { type: 'sales', value: 10 },
        reward: { type: 'bonus', value: 50 },
        isUnlocked: salesCount >= 10,
        unlockedAt: salesCount >= 10 ? new Date() : null
      },
      {
        id: '3',
        name: 'Earnings Master',
        description: 'Earn $1000 in commissions',
        icon: '💰',
        requirement: { type: 'earnings', value: 1000 },
        reward: { type: 'bonus', value: 100 },
        isUnlocked: totalEarnings >= 1000,
        unlockedAt: totalEarnings >= 1000 ? new Date() : null
      },
      {
        id: '4',
        name: 'Conversion Expert',
        description: 'Achieve 20% conversion rate',
        icon: '📈',
        requirement: { type: 'conversions', value: 20 },
        reward: { type: 'badge', value: 'Conversion Expert' },
        isUnlocked: conversionRate >= 20,
        unlockedAt: conversionRate >= 20 ? new Date() : null
      }
    ];

    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ success: false, message: 'Failed to get achievements' });
  }
});

// Get active campaigns
router.get('/campaigns', auth, async (req, res) => {
  try {
    const campaigns = [
      {
        id: '1',
        name: 'Summer Sales Blitz',
        description: 'Earn extra bonuses for high performance this summer',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        requirements: { sales: 20, earnings: 1000 },
        rewards: { bonusAmount: 200, bonusPercentage: 10 },
        isActive: true
      },
      {
        id: '2',
        name: 'Newcomer Challenge',
        description: 'Special rewards for new resellers',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        requirements: { sales: 5, earnings: 250 },
        rewards: { bonusAmount: 50, bonusPercentage: 5 },
        isActive: true
      }
    ];

    res.json({ success: true, campaigns });
  } catch (error) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({ success: false, message: 'Failed to get campaigns' });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
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

    // Get top performers (this would be a real aggregation in production)
    const leaderboard = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          resellerId: 1,
          firstName: 1,
          lastName: 1,
          totalSales: { $ifNull: ['$totalSales', 0] },
          totalEarnings: { $ifNull: ['$totalEarnings', 0] },
          level: { $ifNull: ['$level', 'Beginner'] }
        }
      },
      {
        $sort: { totalEarnings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Add rank to each entry
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      resellerName: `${entry.firstName} ${entry.lastName}`
    }));

    res.json({ success: true, leaderboard: leaderboardWithRank });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to get leaderboard' });
  }
});

// Check and unlock achievements
router.post('/check-achievements', auth, async (req, res) => {
  try {
    const { resellerId, stats } = req.body;

    const user = await User.findOne({ resellerId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { sales, earnings, clicks, conversions } = stats;
    const newlyUnlocked = [];

    // Check for new achievements
    if (sales >= 1 && !user.achievements?.includes('first_sale')) {
      newlyUnlocked.push({
        id: 'first_sale',
        name: 'First Sale',
        reward: { type: 'bonus', value: 10 }
      });
    }

    if (sales >= 10 && !user.achievements?.includes('sales_champion')) {
      newlyUnlocked.push({
        id: 'sales_champion',
        name: 'Sales Champion',
        reward: { type: 'bonus', value: 50 }
      });
    }

    if (earnings >= 1000 && !user.achievements?.includes('earnings_master')) {
      newlyUnlocked.push({
        id: 'earnings_master',
        name: 'Earnings Master',
        reward: { type: 'bonus', value: 100 }
      });
    }

    // Update user achievements if new ones unlocked
    if (newlyUnlocked.length > 0) {
      const currentAchievements = user.achievements || [];
      const newAchievementIds = newlyUnlocked.map(achievement => achievement.id);
      user.achievements = [...currentAchievements, ...newAchievementIds];
      await user.save();
    }

    res.json({
      success: true,
      newlyUnlocked,
      totalUnlocked: (user.achievements || []).length + newlyUnlocked.length
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ success: false, message: 'Failed to check achievements' });
  }
});

// Claim campaign reward
router.post('/campaigns/:campaignId/claim', auth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { resellerId } = req.body;

    const user = await User.findOne({ resellerId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user meets campaign requirements
    const salesCount = user.totalSales || 0;
    const totalEarnings = user.totalEarnings || 0;

    // For demo purposes, we'll assume they qualify
    const campaignReward = {
      bonusAmount: 50,
      bonusPercentage: 5
    };

    // Add bonus to user balance
    user.balance = (user.balance || 0) + campaignReward.bonusAmount;
    await user.save();

    res.json({
      success: true,
      message: 'Campaign reward claimed successfully',
      reward: campaignReward
    });
  } catch (error) {
    console.error('Error claiming campaign reward:', error);
    res.status(500).json({ success: false, message: 'Failed to claim campaign reward' });
  }
});

module.exports = router; 