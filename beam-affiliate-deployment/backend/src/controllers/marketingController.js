const marketingAutomationService = require('../services/marketingAutomationService');
const User = require('../models/User');

const marketingController = {
  // Email Campaign Management
  async createEmailCampaign(req, res) {
    try {
      const campaignData = req.body;
      const result = await marketingAutomationService.createEmailCampaign(campaignData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error creating email campaign:', error);
      res.status(500).json({ success: false, message: 'Failed to create email campaign' });
    }
  },

  async sendEmailCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const { userIds } = req.body;
      
      const result = await marketingAutomationService.sendEmailCampaign(campaignId, userIds);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error sending email campaign:', error);
      res.status(500).json({ success: false, message: 'Failed to send email campaign' });
    }
  },

  async getEmailCampaigns(req, res) {
    try {
      const campaigns = Array.from(marketingAutomationService.campaigns.values());
      res.json({ success: true, campaigns });
    } catch (error) {
      console.error('Error getting email campaigns:', error);
      res.status(500).json({ success: false, message: 'Failed to get email campaigns' });
    }
  },

  // A/B Testing Management
  async createABTest(req, res) {
    try {
      const testData = req.body;
      const result = await marketingAutomationService.createABTest(testData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error creating A/B test:', error);
      res.status(500).json({ success: false, message: 'Failed to create A/B test' });
    }
  },

  async assignVariant(req, res) {
    try {
      const { testId } = req.params;
      const userId = req.user._id;
      
      const result = await marketingAutomationService.assignVariant(testId, userId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error assigning variant:', error);
      res.status(500).json({ success: false, message: 'Failed to assign variant' });
    }
  },

  async trackABTestEvent(req, res) {
    try {
      const { testId } = req.params;
      const { event, value } = req.body;
      const userId = req.user._id;
      
      const result = await marketingAutomationService.trackABTestEvent(testId, userId, event, value);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error tracking A/B test event:', error);
      res.status(500).json({ success: false, message: 'Failed to track A/B test event' });
    }
  },

  async getABTestResults(req, res) {
    try {
      const { testId } = req.params;
      const result = await marketingAutomationService.getABTestResults(testId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error getting A/B test results:', error);
      res.status(500).json({ success: false, message: 'Failed to get A/B test results' });
    }
  },

  async getABTests(req, res) {
    try {
      const tests = Array.from(marketingAutomationService.abTests.values());
      res.json({ success: true, tests });
    } catch (error) {
      console.error('Error getting A/B tests:', error);
      res.status(500).json({ success: false, message: 'Failed to get A/B tests' });
    }
  },

  // Lead Scoring
  async calculateLeadScore(req, res) {
    try {
      const userId = req.user._id;
      const result = await marketingAutomationService.calculateLeadScore(userId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error calculating lead score:', error);
      res.status(500).json({ success: false, message: 'Failed to calculate lead score' });
    }
  },

  async getLeadScores(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (status) {
        query.status = status;
      }

      const users = await User.find(query)
        .select('firstName lastName email resellerId level totalSales totalEarnings')
        .sort({ totalEarnings: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const leadScores = [];
      for (const user of users) {
        const scoreResult = await marketingAutomationService.calculateLeadScore(user._id);
        if (scoreResult.success) {
          leadScores.push({
            user: {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              resellerId: user.resellerId,
              level: user.level,
              totalSales: user.totalSales,
              totalEarnings: user.totalEarnings
            },
            leadScore: scoreResult.leadScore
          });
        }
      }

      res.json({ success: true, leadScores });
    } catch (error) {
      console.error('Error getting lead scores:', error);
      res.status(500).json({ success: false, message: 'Failed to get lead scores' });
    }
  },

  // Social Media Integration
  async postToSocialMedia(req, res) {
    try {
      const { platform, content } = req.body;
      const userId = req.user._id;
      
      const result = await marketingAutomationService.postToSocialMedia(platform, content, userId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error posting to social media:', error);
      res.status(500).json({ success: false, message: 'Failed to post to social media' });
    }
  },

  async scheduleSocialMediaPost(req, res) {
    try {
      const { platform, content, scheduleTime } = req.body;
      const userId = req.user._id;
      
      const result = await marketingAutomationService.scheduleSocialMediaPost(
        platform, 
        content, 
        scheduleTime, 
        userId
      );
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error scheduling social media post:', error);
      res.status(500).json({ success: false, message: 'Failed to schedule social media post' });
    }
  },

  async getSocialPlatforms(req, res) {
    try {
      const platforms = Object.keys(marketingAutomationService.socialPlatforms).map(platform => ({
        name: platform,
        enabled: marketingAutomationService.socialPlatforms[platform].enabled
      }));
      
      res.json({ success: true, platforms });
    } catch (error) {
      console.error('Error getting social platforms:', error);
      res.status(500).json({ success: false, message: 'Failed to get social platforms' });
    }
  },

  // Marketing Automation Workflows
  async createWorkflow(req, res) {
    try {
      const workflowData = req.body;
      const result = await marketingAutomationService.createWorkflow(workflowData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      res.status(500).json({ success: false, message: 'Failed to create workflow' });
    }
  },

  async executeWorkflow(req, res) {
    try {
      const { workflowId } = req.params;
      const triggerData = req.body;
      const userId = req.user._id;
      
      const result = await marketingAutomationService.executeWorkflow(workflowId, userId, triggerData);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      res.status(500).json({ success: false, message: 'Failed to execute workflow' });
    }
  },

  // Analytics and Reporting
  async getMarketingAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // Get campaign statistics
      const campaigns = Array.from(marketingAutomationService.campaigns.values());
      const campaignStats = campaigns.filter(campaign => 
        campaign.sentAt >= start && campaign.sentAt <= end
      );

      // Get A/B test statistics
      const tests = Array.from(marketingAutomationService.abTests.values());
      const testStats = tests.filter(test => 
        test.startDate >= start && test.startDate <= end
      );

      // Get lead scoring statistics
      const leadScores = Array.from(marketingAutomationService.leadScores.values());
      const leadScoreStats = leadScores.filter(score => 
        score.lastUpdated >= start && score.lastUpdated <= end
      );

      const analytics = {
        campaigns: {
          total: campaignStats.length,
          sent: campaignStats.filter(c => c.status === 'sent').length,
          draft: campaignStats.filter(c => c.status === 'draft').length,
          totalSent: campaignStats.reduce((sum, c) => sum + c.sentCount, 0),
          totalOpens: campaignStats.reduce((sum, c) => sum + c.openCount, 0),
          totalClicks: campaignStats.reduce((sum, c) => sum + c.clickCount, 0),
          totalConversions: campaignStats.reduce((sum, c) => sum + c.conversionCount, 0)
        },
        abTests: {
          total: testStats.length,
          active: testStats.filter(t => t.status === 'active').length,
          completed: testStats.filter(t => t.status === 'completed').length,
          totalParticipants: testStats.reduce((sum, t) => sum + t.participants.size, 0)
        },
        leadScoring: {
          total: leadScoreStats.length,
          hot: leadScoreStats.filter(s => s.status === 'hot').length,
          warm: leadScoreStats.filter(s => s.status === 'warm').length,
          cold: leadScoreStats.filter(s => s.status === 'cold').length,
          averageScore: leadScoreStats.length > 0 ? 
            leadScoreStats.reduce((sum, s) => sum + s.score, 0) / leadScoreStats.length : 0
        }
      };

      res.json({ success: true, analytics });
    } catch (error) {
      console.error('Error getting marketing analytics:', error);
      res.status(500).json({ success: false, message: 'Failed to get marketing analytics' });
    }
  },

  // Target Audience Management
  async getTargetAudience(req, res) {
    try {
      const { criteria } = req.query;
      const parsedCriteria = criteria ? JSON.parse(criteria) : {};
      
      const targetUsers = await marketingAutomationService.getTargetAudience(parsedCriteria);
      
      res.json({ success: true, targetUsers });
    } catch (error) {
      console.error('Error getting target audience:', error);
      res.status(500).json({ success: false, message: 'Failed to get target audience' });
    }
  },

  // Content Personalization
  async personalizeContent(req, res) {
    try {
      const { content, format = 'html' } = req.body;
      const user = req.user;
      
      const personalizedContent = marketingAutomationService.personalizeContent(content, user, format);
      
      res.json({ success: true, personalizedContent });
    } catch (error) {
      console.error('Error personalizing content:', error);
      res.status(500).json({ success: false, message: 'Failed to personalize content' });
    }
  }
};

module.exports = marketingController; 