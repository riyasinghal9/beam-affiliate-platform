const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  resellerId: {
    type: String,
    required: true,
    index: true
  },
  achievementId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  awardedAt: {
    type: Date,
    default: Date.now
  },
  // Additional metadata
  category: {
    type: String,
    enum: ['sales', 'earnings', 'conversion', 'social', 'mobile', 'international', 'consistency'],
    default: 'sales'
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  // Progress tracking for multi-step achievements
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      default: 1
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  // Achievement conditions (stored for reference)
  conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Notification status
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for unique achievements per user
achievementSchema.index({ resellerId: 1, achievementId: 1 }, { unique: true });

// Index for leaderboard queries
achievementSchema.index({ awardedAt: -1 });
achievementSchema.index({ category: 1, rarity: 1 });

// Virtual for progress percentage
achievementSchema.virtual('progressPercentage').get(function() {
  if (this.progress.target === 0) return 100;
  return Math.min(100, (this.progress.current / this.progress.target) * 100);
});

// Virtual for time since awarded
achievementSchema.virtual('timeSinceAwarded').get(function() {
  const now = new Date();
  const diff = now - this.awardedAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Method to update progress
achievementSchema.methods.updateProgress = function(current, target) {
  this.progress.current = current;
  this.progress.target = target;
  this.progress.completed = current >= target;
  return this.save();
};

// Method to mark notification as sent
achievementSchema.methods.markNotificationSent = function() {
  this.notificationSent = true;
  this.notificationSentAt = new Date();
  return this.save();
};

// Static method to get user's total points
achievementSchema.statics.getUserTotalPoints = function(resellerId) {
  return this.aggregate([
    {
      $match: { resellerId }
    },
    {
      $group: {
        _id: null,
        totalPoints: { $sum: '$points' }
      }
    }
  ]);
};

// Static method to get achievement statistics
achievementSchema.statics.getAchievementStats = function(resellerId) {
  return this.aggregate([
    {
      $match: { resellerId }
    },
    {
      $group: {
        _id: null,
        totalAchievements: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        byCategory: {
          $push: {
            category: '$category',
            name: '$name',
            points: '$points'
          }
        },
        byRarity: {
          $push: {
            rarity: '$rarity',
            name: '$name',
            points: '$points'
          }
        }
      }
    }
  ]);
};

// Static method to get recent achievements
achievementSchema.statics.getRecentAchievements = function(resellerId, limit = 10) {
  return this.find({ resellerId })
    .sort({ awardedAt: -1 })
    .limit(limit);
};

// Static method to get achievements by category
achievementSchema.statics.getAchievementsByCategory = function(resellerId, category) {
  return this.find({ resellerId, category }).sort({ awardedAt: -1 });
};

// Static method to get achievements by rarity
achievementSchema.statics.getAchievementsByRarity = function(resellerId, rarity) {
  return this.find({ resellerId, rarity }).sort({ awardedAt: -1 });
};

// Static method to get global achievement statistics
achievementSchema.statics.getGlobalAchievementStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$achievementId',
        name: { $first: '$name' },
        description: { $first: '$description' },
        icon: { $first: '$icon' },
        category: { $first: '$category' },
        rarity: { $first: '$rarity' },
        points: { $first: '$points' },
        totalEarned: { $sum: 1 },
        uniqueUsers: { $addToSet: '$resellerId' }
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        icon: 1,
        category: 1,
        rarity: 1,
        points: 1,
        totalEarned: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { totalEarned: -1 }
    }
  ]);
};

// Static method to get achievement leaderboard
achievementSchema.statics.getAchievementLeaderboard = function(limit = 50) {
  return this.aggregate([
    {
      $group: {
        _id: '$resellerId',
        totalPoints: { $sum: '$points' },
        totalAchievements: { $sum: 1 },
        achievements: {
          $push: {
            name: '$name',
            icon: '$icon',
            points: '$points',
            awardedAt: '$awardedAt'
          }
        }
      }
    },
    {
      $sort: { totalPoints: -1, totalAchievements: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get rare achievements
achievementSchema.statics.getRareAchievements = function(resellerId) {
  return this.find({
    resellerId,
    rarity: { $in: ['rare', 'epic', 'legendary'] }
  }).sort({ awardedAt: -1 });
};

// Static method to check if user has specific achievement
achievementSchema.statics.hasAchievement = function(resellerId, achievementId) {
  return this.findOne({ resellerId, achievementId }).then(achievement => !!achievement);
};

// Static method to get achievement progress for all users
achievementSchema.statics.getAchievementProgress = function(achievementId) {
  return this.aggregate([
    {
      $match: { achievementId }
    },
    {
      $group: {
        _id: null,
        totalEarned: { $sum: 1 },
        uniqueUsers: { $addToSet: '$resellerId' },
        recentEarned: {
          $sum: {
            $cond: [
              { $gte: ['$awardedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Achievement', achievementSchema); 