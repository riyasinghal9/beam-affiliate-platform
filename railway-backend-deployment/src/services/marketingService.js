const crypto = require('crypto');
const User = require('../models/User');
const Product = require('../models/Product');

class MarketingService {
  constructor() {
    this.templates = {
      banners: {
        'beam-wallet-installation': {
          title: 'Install Beam Wallet for Your Business',
          subtitle: 'Accept payments instantly and securely',
          price: '$75',
          commission: '$37.50',
          colors: {
            primary: '#3B82F6',
            secondary: '#1E40AF',
            accent: '#F59E0B'
          },
          features: [
            'Instant payment processing',
            'Secure transactions',
            'Easy integration',
            '24/7 support'
          ]
        },
        'commercial-agent-license': {
          title: 'Commercial Agent License',
          subtitle: 'Expand your business with official licensing',
          price: '$150',
          commission: '$75',
          colors: {
            primary: '#10B981',
            secondary: '#059669',
            accent: '#F59E0B'
          },
          features: [
            'Official business license',
            'Legal compliance',
            'Professional credibility',
            'Business growth support'
          ]
        },
      },
      socialMedia: {
        facebook: {
          dimensions: { width: 1200, height: 630 },
          template: 'facebook-post'
        },
        instagram: {
          dimensions: { width: 1080, height: 1080 },
          template: 'instagram-post'
        },
        twitter: {
          dimensions: { width: 1200, height: 675 },
          template: 'twitter-post'
        },
        linkedin: {
          dimensions: { width: 1200, height: 627 },
          template: 'linkedin-post'
        }
      },
      email: {
        welcome: {
          subject: 'Welcome to Beam Wallet - Start Earning Today!',
          template: 'welcome-email'
        },
        promotion: {
          subject: 'Special Offer: Earn More with Beam Wallet!',
          template: 'promotion-email'
        },
        reminder: {
          subject: 'Don\'t Miss Out - Your Links Are Ready!',
          template: 'reminder-email'
        }
      },
      whatsapp: {
        welcome: {
          template: 'whatsapp-welcome'
        },
        promotion: {
          template: 'whatsapp-promotion'
        },
        followUp: {
          template: 'whatsapp-followup'
        }
      }
    };
  }

