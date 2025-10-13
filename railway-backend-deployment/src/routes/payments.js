const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/process', paymentController.processPayment);
router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/test-stripe', paymentController.testStripe);
router.get('/verify/:paymentId', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

// Protected routes (require authentication)
router.get('/history', auth, paymentController.getPaymentHistory);
router.get('/stats', auth, paymentController.getPaymentStats);
router.get('/wallet/balance', auth, paymentController.getWalletBalance);
router.get('/wallet/transactions', auth, paymentController.getTransactionHistory);

module.exports = router; 