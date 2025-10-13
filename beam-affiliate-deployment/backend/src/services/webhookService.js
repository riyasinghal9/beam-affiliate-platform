const crypto = require('crypto');
const axios = require('axios');

class WebhookService {
  constructor() {
    this.webhooks = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 5000; // 5 seconds
    this.timeout = 10000; // 10 seconds
  }

  // Register a webhook
  async registerWebhook(webhookData) {
    try {
      const {
        name,
        url,
        events,
        secret,
        isActive = true,
        headers = {},
        retryConfig = {}
      } = webhookData;

      const webhook = {
        id: crypto.randomBytes(16).toString('hex'),
        name,
        url,
        events: Array.isArray(events) ? events : [events],
        secret,
        isActive,
        headers,
        retryConfig: {
          maxAttempts: retryConfig.maxAttempts || this.retryAttempts,
          delay: retryConfig.delay || this.retryDelay
        },
        createdAt: new Date(),
        stats: {
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          lastDelivery: null,
          lastError: null
        }
      };

      this.webhooks.set(webhook.id, webhook);

      return {
        success: true,
        webhook
      };
    } catch (error) {
      console.error('Register webhook error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Trigger webhook
  async triggerWebhook(event, data, webhookId = null) {
    try {
      const webhooksToTrigger = [];

      if (webhookId) {
        // Trigger specific webhook
        const webhook = this.webhooks.get(webhookId);
        if (webhook && webhook.isActive && webhook.events.includes(event)) {
          webhooksToTrigger.push(webhook);
        }
      } else {
        // Trigger all webhooks for this event
        for (const webhook of this.webhooks.values()) {
          if (webhook.isActive && webhook.events.includes(event)) {
            webhooksToTrigger.push(webhook);
          }
        }
      }

      const results = await Promise.allSettled(
        webhooksToTrigger.map(webhook => this.deliverWebhook(webhook, event, data))
      );

      return {
        success: true,
        triggered: webhooksToTrigger.length,
        results: results.map((result, index) => ({
          webhookId: webhooksToTrigger[index].id,
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason : null
        }))
      };
    } catch (error) {
      console.error('Trigger webhook error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Deliver webhook to endpoint
  async deliverWebhook(webhook, event, data) {
    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
        webhookId: webhook.id
      };

      // Generate signature
      const signature = this.generateSignature(payload, webhook.secret);

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': payload.timestamp,
        ...webhook.headers
      };

      // Send webhook
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: this.timeout,
        validateStatus: () => true // Don't throw on HTTP error status
      });

      // Update webhook stats
      webhook.stats.totalDeliveries++;
      
      if (response.status >= 200 && response.status < 300) {
        webhook.stats.successfulDeliveries++;
        webhook.stats.lastDelivery = new Date();
        webhook.stats.lastError = null;
      } else {
        webhook.stats.failedDeliveries++;
        webhook.stats.lastError = `HTTP ${response.status}: ${response.statusText}`;
        
        // Retry on failure
        await this.retryWebhook(webhook, event, data);
      }

      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        responseData: response.data
      };
    } catch (error) {
      console.error('Deliver webhook error:', error);
      
      // Update webhook stats
      webhook.stats.totalDeliveries++;
      webhook.stats.failedDeliveries++;
      webhook.stats.lastError = error.message;
      
      // Retry on error
      await this.retryWebhook(webhook, event, data);
      
      throw error;
    }
  }

