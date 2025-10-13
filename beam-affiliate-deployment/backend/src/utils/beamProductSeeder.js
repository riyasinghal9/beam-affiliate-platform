const mongoose = require('mongoose');
const Product = require('../models/Product');

const beamWalletProducts = [
  {
    name: 'Beam Wallet NFC for Merchants',
    description: 'Professional NFC-enabled Beam Wallet solution for physical stores and merchants. Enable contactless payments with advanced security features.',
    longDescription: 'The Beam Wallet NFC solution provides merchants with cutting-edge contactless payment technology. This comprehensive system includes NFC hardware, software integration, and complete setup support for physical stores.',
    price: 75.00,
    commission: 50,
    category: 'Wallet',
    productType: 'service',
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
    sortOrder: 1
  },
  {
    name: 'Beam Wallet Bluetooth Terminal for Merchants',
    description: 'Bluetooth-enabled payment terminal for physical stores. Complete wireless payment solution with advanced connectivity.',
    longDescription: 'Professional Bluetooth terminal designed specifically for physical stores. This wireless payment solution offers seamless connectivity, robust security, and comprehensive merchant tools.',
    price: 175.00,
    commission: 50,
    category: 'Wallet',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=900&fit=crop&q=90&auto=format&fm=webp',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=450&fit=crop&q=90&auto=format&fm=webp',
    externalUrl: 'https://shop.beamwallet.com/pt/product/bluethoot-terminal-for-physical-stores',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/bluethoot-terminal-for-physical-stores',
    beamWalletProductId: 'bluetooth-terminal-physical-stores',
    features: [
      'Wireless Bluetooth connectivity',
      'Portable payment terminal',
      'Long-lasting battery life',
      'Secure payment processing',
      'Real-time sales reporting',
      'Inventory management tools',
      'Customer receipt system',
      'Multi-device compatibility'
    ],
    requirements: [
      'Bluetooth-enabled device',
      'Stable internet connection',
      'Business license',
      'Merchant account setup'
    ],
    tags: ['bluetooth', 'terminal', 'wireless', 'physical-stores', 'portable'],
    sortOrder: 2
  },
  {
    name: 'Beam Wallet for Online Stores',
    description: 'Complete e-commerce payment solution for online stores. Integrate Beam Wallet payments into your website with ease.',
    longDescription: 'Comprehensive e-commerce integration solution that enables online stores to accept Beam Wallet payments. Includes API integration, checkout widgets, and complete payment processing infrastructure.',
    price: 75.00,
    commission: 50,
    category: 'Service',
    productType: 'service',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=900&fit=crop&q=90&auto=format&fm=webp',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop&q=90&auto=format&fm=webp',
    externalUrl: 'https://shop.beamwallet.com/pt/product/for-online-stores',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/for-online-stores',
    beamWalletProductId: 'online-stores-integration',
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
    name: 'Certificate of Quality and Trust for Merchants',
    description: 'Official quality and trust certification for merchants using Beam Wallet. Enhance customer confidence and credibility.',
    longDescription: 'Professional certification program that validates merchant quality and trustworthiness. This certificate enhances customer confidence and provides official recognition of compliance with Beam Wallet standards.',
    price: 25.00,
    commission: 50,
    category: 'License',
    productType: 'license',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&q=80',
    externalUrl: 'https://shop.beamwallet.com/pt/product/certificate-of-quality-and-trust',
    externalShopUrl: 'https://shop.beamwallet.com/pt/product/certificate-of-quality-and-trust',
    beamWalletProductId: 'quality-trust-certificate',
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