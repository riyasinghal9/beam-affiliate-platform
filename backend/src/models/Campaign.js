const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  requirements: {
    sales: {
      type: Number,
      default: 0
    },
    earnings: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  },
  rewards: {
    bonusAmount: {
      type: Number,
      default: 0
    },
    bonusPercentage: {
      type: Number,
      default: 0
    },
    badge: {
      type: String,
      default: ''
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participants: [{
    resellerId: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      sales: { type: Number, default: 0 },
      earnings: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 }
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    rewardClaimed: {
      type: Boolean,
      default: false
    },
    rewardClaimedAt: {
      type: Date,
      default: null
    }
  }]
}, {
  timestamps: true
});

// Indexes
campaignSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
campaignSchema.index({ 'participants.resellerId': 1 });

module.exports = mongoose.model('Campaign', campaignSchema); 