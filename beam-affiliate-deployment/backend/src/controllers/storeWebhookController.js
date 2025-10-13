const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Webhook to handle purchases from external Beam Wallet store
const handleStorePurchase = async (req, res) => {
  try {
    console.log('Store purchase webhook received:', {
      body: req.body,
      headers: req.headers
    });

    const {
      orderId,
      productId,
      affiliateId,
      customerEmail,
      customerName,
      amount,
      currency = 'USD',
      paymentMethod = 'beam_wallet',
      purchaseDate,
      orderStatus = 'completed',
      trackingData = {}
    } = req.body;

    // Validate required fields
    if (!orderId || !productId || !affiliateId || !customerEmail || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required purchase data'
      });
    }

    // Verify reseller exists
    const reseller = await User.findOne({ resellerId: affiliateId, isActive: true });
    if (!reseller) {
      console.log(`Reseller not found: ${affiliateId}`);
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }

    // Get product details
    let product = null;
    try {
      product = await Product.findById(productId);
    } catch (error) {
      console.log('Product not found in database, using provided data');
    }

    // If product not in DB, create a mock product object
    if (!product) {
      product = {
        _id: productId,
        name: trackingData.productName || 'Beam Wallet Product',
        price: amount,
        commission: trackingData.commissionRate || 50 // Default 50% commission
      };
    }

    // Calculate commission
    const commissionAmount = (amount * (product.commission || 50)) / 100;
    console.log(`Commission calculated: $${commissionAmount} (${product.commission || 50}% of $${amount})`);

    // Create sale record
    const sale = new Sale({
      trackingId: `store_${orderId}`,
      resellerId: reseller.resellerId,
      productId: product._id.toString(),
      productName: product.name,
      saleAmount: amount,
      commissionAmount: commissionAmount,
      commissionRate: product.commission || 50,
      currency: currency,
      customerEmail: customerEmail,
      customerName: customerName,
      customerPhone: trackingData.customerPhone || null,
      paymentMethod: paymentMethod,
      paymentStatus: orderStatus === 'completed' ? 'completed' : 'pending',
      paymentId: `store_${orderId}`,
      commissionStatus: 'pending',
      adminApproval: 'pending',
      ipAddress: trackingData.ipAddress || 'unknown',
      conversionTime: trackingData.conversionTime || null,
      metadata: {
        source: 'external_store',
        orderId: orderId,
        storeUrl: 'https://shop.beamwallet.com',
        utmSource: trackingData.utmSource || 'affiliate',
        utmMedium: trackingData.utmMedium || 'link',
        utmCampaign: trackingData.utmCampaign || 'beam_affiliate',
        ...trackingData
      }
    });

    await sale.save();
    console.log(`Sale record created: ${sale._id}`);

    // Create commission record
    const commission = new Commission({
      resellerId: reseller.resellerId,
      productId: product._id.toString(),
      saleId: sale._id.toString(),
      commissionAmount: commissionAmount,
      commissionRate: product.commission || 50,
      status: 'pending',
      paymentMethod: paymentMethod,
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: trackingData.customerPhone || null
      },
      productInfo: {
        name: product.name,
        price: amount,
        category: product.category || 'Beam Wallet'
      },
      saleInfo: {
        amount: amount,
        currency: currency,
        saleDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        paymentMethod: paymentMethod
      }
    });

    await commission.save();
    console.log(`Commission record created: ${commission._id}`);

    // Create payment record for admin approval
    const payment = new Payment({
      paymentId: `STORE-${orderId}`,
      resellerId: reseller.resellerId,
      productId: product._id.toString(),
      amount: amount,
      commissionAmount: commissionAmount,
      status: orderStatus === 'completed' ? 'paid' : 'pending',
      adminApproval: 'pending',
      customerName: customerName,
      customerEmail: customerEmail,
      stripePaymentIntentId: `store_${orderId}`,
      commissionStatus: 'pending',
      metadata: {
        source: 'external_store',
        orderId: orderId,
        storeUrl: 'https://shop.beamwallet.com'
      }
    });

    await payment.save();
    console.log(`Payment record created: ${payment._id}`);

    // Create transaction record
    const transaction = new Transaction({
      resellerId: reseller.resellerId,
      productId: new mongoose.Types.ObjectId(),
      productName: product.name,
      productPrice: amount,
      commissionPercentage: product.commission || 50,
      commissionAmount: commissionAmount,
      customerEmail: customerEmail,
      customerName: customerName,
      paymentMethod: 'BeamPay',
      paymentStatus: orderStatus === 'completed' ? 'Confirmed' : 'Pending',
      commissionStatus: 'Pending',
      customerIp: trackingData.ipAddress || 'unknown',
      customerDevice: trackingData.userAgent || 'unknown',
      utmSource: trackingData.utmSource || '',
      utmMedium: trackingData.utmMedium || '',
      utmCampaign: trackingData.utmCampaign || '',
      notes: `External store purchase - Order: ${orderId}`
    });

    await transaction.save();
    console.log(`Transaction record created: ${transaction._id}`);

    // Update reseller stats and balance
    const resellerUpdate = await User.findByIdAndUpdate(reseller._id, {
      $inc: {
        totalSales: 1,
        totalClicks: 1,
        totalEarnings: commissionAmount,
        balance: commissionAmount
      }
    }, { new: true });

    console.log(`Reseller stats updated: ${reseller.email} - Added $${commissionAmount} commission. New balance: $${resellerUpdate.balance}, Total earnings: $${resellerUpdate.totalEarnings}`);

    // Send notifications
    try {
      await notificationService.sendCommissionNotification({
        resellerId: reseller.resellerId,
        resellerEmail: reseller.email,
        commissionAmount: commissionAmount,
        productName: product.name,
        saleAmount: amount,
        source: 'external_store'
      });
    } catch (notificationError) {
      console.warn('Failed to send notification:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: 'Store purchase tracked successfully',
      data: {
        saleId: sale._id,
        commissionId: commission._id,
        paymentId: payment._id,
        transactionId: transaction._id
      }
    });

  } catch (error) {
    console.error('Error processing store purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process store purchase',
      error: error.message
    });
  }
};

