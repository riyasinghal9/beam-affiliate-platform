const mongoose = require('mongoose');
const { seedBeamWalletProducts } = require('./src/utils/beamProductSeeder');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beam-affiliate-platform';

async function updateProducts() {
  try {
    console.log('🔗 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database successfully');

    console.log('🌱 Starting product update...');
    await seedBeamWalletProducts();
    
    console.log('🎉 Product update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
}

updateProducts();
