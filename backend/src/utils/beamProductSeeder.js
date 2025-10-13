const mongoose = require('mongoose');
const Product = require('../models/Product');

const beamWalletProducts = [
  {
    name: 'Certificate of Quality and Trust',
    description: 'Official quality and trust certification for merchants using Beam Wallet. Enhance customer confidence and credibility.',
    longDescription: 'Professional certification program that validates merchant quality and trustworthiness. This certificate enhances customer confidence and provides official recognition of compliance with Beam Wallet standards.',
    price: 25.00,
    commission: 5.00, // 20% commission rate
    category: 'Certification',
    productType: 'certificate',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/certificate-of-quality-and-trust',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/certificate-of-quality-and-trust',
    beamWalletProductId: 'certificate-of-quality-and-trust',
    features: [
      'Official Beam Wallet certification',
      'Trust badge for website/store',
      'Enhanced customer confidence',
      'Quality assurance verification',
      'Marketing materials included',
      'Certificate validity tracking',
      'Renewal reminders',
      'Priority customer support'
    ],
    requirements: [
      'Active Beam Wallet merchant account',
      'Compliance with quality standards',
      'Business verification',
      'Customer service standards'
    ],
    tags: ['certificate', 'trust', 'quality', 'verification', 'credibility'],
    sortOrder: 1
  },
  {
    name: 'Beam Wallet NFC',
    description: 'Professional NFC-enabled Beam Wallet solution for physical stores and merchants. Enable contactless payments with advanced security features.',
    longDescription: 'The Beam Wallet NFC solution provides merchants with cutting-edge contactless payment technology. This comprehensive system includes NFC hardware, software integration, and complete setup support for physical stores.',
    price: 75.00,
    commission: 15.00, // 20% commission rate
    category: 'Hardware',
    productType: 'hardware',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-nfc',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-nfc',
    beamWalletProductId: 'beam-wallet-nfc',
    features: [
      'NFC contactless payment technology',
      'Advanced security encryption',
      'Complete hardware setup',
      'Merchant dashboard access',
      'Real-time transaction monitoring',
      'Multi-currency support',
      'Mobile app integration',
      '24/7 technical support'
    ],
    requirements: [
      'Android or iOS device',
      'Internet connection',
      'Valid business registration',
      'Bank account for settlements'
    ],
    tags: ['NFC', 'contactless', 'payments', 'merchants', 'physical-stores'],
    sortOrder: 2
  },
  {
    name: 'For Online Stores',
    description: 'Complete e-commerce payment solution for online stores. Integrate Beam Wallet payments into your website with ease.',
    longDescription: 'Comprehensive e-commerce integration solution that enables online stores to accept Beam Wallet payments. Includes API integration, checkout widgets, and complete payment processing infrastructure.',
    price: 75.00,
    commission: 15.00, // 20% commission rate
    category: 'Software',
    productType: 'software',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=900&fit=crop&q=90&auto=format&fm=webp',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop&q=90&auto=format&fm=webp',
    externalUrl: 'https://shop.beamwallet.com/pt/product/for-online-stores',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/for-online-stores',
    beamWalletProductId: 'for-online-stores',
    features: [
      'Easy API integration',
      'Customizable checkout widgets',
      'Secure payment processing',
      'Multi-platform support',
      'Real-time transaction tracking',
      'Automated invoicing',
      'Customer management tools',
      'Analytics and reporting'
    ],
    requirements: [
      'Active website or e-commerce platform',
      'Basic technical knowledge',
      'SSL certificate',
      'Business registration'
    ],
    tags: ['e-commerce', 'online-stores', 'API', 'integration', 'checkout'],
    sortOrder: 3
  },
  {
    name: 'Cashback Card',
    description: 'Exclusive Beam Wallet cashback card for customers. Earn rewards on every purchase with our premium cashback program.',
    longDescription: 'Premium cashback card that provides customers with exclusive rewards and benefits. Earn cashback on every purchase while enjoying premium features and exclusive merchant discounts.',
    price: 50.00,
    commission: 10.00, // 20% commission rate
    category: 'Card',
    productType: 'card',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/cashback-card',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/cashback-card',
    beamWalletProductId: 'cashback-card',
    features: [
      'Exclusive cashback rewards',
      'Premium card design',
      'Worldwide acceptance',
      'Mobile app integration',
      'Transaction notifications',
      'Spending analytics',
      'Fraud protection',
      '24/7 customer support'
    ],
    requirements: [
      'Valid identification',
      'Credit check approval',
      'Minimum age requirement',
      'Residential address verification'
    ],
    tags: ['cashback', 'card', 'rewards', 'premium', 'customer'],
    sortOrder: 4
  }
];

const seedBeamWalletProducts = async () => {
  try {
    console.log('🌱 Starting Beam Wallet product seeding...');
    
    // Clear existing products (optional - remove if you want to keep existing ones)
    // await Product.deleteMany({});
    // console.log('🗑️ Cleared existing products');
    
    // Insert new products
    for (const productData of beamWalletProducts) {
      const existingProduct = await Product.findOne({ 
        beamWalletProductId: productData.beamWalletProductId 
      });
      
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${product.name}`);
      } else {
        // Update existing product with new data
        await Product.findOneAndUpdate(
          { beamWalletProductId: productData.beamWalletProductId },
          productData,
          { new: true }
        );
        console.log(`🔄 Updated product: ${productData.name}`);
      }
    }
    
    console.log('🎉 Beam Wallet product seeding completed successfully!');
    console.log(`📊 Total products: ${beamWalletProducts.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding Beam Wallet products:', error);
    throw error;
  }
};

module.exports = {
  seedBeamWalletProducts,
  beamWalletProducts
}; 