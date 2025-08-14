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
  requirement: {
    type: {
      type: String,
      enum: ['sales', 'earnings', 'clicks', 'conversions'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  reward: {
    type: {
      type: String,
      enum: ['bonus', 'badge', 'feature'],
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date,
    default: null
  },
  claimed: {
    type: Boolean,
    default: false
  },
  claimedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ resellerId: 1, achievementId: 1 }, { unique: true });
achievementSchema.index({ resellerId: 1, isUnlocked: 1 });

module.exports = mongoose.model('Achievement', achievementSchema); 