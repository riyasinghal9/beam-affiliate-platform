const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/register-reseller', authController.registerReseller);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post("/create-wallet", auth, authController.createBeamWallet);
// Protected routes
router.get('/me', auth, authController.getMe);

module.exports = router; 