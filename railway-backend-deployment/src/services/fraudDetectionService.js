const User = require('../models/User');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const Click = require('../models/Click');
const crypto = require('crypto');

class FraudDetectionService {
  constructor() {
    this.suspiciousPatterns = new Map();
    this.blockedIPs = new Set();
    this.rateLimits = new Map();
    this.fraudThreshold = 0.7;
    this.maxAttemptsPerHour = 10;
    this.maxAttemptsPerDay = 50;
  }

  // Analyze transaction for fraud
  async analyzeTransaction(transactionData) {
    try {
      const {
        resellerId,
        customerData,
        productData,
        amount,
        ip,
        userAgent,
        timestamp,
        paymentMethod
      } = transactionData;

      const analysis = {
        fraudScore: 0,
        riskFactors: [],
        isSuspicious: false,
        recommendations: [],
        timestamp: new Date()
      };

      // 1. Behavioral Analysis
      const behavioralScore = await this.analyzeBehavior(resellerId, customerData, amount);
      analysis.fraudScore += behavioralScore.score;
      analysis.riskFactors.push(...behavioralScore.factors);

      // 2. Geographic Analysis
      const geoScore = await this.analyzeGeographic(ip, resellerId);
      analysis.fraudScore += geoScore.score;
      analysis.riskFactors.push(...geoScore.factors);

      // 3. Velocity Analysis
      const velocityScore = await this.analyzeVelocity(ip, resellerId, timestamp);
      analysis.fraudScore += velocityScore.score;
      analysis.riskFactors.push(...velocityScore.factors);

      // 4. Device Fingerprint Analysis
      const deviceScore = await this.analyzeDeviceFingerprint(userAgent, ip, resellerId);
      analysis.fraudScore += deviceScore.score;
      analysis.riskFactors.push(...deviceScore.factors);

      // 5. Pattern Analysis
      const patternScore = await this.analyzePatterns(transactionData);
      analysis.fraudScore += patternScore.score;
      analysis.riskFactors.push(...patternScore.factors);

      // 6. Amount Analysis
      const amountScore = await this.analyzeAmount(amount, resellerId, productData);
      analysis.fraudScore += amountScore.score;
      analysis.riskFactors.push(...amountScore.factors);

      // Normalize fraud score to 0-1 range
      analysis.fraudScore = Math.min(1, Math.max(0, analysis.fraudScore / 6));
      analysis.isSuspicious = analysis.fraudScore > this.fraudThreshold;

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);

      // Log suspicious activity
      if (analysis.isSuspicious) {
        await this.logSuspiciousActivity(transactionData, analysis);
      }

      return {
        success: true,
        analysis
      };
    } catch (error) {
      console.error('Fraud analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze user behavior patterns
  async analyzeBehavior(resellerId, customerData, amount) {
    const score = { score: 0, factors: [] };

    try {
      // Get user's historical behavior
      const user = await User.findById(resellerId);
      if (!user) {
        score.score += 0.3;
        score.factors.push('Unknown reseller');
        return score;
      }

      // Check for unusual order amounts
      const avgOrderValue = user.totalEarnings / Math.max(user.totalSales, 1);
      if (amount > avgOrderValue * 3) {
        score.score += 0.2;
        score.factors.push('Unusual order amount');
      }

      // Check for new customer patterns
      const existingCustomer = await Sale.findOne({
        resellerId,
        'customerData.email': customerData.email
      });

      if (!existingCustomer) {
        // New customer - check if this is unusual for the reseller
        const customerCount = await Sale.distinct('customerData.email', { resellerId });
        if (customerCount.length < 5) {
          score.score += 0.1;
          score.factors.push('New customer for inexperienced reseller');
        }
      }

      // Check for time-based patterns
      const recentSales = await Sale.find({
        resellerId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (recentSales.length > 20) {
        score.score += 0.3;
        score.factors.push('High volume of sales in short time');
      }

      return score;
    } catch (error) {
      console.error('Behavior analysis error:', error);
      score.score += 0.1;
      score.factors.push('Behavior analysis failed');
      return score;
    }
  }

  // Analyze geographic patterns
  async analyzeGeographic(ip, resellerId) {
    const score = { score: 0, factors: [] };

    try {
      // Get reseller's typical geographic patterns
      const resellerSales = await Sale.find({ resellerId }).limit(100);
      const resellerIPs = [...new Set(resellerSales.map(s => s.ip))];

      // Check if IP is from a different country/region
      if (resellerIPs.length > 0 && !resellerIPs.includes(ip)) {
        score.score += 0.2;
        score.factors.push('Geographic anomaly detected');
      }

      // Check for known suspicious IP ranges
      if (this.isSuspiciousIP(ip)) {
        score.score += 0.4;
        score.factors.push('Suspicious IP address');
      }

      // Check for VPN/Proxy usage
      if (await this.isVPN(ip)) {
        score.score += 0.3;
        score.factors.push('VPN/Proxy detected');
      }

      return score;
    } catch (error) {
      console.error('Geographic analysis error:', error);
      score.score += 0.1;
      score.factors.push('Geographic analysis failed');
      return score;
    }
  }

  // Analyze velocity patterns
  async analyzeVelocity(ip, resellerId, timestamp) {
    const score = { score: 0, factors: [] };

    try {
      const oneHourAgo = new Date(timestamp.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);

      // Check hourly velocity
      const hourlyAttempts = await Sale.countDocuments({
        $or: [{ resellerId }, { ip }],
        createdAt: { $gte: oneHourAgo }
      });

      if (hourlyAttempts > this.maxAttemptsPerHour) {
        score.score += 0.4;
        score.factors.push('High hourly transaction velocity');
      }

      // Check daily velocity
      const dailyAttempts = await Sale.countDocuments({
        $or: [{ resellerId }, { ip }],
        createdAt: { $gte: oneDayAgo }
      });

      if (dailyAttempts > this.maxAttemptsPerDay) {
        score.score += 0.3;
        score.factors.push('High daily transaction velocity');
      }

      // Check for rapid-fire transactions
      const recentTransactions = await Sale.find({
        $or: [{ resellerId }, { ip }],
        createdAt: { $gte: new Date(timestamp.getTime() - 5 * 60 * 1000) } // Last 5 minutes
      });

      if (recentTransactions.length > 3) {
        score.score += 0.5;
        score.factors.push('Rapid-fire transactions detected');
      }

      return score;
    } catch (error) {
      console.error('Velocity analysis error:', error);
      score.score += 0.1;
      score.factors.push('Velocity analysis failed');
      return score;
    }
  }

  // Analyze device fingerprint
  async analyzeDeviceFingerprint(userAgent, ip, resellerId) {
    const score = { score: 0, factors: [] };

    try {
      // Generate device fingerprint
      const fingerprint = this.generateDeviceFingerprint(userAgent, ip);

      // Check for known suspicious fingerprints
      if (this.suspiciousPatterns.has(fingerprint)) {
        score.score += 0.4;
        score.factors.push('Suspicious device fingerprint');
      }

      // Check for multiple accounts using same device
      const usersWithFingerprint = await Sale.distinct('resellerId', {
        deviceFingerprint: fingerprint
      });

      if (usersWithFingerprint.length > 3) {
        score.score += 0.3;
        score.factors.push('Multiple accounts using same device');
      }

      // Check for automated browser patterns
      if (this.isAutomatedBrowser(userAgent)) {
        score.score += 0.5;
        score.factors.push('Automated browser detected');
      }

      return score;
    } catch (error) {
      console.error('Device fingerprint analysis error:', error);
      score.score += 0.1;
      score.factors.push('Device fingerprint analysis failed');
      return score;
    }
  }

  // Analyze transaction patterns
  async analyzePatterns(transactionData) {
    const score = { score: 0, factors: [] };

    try {
      const { amount, customerData, productData } = transactionData;

      // Check for round number amounts (suspicious)
      if (amount % 100 === 0 && amount > 1000) {
        score.score += 0.2;
        score.factors.push('Suspicious round number amount');
      }

      // Check for repeated customer data
      const similarCustomers = await Sale.countDocuments({
        'customerData.email': customerData.email,
        'customerData.name': customerData.name
      });

      if (similarCustomers > 5) {
        score.score += 0.3;
        score.factors.push('Repeated customer data');
      }

      // Check for product price manipulation
      const product = await Product.findById(productData._id);
      if (product && Math.abs(amount - product.price) > product.price * 0.1) {
        score.score += 0.4;
        score.factors.push('Price manipulation detected');
      }

      return score;
    } catch (error) {
      console.error('Pattern analysis error:', error);
      score.score += 0.1;
      score.factors.push('Pattern analysis failed');
      return score;
    }
  }

  // Analyze amount patterns
  async analyzeAmount(amount, resellerId, productData) {
    const score = { score: 0, factors: [] };

    try {
      // Get reseller's typical amounts
      const resellerSales = await Sale.find({ resellerId }).limit(50);
      const amounts = resellerSales.map(s => s.amount);
      
      if (amounts.length > 0) {
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stdDev = Math.sqrt(
          amounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / amounts.length
        );

        // Check if amount is significantly different from average
        if (Math.abs(amount - avgAmount) > stdDev * 3) {
          score.score += 0.3;
          score.factors.push('Amount significantly different from average');
        }
      }

      // Check for minimum amount violations
      if (amount < 10) {
        score.score += 0.2;
        score.factors.push('Suspiciously low amount');
      }

      // Check for maximum amount violations
      if (amount > 10000) {
        score.score += 0.4;
        score.factors.push('Suspiciously high amount');
      }

      return score;
    } catch (error) {
      console.error('Amount analysis error:', error);
      score.score += 0.1;
      score.factors.push('Amount analysis failed');
      return score;
    }
  }

  // Generate recommendations based on analysis
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.fraudScore > 0.8) {
      recommendations.push('Block transaction immediately');
      recommendations.push('Flag reseller for manual review');
      recommendations.push('Implement additional verification');
    } else if (analysis.fraudScore > 0.6) {
      recommendations.push('Require additional verification');
      recommendations.push('Monitor reseller activity closely');
      recommendations.push('Set up automated alerts');
    } else if (analysis.fraudScore > 0.4) {
      recommendations.push('Review transaction manually');
      recommendations.push('Monitor for similar patterns');
    }

    if (analysis.riskFactors.includes('High volume of sales in short time')) {
      recommendations.push('Implement rate limiting');
    }

    if (analysis.riskFactors.includes('Geographic anomaly detected')) {
      recommendations.push('Require location verification');
    }

    if (analysis.riskFactors.includes('Automated browser detected')) {
      recommendations.push('Implement CAPTCHA verification');
    }

    return recommendations;
  }

  // Log suspicious activity
  async logSuspiciousActivity(transactionData, analysis) {
    try {
      const FraudLog = require('../models/FraudLog');
      
      await FraudLog.create({
        transactionData,
        analysis,
        timestamp: new Date(),
        status: 'flagged'
      });

      // Update rate limits
      const key = `${transactionData.ip}-${transactionData.resellerId}`;
      const current = this.rateLimits.get(key) || 0;
      this.rateLimits.set(key, current + 1);

      // Block IP if too many suspicious activities
      if (current > 5) {
        this.blockedIPs.add(transactionData.ip);
      }
    } catch (error) {
      console.error('Log suspicious activity error:', error);
    }
  }

  // Helper methods
  generateDeviceFingerprint(userAgent, ip) {
    const data = `${userAgent}-${ip}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  isSuspiciousIP(ip) {
    // Add logic to check against known suspicious IP ranges
    const suspiciousRanges = [
      '192.168.1.0/24',
      '10.0.0.0/8',
      '172.16.0.0/12'
    ];
    
    // Simplified check - in production, use proper IP range checking
    return suspiciousRanges.some(range => ip.startsWith(range.split('/')[0]));
  }

  async isVPN(ip) {
    // Add logic to check if IP is from a VPN service
    // This would typically involve calling a third-party service
    const vpnKeywords = ['vpn', 'proxy', 'tor', 'anonymous'];
    return false; // Simplified for now
  }

  isAutomatedBrowser(userAgent) {
    const automatedKeywords = [
      'bot', 'crawler', 'spider', 'scraper', 'headless',
      'selenium', 'phantomjs', 'puppeteer'
    ];
    
    return automatedKeywords.some(keyword => 
      userAgent.toLowerCase().includes(keyword)
    );
  }

  // Get fraud statistics
  async getFraudStats(resellerId = null) {
    try {
      const match = resellerId ? { resellerId } : {};
      
      const stats = await Sale.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            suspiciousTransactions: {
              $sum: { $cond: [{ $gt: ['$fraudScore', this.fraudThreshold] }, 1, 0] }
            },
            avgFraudScore: { $avg: '$fraudScore' },
            totalAmount: { $sum: '$amount' },
            suspiciousAmount: {
              $sum: {
                $cond: [
                  { $gt: ['$fraudScore', this.fraudThreshold] },
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ]);

      return {
        success: true,
        stats: stats[0] || {
          totalTransactions: 0,
          suspiciousTransactions: 0,
          avgFraudScore: 0,
          totalAmount: 0,
          suspiciousAmount: 0
        }
      };
    } catch (error) {
      console.error('Get fraud stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update fraud threshold
  updateFraudThreshold(threshold) {
    this.fraudThreshold = Math.max(0, Math.min(1, threshold));
  }

  // Get blocked IPs
  getBlockedIPs() {
    return Array.from(this.blockedIPs);
  }

  // Unblock IP
  unblockIP(ip) {
    this.blockedIPs.delete(ip);
  }

  // Clear rate limits
  clearRateLimits() {
    this.rateLimits.clear();
  }
}

module.exports = new FraudDetectionService(); 