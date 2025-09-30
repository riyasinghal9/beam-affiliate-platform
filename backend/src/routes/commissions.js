const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/calculate', commissionController.calculateCommission);

// User routes (require authentication)
router.get('/my-commissions', auth, commissionController.getMyCommissions);
router.get('/details/:commissionId', auth, commissionController.getCommissionDetails);
router.post('/upload-proof', auth, commissionController.upload.single('file'), commissionController.uploadPaymentProof);
router.get('/stats', auth, commissionController.getCommissionStats);

// Admin routes (require admin authentication)
router.get('/pending', adminAuth, commissionController.getPendingCommissions);
router.post('/verify-proof/:commissionId', adminAuth, commissionController.verifyPaymentProof);
router.post('/approve/:commissionId', adminAuth, commissionController.approveCommission);
router.post('/reject/:commissionId', adminAuth, commissionController.rejectCommission);
router.post('/process-payouts', adminAuth, commissionController.processPayouts);
router.get('/payout-schedule', adminAuth, commissionController.getPayoutSchedule);

module.exports = router; 