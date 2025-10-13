const nodemailer = require('nodemailer');
const User = require('../models/User');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.smsProvider = {
      apiKey: process.env.SMS_API_KEY,
      apiSecret: process.env.SMS_API_SECRET,
      from: process.env.SMS_FROM || 'BeamAffiliate'
    };

    this.pushProvider = {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY
    };
  }

  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: `"Beam Affiliate Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSMS(to, message) {
    try {
      // Implement SMS sending logic here
      // This is a placeholder for actual SMS integration
      console.log(`SMS to ${to}: ${message}`);
      return { success: true, message: 'SMS sent successfully' };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // Implement push notification logic here
      // This is a placeholder for actual push notification integration
      console.log(`Push notification to user ${userId}: ${title} - ${body}`);
      return { success: true, message: 'Push notification sent successfully' };
    } catch (error) {
      console.error('Push notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendCommissionPaymentNotification(resellerId, amount, transactionId) {
    try {
      const user = await User.findOne({ resellerId });
      if (!user) return { success: false, error: 'User not found' };

      const subject = '💰 Commission Payment Received!';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Commission Payment Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .amount { font-size: 2em; color: #28a745; font-weight: bold; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Commission Payment Received!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <p>Great news! Your commission payment has been processed and sent to your Beam Wallet.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div class="amount">$${amount.toFixed(2)}</div>
                <p>has been added to your balance</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Payment Details:</h3>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span style="color: #28a745;">✓ Completed</span></p>
              </div>
              
              <p>Your payment is now available in your Beam Wallet. You can use it for purchases or withdraw it to your bank account.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
              </div>
              
              <p>Keep up the great work! Continue sharing your affiliate links to earn more commissions.</p>
            </div>
            <div class="footer">
              <p>Thank you for being part of the Beam Affiliate Platform!</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      const text = `
        Commission Payment Received!
        
        Hello ${user.firstName}!
        
        Great news! Your commission payment of $${amount.toFixed(2)} has been processed and sent to your Beam Wallet.
        
        Transaction ID: ${transactionId}
        Amount: $${amount.toFixed(2)}
        Date: ${new Date().toLocaleDateString()}
        Status: Completed
        
        Your payment is now available in your Beam Wallet. You can use it for purchases or withdraw it to your bank account.
        
        View your dashboard: ${process.env.FRONTEND_URL}/dashboard
        
        Keep up the great work! Continue sharing your affiliate links to earn more commissions.
        
        Thank you for being part of the Beam Affiliate Platform!
      `;

      const emailResult = await this.sendEmail(user.email, subject, html, text);
      
      // Send SMS notification if user has phone number
      if (user.phone) {
        await this.sendSMS(user.phone, `Commission payment of $${amount.toFixed(2)} received! Transaction ID: ${transactionId}`);
      }

      // Send push notification
      await this.sendPushNotification(user.id, 'Commission Payment Received', `$${amount.toFixed(2)} added to your balance`);

      return emailResult;
    } catch (error) {
      console.error('Error sending commission payment notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendLevelUpNotification(user, newLevel) {
    try {
      const subject = '🎉 Level Up! You\'ve Reached a New Level!';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Level Up Achievement</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .level { font-size: 2.5em; color: #ff6b6b; font-weight: bold; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>You've reached a new level in your affiliate journey!</p>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <p>Amazing work! You've successfully leveled up to:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div class="level">${newLevel}</div>
              </div>
              
              <p>This achievement unlocks new benefits and higher commission rates. Keep up the excellent work!</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/gamification" class="button">View Your Progress</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      const text = `
        Level Up Achievement!
        
        Hello ${user.firstName}!
        
        Congratulations! You've successfully leveled up to ${newLevel}!
        
        This achievement unlocks new benefits and higher commission rates. Keep up the excellent work!
        
        View your progress: ${process.env.FRONTEND_URL}/gamification
      `;

      const emailResult = await this.sendEmail(user.email, subject, html, text);
      
      // Send push notification
      await this.sendPushNotification(user.id, 'Level Up!', `Congratulations! You've reached ${newLevel} level!`);

      return emailResult;
    } catch (error) {
      console.error('Error sending level up notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAchievementNotification(resellerId, achievement) {
    try {
      const user = await User.findOne({ resellerId });
      if (!user) return { success: false, error: 'User not found' };

      const subject = '🏆 Achievement Unlocked!';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Achievement Unlocked</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .achievement { font-size: 2em; color: #ff6b6b; font-weight: bold; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Achievement Unlocked!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <p>Congratulations! You've unlocked a new achievement:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div class="achievement">${achievement.name}</div>
                <p>${achievement.description}</p>
              </div>
              
              <p>You've earned ${achievement.points} points for this achievement!</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/gamification" class="button">View Achievements</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      const text = `
        Achievement Unlocked!
        
        Hello ${user.firstName}!
        
        Congratulations! You've unlocked a new achievement: ${achievement.name}
        
        ${achievement.description}
        
        You've earned ${achievement.points} points for this achievement!
        
        View achievements: ${process.env.FRONTEND_URL}/gamification
      `;

      const emailResult = await this.sendEmail(user.email, subject, html, text);
      
      // Send push notification
      await this.sendPushNotification(user.id, 'Achievement Unlocked!', `${achievement.name} - ${achievement.points} points earned!`);

      return emailResult;
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSaleNotification(resellerId, saleData) {
    try {
      const user = await User.findOne({ resellerId });
      if (!user) return { success: false, error: 'User not found' };

      const subject = '🛒 New Sale! Commission Earned!';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Sale Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .commission { font-size: 2em; color: #28a745; font-weight: bold; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 New Sale!</h1>
              <p>You've earned a commission!</p>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <p>Great news! A customer has made a purchase through your affiliate link.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div class="commission">$${saleData.commissionAmount.toFixed(2)}</div>
                <p>commission earned</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Sale Details:</h3>
                <p><strong>Product:</strong> ${saleData.productName}</p>
                <p><strong>Sale Amount:</strong> $${saleData.saleAmount.toFixed(2)}</p>
                <p><strong>Commission Rate:</strong> ${saleData.commissionRate}%</p>
                <p><strong>Customer:</strong> ${saleData.customerName}</p>
              </div>
              
              <p>Your commission will be processed and paid to your Beam Wallet within 24-48 hours.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      const text = `
        New Sale Notification!
        
        Hello ${user.firstName}!
        
        Great news! A customer has made a purchase through your affiliate link.
        
        You've earned a commission of $${saleData.commissionAmount.toFixed(2)}!
        
        Sale Details:
        - Product: ${saleData.productName}
        - Sale Amount: $${saleData.saleAmount.toFixed(2)}
        - Commission Rate: ${saleData.commissionRate}%
        - Customer: ${saleData.customerName}
        
        Your commission will be processed and paid to your Beam Wallet within 24-48 hours.
        
        View dashboard: ${process.env.FRONTEND_URL}/dashboard
      `;

      const emailResult = await this.sendEmail(user.email, subject, html, text);
      
      // Send SMS notification if user has phone number
      if (user.phone) {
        await this.sendSMS(user.phone, `New sale! Commission earned: $${saleData.commissionAmount.toFixed(2)}`);
      }

      // Send push notification
      await this.sendPushNotification(user.id, 'New Sale!', `Commission earned: $${saleData.commissionAmount.toFixed(2)}`);

      return emailResult;
    } catch (error) {
      console.error('Error sending sale notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendCampaignNotification(resellerId, campaign) {
    try {
      const user = await User.findOne({ resellerId });
      if (!user) return { success: false, error: 'User not found' };

      const subject = '🎯 New Campaign Available!';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Campaign</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Campaign!</h1>
              <p>Limited time opportunity to earn more!</p>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <p>A new campaign is available for you to participate in:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>${campaign.name}</h3>
                <p>${campaign.description}</p>
                <p><strong>Reward:</strong> ${campaign.reward}</p>
                <p><strong>Duration:</strong> ${campaign.duration}</p>
              </div>
              
              <p>Don't miss out on this opportunity to boost your earnings!</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/gamification" class="button">Join Campaign</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      const text = `
        New Campaign Available!
        
        Hello ${user.firstName}!
        
        A new campaign is available for you to participate in: ${campaign.name}
        
        ${campaign.description}
        
        Reward: ${campaign.reward}
        Duration: ${campaign.duration}
        
        Don't miss out on this opportunity to boost your earnings!
        
        Join campaign: ${process.env.FRONTEND_URL}/gamification
      `;

      const emailResult = await this.sendEmail(user.email, subject, html, text);
      
      // Send push notification
      await this.sendPushNotification(user.id, 'New Campaign!', `${campaign.name} - Limited time opportunity!`);

      return emailResult;
    } catch (error) {
      console.error('Error sending campaign notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const subject = '🎉 Welcome to Beam Affiliate Platform!';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Beam Affiliate</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Beam Affiliate!</h1>
              <p>Your journey to earning starts now!</p>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <p>Welcome to the Beam Affiliate Platform! We're excited to have you on board.</p>
              
              <p>Your unique reseller ID is: <strong>${user.resellerId}</strong></p>
              
              <h3>Getting Started:</h3>
              <ol>
                <li>Explore our product catalog</li>
                <li>Generate your affiliate links</li>
                <li>Share them on social media, email, or any platform</li>
                <li>Start earning commissions!</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
              </div>
              
              <p>If you have any questions, our support team is here to help!</p>
            </div>
          </div>
        </body>
        </html>
      `;
      const text = `
        Welcome to Beam Affiliate Platform!
        
        Hello ${user.firstName}!
        
        Welcome to the Beam Affiliate Platform! We're excited to have you on board.
        
        Your unique reseller ID is: ${user.resellerId}
        
        Getting Started:
        1. Explore our product catalog
        2. Generate your affiliate links
        3. Share them on social media, email, or any platform
        4. Start earning commissions!
        
        Get started: ${process.env.FRONTEND_URL}/dashboard
        
        If you have any questions, our support team is here to help!
      `;

      return await this.sendEmail(user.email, subject, html, text);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendAccountStatusNotification(email, status) {
    try {
      const subject = status === 'activated' ? '✅ Account Activated!' : '❌ Account Deactivated';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Account Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${status === 'activated' ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${status === 'activated' ? '✅ Account Activated!' : '❌ Account Deactivated'}</h1>
            </div>
            <div class="content">
              <h2>Account Status Update</h2>
              <p>Your Beam Affiliate account has been <strong>${status}</strong>.</p>
              
              ${status === 'activated' ? 
                '<p>You can now access all features and start earning commissions!</p>' :
                '<p>Your account has been temporarily suspended. Please contact support for more information.</p>'
              }
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Access Dashboard</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      const text = `
        Account Status Update
        
        Your Beam Affiliate account has been ${status}.
        
        ${status === 'activated' ? 
          'You can now access all features and start earning commissions!' :
          'Your account has been temporarily suspended. Please contact support for more information.'
        }
        
        Access dashboard: ${process.env.FRONTEND_URL}/dashboard
      `;

      return await this.sendEmail(email, subject, html, text);
    } catch (error) {
      console.error('Error sending account status notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendCommissionRejectionNotification(resellerId, amount, reason) {
    try {
      const user = await User.findOne({ resellerId });
      if (!user) return { success: false, error: 'User not found' };

      const subject = '❌ Commission Rejected';
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Commission Rejected</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Commission Rejected</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              <p>Unfortunately, your commission payment of <strong>$${amount.toFixed(2)}</strong> has been rejected.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Reason for Rejection:</h3>
                <p>${reason}</p>
              </div>
              
              <p>If you believe this is an error, please contact our support team for assistance.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      const text = `
        Commission Rejected
        
        Hello ${user.firstName}!
        
        Unfortunately, your commission payment of $${amount.toFixed(2)} has been rejected.
        
        Reason for Rejection: ${reason}
        
        If you believe this is an error, please contact our support team for assistance.
        
        View dashboard: ${process.env.FRONTEND_URL}/dashboard
      `;

      return await this.sendEmail(user.email, subject, html, text);
    } catch (error) {
      console.error('Error sending commission rejection notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService(); 