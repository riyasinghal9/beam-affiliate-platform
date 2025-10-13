const User = require('../models/User');
const Sale = require('../models/Sale');
const Commission = require('../models/Commission');
const Click = require('../models/Click');
const nodemailer = require('nodemailer');

class MarketingAutomationService {
  constructor() {
    this.campaigns = new Map();
    this.workflows = new Map();
    this.leadScores = new Map();
    this.emailTemplates = new Map();
    
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.initializeTemplates();
  }

  // Initialize email templates
  initializeTemplates() {
    this.emailTemplates.set('welcome', {
      subject: 'Welcome to Beam Affiliate Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Beam Affiliate Platform!</h2>
          <p>Hi {{firstName}},</p>
          <p>Welcome to the Beam Affiliate Platform! You're now part of a community of successful resellers earning money online.</p>
          <p>Your Reseller ID: <strong>{{resellerId}}</strong></p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Browse available products</li>
            <li>Start sharing your affiliate links</li>
            <li>Track your earnings</li>
          </ul>
          <a href="{{dashboardUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
          <p>Best regards,<br>The Beam Team</p>
        </div>
      `
    });

    this.emailTemplates.set('commission_earned', {
      subject: 'Commission Earned! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Commission Earned!</h2>
          <p>Hi {{firstName}},</p>
          <p>Congratulations! You've earned a commission of <strong>{{commissionAmount}}</strong> for the sale of <strong>{{productName}}</strong>.</p>
          <p>Sale Details:</p>
          <ul>
            <li>Product: {{productName}}</li>
            <li>Sale Amount: {{saleAmount}}</li>
            <li>Commission Rate: {{commissionRate}}%</li>
            <li>Commission Earned: {{commissionAmount}}</li>
          </ul>
          <a href="{{dashboardUrl}}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
          <p>Keep up the great work!</p>
          <p>Best regards,<br>The Beam Team</p>
        </div>
      `
    });

    this.emailTemplates.set('milestone_reached', {
      subject: 'Milestone Reached! 🏆',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Milestone Reached!</h2>
          <p>Hi {{firstName}},</p>
          <p>Congratulations! You've reached a new milestone: <strong>{{milestone}}</strong></p>
          <p>Your achievements:</p>
          <ul>
            <li>Total Sales: {{totalSales}}</li>
            <li>Total Earnings: {{totalEarnings}}</li>
            <li>Current Level: {{currentLevel}}</li>
          </ul>
          <p>You're doing amazing! Keep up the great work and reach even higher levels.</p>
          <a href="{{dashboardUrl}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Progress</a>
          <p>Best regards,<br>The Beam Team</p>
        </div>
      `
    });

    this.emailTemplates.set('inactive_reminder', {
      subject: 'Don\'t Miss Out on Earnings! 💰',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Don't Miss Out on Earnings!</h2>
          <p>Hi {{firstName}},</p>
          <p>We noticed you haven't been active lately. Don't miss out on potential earnings!</p>
          <p>Here are some tips to get back on track:</p>
          <ul>
            <li>Share your affiliate links on social media</li>
            <li>Create engaging content about our products</li>
            <li>Reach out to your network</li>
            <li>Check out our latest products</li>
          </ul>
          <a href="{{dashboardUrl}}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Earning Again</a>
          <p>Best regards,<br>The Beam Team</p>
        </div>
      `
    });
  }