  // Retry webhook delivery
  async retryWebhook(webhook, event, data, attempt = 1) {
    if (attempt >= webhook.retryConfig.maxAttempts) {
      console.log(`Webhook ${webhook.id} failed after ${attempt} attempts`);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, webhook.retryConfig.delay * attempt));
      await this.deliverWebhook(webhook, event, data);
    } catch (error) {
      console.error(`Webhook retry ${attempt} failed:`, error);
      await this.retryWebhook(webhook, event, data, attempt + 1);
    }
  }

  // Generate webhook signature
  generateSignature(payload, secret) {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  }

  // Verify webhook signature
  verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Get webhook by ID
  getWebhook(webhookId) {
    return this.webhooks.get(webhookId);
  }

  // Get all webhooks
  getAllWebhooks() {
    return Array.from(this.webhooks.values());
  }

  // Update webhook
  async updateWebhook(webhookId, updates) {
    try {
      const webhook = this.webhooks.get(webhookId);
      if (!webhook) {
        return {
          success: false,
          error: 'Webhook not found'
        };
      }

      // Update webhook properties
      Object.assign(webhook, updates);
      webhook.updatedAt = new Date();

      return {
        success: true,
        webhook
      };
    } catch (error) {
      console.error('Update webhook error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete webhook
  async deleteWebhook(webhookId) {
    try {
      const webhook = this.webhooks.get(webhookId);
      if (!webhook) {
        return {
          success: false,
          error: 'Webhook not found'
        };
      }

      this.webhooks.delete(webhookId);

      return {
        success: true,
        message: 'Webhook deleted successfully'
      };
    } catch (error) {
      console.error('Delete webhook error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test webhook
  async testWebhook(webhookId) {
    try {
      const webhook = this.webhooks.get(webhookId);
      if (!webhook) {
        return {
          success: false,
          error: 'Webhook not found'
        };
      }

      const testData = {
        test: true,
        message: 'This is a test webhook delivery',
        timestamp: new Date().toISOString()
      };

      const result = await this.deliverWebhook(webhook, 'test', testData);

      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Test webhook error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get webhook statistics
  getWebhookStats(webhookId = null) {
    if (webhookId) {
      const webhook = this.webhooks.get(webhookId);
      return webhook ? webhook.stats : null;
    }

    const stats = {
      totalWebhooks: this.webhooks.size,
      activeWebhooks: Array.from(this.webhooks.values()).filter(w => w.isActive).length,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0
    };

    for (const webhook of this.webhooks.values()) {
      stats.totalDeliveries += webhook.stats.totalDeliveries;
      stats.successfulDeliveries += webhook.stats.successfulDeliveries;
      stats.failedDeliveries += webhook.stats.failedDeliveries;
    }

    return stats;
  }

  // Predefined webhook events
  static get Events() {
    return {
      // User events
      USER_REGISTERED: 'user.registered',
      USER_LOGIN: 'user.login',
      USER_LOGOUT: 'user.logout',
      USER_UPDATED: 'user.updated',
      USER_DELETED: 'user.deleted',

      // Financial events
      PAYMENT_PROCESSED: 'payment.processed',
      PAYMENT_FAILED: 'payment.failed',
      COMMISSION_EARNED: 'commission.earned',
      WITHDRAWAL_REQUESTED: 'withdrawal.requested',
      WITHDRAWAL_PROCESSED: 'withdrawal.processed',

      // Training events
      COURSE_ENROLLED: 'course.enrolled',
      LESSON_COMPLETED: 'lesson.completed',
      CERTIFICATE_EARNED: 'certificate.earned',

      // Security events
      SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
      FRAUD_DETECTED: 'security.fraud_detected',
      ACCOUNT_LOCKED: 'security.account_locked',

      // System events
      SYSTEM_MAINTENANCE: 'system.maintenance',
      SYSTEM_ERROR: 'system.error',
      BACKUP_COMPLETED: 'system.backup_completed',

      // Marketing events
      CAMPAIGN_CREATED: 'marketing.campaign_created',
      EMAIL_SENT: 'marketing.email_sent',
      LEAD_SCORED: 'marketing.lead_scored'
    };
  }

  // Create webhook for common integrations
  async createIntegrationWebhook(integrationType, config) {
    const integrationWebhooks = {
      slack: {
        name: 'Slack Notifications',
        events: [
          WebhookService.Events.PAYMENT_PROCESSED,
          WebhookService.Events.COMMISSION_EARNED,
          WebhookService.Events.SUSPICIOUS_ACTIVITY
        ],
        headers: {
          'Content-Type': 'application/json'
        }
      },
      discord: {
        name: 'Discord Notifications',
        events: [
          WebhookService.Events.PAYMENT_PROCESSED,
          WebhookService.Events.COMMISSION_EARNED
        ],
        headers: {
          'Content-Type': 'application/json'
        }
      },
      zapier: {
        name: 'Zapier Integration',
        events: Object.values(WebhookService.Events),
        headers: {}
      },
      shopify: {
        name: 'Shopify Integration',
        events: [
          WebhookService.Events.PAYMENT_PROCESSED,
          WebhookService.Events.COMMISSION_EARNED
        ],
        headers: {
          'X-Shopify-Topic': 'orders/create'
        }
      }
    };

    const webhookConfig = integrationWebhooks[integrationType];
    if (!webhookConfig) {
      return {
        success: false,
        error: 'Unsupported integration type'
      };
    }

    return this.registerWebhook({
      ...webhookConfig,
      url: config.url,
      secret: config.secret || crypto.randomBytes(32).toString('hex')
    });
  }

  // Format payload for specific integrations
  formatPayloadForIntegration(integrationType, event, data) {
    const formatters = {
      slack: (event, data) => ({
        text: `*${event}* occurred`,
        attachments: [{
          color: this.getSlackColor(event),
          fields: this.formatSlackFields(data),
          ts: Math.floor(Date.now() / 1000)
        }]
      }),
      discord: (event, data) => ({
        embeds: [{
          title: event,
          description: this.formatDiscordDescription(data),
          color: this.getDiscordColor(event),
          timestamp: new Date().toISOString()
        }]
      })
    };

    const formatter = formatters[integrationType];
    return formatter ? formatter(event, data) : data;
  }

  // Get Slack color for event
  getSlackColor(event) {
    const colors = {
      'payment.processed': 'good',
      'commission.earned': 'good',
      'suspicious_activity': 'warning',
      'fraud_detected': 'danger',
      'system.error': 'danger'
    };
    return colors[event] || '#36a64f';
  }

  // Get Discord color for event
  getDiscordColor(event) {
    const colors = {
      'payment.processed': 0x00ff00,
      'commission.earned': 0x00ff00,
      'suspicious_activity': 0xffff00,
      'fraud_detected': 0xff0000,
      'system.error': 0xff0000
    };
    return colors[event] || 0x36a64f;
  }

  // Format Slack fields
  formatSlackFields(data) {
    const fields = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        short: true
      });
    }
    return fields;
  }

  // Format Discord description
  formatDiscordDescription(data) {
    return Object.entries(data)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join('\n');
  }
}

module.exports = new WebhookService(); 