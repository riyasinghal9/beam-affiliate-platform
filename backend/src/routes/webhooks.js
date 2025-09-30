const express = require('express');
const router = express.Router();
const webhookService = require('../services/webhookService');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Webhook:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique webhook identifier
 *         name:
 *           type: string
 *           description: Webhook name
 *         url:
 *           type: string
 *           format: uri
 *           description: Webhook endpoint URL
 *         events:
 *           type: array
 *           items:
 *             type: string
 *           description: List of subscribed events
 *         isActive:
 *           type: boolean
 *           description: Whether the webhook is active
 *         secret:
 *           type: string
 *           description: Webhook secret for signature verification
 *         headers:
 *           type: object
 *           description: Custom headers to include in webhook requests
 *         retryConfig:
 *           type: object
 *           properties:
 *             maxRetries:
 *               type: number
 *               description: Maximum number of retry attempts
 *             retryDelay:
 *               type: number
 *               description: Initial retry delay in milliseconds
 *             backoffMultiplier:
 *               type: number
 *               description: Exponential backoff multiplier
 *             maxDelay:
 *               type: number
 *               description: Maximum retry delay in milliseconds
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         lastTriggered:
 *           type: string
 *           format: date-time
 *         successCount:
 *           type: number
 *         failureCount:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook management and monitoring
 */

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Register a new webhook
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *               - events
 *             properties:
 *               name:
 *                 type: string
 *                 description: Webhook name
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Webhook endpoint URL
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of events to subscribe to
 *               secret:
 *                 type: string
 *                 description: Custom secret for signature verification
 *               headers:
 *                 type: object
 *                 description: Custom headers
 *               retryConfig:
 *                 type: object
 *                 description: Retry configuration
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       201:
 *         description: Webhook registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 webhook:
 *                   $ref: '#/components/schemas/Webhook'
 *       400:
 *         description: Invalid webhook data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const result = await webhookService.registerWebhook(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error registering webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks:
 *   get:
 *     summary: Get all webhooks
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: events
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by event types
 *     responses:
 *       200:
 *         description: List of webhooks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 webhooks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Webhook'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const filters = {};
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }
    if (req.query.events) {
      filters.events = Array.isArray(req.query.events) ? req.query.events : [req.query.events];
    }

    const result = await webhookService.getAllWebhooks(filters);
    res.json(result);
  } catch (error) {
    console.error('Error getting webhooks:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/{webhookId}:
 *   get:
 *     summary: Get webhook by ID
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook ID
 *     responses:
 *       200:
 *         description: Webhook details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 webhook:
 *                   $ref: '#/components/schemas/Webhook'
 *       404:
 *         description: Webhook not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:webhookId', adminAuth, async (req, res) => {
  try {
    const result = await webhookService.getWebhook(req.params.webhookId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error getting webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/{webhookId}:
 *   put:
 *     summary: Update webhook
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               headers:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *               retryConfig:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook updated successfully
 *       400:
 *         description: Invalid update data
 *       404:
 *         description: Webhook not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:webhookId', adminAuth, async (req, res) => {
  try {
    const result = await webhookService.updateWebhook(req.params.webhookId, req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/{webhookId}:
 *   delete:
 *     summary: Delete webhook
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook ID
 *     responses:
 *       200:
 *         description: Webhook deleted successfully
 *       404:
 *         description: Webhook not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:webhookId', adminAuth, async (req, res) => {
  try {
    const result = await webhookService.deleteWebhook(req.params.webhookId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/{webhookId}/test:
 *   post:
 *     summary: Test webhook endpoint
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook ID
 *     responses:
 *       200:
 *         description: Test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: number
 *                 data:
 *                   type: object
 *       404:
 *         description: Webhook not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:webhookId/test', adminAuth, async (req, res) => {
  try {
    const webhook = await webhookService.getWebhook(req.params.webhookId);
    
    if (!webhook.success) {
      return res.status(404).json(webhook);
    }

    const result = await webhookService.testWebhook(webhook.webhook);
    res.json(result);
  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/{webhookId}/trigger:
 *   post:
 *     summary: Manually trigger webhook
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - eventData
 *             properties:
 *               eventType:
 *                 type: string
 *                 description: Event type to trigger
 *               eventData:
 *                 type: object
 *                 description: Event data payload
 *     responses:
 *       200:
 *         description: Webhook triggered successfully
 *       400:
 *         description: Invalid event data
 *       404:
 *         description: Webhook not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:webhookId/trigger', adminAuth, async (req, res) => {
  try {
    const { eventType, eventData } = req.body;
    
    if (!eventType || !eventData) {
      return res.status(400).json({
        success: false,
        error: 'eventType and eventData are required'
      });
    }

    const result = await webhookService.triggerWebhook(
      req.params.webhookId,
      eventType,
      eventData
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error triggering webhook:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/events/trigger:
 *   post:
 *     summary: Trigger event for all subscribed webhooks
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *               - eventData
 *             properties:
 *               eventType:
 *                 type: string
 *                 description: Event type to trigger
 *               eventData:
 *                 type: object
 *                 description: Event data payload
 *               webhookIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific webhook IDs to trigger (optional)
 *     responses:
 *       200:
 *         description: Event triggered successfully
 *       400:
 *         description: Invalid event data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/events/trigger', adminAuth, async (req, res) => {
  try {
    const { eventType, eventData, webhookIds } = req.body;
    
    if (!eventType || !eventData) {
      return res.status(400).json({
        success: false,
        error: 'eventType and eventData are required'
      });
    }

    const result = await webhookService.bulkTriggerWebhooks(eventType, eventData, webhookIds);
    res.json(result);
  } catch (error) {
    console.error('Error triggering event:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/statistics:
 *   get:
 *     summary: Get webhook statistics
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Webhook statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     inactive:
 *                       type: number
 *                     totalSuccess:
 *                       type: number
 *                     totalFailures:
 *                       type: number
 *                     successRate:
 *                       type: number
 *                     byEventType:
 *                       type: object
 *                     recentActivity:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    const result = await webhookService.getWebhookStatistics();
    res.json(result);
  } catch (error) {
    console.error('Error getting webhook statistics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/health:
 *   get:
 *     summary: Check webhook health
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Webhook health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     healthy:
 *                       type: number
 *                     unhealthy:
 *                       type: number
 *                     inactive:
 *                       type: number
 *                     error:
 *                       type: number
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       webhookId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       error:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/health', adminAuth, async (req, res) => {
  try {
    const result = await webhookService.healthCheck();
    res.json(result);
  } catch (error) {
    console.error('Error checking webhook health:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/{webhookId}/export:
 *   get:
 *     summary: Export webhook configuration
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook ID
 *     responses:
 *       200:
 *         description: Webhook configuration
 *       404:
 *         description: Webhook not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:webhookId/export', adminAuth, async (req, res) => {
  try {
    const result = await webhookService.exportWebhookConfig(req.params.webhookId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error exporting webhook config:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhooks/import:
 *   post:
 *     summary: Import webhook configuration
 *     tags: [Webhooks]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *               - events
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               headers:
 *                 type: object
 *               retryConfig:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Webhook imported successfully
 *       400:
 *         description: Invalid configuration
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/import', adminAuth, async (req, res) => {
  try {
    const result = await webhookService.importWebhookConfig(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error importing webhook config:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router; 