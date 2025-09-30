const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// Apply admin authentication to all routes
router.use(adminAuth);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Commission Management
router.get('/commissions', adminController.getAllCommissions);
router.get('/commissions/pending', adminController.getPendingCommissions);
router.post('/commissions/:commissionId/approve', adminController.approveCommission);
router.post('/commissions/:commissionId/reject', adminController.rejectCommission);

// Fraud Management
router.get('/fraud/alerts', adminController.getFraudAlerts);
router.post('/fraud/:alertType/:alertId/review', adminController.reviewFraudAlert);

// Payment Management
router.get('/payments/all', adminController.getAllPayments);
router.get('/payments/stats', adminController.getPaymentStats);
router.put('/payments/:paymentId/approve', adminController.approvePayment);
router.put('/payments/:paymentId/reject', adminController.rejectPayment);
router.get('/payments/failures', adminController.getFailedPayments);
router.post('/payments/failures/:failureId/retry', adminController.retryPayment);

// System Analytics
router.get('/analytics', adminController.getSystemAnalytics);

// Product Management
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);

module.exports = router; 