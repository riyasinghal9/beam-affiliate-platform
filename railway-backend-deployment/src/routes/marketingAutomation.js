const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { auth, adminAuth } = require('../middleware/auth');

// Email Campaign Management
router.post('/campaigns', adminAuth, marketingController.createEmailCampaign);
router.post('/campaigns/:campaignId/send', adminAuth, marketingController.sendEmailCampaign);
router.get('/campaigns', adminAuth, marketingController.getEmailCampaigns);

// A/B Testing Management
router.post('/ab-tests', adminAuth, marketingController.createABTest);
router.get('/ab-tests', auth, marketingController.getABTests);
router.get('/ab-tests/:testId/results', adminAuth, marketingController.getABTestResults);
router.post('/ab-tests/:testId/assign', auth, marketingController.assignVariant);
router.post('/ab-tests/:testId/track', auth, marketingController.trackABTestEvent);

// Lead Scoring
router.get('/lead-score', auth, marketingController.calculateLeadScore);
router.get('/lead-scores', adminAuth, marketingController.getLeadScores);

// Social Media Integration
router.post('/social/post', auth, marketingController.postToSocialMedia);
router.post('/social/schedule', auth, marketingController.scheduleSocialMediaPost);
router.get('/social/platforms', auth, marketingController.getSocialPlatforms);

// Marketing Automation Workflows
router.post('/workflows', adminAuth, marketingController.createWorkflow);
router.post('/workflows/:workflowId/execute', auth, marketingController.executeWorkflow);

// Analytics and Reporting
router.get('/analytics', adminAuth, marketingController.getMarketingAnalytics);

// Target Audience Management
router.get('/target-audience', adminAuth, marketingController.getTargetAudience);

// Content Personalization
router.post('/personalize', auth, marketingController.personalizeContent);

module.exports = router; 