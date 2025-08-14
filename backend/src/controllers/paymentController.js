const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const User = require('../models/User');

const paymentController = {
  // Create payment intent
  async createPaymentIntent(req, res) {
    try {
      const { productId, resellerId, customerEmail, customerName } = req.body;

      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Calculate commission (10% for demo)
      const commissionAmount = product.price * 0.10;

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(product.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          productId,
          resellerId,
          customerEmail,
          customerName
        }
      });

      // Create payment record
      const payment = new Payment({
        resellerId,
        productId,
        customerEmail,
        customerName,
        amount: product.price,
        stripePaymentIntentId: paymentIntent.id,
        commissionAmount
      });

      await payment.save();

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.paymentId
      });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ success: false, message: 'Payment creation failed' });
    }
  },

  // Confirm payment
  async confirmPayment(req, res) {
    try {
      const { paymentId } = req.body;

      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      // Update payment status
      payment.status = 'paid';
      await payment.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        payment: payment
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({ success: false, message: 'Payment confirmation failed' });
    }
  },

  // Get all payments (admin)
  async getAllPayments(req, res) {
    try {
      const payments = await Payment.find()
        .populate('productId', 'name price')
        .populate('resellerId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        payments
      });
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
  },

  // Get payments by reseller
  async getResellerPayments(req, res) {
    try {
      const { resellerId } = req.params;

      const payments = await Payment.find({ resellerId })
        .populate('productId', 'name price')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        payments
      });
    } catch (error) {
      console.error('Get reseller payments error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
  },

  // Admin approve/reject payment
  async adminApprovePayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { action, notes } = req.body; // action: 'approve' or 'reject'
      const adminId = req.user.id; // From auth middleware

      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      if (action === 'approve') {
        payment.adminApproval = 'approved';
        payment.status = 'approved';
        payment.commissionStatus = 'paid';
        payment.approvedBy = adminId;
        payment.approvedAt = new Date();
        payment.adminNotes = notes;

        // Add commission to reseller balance
        const reseller = await User.findOne({ resellerId: payment.resellerId });
        if (reseller) {
          reseller.balance += payment.commissionAmount;
          reseller.totalEarnings += payment.commissionAmount;
          await reseller.save();
        }
      } else if (action === 'reject') {
        payment.adminApproval = 'rejected';
        payment.status = 'rejected';
        payment.approvedBy = adminId;
        payment.approvedAt = new Date();
        payment.adminNotes = notes;
      }

      await payment.save();

      res.json({
        success: true,
        message: `Payment ${action}d successfully`,
        payment
      });
    } catch (error) {
      console.error('Admin approval error:', error);
      res.status(500).json({ success: false, message: 'Approval action failed' });
    }
  },

  // Get payment statistics
  async getPaymentStats(req, res) {
    try {
      const totalPayments = await Payment.countDocuments();
      const pendingApprovals = await Payment.countDocuments({ adminApproval: 'pending' });
      const totalRevenue = await Payment.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalCommissions = await Payment.aggregate([
        { $match: { commissionStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]);

      res.json({
        success: true,
        stats: {
          totalPayments,
          pendingApprovals,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalCommissions: totalCommissions[0]?.total || 0
        }
      });
    } catch (error) {
      console.error('Payment stats error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
  }
};

module.exports = paymentController; 