const Click = require('../models/Click');
const Sale = require('../models/Sale');
const User = require('../models/User');
const crypto = require('crypto');

class TrackingService {
  constructor() {
    this.fraudThresholds = {
      maxClicksPerHour: 100,
      maxClicksPerIP: 50,
      suspiciousPatterns: ['bot', 'crawler', 'spider']
    };
  }

  // Generate unique tracking ID
  generateTrackingId(resellerId, productId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return crypto.createHash('md5')
      .update(`${resellerId}-${productId}-${timestamp}-${random}`)
      .digest('hex')
      .substring(0, 16);
  }

  // Track link click with comprehensive data
  async trackClick(req, resellerId, productId, productName) {
    try {
      const trackingId = this.generateTrackingId(resellerId, productId);
      
      // Get client information
      const clientInfo = this.extractClientInfo(req);
      
      // Check for fraud
      const fraudCheck = await this.performFraudCheck(clientInfo, resellerId);
      
      const clickData = {
        trackingId,
        resellerId,
        productId,
        productName,
        timestamp: new Date(),
        ipAddress: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        referrer: clientInfo.referrer,
        utmSource: req.query.utm_source || null,
        utmMedium: req.query.utm_medium || null,
        utmCampaign: req.query.utm_campaign || null,
        utmTerm: req.query.utm_term || null,
        utmContent: req.query.utm_content || null,
        deviceType: clientInfo.deviceType,
        browser: clientInfo.browser,
        os: clientInfo.os,
        country: clientInfo.country,
        city: clientInfo.city,
        isMobile: clientInfo.isMobile,
        screenResolution: clientInfo.screenResolution,
        language: clientInfo.language,
        timezone: clientInfo.timezone,
        fraudScore: fraudCheck.score,
        isSuspicious: fraudCheck.isSuspicious,
        fraudReasons: fraudCheck.reasons
      };

      const click = new Click(clickData);
      await click.save();

      // Update reseller's click count
      await User.findOneAndUpdate(
        { resellerId },
        { $inc: { totalClicks: 1 } }
      );

      return {
        success: true,
        trackingId,
        fraudCheck: fraudCheck.isSuspicious ? 'suspicious' : 'clean'
      };
    } catch (error) {
      console.error('Error tracking click:', error);
      return { success: false, error: error.message };
    }
  }

  // Extract comprehensive client information
  extractClientInfo(req) {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers.referer || req.headers.referrer || '';
    
    // Parse user agent
    const browser = this.parseBrowser(userAgent);
    const os = this.parseOS(userAgent);
    const deviceType = this.parseDeviceType(userAgent);
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

    return {
      ip,
      userAgent,
      referrer,
      browser,
      os,
      deviceType,
      isMobile,
      screenResolution: req.headers['sec-ch-viewport-width'] ? 
        `${req.headers['sec-ch-viewport-width']}x${req.headers['sec-ch-viewport-height']}` : null,
      language: req.headers['accept-language']?.split(',')[0] || 'en',
      timezone: req.headers['sec-ch-prefers-color-scheme'] || 'light',
      country: null, // Would be populated by IP geolocation service
      city: null     // Would be populated by IP geolocation service
    };
  }

