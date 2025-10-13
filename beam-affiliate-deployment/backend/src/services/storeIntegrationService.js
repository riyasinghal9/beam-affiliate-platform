const axios = require('axios');

class StoreIntegrationService {
  constructor() {
    this.storeBaseUrl = 'https://shop.beamwallet.com';
    this.webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:5001/api/store-webhooks';
  }

  // Generate tracking URL for external store
  generateTrackingUrl(productId, resellerId, productPrice, utmData = {}) {
    const baseUrl = `${this.storeBaseUrl}/pt/product/for-online-stores`;
    const trackingParams = new URLSearchParams({
      affiliate_id: resellerId,
      product_id: productId,
      product_price: productPrice.toString(),
      utm_source: utmData.utmSource || 'affiliate',
      utm_medium: utmData.utmMedium || 'link',
      utm_campaign: utmData.utmCampaign || 'beam_affiliate',
      ref: 'beam_affiliate_platform',
      webhook_url: this.webhookUrl
    });

    return `${baseUrl}?${trackingParams.toString()}`;
  }

  // Simulate webhook call for testing (in production, this would be called by the store)
  async simulateStorePurchase(purchaseData) {
    try {
      const webhookData = {
        orderId: `test_${Date.now()}`,
        productId: purchaseData.productId,
        affiliateId: purchaseData.resellerId,
        customerEmail: purchaseData.customerEmail,
        customerName: purchaseData.customerName,
        amount: purchaseData.amount,
        currency: purchaseData.currency || 'USD',
        paymentMethod: 'beam_wallet',
        purchaseDate: new Date().toISOString(),
        orderStatus: 'completed',
        trackingData: {
          productName: purchaseData.productName,
          commissionRate: purchaseData.commissionRate || 50,
          customerPhone: purchaseData.customerPhone,
          ipAddress: purchaseData.ipAddress || '127.0.0.1',
          userAgent: purchaseData.userAgent || 'Test Agent',
          utmSource: purchaseData.utmSource,
          utmMedium: purchaseData.utmMedium,
          utmCampaign: purchaseData.utmCampaign,
          conversionTime: purchaseData.conversionTime
        }
      };

      // Call our own webhook endpoint
      const response = await axios.post(`${this.webhookUrl}/purchase`, webhookData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Beam-Signature': 'test-signature'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error simulating store purchase:', error);
      throw error;
    }
  }

  // Verify webhook signature (for production)
  verifyWebhookSignature(payload, signature, secret) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Get store product information
  async getStoreProductInfo(productId) {
    try {
      // In a real implementation, this would call the store's API
      // For now, we'll return mock data
      return {
        id: productId,
        name: 'Beam Wallet for Online Stores',
        price: 99.99,
        currency: 'USD',
        description: 'Complete payment solution for online stores',
        category: 'Payment Solutions',
        available: true
      };
    } catch (error) {
      console.error('Error fetching store product info:', error);
      throw error;
    }
  }

  // Track conversion from store
  async trackStoreConversion(trackingData) {
    try {
      const conversionData = {
        resellerId: trackingData.resellerId,
        productId: trackingData.productId,
        customerEmail: trackingData.customerEmail,
        customerName: trackingData.customerName,
        amount: trackingData.amount,
        commission: trackingData.commission,
        clickId: trackingData.clickId,
        paymentMethod: 'beam_wallet',
        timestamp: new Date(),
        productName: trackingData.productName,
        commissionRate: trackingData.commissionRate,
        paymentId: `store_${Date.now()}`,
        ipAddress: trackingData.ipAddress,
        userAgent: trackingData.userAgent,
        utmSource: trackingData.utmSource,
        utmMedium: trackingData.utmMedium,
        utmCampaign: trackingData.utmCampaign
      };

      // Call tracking service
      const trackingService = require('./trackingService');
      return await trackingService.trackSale(conversionData);
    } catch (error) {
      console.error('Error tracking store conversion:', error);
      throw error;
    }
  }

  // Get store analytics
  async getStoreAnalytics(resellerId, period = '30d') {
    try {
      // This would typically call the store's analytics API
      // For now, we'll return mock data
      return {
        totalVisits: 150,
        totalPurchases: 12,
        conversionRate: 8.0,
        totalRevenue: 1199.88,
        averageOrderValue: 99.99,
        topProducts: [
          { name: 'Beam Wallet for Online Stores', purchases: 8, revenue: 799.92 },
          { name: 'Beam Wallet Pro', purchases: 4, revenue: 399.96 }
        ],
        trafficSources: [
          { source: 'affiliate', visits: 120, conversions: 10 },
          { source: 'direct', visits: 30, conversions: 2 }
        ]
      };
    } catch (error) {
      console.error('Error fetching store analytics:', error);
      throw error;
    }
  }

  // Validate store purchase data
  validatePurchaseData(data) {
    const required = ['orderId', 'productId', 'affiliateId', 'customerEmail', 'amount'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!data.customerEmail || !data.customerEmail.includes('@')) {
      throw new Error('Invalid email address');
    }

    return true;
  }
}

module.exports = new StoreIntegrationService();
