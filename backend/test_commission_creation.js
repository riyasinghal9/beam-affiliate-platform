const mongoose = require('mongoose');
const Commission = require('./src/models/Commission');

async function testCommissionCreation() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Test commission creation with minimal data
    const commission = new Commission({
      resellerId: 'F2FA9D',
      saleId: 'test_sale_id',
      productId: 'test_product_249',
      commissionAmount: 124.50,
      commissionRate: 50.0,
      status: 'paid',
      paidAt: new Date()
    });
    
    await commission.save();
    console.log('Commission created successfully:', commission._id);
    
  } catch (error) {
    console.error('Commission creation error:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.disconnect();
  }
}

testCommissionCreation();
