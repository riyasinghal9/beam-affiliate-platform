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

const updateProductPrices = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Updating product prices to match official website...\n');
    
    // Update prices for the 4 products
    const priceUpdates = [
      {
        name: 'Beam Wallet NFC for Merchants',
        newPrice: 75,
        description: 'Updated price to match official website'
      },
      {
        name: 'Beam Wallet Bluetooth Terminal for Merchants', 
        newPrice: 175,
        description: 'Updated price to match official website'
      },
      {
        name: 'Beam Wallet for Online Stores',
        newPrice: 75,
        description: 'Updated price to match official website'
      },
      {
        name: 'Certificate of Quality and Trust for Merchants',
        newPrice: 25,
        description: 'Updated price to match official website'
      }
    ];
    
    for (const update of priceUpdates) {
      const result = await Product.findOneAndUpdate(
        { name: update.name },
        { 
          price: update.newPrice,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (result) {
        console.log(`✅ Updated ${update.name}: $${update.newPrice}`);
      } else {
        console.log(`❌ Product not found: ${update.name}`);
      }
    }
    
    console.log('\n🎉 Price updates completed!');
    
    // Display updated prices
    console.log('\n📋 Updated Product Prices:');
    const products = await Product.find({ 
      name: { 
        $in: priceUpdates.map(p => p.name) 
      } 
    }).select('name price');
    
    products.forEach(product => {
      console.log(`   ${product.name}: $${product.price}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating prices:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

updateProductPrices();
