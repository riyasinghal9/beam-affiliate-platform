const nodemailer = require('nodemailer');

class EmailService {
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
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(userEmail, userName, paymentData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Payment Confirmation - Beam Wallet Affiliate',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1>🎉 Payment Confirmation</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Hello ${userName},</h2>
              <p>Your payment has been successfully processed and is pending admin approval.</p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Payment Details:</h3>
                <p><strong>Amount:</strong> $${paymentData.amount}</p>
                <p><strong>Product:</strong> ${paymentData.productName}</p>
                <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>You will receive another email once your payment is approved and your commission is processed.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
              </div>
              
              <p>Thank you for choosing Beam Wallet!</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Payment confirmation email sent to:', userEmail);
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
    }
  }

  // Send commission notification
  async sendCommissionNotification(userEmail, userName, commissionData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Commission Earned - Beam Wallet Affiliate',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; text-align: center;">
              <h1>💰 Commission Earned!</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Congratulations ${userName}!</h2>
              <p>You've earned a commission from a successful sale!</p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Commission Details:</h3>
                <p><strong>Amount:</strong> $${commissionData.amount}</p>
                <p><strong>Product:</strong> ${commissionData.productName}</p>
                <p><strong>Sale Amount:</strong> $${commissionData.saleAmount}</p>
                <p><strong>Commission Rate:</strong> ${commissionData.rate}%</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Your commission will be processed and added to your Beam Wallet balance within 24-48 hours.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
              </div>
              
              <p>Keep up the great work!</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Commission notification email sent to:', userEmail);
    } catch (error) {
      console.error('Error sending commission notification email:', error);
    }
  }

  // Send level-up notification
  async sendLevelUpNotification(userEmail, userName, levelData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Level Up! - Beam Wallet Affiliate',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 20px; text-align: center;">
              <h1>🚀 Level Up!</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Congratulations ${userName}!</h2>
              <p>You've reached a new level: <strong>${levelData.newLevel}</strong></p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>New Benefits:</h3>
                <ul>
                  ${levelData.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
                <p><strong>Commission Bonus:</strong> +${levelData.commissionBonus}%</p>
              </div>
              
              <p>Your new level brings increased commission rates and exclusive benefits!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
              </div>
              
              <p>Keep pushing for the next level!</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Level up notification email sent to:', userEmail);
    } catch (error) {
      console.error('Error sending level up notification email:', error);
    }
  }

  // Send achievement notification
  async sendAchievementNotification(userEmail, userName, achievementData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Achievement Unlocked! - Beam Wallet Affiliate',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #9C27B0 0%, #673AB7 100%); color: white; padding: 20px; text-align: center;">
              <h1>🏆 Achievement Unlocked!</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Congratulations ${userName}!</h2>
              <p>You've unlocked a new achievement: <strong>${achievementData.name}</strong></p>
              
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Achievement Details:</h3>
                <p><strong>Name:</strong> ${achievementData.name}</p>
                <p><strong>Description:</strong> ${achievementData.description}</p>
                <p><strong>Reward:</strong> ${achievementData.reward}</p>
              </div>
              
              <p>Your reward has been automatically added to your account!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #9C27B0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
              </div>
              
              <p>Keep up the amazing work!</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Achievement notification email sent to:', userEmail);
    } catch (error) {
      console.error('Error sending achievement notification email:', error);
    }
  }

  // Send password reset email
  async sendPasswordReset(userEmail, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Password Reset - Beam Wallet Affiliate',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%); color: white; padding: 20px; text-align: center;">
              <h1>🔐 Password Reset</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Password Reset Request</h2>
              <p>You requested a password reset for your Beam Wallet Affiliate account.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
              </div>
              
              <p>If you didn't request this reset, please ignore this email.</p>
              <p>This link will expire in 1 hour.</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', userEmail);
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }
}

module.exports = new EmailService(); 