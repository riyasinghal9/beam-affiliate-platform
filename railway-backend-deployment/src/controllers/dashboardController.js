const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const resellerId = req.user.resellerId;

    // Get user's current data
    const user = await User.findById(userId);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ resellerId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('productId', 'name');

    // Get monthly earnings
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          resellerId,
          createdAt: { $gte: currentMonth },
          commissionStatus: 'Paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$commissionAmount' }
        }
      }
    ]);

    // Get products for reselling
    const products = await Product.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    // Generate affiliate links
    const affiliateLinks = products.map(product => ({
      productId: product._id,
      productName: product.name,
      price: product.price,
      commission: product.commission,
      commissionAmount: product.commissionAmount,
      link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay?v=${product.price}&id=${resellerId}&product=${product._id}`
    }));

    // Get conversion rate
    const totalClicks = user.totalClicks || 0;
    const totalSales = user.totalSales || 0;
    const conversionRate = totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      stats: {
        balance: user.balance,
        totalEarnings: user.totalEarnings,
        totalSales: user.totalSales,
        totalClicks: user.totalClicks,
        monthlyEarnings: monthlyEarnings[0]?.total || 0,
        conversionRate: parseFloat(conversionRate),
        level: user.level
      },
      recentTransactions,
      affiliateLinks
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get transaction history
// @route   GET /api/dashboard/transactions
// @access  Private
const getTransactionHistory = async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ resellerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('productId', 'name');

    const total = await Transaction.countDocuments({ resellerId });

    res.json({
      success: true,
      transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Track click
// @route   POST /api/dashboard/track-click
// @access  Private
const trackClick = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    // Update user's click count
    await User.findByIdAndUpdate(userId, {
      $inc: { totalClicks: 1 }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getTransactionHistory,
  trackClick
}; 