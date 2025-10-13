const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  resellerId: {
    type: String,
    unique: true,
    sparse: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isReseller: {
    type: Boolean,
    default: false
  },
  level: {
    type: String,
    enum: ['Beginner', 'Active', 'Ambassador'],
    default: 'Beginner'
  },
  balance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  socialMedia: {
    type: String,
    enum: ['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'whatsapp', 'other', ''],
    default: ''
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorSecret: String,
  beamWalletId: {
    type: String,
    sparse: true
  },
  walletCreated: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },
  security: {
    lastPasswordChange: { type: Date, default: Date.now },
    failedLoginAttempts: { type: Number, default: 0 },
    accountLocked: { type: Boolean, default: false },
    lockExpires: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate reseller ID if not exists
userSchema.pre('save', async function(next) {
  if (this.isReseller && !this.resellerId) {
    const crypto = require('crypto');
    let resellerId;
    let isUnique = false;
    
    while (!isUnique) {
      resellerId = crypto.randomBytes(3).toString('hex').toUpperCase();
      const existingUser = await this.constructor.findOne({ resellerId });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    this.resellerId = resellerId;
  }
  next();
});

// Update level based on sales
userSchema.methods.updateLevel = function() {
  if (this.totalSales >= 50) {
    this.level = 'Ambassador';
  } else if (this.totalSales >= 10) {
    this.level = 'Active';
  } else {
    this.level = 'Beginner';
  }
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Exclude password from JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema); 