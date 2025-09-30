const express = require('express');
const router = express.Router();
const machineLearningService = require('../services/machineLearningService');
const advancedAnalyticsService = require('../services/advancedAnalyticsService');
const internationalizationService = require('../services/internationalizationService');
const advancedSecurityService = require('../services/advancedSecurityService');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Advanced Features
 *   description: Machine Learning, Analytics, Internationalization, and Security features
 */

// Machine Learning Routes
/**
 * @swagger
 * /api/advanced/ml/fraud-detection/train:
 *   post:
 *     summary: Train fraud detection model
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainingData:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Model trained successfully
 */
router.post('/ml/fraud-detection/train', adminAuth, async (req, res) => {
  try {
    const result = await machineLearningService.trainFraudDetectionModel(req.body.trainingData);
    res.json(result);
  } catch (error) {
    console.error('Error training fraud detection model:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/ml/fraud-detection/predict:
 *   post:
 *     summary: Predict fraud probability
 *     tags: [Advanced Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               features:
 *                 type: object
 *     responses:
 *       200:
 *         description: Fraud prediction result
 */
router.post('/ml/fraud-detection/predict', auth, async (req, res) => {
  try {
    const result = await machineLearningService.predictFraud(req.body.features);
    res.json(result);
  } catch (error) {
    console.error('Error predicting fraud:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/ml/sales-prediction/train:
 *   post:
 *     summary: Train sales prediction model
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainingData:
 *                 type: array
 *     responses:
 *       200:
 *         description: Model trained successfully
 */
router.post('/ml/sales-prediction/train', adminAuth, async (req, res) => {
  try {
    const result = await machineLearningService.trainSalesPredictionModel(req.body.trainingData);
    res.json(result);
  } catch (error) {
    console.error('Error training sales prediction model:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/ml/sales-prediction/predict:
 *   post:
 *     summary: Predict sales
 *     tags: [Advanced Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               features:
 *                 type: object
 *     responses:
 *       200:
 *         description: Sales prediction result
 */
router.post('/ml/sales-prediction/predict', auth, async (req, res) => {
  try {
    const result = await machineLearningService.predictSales(req.body.features);
    res.json(result);
  } catch (error) {
    console.error('Error predicting sales:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/ml/recommendations:
 *   get:
 *     summary: Get personalized recommendations
 *     tags: [Advanced Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: User recommendations
 */
router.get('/ml/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;
    const result = await machineLearningService.getRecommendations(userId, limit);
    res.json(result);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/ml/user-segmentation:
 *   post:
 *     summary: Perform user segmentation
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *               features:
 *                 type: array
 *     responses:
 *       200:
 *         description: User segmentation results
 */
router.post('/ml/user-segmentation', adminAuth, async (req, res) => {
  try {
    const result = await machineLearningService.performUserSegmentation(
      req.body.users,
      req.body.features
    );
    res.json(result);
  } catch (error) {
    console.error('Error performing user segmentation:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Advanced Analytics Routes
/**
 * @swagger
 * /api/advanced/analytics/predictive-insights:
 *   post:
 *     summary: Generate predictive insights
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *               timeRange:
 *                 type: string
 *     responses:
 *       200:
 *         description: Predictive insights
 */
router.post('/analytics/predictive-insights', adminAuth, async (req, res) => {
  try {
    const result = await advancedAnalyticsService.generatePredictiveInsights(
      req.body.data,
      req.body.timeRange
    );
    res.json(result);
  } catch (error) {
    console.error('Error generating predictive insights:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/analytics/cohort-analysis:
 *   post:
 *     summary: Perform cohort analysis
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *               cohortType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cohort analysis results
 */
router.post('/analytics/cohort-analysis', adminAuth, async (req, res) => {
  try {
    const result = await advancedAnalyticsService.performCohortAnalysis(
      req.body.data,
      req.body.cohortType
    );
    res.json(result);
  } catch (error) {
    console.error('Error performing cohort analysis:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/analytics/business-intelligence:
 *   post:
 *     summary: Generate business intelligence
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Business intelligence report
 */
router.post('/analytics/business-intelligence', adminAuth, async (req, res) => {
  try {
    const result = await advancedAnalyticsService.generateBusinessIntelligence(req.body.data);
    res.json(result);
  } catch (error) {
    console.error('Error generating business intelligence:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/analytics/real-time-metrics:
 *   get:
 *     summary: Get real-time metrics
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Real-time metrics
 */
router.get('/analytics/real-time-metrics', adminAuth, async (req, res) => {
  try {
    const result = await advancedAnalyticsService.getRealTimeMetrics();
    res.json(result);
  } catch (error) {
    console.error('Error getting real-time metrics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/analytics/statistical-analysis:
 *   post:
 *     summary: Perform statistical analysis
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: array
 *     responses:
 *       200:
 *         description: Statistical analysis results
 */
router.post('/analytics/statistical-analysis', adminAuth, async (req, res) => {
  try {
    const result = await advancedAnalyticsService.performStatisticalAnalysis(req.body.data);
    res.json(result);
  } catch (error) {
    console.error('Error performing statistical analysis:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Internationalization Routes
/**
 * @swagger
 * /api/advanced/i18n/languages:
 *   get:
 *     summary: Get supported languages
 *     tags: [Advanced Features]
 *     responses:
 *       200:
 *         description: List of supported languages
 */
router.get('/i18n/languages', async (req, res) => {
  try {
    const languages = internationalizationService.getSupportedLanguages();
    res.json({ success: true, languages });
  } catch (error) {
    console.error('Error getting supported languages:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/i18n/translate:
 *   post:
 *     summary: Translate text
 *     tags: [Advanced Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               language:
 *                 type: string
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: Translated text
 */
router.post('/i18n/translate', async (req, res) => {
  try {
    const { key, language, options } = req.body;
    await internationalizationService.changeLanguage(language);
    const translation = internationalizationService.translate(key, options);
    res.json({ success: true, translation });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/i18n/translations:
 *   get:
 *     summary: Get translations for language
 *     tags: [Advanced Features]
 *     parameters:
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Translations for specified language
 */
router.get('/i18n/translations', async (req, res) => {
  try {
    const { language } = req.query;
    const translations = internationalizationService.getTranslations(language);
    res.json({ success: true, translations });
  } catch (error) {
    console.error('Error getting translations:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/i18n/format-currency:
 *   post:
 *     summary: Format currency
 *     tags: [Advanced Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               locale:
 *                 type: string
 *     responses:
 *       200:
 *         description: Formatted currency
 */
router.post('/i18n/format-currency', async (req, res) => {
  try {
    const { amount, currency, locale } = req.body;
    const formatted = internationalizationService.formatCurrency(amount, currency, locale);
    res.json({ success: true, formatted });
  } catch (error) {
    console.error('Error formatting currency:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Advanced Security Routes
/**
 * @swagger
 * /api/advanced/security/2fa/setup:
 *   post:
 *     summary: Setup 2FA for user
 *     tags: [Advanced Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA setup result
 */
router.post('/security/2fa/setup', auth, async (req, res) => {
  try {
    const result = await advancedSecurityService.setup2FA(req.body.userId);
    res.json(result);
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/security/2fa/verify:
 *   post:
 *     summary: Verify 2FA token
 *     tags: [Advanced Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               secret:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA verification result
 */
router.post('/security/2fa/verify', async (req, res) => {
  try {
    const result = await advancedSecurityService.verify2FA(req.body.token, req.body.secret);
    res.json(result);
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/security/biometric/register:
 *   post:
 *     summary: Register biometric authentication
 *     tags: [Advanced Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               biometricData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Biometric registration result
 */
router.post('/security/biometric/register', auth, async (req, res) => {
  try {
    const result = await advancedSecurityService.registerBiometric(
      req.body.userId,
      req.body.biometricData
    );
    res.json(result);
  } catch (error) {
    console.error('Error registering biometric:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/security/device-fingerprint:
 *   post:
 *     summary: Create device fingerprint
 *     tags: [Advanced Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               deviceData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Device fingerprint result
 */
router.post('/security/device-fingerprint', auth, async (req, res) => {
  try {
    const result = await advancedSecurityService.createDeviceFingerprint(
      req.body.userId,
      req.body.deviceData
    );
    res.json(result);
  } catch (error) {
    console.error('Error creating device fingerprint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/security/password/validate:
 *   post:
 *     summary: Validate password strength
 *     tags: [Advanced Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password validation result
 */
router.post('/security/password/validate', async (req, res) => {
  try {
    const result = await advancedSecurityService.validatePassword(req.body.password);
    res.json(result);
  } catch (error) {
    console.error('Error validating password:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/security/threat-detection:
 *   post:
 *     summary: Detect security threats
 *     tags: [Advanced Features]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Threat detection results
 */
router.post('/security/threat-detection', adminAuth, async (req, res) => {
  try {
    const result = await advancedSecurityService.detectThreats(req.body.requestData);
    res.json(result);
  } catch (error) {
    console.error('Error detecting threats:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/advanced/security/audit:
 *   get:
 *     summary: Generate security audit
 *     tags: [Advanced Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Security audit report
 */
router.get('/security/audit', auth, async (req, res) => {
  try {
    const result = await advancedSecurityService.generateSecurityAudit(req.query.userId);
    res.json(result);
  } catch (error) {
    console.error('Error generating security audit:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router; 