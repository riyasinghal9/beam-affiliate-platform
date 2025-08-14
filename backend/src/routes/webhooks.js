const express = require('express');
const router = express.Router();
const beamWalletService = require('../services/beamWalletService');
const emailService = require('../services/emailService');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const User = require('../models/User');

// Beam Wallet payment webhook
router.post('/beam-wallet/payment', async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature (implement proper verification)
    // const signature = req.headers['x-beam-signature'];
    // if (!verifySignature(webhookData, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // Process the webhook
    const result = await beamWalletService.handlePaymentWebhook(webhookData);
    
    res.json(result);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe webhook
router.post('/stripe/payment', async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handleStripePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful Stripe payment
async function handleStripePaymentSuccess(paymentIntent) {
  try {
    const { resellerId, productId, customerEmail, customerName } = paymentIntent.metadata;
    
    // Find the sale record
    const sale = await Sale.findOne({
      resellerId,
      productId,
      customerEmail,
      status: 'pending'
    });

    if (!sale) {
      console.error('Sale not found for payment:', paymentIntent.id);
      return;
    }

    // Update sale status
    sale.status = 'confirmed';
    sale.paymentReference = paymentIntent.id;
    await sale.save();

    // Calculate and create commission
    const commission = new Commission({
      resellerId: sale.resellerId,
      productId: sale.productId,
      productName: sale.productName || 'Beam Wallet Service',
      saleAmount: sale.amount,
      commissionAmount: sale.commission,
      commissionRate: 50, // This should come from commission rules
      status: 'pending',
      saleDate: sale.timestamp,
      saleId: sale._id
    });

    await commission.save();

    // Update user stats
    const user = await User.findOne({ resellerId: sale.resellerId });
    if (user) {
      user.totalSales += 1;
      user.totalEarnings += sale.commission;
      await user.save();
    }

    // Send notification email
    await emailService.sendCommissionNotification(
      customerEmail,
      customerName,
      {
        amount: sale.commission,
        productName: sale.productName || 'Beam Wallet Service',
        saleAmount: sale.amount,
        rate: 50
      }
    );

    console.log('Payment processed successfully:', paymentIntent.id);
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

// Handle failed Stripe payment
async function handleStripePaymentFailure(paymentIntent) {
  try {
    const { resellerId, productId, customerEmail } = paymentIntent.metadata;
    
    // Update sale status
    await Sale.updateOne(
      {
        resellerId,
        productId,
        customerEmail,
        status: 'pending'
      },
      {
        status: 'failed',
        paymentReference: paymentIntent.id
      }
    );

    console.log('Payment failed:', paymentIntent.id);
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}

// Manual payment proof upload webhook
router.post('/manual-proof', async (req, res) => {
  try {
    const { paymentId, proofUrl, adminNotes } = req.body;
    
    // Find the payment
    const sale = await Sale.findById(paymentId);
    if (!sale) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment with proof
    sale.paymentProof = proofUrl;
    sale.adminNotes = adminNotes;
    sale.status = 'pending_verification';
    await sale.save();

    // Notify admin for manual verification
    // This could trigger an email to admin or update admin dashboard

    res.json({ success: true, message: 'Payment proof uploaded successfully' });
  } catch (error) {
    console.error('Manual proof upload error:', error);
    res.status(500).json({ error: 'Failed to upload payment proof' });
  }
});

// Admin payment approval webhook
router.post('/admin/approve-payment', async (req, res) => {
  try {
    const { paymentId, adminId, approvalNotes } = req.body;
    
    // Find the payment
    const sale = await Sale.findById(paymentId);
    if (!sale) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    sale.status = 'confirmed';
    sale.adminApproval = {
      adminId,
      approvedAt: new Date(),
      notes: approvalNotes
    };
    await sale.save();

    // Create commission
    const commission = new Commission({
      resellerId: sale.resellerId,
      productId: sale.productId,
      productName: sale.productName || 'Beam Wallet Service',
      saleAmount: sale.amount,
      commissionAmount: sale.commission,
      commissionRate: 50,
      status: 'pending',
      saleDate: sale.timestamp,
      saleId: sale._id
    });

    await commission.save();

    // Update user stats
    const user = await User.findOne({ resellerId: sale.resellerId });
    if (user) {
      user.totalSales += 1;
      user.totalEarnings += sale.commission;
      await user.save();
    }

    // Send notification
    await emailService.sendCommissionNotification(
      user.email,
      `${user.firstName} ${user.lastName}`,
      {
        amount: sale.commission,
        productName: sale.productName || 'Beam Wallet Service',
        saleAmount: sale.amount,
        rate: 50
      }
    );

    res.json({ success: true, message: 'Payment approved successfully' });
  } catch (error) {
    console.error('Payment approval error:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// Admin payment rejection webhook
router.post('/admin/reject-payment', async (req, res) => {
  try {
    const { paymentId, adminId, rejectionReason } = req.body;
    
    // Find the payment
    const sale = await Sale.findById(paymentId);
    if (!sale) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    sale.status = 'rejected';
    sale.adminRejection = {
      adminId,
      rejectedAt: new Date(),
      reason: rejectionReason
    };
    await sale.save();

    // Send notification to reseller
    const user = await User.findOne({ resellerId: sale.resellerId });
    if (user) {
      await emailService.sendPaymentRejectionNotification(
        user.email,
        `${user.firstName} ${user.lastName}`,
        {
          amount: sale.amount,
          productName: sale.productName || 'Beam Wallet Service',
          reason: rejectionReason
        }
      );
    }

    res.json({ success: true, message: 'Payment rejected successfully' });
  } catch (error) {
    console.error('Payment rejection error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

module.exports = router; 