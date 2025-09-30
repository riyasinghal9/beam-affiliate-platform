const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '30d'
  });
};

// @desc    Register new reseller
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, beamWalletNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      isReseller: true
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        resellerId: user.resellerId,
        level: user.level,
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        totalSales: user.totalSales,
        totalClicks: user.totalClicks,
        isAdmin: user.isAdmin,
        isReseller: user.isReseller,
        socialMedia: user.socialMedia,
        experience: user.experience,
        goals: user.goals
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Register reseller (new endpoint)
const registerReseller = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      socialMedia,
      experience,
      goals
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate unique reseller ID
    const crypto = require('crypto');
    let resellerId;
    let isUnique = false;
    
    while (!isUnique) {
      resellerId = crypto.randomBytes(3).toString('hex').toUpperCase();
      const existingReseller = await User.findOne({ resellerId });
      if (!existingReseller) {
        isUnique = true;
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new reseller
    const reseller = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      resellerId,
      socialMedia,
      experience,
      goals,
      isReseller: true,
      level: 'Beginner',
      balance: 0,
      totalEarnings: 0,
      totalSales: 0,
      totalClicks: 0,
      isActive: true
    });

    await reseller.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: reseller._id, email: reseller.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Reseller registered successfully',
      token,
      user: {
        id: reseller._id,
        firstName: reseller.firstName,
        lastName: reseller.lastName,
        email: reseller.email,
        resellerId: reseller.resellerId,
        level: reseller.level,
        balance: reseller.balance,
        totalEarnings: reseller.totalEarnings,
        totalSales: reseller.totalSales,
        isReseller: reseller.isReseller
      }
    });
  } catch (error) {
    console.error('Reseller registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login reseller
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        resellerId: user.resellerId,
        level: user.level,
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        totalSales: user.totalSales,
        totalClicks: user.totalClicks,
        isAdmin: user.isAdmin,
        isReseller: user.isReseller,
        socialMedia: user.socialMedia,
        experience: user.experience,
        goals: user.goals
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        resellerId: user.resellerId,
        level: user.level,
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        totalSales: user.totalSales,
        totalClicks: user.totalClicks,
        isAdmin: user.isAdmin,
        isReseller: user.isReseller,
        socialMedia: user.socialMedia,
        experience: user.experience,
        goals: user.goals
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real app, you would send an email here
    // For now, just return the token
    res.json({
      success: true,
      message: 'Password reset email sent',
      resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Create Beam wallet for user
const createBeamWallet = async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: "User ID and email are required"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user already has a wallet
    if (user.beamWalletId) {
      return res.status(400).json({
        success: false,
        message: "User already has a Beam wallet"
      });
    }

    // Create wallet using BeamWalletService
    const beamWalletService = require("../services/beamWalletService");
    const walletResult = await beamWalletService.createWallet(
      userId,
      user.resellerId,
      email
    );

    if (walletResult.success) {
      // Update user with wallet information
      user.beamWalletId = walletResult.walletId;
      user.walletCreated = true;
      await user.save();

      return res.status(201).json({
        success: true,
        message: "Beam wallet created successfully",
        wallet: {
          walletId: walletResult.walletId,
          address: walletResult.address,
          balance: walletResult.balance
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: walletResult.error || "Failed to create Beam wallet"
      });
    }
  } catch (error) {
    console.error("Create Beam wallet error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during wallet creation"
    });
  }
};


module.exports = {
  register,
  login,
  getMe,
  registerReseller,
  forgotPassword,
  resetPassword,
  createBeamWallet,
};
