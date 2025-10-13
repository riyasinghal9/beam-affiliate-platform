const express = require('express');
const router = express.Router();
const storeWebhookController = require('../controllers/storeWebhookController');

// Middleware to verify webhook signature (optional - for security)
const verifyWebhookSignature = (req, res, next) => {
  // In production, you should verify the webhook signature
  // For now, we'll skip verification for development
  const signature = req.headers['x-beam-signature'];
  
  if (process.env.NODE_ENV === 'production' && !signature) {
    return res.status(401).json({
      success: false,
      message: 'Missing webhook signature'
    });
  }
  
  next();
};

// Webhook endpoint for store purchases
router.post('/purchase', verifyWebhookSignature, storeWebhookController.handleStorePurchase);

// Webhook endpoint for order status updates
router.post('/order-status', verifyWebhookSignature, storeWebhookController.handleOrderStatusUpdate);

// Get store purchase statistics for a reseller
router.get('/stats/:resellerId', storeWebhookController.getStorePurchaseStats);

module.exports = router;
