const express = require('express');
const router = express.Router();
const resellerController = require('../controllers/resellerController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', resellerController.registerReseller);
router.post('/track-click', resellerController.trackClick);

// Protected routes (require authentication)
router.get('/stats', auth, resellerController.getResellerStats);
router.get('/products', auth, resellerController.getResellerProducts);
router.get('/recent-sales', auth, resellerController.getRecentSales);
router.get('/profile', auth, resellerController.getResellerProfile);
router.put('/profile', auth, resellerController.updateResellerProfile);

module.exports = router; 