// Webhook to handle order status updates
const handleOrderStatusUpdate = async (req, res) => {
  try {
    const { orderId, status, reason } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required data'
      });
    }

    // Find and update related records
    const sale = await Sale.findOne({ 'metadata.orderId': orderId });
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update sale status
    const newPaymentStatus = status === 'completed' ? 'completed' : 
                           status === 'cancelled' ? 'failed' : 'pending';
    
    await Sale.findByIdAndUpdate(sale._id, {
      paymentStatus: newPaymentStatus,
      'metadata.statusUpdate': {
        status: status,
        reason: reason,
        updatedAt: new Date()
      }
    });

    // Update payment status
    await Payment.findOneAndUpdate(
      { 'metadata.orderId': orderId },
      { 
        status: newPaymentStatus,
        adminApproval: status === 'completed' ? 'approved' : 'pending'
      }
    );

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { 'notes': { $regex: `Order: ${orderId}` } },
      { 
        paymentStatus: status === 'completed' ? 'Confirmed' : 'Pending',
        notes: `External store purchase - Order: ${orderId} - Status: ${status}`
      }
    );

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get store purchase statistics
const getStorePurchaseStats = async (req, res) => {
  try {
    const { resellerId } = req.params;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get store purchases
    const storePurchases = await Sale.find({
      resellerId: resellerId,
      'metadata.source': 'external_store',
      createdAt: { $gte: startDate }
    });

    const stats = {
      totalPurchases: storePurchases.length,
      totalRevenue: storePurchases.reduce((sum, sale) => sum + sale.saleAmount, 0),
      totalCommission: storePurchases.reduce((sum, sale) => sum + sale.commissionAmount, 0),
      averageOrderValue: storePurchases.length > 0 ? 
        storePurchases.reduce((sum, sale) => sum + sale.saleAmount, 0) / storePurchases.length : 0,
      completedPurchases: storePurchases.filter(sale => sale.paymentStatus === 'completed').length,
      pendingPurchases: storePurchases.filter(sale => sale.paymentStatus === 'pending').length
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error getting store purchase stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get store purchase statistics',
      error: error.message
    });
  }
};

module.exports = {
  handleStorePurchase,
  handleOrderStatusUpdate,
  getStorePurchaseStats
};
