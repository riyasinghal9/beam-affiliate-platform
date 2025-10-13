#!/usr/bin/env node

/**
 * Update Beam Wallet Products Script
 * This script updates the product catalog with real Beam Wallet products from shop.beamwallet.com
 */

const mongoose = require('mongoose');
const { seedBeamWalletProducts } = require('./backend/src/utils/beamProductSeeder');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beam-affiliate';

async function updateProducts() {
  try {
    console.log('🚀 Updating Beam Wallet Products...');
    console.log('=====================================');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to database');
    
    // Run the product seeder
    console.log('🌱 Seeding products...');
    await seedBeamWalletProducts();
    
    console.log('🎉 Product update completed successfully!');
    console.log('');
    console.log('📊 Updated Products:');
    console.log('1. Beam Wallet NFC for Merchants - $75.00 (20% commission)');
    console.log('2. Beam Wallet Bluetooth Terminal for Merchants - $175.00 (20% commission)');
    console.log('3. Beam Wallet for Online Stores - $75.00 (20% commission)');
    console.log('4. Certificate of Quality and Trust for Merchants - $25.00 (20% commission)');
    console.log('');
    console.log('🖼️ Product images updated to use Beam Wallet shop URLs');
    console.log('💰 Pricing updated to match shop.beamwallet.com');
    console.log('📝 Descriptions updated to match official Beam Wallet products');
    console.log('🔗 External URLs updated to English shop (shop.beamwallet.com/en)');
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
}

// Run the update
updateProducts();
