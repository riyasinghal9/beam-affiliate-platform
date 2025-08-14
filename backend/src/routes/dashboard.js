const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getTransactionHistory, 
  trackClick 
} = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.get('/stats', getDashboardStats);
router.get('/transactions', getTransactionHistory);
router.post('/track-click', trackClick);

module.exports = router; 