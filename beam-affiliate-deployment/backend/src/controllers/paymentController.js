const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const User = require('../models/User');
const beamWalletService = require('../services/beamWalletService');
const stripeService = require('../services/stripeService');
const notificationService = require('../services/notificationService');

// Process payment for product purchase
const processPayment = async (req, res) => {
  try {
    console.log('Payment request received:', {
      body: req.body,
      headers: req.headers
    });
    const {
      amount,
      customerData,
      productData,
      resellerId,
      paymentMethod = 'stripe', // Default to stripe for credit card
      paymentIntentId = null,
      paymentMethodId = null
    } = req.body;

    // Validate input
    if (!amount || !customerData || !productData || !resellerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Verify reseller exists
    const reseller = await User.findOne({ resellerId, isActive: true });
    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Invalid reseller ID'
      });
    }

    // Verify product exists (optional - use provided data if not in DB)
    console.log('Product data received:', productData);
    let product = null;
    try {
      if (productData._id) {
        product = await Product.findById(productData._id);
      }
    } catch (error) {
      console.log('Product not found in database, using provided data:', error.message);
    }
    
    // If product not in DB, create a mock product object from provided data
    if (!product) {
      product = {
        _id: productData._id || `product_${Date.now()}`,
        name: productData.name || 'Unknown Product',
        price: productData.price || 0,
        commission: productData.commission || 0,
        isActive: true
      };
    }
    
    console.log('Final product object:', product);

    // Verify amount matches product price
    if (amount !== product.price) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match product price'
      });
    }

    // Process payment based on payment method
    let paymentResult;
    
    if (paymentMethod === 'stripe') {
      // Process Stripe payment
      if (paymentIntentId && paymentMethodId) {
        // Confirm existing payment intent with payment method
        paymentResult = await stripeService.confirmPaymentIntent(paymentIntentId, paymentMethodId);
      } else if (paymentMethodId) {
        // Create new payment intent with payment method
        paymentResult = await stripeService.createPaymentIntent(amount, 'usd', {
          resellerId: resellerId,
          productId: product._id.toString(),
          customerEmail: customerData.email
        }, paymentMethodId);
        
        if (paymentResult.success) {
          // Return client secret for frontend to complete payment
          return res.json({
            success: true,
            requiresAction: true,
            clientSecret: paymentResult.clientSecret,
            paymentIntentId: paymentResult.paymentIntentId
          });
        }
      } else {
        // Create new payment intent without payment method (for frontend to handle)
        paymentResult = await stripeService.createPaymentIntent(amount, 'usd', {
          resellerId: resellerId,
          productId: product._id.toString(),
          customerEmail: customerData.email
        });
        
        if (paymentResult.success) {
          // Return client secret for frontend to complete payment
          return res.json({
            success: true,
            requiresAction: true,
            clientSecret: paymentResult.clientSecret,
            paymentIntentId: paymentResult.paymentIntentId
          });
        }
      }
    } else {
      // Process Beam Wallet payment (mock for development)
      console.log('Processing Beam Wallet payment:', {
        amount,
        customerData,
        productData,
        resellerId,
        paymentMethod
      });
      
      // For Beam Wallet payments, we don't check customer balance as it's an external payment
      // The customer pays through their Beam Wallet app, not through our system
      console.log('Beam Wallet payment: External payment, no balance check required');
      
      paymentResult = await beamWalletService.processPayment(
        amount,
        customerData,
        productData,
        resellerId
      );
      
      console.log('Beam Wallet payment result:', paymentResult);
    }

    if (!paymentResult.success) {
      console.error('Payment processing failed:', paymentResult);
      return res.status(400).json({
        success: false,
        message: paymentResult.error || 'Payment processing failed'
      });
    }

    // Create sale record
    const sale = new Sale({
      trackingId: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resellerId: reseller.resellerId, // Use string resellerId, not ObjectId
      productId: (product._id || `product_${Date.now()}`).toString(), // Ensure it's a string
      productName: product.name || 'Unknown Product',
      saleAmount: amount,
      commissionAmount: (amount * (product.commission || 0)) / 100,
      commissionRate: product.commission || 0,
      customerEmail: customerData.email,
      customerName: customerData.name,
      customerPhone: customerData.phone || '',
      paymentMethod: paymentMethod,
      paymentStatus: paymentResult.status || 'completed',
      paymentId: paymentResult.paymentIntentId || paymentResult.paymentId,
      commissionStatus: 'pending',
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date()
    });

    await sale.save();

    // Calculate commission
    const commissionAmount = (amount * (product.commission || 0)) / 100;
    console.log(`Commission calculated: $${commissionAmount} (${product.commission || 0}% of $${amount})`);

    // Create commission record
    const commission = new Commission({
      resellerId: reseller.resellerId, // Use string resellerId
      productId: (product._id || `product_${Date.now()}`).toString(), // Ensure it's a string
      saleId: sale._id.toString(), // Convert to string
      commissionAmount: commissionAmount,
      commissionRate: product.commission || 0,
      status: 'pending',
      paymentMethod: 'beam_wallet',
      customerInfo: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone
      },
      productInfo: {
        name: product.name,
        price: product.price,
        category: product.category || 'Other'
      },
      saleInfo: {
        amount: amount,
        currency: 'USD',
        saleDate: new Date(),
        paymentMethod: 'beam_wallet'
      }
    });

    await commission.save();
    console.log(`Commission record created: ${commission._id}`);

    // Create payment record for admin approval
    const payment = new Payment({
      paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      resellerId: reseller.resellerId,
      productId: product._id?.toString() || new mongoose.Types.ObjectId().toString(),
      amount: amount,
      commissionAmount: commissionAmount,
      status: 'paid', // Use valid enum value
      adminApproval: 'pending', // This makes it show up in admin approval
      customerName: customerData.name,
      customerEmail: customerData.email,
      stripePaymentIntentId: `beam_${Date.now()}`, // Generate a fake Stripe ID for Beam payments
      commissionStatus: 'pending'
    });

    await payment.save();
    console.log(`Payment record created: ${payment._id}`);

    // Create transaction record for the transactions page
    const transaction = new Transaction({
      resellerId: reseller.resellerId,
      productId: new mongoose.Types.ObjectId(),
      productName: product.name,
      productPrice: amount,
      commissionPercentage: product.commission || 0,
      commissionAmount: commissionAmount,
      customerEmail: customerData.email,
      customerName: customerData.name,
      paymentMethod: 'BeamPay', // Map beam_wallet to BeamPay for Transaction model
      paymentStatus: 'Confirmed',
      commissionStatus: 'Paid',
      customerIp: req.ip || req.connection?.remoteAddress || 'unknown',
      customerDevice: req.headers['user-agent'] || 'unknown',
      utmSource: req.body.utmSource || '',
      utmMedium: req.body.utmMedium || '',
      utmCampaign: req.body.utmCampaign || '',
      notes: `Beam Wallet payment - ${product.name}`
    });

    await transaction.save();
    console.log(`Transaction record created: ${transaction._id}`);

    // Update reseller stats and balance
    const resellerUpdate = await User.findByIdAndUpdate(reseller._id, {
      $inc: {
        totalSales: 1,
        totalClicks: 1,
        totalEarnings: commissionAmount,  // Add commission to total earnings
        balance: commissionAmount  // Add commission to reseller's balance
      }
    }, { new: true });

    console.log(`Reseller stats updated: ${reseller.email} - Added $${commissionAmount} commission. New balance: $${resellerUpdate.balance}, Total earnings: $${resellerUpdate.totalEarnings}`);

    // Send notifications
    try {
      await notificationService.sendSaleNotification(
        reseller._id,
        sale._id,
        amount,
        product.name
      );

      await notificationService.sendCommissionPaymentNotification(
        reseller.resellerId,
        commissionAmount,
        commission._id
      );
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the payment if notifications fail
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      paymentId: paymentResult.paymentId,
      saleId: sale._id,
      commissionId: commission._id,
      amount: amount,
      commissionAmount: commissionAmount
    });

  } catch (error) {
    console.error('Process payment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Verify payment status
const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const verificationResult = await beamWalletService.verifyPayment(paymentId);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.error || 'Payment verification failed'
      });
    }

    // Update sale status if payment is completed
    if (verificationResult.verified) {
      await Sale.findOneAndUpdate(
        { paymentId },
        {
          status: 'completed',
          completedAt: new Date()
        }
      );

      // Trigger commission processing
      const sale = await Sale.findOne({ paymentId });
      if (sale) {
        const commission = await Commission.findOne({ saleId: sale._id });
        if (commission && commission.status === 'pending') {
          commission.status = 'approved';
          await commission.save();
        }
      }
    }

    res.json({
      success: true,
      paymentStatus: verificationResult.status,
      verified: verificationResult.verified
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const sales = await Sale.find({ resellerId: userId })
      .populate('productId', 'name price category')
      .populate('commissionId', 'commissionAmount status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Sale.countDocuments({ resellerId: userId });

    res.json({
      success: true,
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment history'
    });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get sales statistics
    const salesStats = await Sale.aggregate([
      { $match: { resellerId: user._id } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedSales: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Get commission statistics
    const commissionStats = await Commission.aggregate([
      { $match: { resellerId: user._id } },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: 1 },
          totalCommissionAmount: { $sum: '$commissionAmount' },
          paidCommissions: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
          },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$commissionAmount', 0] }
          },
          pendingCommissions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$commissionAmount', 0] }
          }
        }
      }
    ]);

    // Get recent activity
    const recentSales = await Sale.find({ resellerId: user._id })
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCommissions = await Commission.find({ resellerId: user._id })
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        sales: salesStats[0] || {
          totalSales: 0,
          totalAmount: 0,
          completedSales: 0,
          completedAmount: 0
        },
        commissions: commissionStats[0] || {
          totalCommissions: 0,
          totalCommissionAmount: 0,
          paidCommissions: 0,
          paidAmount: 0,
          pendingCommissions: 0,
          pendingAmount: 0
        }
      },
      recentActivity: {
        sales: recentSales,
        commissions: recentCommissions
      }
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment statistics'
    });
  }
};

