const express = require('express');
const router = express.Router();
const gamificationService = require('../services/gamificationService');
const { auth } = require('../middleware/auth');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Get user's current level and progress
router.get('/level', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const levelInfo = await gamificationService.calculateLevel(resellerId);
    
    res.json({ success: true, level: levelInfo });
  } catch (error) {
    console.error('Error getting level info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user's achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const { page = 1, limit = 20, category, rarity } = req.query;

    let query = { resellerId };
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;

    const skip = (page - 1) * limit;
    
    const [achievements, total] = await Promise.all([
      Achievement.find(query)
        .sort({ awardedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Achievement.countDocuments(query)
    ]);

    // Get total points
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

    res.json({
      success: true,
      achievements,
      totalPoints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user's recent achievements
router.get('/achievements/recent', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const { limit = 5 } = req.query;

    const achievements = await Achievement.getRecentAchievements(resellerId, parseInt(limit));
    
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error getting recent achievements:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user's rare achievements
router.get('/achievements/rare', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const achievements = await Achievement.getRareAchievements(resellerId);
    
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('Error getting rare achievements:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get achievement statistics
router.get('/achievements/stats', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const stats = await Achievement.getAchievementStats(resellerId);
    
    res.json({ success: true, stats: stats[0] || { totalAchievements: 0, totalPoints: 0 } });
  } catch (error) {
    console.error('Error getting achievement stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'month', limit = 50 } = req.query;
    const leaderboard = await gamificationService.getLeaderboard(period, parseInt(limit));
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get achievement leaderboard
router.get('/leaderboard/achievements', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const leaderboard = await Achievement.getAchievementLeaderboard(parseInt(limit));
    
    // Get user details for leaderboard
    const resellerIds = leaderboard.map(item => item._id);
    const users = await User.find({ resellerId: { $in: resellerIds } });
    
    const userMap = {};
    users.forEach(user => {
      userMap[user.resellerId] = user;
    });

    const enrichedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      resellerId: item._id,
      firstName: userMap[item._id]?.firstName || 'Unknown',
      lastName: userMap[item._id]?.lastName || 'User',
      totalPoints: item.totalPoints,
      totalAchievements: item.totalAchievements,
      level: userMap[item._id]?.level || 'Beginner',
      achievements: item.achievements
    }));

    res.json({ success: true, leaderboard: enrichedLeaderboard });
  } catch (error) {
    console.error('Error getting achievement leaderboard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get active campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await gamificationService.getActiveCampaigns();
    
    res.json({ success: true, campaigns });
  } catch (error) {
    console.error('Error getting campaigns:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Check campaign eligibility
router.get('/campaigns/:campaignId/eligibility', auth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const resellerId = req.user.resellerId;
    
    const eligibility = await gamificationService.checkCampaignEligibility(resellerId, campaignId);
    
    res.json({ success: true, eligibility });
  } catch (error) {
    console.error('Error checking campaign eligibility:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user's gamification dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    
    // Get all gamification data in parallel
    const [levelInfo, recentAchievements, totalPoints, activeCampaigns] = await Promise.all([
      gamificationService.calculateLevel(resellerId),
      Achievement.getRecentAchievements(resellerId, 5),
      Achievement.getUserTotalPoints(resellerId),
      gamificationService.getActiveCampaigns()
    ]);

    // Check campaign eligibility for each active campaign
    const campaignsWithEligibility = await Promise.all(
      activeCampaigns.map(async (campaign) => {
        const eligibility = await gamificationService.checkCampaignEligibility(resellerId, campaign.id);
        return {
          ...campaign,
          eligibility
        };
      })
    );

    const dashboard = {
      level: levelInfo,
      recentAchievements,
      totalPoints: totalPoints[0]?.totalPoints || 0,
      campaigns: campaignsWithEligibility
    };

    res.json({ success: true, dashboard });
  } catch (error) {
    console.error('Error getting gamification dashboard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get global achievement statistics
router.get('/achievements/global', async (req, res) => {
  try {
    const stats = await Achievement.getGlobalAchievementStats();
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting global achievement stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get achievement progress for specific achievement
router.get('/achievements/:achievementId/progress', async (req, res) => {
  try {
    const { achievementId } = req.params;
    const progress = await Achievement.getAchievementProgress(achievementId);
    
    res.json({ success: true, progress: progress[0] || { totalEarned: 0, uniqueUsers: 0, recentEarned: 0 } });
  } catch (error) {
    console.error('Error getting achievement progress:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Check if user has specific achievement
router.get('/achievements/:achievementId/has', auth, async (req, res) => {
  try {
    const { achievementId } = req.params;
    const resellerId = req.user.resellerId;
    
    const hasAchievement = await Achievement.hasAchievement(resellerId, achievementId);
    
    res.json({ success: true, hasAchievement });
  } catch (error) {
    console.error('Error checking achievement:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user's level progression history
router.get('/level/history', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const { limit = 10 } = req.query;

    // This would require a separate LevelHistory model
    // For now, we'll return the current level info
    const levelInfo = await gamificationService.calculateLevel(resellerId);
    
    res.json({ 
      success: true, 
      currentLevel: levelInfo,
      history: [] // Would be populated from LevelHistory model
    });
  } catch (error) {
    console.error('Error getting level history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user's points breakdown
router.get('/points/breakdown', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const { period = 'all' } = req.query;

    let query = { resellerId };
    if (period !== 'all') {
      const startDate = gamificationService.getStartDate(period);
      query.awardedAt = { $gte: startDate };
    }

    const achievements = await Achievement.find(query);
    
    const breakdown = {
      total: achievements.reduce((sum, achievement) => sum + achievement.points, 0),
      byCategory: {},
      byRarity: {},
      recent: achievements
        .filter(a => a.awardedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum, achievement) => sum + achievement.points, 0)
    };

    // Group by category
    achievements.forEach(achievement => {
      breakdown.byCategory[achievement.category] = (breakdown.byCategory[achievement.category] || 0) + achievement.points;
    });

    // Group by rarity
    achievements.forEach(achievement => {
      breakdown.byRarity[achievement.rarity] = (breakdown.byRarity[achievement.rarity] || 0) + achievement.points;
    });

    res.json({ success: true, breakdown });
  } catch (error) {
    console.error('Error getting points breakdown:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get upcoming achievements (achievements user is close to earning)
router.get('/achievements/upcoming', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const stats = await gamificationService.getUserStats(resellerId);
    
    const upcomingAchievements = [];
    
    // Check each achievement to see if user is close to earning it
    for (const [achievementId, achievement] of Object.entries(gamificationService.achievements)) {
      const hasAchievement = await Achievement.hasAchievement(resellerId, achievementId);
      
      if (!hasAchievement) {
        // Calculate progress towards achievement
        let progress = 0;
        let target = 1;
        
        switch (achievementId) {
          case 'first_sale':
            progress = stats.totalSales;
            target = 1;
            break;
          case 'sales_milestone_5':
            progress = stats.totalSales;
            target = 5;
            break;
          case 'sales_milestone_10':
            progress = stats.totalSales;
            target = 10;
            break;
          case 'sales_milestone_25':
            progress = stats.totalSales;
            target = 25;
            break;
          case 'earnings_milestone_100':
            progress = stats.totalEarnings;
            target = 100;
            break;
          case 'earnings_milestone_500':
            progress = stats.totalEarnings;
            target = 500;
            break;
          case 'earnings_milestone_1000':
            progress = stats.totalEarnings;
            target = 1000;
            break;
          case 'conversion_master':
            progress = Math.min(stats.totalClicks, stats.conversionRate);
            target = Math.min(50, 10);
            break;
          case 'social_butterfly':
            progress = stats.uniqueSources;
            target = 5;
            break;
          case 'mobile_expert':
            progress = stats.mobileClicks;
            target = stats.totalClicks * 0.5;
            break;
          case 'international_seller':
            progress = stats.uniqueCountries;
            target = 3;
            break;
          case 'quick_converter':
            progress = stats.hasQuickConversion ? 1 : 0;
            target = 1;
            break;
          case 'consistency_king':
            progress = stats.consecutiveSalesDays;
            target = 7;
            break;
        }
        
        const progressPercentage = Math.min(100, (progress / target) * 100);
        
        if (progressPercentage > 0) {
          upcomingAchievements.push({
            id: achievementId,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points,
            progress: Math.round(progressPercentage),
            current: progress,
            target: target
          });
        }
      }
    }
    
    // Sort by progress percentage (highest first)
    upcomingAchievements.sort((a, b) => b.progress - a.progress);
    
    res.json({ success: true, upcomingAchievements: upcomingAchievements.slice(0, 5) });
  } catch (error) {
    console.error('Error getting upcoming achievements:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all available levels (for frontend compatibility)
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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get achievements for specific reseller (for frontend compatibility)
router.get('/achievements/:resellerId', auth, async (req, res) => {
  try {
    const { resellerId } = req.params;
    
    // Verify the user is requesting their own achievements or is admin
    if (req.user.resellerId !== resellerId && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const achievements = await Achievement.find({ resellerId })
      .sort({ awardedAt: -1 })
      .limit(20);

    // Transform to match frontend expectations
    const transformedAchievements = achievements.map(achievement => ({
      id: achievement._id.toString(),
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon || '🏆',
      requirement: { type: achievement.requirementType, value: achievement.requirementValue },
      reward: { type: achievement.rewardType, value: achievement.rewardValue },
      isUnlocked: true,
      awardedAt: achievement.awardedAt
    }));

    res.json({ success: true, achievements: transformedAchievements });
  } catch (error) {
    console.error('Error getting achievements for reseller:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 