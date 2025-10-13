const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate unique reseller ID
const generateResellerId = async () => {
  let resellerId;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate a random 6-character alphanumeric ID
    resellerId = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Check if it already exists
    const existingUser = await User.findOne({ resellerId });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return resellerId;
};

// Register new reseller
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
    const resellerId = await generateResellerId();

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
    const jwt = require('jsonwebtoken');
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

// Get reseller stats
const getResellerStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent sales for conversion calculation
    const recentSales = await Sale.find({ resellerId: user.resellerId })
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate conversion rate
    const totalClicks = user.totalClicks || 0;
    const totalSales = recentSales.length;
    const conversionRate = totalClicks > 0 ? totalSales / totalClicks : 0;

    // Calculate monthly earnings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlySales = await Sale.find({
      resellerId: user.resellerId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const monthlyEarnings = monthlySales.reduce((total, sale) => total + (sale.commissionAmount || 0), 0);

    // Get pending commissions
    const pendingCommissions = await Commission.find({
      resellerId: user.resellerId,
      status: 'pending'
    });

    const pendingAmount = pendingCommissions.reduce((total, commission) => total + commission.commissionAmount, 0);

    // Calculate level progress
    let levelProgress = 0;
    switch (user.level) {
      case 'Beginner':
        levelProgress = Math.min((totalSales / 10) * 100, 100);
        break;
      case 'Active':
        levelProgress = Math.min(((totalSales - 10) / 40) * 100, 100);
        break;
      case 'Ambassador':
        levelProgress = Math.min(((totalSales - 50) / 100) * 100, 100);
        break;
      default:
        levelProgress = 100;
    }

    res.json({
      success: true,
      stats: {
        totalEarnings: user.totalEarnings || 0,
        totalSales: user.totalSales || 0,
        totalClicks: user.totalClicks || 0,
        conversionRate,
        monthlyEarnings,
        pendingCommissions: pendingAmount,
        resellerId: user.resellerId,
        level: user.level,
        levelProgress: Math.round(levelProgress)
      }
    });
  } catch (error) {
    console.error('Get reseller stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
};

// Get reseller products with affiliate links
const getResellerProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all active products
    const products = await Product.find({ isActive: true }).sort({ sortOrder: 1 });

    // Generate affiliate links for each product
    const productsWithLinks = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      commission: product.commission,
      category: product.category,
      image: product.image || '',
      affiliateLink: `${process.env.FRONTEND_URL}/pay?v=${product.price}&id=${user.resellerId}&product=${product._id}`
    }));

    res.json({
      success: true,
      products: productsWithLinks
    });
  } catch (error) {
    console.error('Get reseller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// Get recent sales
const getRecentSales = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent sales for this reseller
    const sales = await Sale.find({ resellerId: user.resellerId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('productId', 'name');

    const formattedSales = sales.map(sale => ({
      _id: sale._id,
      productName: sale.productId?.name || 'Unknown Product',
      customerName: sale.customerName || 'Anonymous',
      amount: sale.amount,
      commission: sale.commissionAmount,
      date: sale.createdAt,
      status: sale.status
    }));

    res.json({
      success: true,
      sales: formattedSales
    });
  } catch (error) {
    console.error('Get recent sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales'
    });
  }
};

// Track click
const trackClick = async (req, res) => {
  try {
    const { resellerId, productId, source } = req.body;

    // Validate reseller
    const reseller = await User.findOne({ resellerId, isActive: true });
    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Invalid reseller ID'
      });
    }

    // Update click count
    await User.findByIdAndUpdate(reseller._id, {
      $inc: { totalClicks: 1 }
    });

    // Log click for analytics
    const Click = require('../models/Click');
    await Click.create({
      resellerId: reseller._id,
      productId,
      source: source || 'direct',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking click'
    });
  }
};

// Get reseller profile
const getResellerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        resellerId: user.resellerId,
        level: user.level,
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        totalSales: user.totalSales,
        totalClicks: user.totalClicks,
        socialMedia: user.socialMedia,
        experience: user.experience,
        goals: user.goals,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get reseller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update reseller profile
const updateResellerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phone, socialMedia, experience, goals } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        phone,
        socialMedia,
        experience,
        goals
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        resellerId: updatedUser.resellerId,
        level: updatedUser.level,
        balance: updatedUser.balance,
        totalEarnings: updatedUser.totalEarnings,
        totalSales: updatedUser.totalSales,
        totalClicks: updatedUser.totalClicks,
        socialMedia: updatedUser.socialMedia,
        experience: updatedUser.experience,
        goals: updatedUser.goals,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update reseller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

module.exports = {
  registerReseller,
  getResellerStats,
  getResellerProducts,
  getRecentSales,
  trackClick,
  getResellerProfile,
  updateResellerProfile
}; 