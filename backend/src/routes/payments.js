const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes (for customers)
router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/confirm', paymentController.confirmPayment);

// Protected routes (for resellers)
router.get('/reseller/:resellerId', auth, paymentController.getResellerPayments);

// Admin routes
router.get('/admin/all', adminAuth, paymentController.getAllPayments);
router.get('/admin/stats', adminAuth, paymentController.getPaymentStats);
router.put('/admin/:paymentId/approve', adminAuth, paymentController.adminApprovePayment);

module.exports = router; 