  // Generate marketing banner with reseller ID
  async generateBanner(resellerId, productId, platform = 'facebook') {
    try {
      const user = await User.findOne({ resellerId });
      const product = await Product.findById(productId);
      
      if (!user || !product) {
        throw new Error('User or product not found');
      }

      const template = this.templates.banners[product.slug] || this.templates.banners['beam-wallet-installation'];
      const platformConfig = this.templates.socialMedia[platform] || this.templates.socialMedia.facebook;

      const bannerData = {
        resellerId,
        productName: product.name,
        productPrice: product.price,
        commission: product.commission,
        colors: template.colors,
        dimensions: platformConfig.dimensions,
        template: platformConfig.template,
        features: template.features,
        userInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          level: user.level
        },
        affiliateLink: this.generateAffiliateLink(resellerId, productId),
        qrCode: this.generateQRCode(this.generateAffiliateLink(resellerId, productId)),
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        banner: bannerData,
        downloadUrl: `/api/marketing/banner/${resellerId}/${productId}/${platform}`,
        previewUrl: `/api/marketing/preview/${resellerId}/${productId}/${platform}`
      };
    } catch (error) {
      console.error('Error generating banner:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate affiliate link with UTM parameters
  generateAffiliateLink(resellerId, productId, utmParams = {}) {
    const baseUrl = process.env.FRONTEND_URL || 'https://beamaffiliate.com';
    const url = new URL(`${baseUrl}/tracking/click/${resellerId}/${productId}`);
    
    // Add default UTM parameters
    const defaultUtm = {
      utm_source: 'affiliate',
      utm_medium: 'banner',
      utm_campaign: 'beam_wallet',
      utm_content: resellerId,
      utm_term: 'payment_solution'
    };

    // Merge with provided UTM parameters
    const finalUtm = { ...defaultUtm, ...utmParams };
    
    Object.entries(finalUtm).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }

  // Generate QR code data URL
  generateQRCode(url) {
    // In a real implementation, you would use a QR code library
    // For now, we'll return a placeholder
    return `data:image/png;base64,${Buffer.from(url).toString('base64')}`;
  }

  // Generate social media post content
  async generateSocialMediaPost(resellerId, productId, platform) {
    try {
      const user = await User.findOne({ resellerId });
      const product = await Product.findById(productId);
      
      if (!user || !product) {
        throw new Error('User or product not found');
      }

      const templates = {
        facebook: {
          title: `🚀 Transform Your Business with ${product.name}!`,
          content: `Hey business owners! 👋

I've been using ${product.name} and it's been a game-changer for my business! 💯

✅ ${product.description}
✅ Only $${product.price}
✅ Instant setup
✅ 24/7 support

Want to see the same results? Check it out here: ${this.generateAffiliateLink(resellerId, productId, { utm_medium: 'facebook' })}

#BeamWallet #BusinessGrowth #PaymentSolutions #Entrepreneur`,
          hashtags: ['#BeamWallet', '#BusinessGrowth', '#PaymentSolutions', '#Entrepreneur']
        },
        instagram: {
          title: `💼 Business Upgrade Alert!`,
          content: `Transform your business with ${product.name}! 💪

✨ ${product.description}
💰 Only $${product.price}
⚡ Instant setup
🛡️ Secure & reliable

Link in bio! 👆

${this.generateAffiliateLink(resellerId, productId, { utm_medium: 'instagram' })}

#BeamWallet #BusinessGrowth #Entrepreneur #Success`,
          hashtags: ['#BeamWallet', '#BusinessGrowth', '#Entrepreneur', '#Success']
        },
        twitter: {
          title: `🚀 Business Game-Changer Alert!`,
          content: `Just discovered ${product.name} and it's revolutionizing how I handle payments! 💯

✅ ${product.description}
✅ $${product.price}
✅ Instant setup

Check it out: ${this.generateAffiliateLink(resellerId, productId, { utm_medium: 'twitter' })}

#BeamWallet #BusinessGrowth #Entrepreneur`,
          hashtags: ['#BeamWallet', '#BusinessGrowth', '#Entrepreneur']
        },
        linkedin: {
          title: `Professional Recommendation: ${product.name}`,
          content: `I wanted to share a business solution that has significantly improved my operations: ${product.name}.

Key benefits:
• ${product.description}
• Competitive pricing at $${product.price}
• Seamless integration
• Professional support

As a business owner, I'm always looking for tools that deliver real value. This one definitely does.

Learn more: ${this.generateAffiliateLink(resellerId, productId, { utm_medium: 'linkedin' })}

#BusinessSolutions #ProfessionalGrowth #BeamWallet`,
          hashtags: ['#BusinessSolutions', '#ProfessionalGrowth', '#BeamWallet']
        }
      };

      const template = templates[platform] || templates.facebook;

      return {
        success: true,
        post: {
          platform,
          title: template.title,
          content: template.content,
          hashtags: template.hashtags,
          affiliateLink: this.generateAffiliateLink(resellerId, productId, { utm_medium: platform }),
          characterCount: template.content.length,
          maxCharacters: this.getMaxCharacters(platform)
        }
      };
    } catch (error) {
      console.error('Error generating social media post:', error);
      return { success: false, error: error.message };
    }
  }

  // Get maximum characters for platform
  getMaxCharacters(platform) {
    const limits = {
      facebook: 63206,
      instagram: 2200,
      twitter: 280,
      linkedin: 3000
    };
    return limits[platform] || 1000;
  }

  // Generate email template
  async generateEmailTemplate(resellerId, productId, templateType = 'promotion') {
    try {
      const user = await User.findOne({ resellerId });
      const product = await Product.findById(productId);
      
      if (!user || !product) {
        throw new Error('User or product not found');
      }

      const templates = {
        welcome: {
          subject: `Welcome to Beam Wallet - Start Earning with ${user.firstName}!`,
          html: this.generateWelcomeEmailHTML(user, product, resellerId),
          text: this.generateWelcomeEmailText(user, product, resellerId)
        },
        promotion: {
          subject: `Special Offer: ${product.name} - Limited Time!`,
          html: this.generatePromotionEmailHTML(user, product, resellerId),
          text: this.generatePromotionEmailText(user, product, resellerId)
        },
        reminder: {
          subject: `Don't Miss Out - Your ${product.name} Links Are Ready!`,
          html: this.generateReminderEmailHTML(user, product, resellerId),
          text: this.generateReminderEmailText(user, product, resellerId)
        }
      };

      const template = templates[templateType] || templates.promotion;

      return {
        success: true,
        email: {
          subject: template.subject,
          html: template.html,
          text: template.text,
          affiliateLink: this.generateAffiliateLink(resellerId, productId, { utm_medium: 'email' })
        }
      };
    } catch (error) {
      console.error('Error generating email template:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate WhatsApp message template
  async generateWhatsAppMessage(resellerId, productId, templateType = 'promotion') {
    try {
      const user = await User.findOne({ resellerId });
      const product = await Product.findById(productId);
      
      if (!user || !product) {
        throw new Error('User or product not found');
      }

      const templates = {
        welcome: {
          message: `🚀 Welcome to Beam Wallet!

Hi! I'm ${user.firstName} and I want to share an amazing business solution with you.

${product.name} has been a game-changer for my business:
✅ ${product.description}
✅ Only $${product.price}
✅ Instant setup

Want to learn more? Check this out: ${this.generateAffiliateLink(resellerId, productId, { utm_medium: 'whatsapp' })}

Let me know if you have any questions! 😊`
        },
        promotion: {
          message: `🔥 SPECIAL OFFER ALERT! 🔥

Hey! I wanted to share this amazing deal with you:

${product.name} is currently offering incredible value:
💰 Only $${product.price}
⚡ Instant setup
🛡️ Secure & reliable
📞 24/7 support

This is perfect for any business owner looking to upgrade their payment system!

Check it out here: ${this.generateAffiliateLink(resellerId, productId, { utm_medium: 'whatsapp' })}

Don't miss out on this opportunity! 💪`
        },
        followUp: {
          message: `👋 Follow-up: ${product.name}

Hi! I wanted to follow up about ${product.name}.

Did you get a chance to check out the link I sent? It's really worth looking into if you're serious about growing your business.

Key benefits:
• ${product.description}
• Competitive pricing
• Easy integration
• Professional support

Here's the link again: ${this.generateAffiliateLink(resellerId, productId, { utm_medium: 'whatsapp' })}

Let me know if you have any questions! 😊`
        }
      };

      const template = templates[templateType] || templates.promotion;

      return {
        success: true,
        whatsapp: {
          message: template.message,
          affiliateLink: this.generateAffiliateLink(resellerId, productId, { utm_medium: 'whatsapp' }),
          characterCount: template.message.length
        }
      };
    } catch (error) {
      console.error('Error generating WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate welcome email HTML
  generateWelcomeEmailHTML(user, product, resellerId) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Beam Wallet!</h1>
          <p style="margin: 10px 0 0 0;">Your business transformation starts here</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #1f2937;">Hi ${user.firstName}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            I wanted to personally introduce you to ${product.name} - a solution that has completely transformed how I handle business payments.
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Why ${product.name}?</h3>
            <ul style="color: #1f2937; margin: 0; padding-left: 20px;">
              <li>${product.description}</li>
              <li>Competitive pricing at $${product.price}</li>
              <li>Instant setup and integration</li>
              <li>Professional support team</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.generateAffiliateLink(resellerId, product._id, { utm_medium: 'email' })}" 
               style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Learn More About ${product.name}
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">
            If you have any questions or need assistance, don't hesitate to reach out. I'm here to help you succeed!
          </p>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Best regards,<br>
            ${user.firstName} ${user.lastName}<br>
            Beam Affiliate Partner
          </p>
        </div>
      </div>
    `;
  }

  // Generate welcome email text
  generateWelcomeEmailText(user, product, resellerId) {
    return `
Welcome to Beam Wallet!

Hi ${user.firstName}!

I wanted to personally introduce you to ${product.name} - a solution that has completely transformed how I handle business payments.

Why ${product.name}?
• ${product.description}
• Competitive pricing at $${product.price}
• Instant setup and integration
• Professional support team

Learn more: ${this.generateAffiliateLink(resellerId, product._id, { utm_medium: 'email' })}

If you have any questions or need assistance, don't hesitate to reach out. I'm here to help you succeed!

Best regards,
${user.firstName} ${user.lastName}
Beam Affiliate Partner
    `;
  }

  // Generate promotion email HTML
  generatePromotionEmailHTML(user, product, resellerId) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔥 SPECIAL OFFER! 🔥</h1>
          <p style="margin: 10px 0 0 0;">Limited time opportunity - Don't miss out!</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #1f2937;">Exclusive Deal: ${product.name}</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            I'm excited to share this exclusive offer with you! ${product.name} is currently offering incredible value that you won't want to miss.
          </p>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">Special Price: $${product.price}</h3>
            <p style="color: #6b7280; margin: 0;">Limited time offer - Act fast!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">What You Get:</h3>
            <ul style="color: #1f2937; margin: 0; padding-left: 20px;">
              <li>${product.description}</li>
              <li>Instant setup and integration</li>
              <li>Professional support team</li>
              <li>Secure and reliable service</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.generateAffiliateLink(resellerId, product._id, { utm_medium: 'email' })}" 
               style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Claim Your Special Offer Now!
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">
            This offer won't last long, so make sure to take advantage of it while you can!
          </p>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Best regards,<br>
            ${user.firstName} ${user.lastName}<br>
            Beam Affiliate Partner
          </p>
        </div>
      </div>
    `;
  }

  // Generate promotion email text
  generatePromotionEmailText(user, product, resellerId) {
    return `
🔥 SPECIAL OFFER! 🔥

Exclusive Deal: ${product.name}

I'm excited to share this exclusive offer with you! ${product.name} is currently offering incredible value that you won't want to miss.

Special Price: $${product.price}
Limited time offer - Act fast!

What You Get:
• ${product.description}
• Instant setup and integration
• Professional support team
• Secure and reliable service

Claim your special offer: ${this.generateAffiliateLink(resellerId, product._id, { utm_medium: 'email' })}

This offer won't last long, so make sure to take advantage of it while you can!

Best regards,
${user.firstName} ${user.lastName}
Beam Affiliate Partner
    `;
  }

  // Generate reminder email HTML
  generateReminderEmailHTML(user, product, resellerId) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">⏰ Don't Miss Out!</h1>
          <p style="margin: 10px 0 0 0;">Your opportunity is waiting</p>
        </div>
        
        <div style="background: white; padding: 30px;">
          <h2 style="color: #1f2937;">Hi ${user.firstName}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            I wanted to follow up about ${product.name}. I noticed you haven't checked out the link I sent yet, and I didn't want you to miss this amazing opportunity!
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Why ${product.name} is perfect for you:</h3>
            <ul style="color: #1f2937; margin: 0; padding-left: 20px;">
              <li>${product.description}</li>
              <li>Affordable at $${product.price}</li>
              <li>Easy to set up and use</li>
              <li>Professional support included</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.generateAffiliateLink(resellerId, product._id, { utm_medium: 'email' })}" 
               style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Check Out ${product.name} Now
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">
            I'm here to help if you have any questions. This could be exactly what your business needs!
          </p>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Best regards,<br>
            ${user.firstName} ${user.lastName}<br>
            Beam Affiliate Partner
          </p>
        </div>
      </div>
    `;
  }

  // Generate reminder email text
  generateReminderEmailText(user, product, resellerId) {
    return `
⏰ Don't Miss Out!

Hi ${user.firstName}!

I wanted to follow up about ${product.name}. I noticed you haven't checked out the link I sent yet, and I didn't want you to miss this amazing opportunity!

Why ${product.name} is perfect for you:
• ${product.description}
• Affordable at $${product.price}
• Easy to set up and use
• Professional support included

Check it out: ${this.generateAffiliateLink(resellerId, product._id, { utm_medium: 'email' })}

I'm here to help if you have any questions. This could be exactly what your business needs!

Best regards,
${user.firstName} ${user.lastName}
Beam Affiliate Partner
    `;
  }

  // Get all available templates
  getAvailableTemplates() {
    return {
      banners: Object.keys(this.templates.banners),
      socialMedia: Object.keys(this.templates.socialMedia),
      email: Object.keys(this.templates.email),
      whatsapp: Object.keys(this.templates.whatsapp)
    };
  }

  // Get template preview
  getTemplatePreview(templateType, templateName) {
    const template = this.templates[templateType]?.[templateName];
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    return {
      success: true,
      template: {
        type: templateType,
        name: templateName,
        ...template
      }
    };
  }
}

module.exports = new MarketingService(); 