const express = require('express');
const router = express.Router();
const marketingService = require('../services/marketingService');
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');

// Get available marketing templates
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = marketingService.getAvailableTemplates();
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get template preview
router.get('/templates/:type/:name', auth, async (req, res) => {
  try {
    const { type, name } = req.params;
    const preview = marketingService.getTemplatePreview(type, name);
    res.json(preview);
  } catch (error) {
    console.error('Error getting template preview:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Generate marketing banner
router.post('/banner', auth, async (req, res) => {
  try {
    const { productId, platform = 'facebook' } = req.body;
    const resellerId = req.user.resellerId;

    const banner = await marketingService.generateBanner(resellerId, productId, platform);
    res.json(banner);
  } catch (error) {
    console.error('Error generating banner:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Generate social media post
router.post('/social-media', auth, async (req, res) => {
  try {
    const { productId, platform } = req.body;
    const resellerId = req.user.resellerId;

    if (!platform || !['facebook', 'instagram', 'twitter', 'linkedin'].includes(platform)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform must be one of: facebook, instagram, twitter, linkedin' 
      });
    }

    const post = await marketingService.generateSocialMediaPost(resellerId, productId, platform);
    res.json(post);
  } catch (error) {
    console.error('Error generating social media post:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Generate email template
router.post('/email', auth, async (req, res) => {
  try {
    const { productId, templateType = 'promotion' } = req.body;
    const resellerId = req.user.resellerId;

    if (!['welcome', 'promotion', 'reminder'].includes(templateType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template type must be one of: welcome, promotion, reminder' 
      });
    }

    const email = await marketingService.generateEmailTemplate(resellerId, productId, templateType);
    res.json(email);
  } catch (error) {
    console.error('Error generating email template:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Generate WhatsApp message
router.post('/whatsapp', auth, async (req, res) => {
  try {
    const { productId, templateType = 'promotion' } = req.body;
    const resellerId = req.user.resellerId;

    if (!['welcome', 'promotion', 'followUp'].includes(templateType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template type must be one of: welcome, promotion, followUp' 
      });
    }

    const whatsapp = await marketingService.generateWhatsAppMessage(resellerId, productId, templateType);
    res.json(whatsapp);
  } catch (error) {
    console.error('Error generating WhatsApp message:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Generate affiliate link
router.post('/affiliate-link', auth, async (req, res) => {
  try {
    const { productId, utmParams = {} } = req.body;
    const resellerId = req.user.resellerId;

    const affiliateLink = marketingService.generateAffiliateLink(resellerId, productId, utmParams);
    
    res.json({
      success: true,
      affiliateLink,
      resellerId,
      productId,
      utmParams
    });
  } catch (error) {
    console.error('Error generating affiliate link:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all marketing materials for a user
router.get('/materials', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const { productId } = req.query;

    // Get all products if no specific product requested
    const products = productId 
      ? [await Product.findById(productId)]
      : await Product.find();

    const materials = [];

    for (const product of products) {
      if (!product) continue;

      const productMaterials = {
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        commission: product.commission,
        banners: {},
        socialMedia: {},
        email: {},
        whatsapp: {},
        affiliateLink: marketingService.generateAffiliateLink(resellerId, product._id)
      };

      // Generate banners for different platforms
      const platforms = ['facebook', 'instagram', 'twitter', 'linkedin'];
      for (const platform of platforms) {
        const banner = await marketingService.generateBanner(resellerId, product._id, platform);
        if (banner.success) {
          productMaterials.banners[platform] = banner.banner;
        }
      }

      // Generate social media posts
      for (const platform of platforms) {
        const post = await marketingService.generateSocialMediaPost(resellerId, product._id, platform);
        if (post.success) {
          productMaterials.socialMedia[platform] = post.post;
        }
      }

      // Generate email templates
      const emailTypes = ['welcome', 'promotion', 'reminder'];
      for (const type of emailTypes) {
        const email = await marketingService.generateEmailTemplate(resellerId, product._id, type);
        if (email.success) {
          productMaterials.email[type] = email.email;
        }
      }

      // Generate WhatsApp messages
      const whatsappTypes = ['welcome', 'promotion', 'followUp'];
      for (const type of whatsappTypes) {
        const whatsapp = await marketingService.generateWhatsAppMessage(resellerId, product._id, type);
        if (whatsapp.success) {
          productMaterials.whatsapp[type] = whatsapp.whatsapp;
        }
      }

      materials.push(productMaterials);
    }

    res.json({
      success: true,
      materials,
      resellerId
    });
  } catch (error) {
    console.error('Error getting marketing materials:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get marketing materials for specific product
router.get('/materials/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const resellerId = req.user.resellerId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const materials = {
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      commission: product.commission,
      banners: {},
      socialMedia: {},
      email: {},
      whatsapp: {},
      affiliateLink: marketingService.generateAffiliateLink(resellerId, product._id)
    };

    // Generate banners for different platforms
    const platforms = ['facebook', 'instagram', 'twitter', 'linkedin'];
    for (const platform of platforms) {
      const banner = await marketingService.generateBanner(resellerId, product._id, platform);
      if (banner.success) {
        materials.banners[platform] = banner.banner;
      }
    }

    // Generate social media posts
    for (const platform of platforms) {
      const post = await marketingService.generateSocialMediaPost(resellerId, product._id, platform);
      if (post.success) {
        materials.socialMedia[platform] = post.post;
      }
    }

    // Generate email templates
    const emailTypes = ['welcome', 'promotion', 'reminder'];
    for (const type of emailTypes) {
      const email = await marketingService.generateEmailTemplate(resellerId, product._id, type);
      if (email.success) {
        materials.email[type] = email.email;
      }
    }

    // Generate WhatsApp messages
    const whatsappTypes = ['welcome', 'promotion', 'followUp'];
    for (const type of whatsappTypes) {
      const whatsapp = await marketingService.generateWhatsAppMessage(resellerId, product._id, type);
      if (whatsapp.success) {
        materials.whatsapp[type] = whatsapp.whatsapp;
      }
    }

    res.json({
      success: true,
      materials,
      resellerId
    });
  } catch (error) {
    console.error('Error getting marketing materials:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Download marketing material
router.get('/download/:type/:productId/:platform', auth, async (req, res) => {
  try {
    const { type, productId, platform } = req.params;
    const resellerId = req.user.resellerId;

    // This would typically generate and serve a file
    // For now, we'll return the data that would be used to generate the file
    let material;

    switch (type) {
      case 'banner':
        material = await marketingService.generateBanner(resellerId, productId, platform);
        break;
      case 'social-media':
        material = await marketingService.generateSocialMediaPost(resellerId, productId, platform);
        break;
      case 'email':
        material = await marketingService.generateEmailTemplate(resellerId, productId, platform);
        break;
      case 'whatsapp':
        material = await marketingService.generateWhatsAppMessage(resellerId, productId, platform);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid material type' });
    }

    if (!material.success) {
      return res.status(500).json({ success: false, message: material.error });
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-${productId}-${platform}.json"`);

    res.json(material);
  } catch (error) {
    console.error('Error downloading marketing material:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Preview marketing material
router.get('/preview/:type/:productId/:platform', auth, async (req, res) => {
  try {
    const { type, productId, platform } = req.params;
    const resellerId = req.user.resellerId;

    let material;

    switch (type) {
      case 'banner':
        material = await marketingService.generateBanner(resellerId, productId, platform);
        break;
      case 'social-media':
        material = await marketingService.generateSocialMediaPost(resellerId, productId, platform);
        break;
      case 'email':
        material = await marketingService.generateEmailTemplate(resellerId, productId, platform);
        break;
      case 'whatsapp':
        material = await marketingService.generateWhatsAppMessage(resellerId, productId, platform);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid material type' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error previewing marketing material:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get UTM parameter suggestions
router.get('/utm-suggestions', auth, async (req, res) => {
  try {
    const suggestions = {
      sources: [
        'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok',
        'email', 'whatsapp', 'telegram', 'website', 'blog', 'forum'
      ],
      mediums: [
        'social', 'email', 'banner', 'video', 'story', 'post', 'message',
        'referral', 'organic', 'paid', 'affiliate'
      ],
      campaigns: [
        'beam_wallet_launch', 'summer_sale', 'business_growth', 'payment_solutions',
        'affiliate_program', 'new_features', 'holiday_special', 'year_end'
      ],
      terms: [
        'payment processing', 'business solutions', 'digital payments',
        'affiliate marketing', 'earn money', 'business growth', 'online payments'
      ],
      content: [
        'banner', 'video', 'post', 'story', 'email', 'message', 'landing_page',
        'product_page', 'testimonial', 'case_study'
      ]
    };

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error getting UTM suggestions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get marketing analytics (basic stats)
router.get('/analytics', auth, async (req, res) => {
  try {
    const resellerId = req.user.resellerId;
    const { period = '30d' } = req.query;

    // This would typically fetch from analytics database
    // For now, we'll return mock data
    const analytics = {
      totalMaterialsGenerated: 45,
      totalDownloads: 23,
      mostPopularPlatform: 'facebook',
      mostPopularProduct: 'beam-wallet-installation',
      conversionRate: 3.2,
      topPerformingMaterial: 'facebook-banner',
      period,
      resellerId
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error getting marketing analytics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 