  // Parse browser from user agent
  parseBrowser(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  // Parse OS from user agent
  parseOS(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Parse device type from user agent
  parseDeviceType(userAgent) {
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  // Perform fraud detection
  async performFraudCheck(clientInfo, resellerId) {
    let score = 0;
    const reasons = [];

    // Check for suspicious user agents
    if (this.fraudThresholds.suspiciousPatterns.some(pattern => 
      clientInfo.userAgent.toLowerCase().includes(pattern))) {
      score += 50;
      reasons.push('Suspicious user agent');
    }

    // Check click frequency per IP
    const recentClicksByIP = await Click.countDocuments({
      ipAddress: clientInfo.ip,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });

    if (recentClicksByIP > this.fraudThresholds.maxClicksPerIP) {
      score += 30;
      reasons.push('High click frequency from IP');
    }

    // Check click frequency per reseller
    const recentClicksByReseller = await Click.countDocuments({
      resellerId,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });

    if (recentClicksByReseller > this.fraudThresholds.maxClicksPerHour) {
      score += 40;
      reasons.push('High click frequency for reseller');
    }

    // Check for missing referrer (direct access)
    if (!clientInfo.referrer) {
      score += 10;
      reasons.push('No referrer');
    }

    // Check for bot-like behavior
    if (clientInfo.userAgent.length < 20) {
      score += 20;
      reasons.push('Suspicious user agent length');
    }

    return {
      score,
      isSuspicious: score > 50,
      reasons
    };
  }

  // Track conversion (sale)
  async trackConversion(trackingId, saleData) {
    try {
      // Find the original click
      const click = await Click.findOne({ trackingId });
      if (!click) {
        throw new Error('Click not found for tracking ID');
      }

      const conversionData = {
        trackingId,
        resellerId: click.resellerId,
        productId: click.productId,
        productName: click.productName,
        saleAmount: saleData.amount,
        commissionAmount: saleData.commissionAmount,
        customerEmail: saleData.customerEmail,
        customerName: saleData.customerName,
        paymentMethod: saleData.paymentMethod,
        paymentStatus: saleData.paymentStatus,
        timestamp: new Date(),
        conversionTime: new Date() - click.timestamp, // Time from click to conversion
        ipAddress: click.ipAddress,
        userAgent: click.userAgent,
        referrer: click.referrer,
        utmSource: click.utmSource,
        utmMedium: click.utmMedium,
        utmCampaign: click.utmCampaign,
        utmTerm: click.utmTerm,
        utmContent: click.utmContent,
        deviceType: click.deviceType,
        browser: click.browser,
        os: click.os,
        country: click.country,
        city: click.city,
        isMobile: click.isMobile
      };

      const sale = new Sale(conversionData);
      await sale.save();

      // Update reseller's sales count and earnings
      await User.findOneAndUpdate(
        { resellerId: click.resellerId },
        { 
          $inc: { 
            totalSales: 1,
            totalEarnings: saleData.commissionAmount
          }
        }
      );

      return {
        success: true,
        saleId: sale._id,
        conversionTime: conversionData.conversionTime
      };
    } catch (error) {
      console.error('Error tracking conversion:', error);
      return { success: false, error: error.message };
    }
  }

  // Get analytics for reseller
  async getResellerAnalytics(resellerId, period = '30d') {
    try {
      const startDate = this.getStartDate(period);
      
      const clicks = await Click.find({
        resellerId,
        timestamp: { $gte: startDate }
      });

      const sales = await Sale.find({
        resellerId,
        timestamp: { $gte: startDate }
      });

      const analytics = {
        totalClicks: clicks.length,
        totalSales: sales.length,
        conversionRate: clicks.length > 0 ? (sales.length / clicks.length * 100).toFixed(2) : 0,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.saleAmount, 0),
        totalCommission: sales.reduce((sum, sale) => sum + sale.commissionAmount, 0),
        averageOrderValue: sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.saleAmount, 0) / sales.length).toFixed(2) : 0,
        topProducts: this.getTopProducts(sales),
        topSources: this.getTopSources(clicks),
        deviceBreakdown: this.getDeviceBreakdown(clicks),
        geographicData: this.getGeographicData(clicks),
        timeSeriesData: this.getTimeSeriesData(clicks, sales, period)
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get start date based on period
  getStartDate(period) {
    const now = new Date();
    switch (period) {
      case '7d': return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now - 90 * 24 * 60 * 60 * 1000);
      case '1y': return new Date(now - 365 * 24 * 60 * 60 * 1000);
      default: return new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Get top products
  getTopProducts(sales) {
    const productCount = {};
    sales.forEach(sale => {
      productCount[sale.productName] = (productCount[sale.productName] || 0) + 1;
    });
    return Object.entries(productCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Get top sources
  getTopSources(clicks) {
    const sourceCount = {};
    clicks.forEach(click => {
      const source = click.utmSource || click.referrer || 'Direct';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    return Object.entries(sourceCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Get device breakdown
  getDeviceBreakdown(clicks) {
    const deviceCount = {};
    clicks.forEach(click => {
      deviceCount[click.deviceType] = (deviceCount[click.deviceType] || 0) + 1;
    });
    return Object.entries(deviceCount)
      .map(([device, count]) => ({ device, count }));
  }

  // Get geographic data
  getGeographicData(clicks) {
    const geoCount = {};
    clicks.forEach(click => {
      const location = click.country || 'Unknown';
      geoCount[location] = (geoCount[location] || 0) + 1;
    });
    return Object.entries(geoCount)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Get time series data
  getTimeSeriesData(clicks, sales, period) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const timeSeries = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayClicks = clicks.filter(click => 
        click.timestamp.toISOString().split('T')[0] === dateStr
      ).length;

      const daySales = sales.filter(sale => 
        sale.timestamp.toISOString().split('T')[0] === dateStr
      ).length;

      timeSeries.push({
        date: dateStr,
        clicks: dayClicks,
        sales: daySales
      });
    }

    return timeSeries;
  }
}

module.exports = new TrackingService(); 