  // Create a new campaign
  async createCampaign(campaignData) {
    try {
      const campaign = {
        id: this.generateId(),
        name: campaignData.name,
        type: campaignData.type, // 'email', 'sms', 'push'
        template: campaignData.template,
        targetAudience: campaignData.targetAudience,
        schedule: campaignData.schedule,
        status: 'draft',
        createdAt: new Date(),
        stats: {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0
        }
      };

      this.campaigns.set(campaign.id, campaign);

      return {
        success: true,
        campaign
      };
    } catch (error) {
      console.error('Create campaign error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send campaign
  async sendCampaign(campaignId) {
    try {
      const campaign = this.campaigns.get(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Get target audience
      const recipients = await this.getTargetAudience(campaign.targetAudience);
      
      // Send emails
      const results = await Promise.allSettled(
        recipients.map(recipient => this.sendEmail(recipient, campaign))
      );

      // Update campaign stats
      const successful = results.filter(r => r.status === 'fulfilled').length;
      campaign.stats.sent += successful;
      campaign.status = 'sent';
      campaign.sentAt = new Date();

      this.campaigns.set(campaignId, campaign);

      return {
        success: true,
        sent: successful,
        total: recipients.length
      };
    } catch (error) {
      console.error('Send campaign error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get target audience based on criteria
  async getTargetAudience(criteria) {
    const query = { isReseller: true, isActive: true };

    if (criteria.level) {
      query.level = criteria.level;
    }

    if (criteria.minSales) {
      query.totalSales = { $gte: criteria.minSales };
    }

    if (criteria.minEarnings) {
      query.totalEarnings = { $gte: criteria.minEarnings };
    }

    if (criteria.inactiveDays) {
      const inactiveDate = new Date();
      inactiveDate.setDate(inactiveDate.getDate() - criteria.inactiveDays);
      query.lastLogin = { $lt: inactiveDate };
    }

    const users = await User.find(query).select('firstName lastName email resellerId level totalSales totalEarnings lastLogin');

    return users;
  }

  // Send email to recipient
  async sendEmail(recipient, campaign) {
    try {
      const template = this.emailTemplates.get(campaign.template);
      if (!template) {
        throw new Error('Email template not found');
      }

      // Replace placeholders
      let html = template.html;
      let subject = template.subject;

      const placeholders = {
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        email: recipient.email,
        resellerId: recipient.resellerId,
        level: recipient.level,
        totalSales: recipient.totalSales,
        totalEarnings: recipient.totalEarnings,
        dashboardUrl: `${process.env.FRONTEND_URL}/reseller-dashboard`
      };

      Object.keys(placeholders).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, placeholders[key]);
        subject = subject.replace(regex, placeholders[key]);
      });

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@beamaffiliate.com',
        to: recipient.email,
        subject: subject,
        html: html
      };

      await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        recipient: recipient.email
      };
    } catch (error) {
      console.error('Send email error:', error);
      return {
        success: false,
        recipient: recipient.email,
        error: error.message
      };
    }
  }

  // Create automated workflow
  async createWorkflow(workflowData) {
    try {
      const workflow = {
        id: this.generateId(),
        name: workflowData.name,
        triggers: workflowData.triggers,
        actions: workflowData.actions,
        conditions: workflowData.conditions,
        status: 'active',
        createdAt: new Date(),
        stats: {
          triggered: 0,
          completed: 0,
          failed: 0
        }
      };

      this.workflows.set(workflow.id, workflow);

      return {
        success: true,
        workflow
      };
    } catch (error) {
      console.error('Create workflow error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Trigger workflow
  async triggerWorkflow(workflowId, eventData) {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow || workflow.status !== 'active') {
        return { success: false, error: 'Workflow not found or inactive' };
      }

      workflow.stats.triggered++;

      // Check conditions
      if (!this.evaluateConditions(workflow.conditions, eventData)) {
        return { success: false, error: 'Conditions not met' };
      }

      // Execute actions
      const results = await Promise.allSettled(
        workflow.actions.map(action => this.executeAction(action, eventData))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      workflow.stats.completed += successful;
      workflow.stats.failed += results.length - successful;

      this.workflows.set(workflowId, workflow);

      return {
        success: true,
        executed: successful,
        total: results.length
      };
    } catch (error) {
      console.error('Trigger workflow error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Evaluate workflow conditions
  evaluateConditions(conditions, eventData) {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const actualValue = this.getNestedValue(eventData, field);

      switch (operator) {
        case 'equals':
          return actualValue === value;
        case 'not_equals':
          return actualValue !== value;
        case 'greater_than':
          return actualValue > value;
        case 'less_than':
          return actualValue < value;
        case 'contains':
          return String(actualValue).includes(value);
        case 'not_contains':
          return !String(actualValue).includes(value);
        default:
          return false;
      }
    });
  }

  // Execute workflow action
  async executeAction(action, eventData) {
    try {
      switch (action.type) {
        case 'send_email':
          return await this.sendAutomatedEmail(action, eventData);
        case 'update_user':
          return await this.updateUser(action, eventData);
        case 'create_commission':
          return await this.createCommission(action, eventData);
        case 'send_notification':
          return await this.sendNotification(action, eventData);
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error('Execute action error:', error);
      throw error;
    }
  }

  // Send automated email
  async sendAutomatedEmail(action, eventData) {
    const { template, recipient } = action;
    const user = await User.findById(recipient);
    
    if (!user) {
      throw new Error('User not found');
    }

    return await this.sendEmail(user, { template });
  }

  // Update user
  async updateUser(action, eventData) {
    const { userId, updates } = action;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    
    if (!user) {
      throw new Error('User not found');
    }

    return { success: true, user };
  }

  // Create commission
  async createCommission(action, eventData) {
    const { resellerId, productId, amount, commissionRate } = action;
    
    const commission = new Commission({
      resellerId,
      productId,
      commissionAmount: (amount * commissionRate) / 100,
      commissionRate,
      status: 'pending'
    });

    await commission.save();
    return { success: true, commission };
  }

  // Send notification
  async sendNotification(action, eventData) {
    const { userId, message, type } = action;
    
    // This would integrate with a notification service
    console.log(`Sending ${type} notification to user ${userId}: ${message}`);
    
    return { success: true };
  }

  // Calculate lead score
  async calculateLeadScore(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let score = 0;

      // Activity score
      const recentSales = await Sale.countDocuments({
        resellerId: userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });
      score += recentSales * 10;

      // Revenue score
      score += user.totalEarnings * 0.1;

      // Engagement score
      const recentClicks = await Click.countDocuments({
        resellerId: userId,
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      score += recentClicks * 2;

      // Consistency score
      const salesConsistency = await this.calculateSalesConsistency(userId);
      score += salesConsistency * 20;

      // Level score
      const levelScores = { 'Beginner': 0, 'Active': 50, 'Ambassador': 100 };
      score += levelScores[user.level] || 0;

      this.leadScores.set(userId, score);

      return {
        success: true,
        score: Math.round(score),
        level: this.getLeadLevel(score)
      };
    } catch (error) {
      console.error('Calculate lead score error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate sales consistency
  async calculateSalesConsistency(userId) {
    const sales = await Sale.find({ resellerId: userId })
      .sort({ createdAt: -1 })
      .limit(30);

    if (sales.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < sales.length; i++) {
      const interval = sales[i-1].createdAt - sales[i].createdAt;
      intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

    return Math.max(0, 1 - (variance / avgInterval));
  }

  // Get lead level based on score
  getLeadLevel(score) {
    if (score >= 200) return 'Hot Lead';
    if (score >= 100) return 'Warm Lead';
    if (score >= 50) return 'Qualified Lead';
    return 'Cold Lead';
  }

  // Get nested object value
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get campaign statistics
  async getCampaignStats(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    return {
      success: true,
      stats: campaign.stats
    };
  }

  // Get workflow statistics
  async getWorkflowStats(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }

    return {
      success: true,
      stats: workflow.stats
    };
  }

  // Get all campaigns
  async getAllCampaigns() {
    return Array.from(this.campaigns.values());
  }

  // Get all workflows
  async getAllWorkflows() {
    return Array.from(this.workflows.values());
  }

  // Get lead scores
  async getLeadScores() {
    return Array.from(this.leadScores.entries()).map(([userId, score]) => ({
      userId,
      score,
      level: this.getLeadLevel(score)
    }));
  }
}

module.exports = new MarketingAutomationService(); 