// Handle webhook from Beam Wallet
const handleWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;
    const signature = req.headers['x-beam-signature'];

    // Verify webhook signature
    if (!beamWalletService.verifyWebhook(req.body, signature)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Process webhook
    const result = await beamWalletService.handleWebhook(event, data);

    if (result.success) {
      res.json({ success: true, message: 'Webhook processed successfully' });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Webhook processing failed'
      });
    }

  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing webhook'
    });
  }
};

// Get wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.beamWalletId) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const balanceResult = await beamWalletService.getWalletBalance(user.beamWalletId);

    if (!balanceResult.success) {
      return res.status(400).json({
        success: false,
        message: balanceResult.error || 'Failed to get wallet balance'
      });
    }

    res.json({
      success: true,
      balance: balanceResult.balance,
      currency: balanceResult.currency
    });

  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wallet balance'
    });
  }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!user || !user.beamWalletId) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const historyResult = await beamWalletService.getTransactionHistory(
      user.beamWalletId,
      limit,
      (page - 1) * limit
    );

    if (!historyResult.success) {
      return res.status(400).json({
        success: false,
        message: historyResult.error || 'Failed to get transaction history'
      });
    }

    res.json({
      success: true,
      transactions: historyResult.transactions,
      pagination: {
        page,
        limit,
        total: historyResult.total,
        pages: Math.ceil(historyResult.total / limit)
      }
    });

  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction history'
    });
  }
};

// Test Stripe integration
const testStripe = async (req, res) => {
  try {
    const testResult = await stripeService.createPaymentIntent(75, 'usd', {
      test: true
    });
    
    res.json({
      success: true,
      stripeTest: testResult
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create payment intent only
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const paymentResult = await stripeService.createPaymentIntent(amount, currency, metadata);
    
    if (paymentResult.success) {
      res.json({
        success: true,
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntentId
      });
    } else {
      res.status(400).json({
        success: false,
        message: paymentResult.error || 'Failed to create payment intent'
      });
    }
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment intent'
    });
  }
};

module.exports = {
  processPayment,
  createPaymentIntent,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentStats,
  getWalletBalance,
  getTransactionHistory,
  testStripe
}; 