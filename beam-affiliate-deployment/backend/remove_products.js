const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beam-affiliate-platform');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Product schema
const Product = require('./src/models/Product');

const removeProducts = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Removing products from database...\n');
    
    // Products to remove
    const productsToRemove = [
      'Beam Wallet Installation Service',
      'Beam Wallet Premium Support Package'
    ];
    
    for (const productName of productsToRemove) {
      const result = await Product.findOneAndDelete({ name: productName });
      
      if (result) {
        console.log(`✅ Removed: ${productName} (ID: ${result._id})`);
      } else {
        console.log(`❌ Product not found: ${productName}`);
      }
    }
    
    console.log('\n🎉 Product removal completed!');
    
    // Display remaining products
    console.log('\n📋 Remaining Products:');
    const remainingProducts = await Product.find({}).select('name price commission');
    
    if (remainingProducts.length > 0) {
      remainingProducts.forEach(product => {
        console.log(`   ${product.name}: $${product.price} (${product.commission}% commission)`);
      });
    } else {
      console.log('   No products found');
    }
    
  } catch (error) {
    console.error('❌ Error removing products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

removeProducts();
