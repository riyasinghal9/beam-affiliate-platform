const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

async function createTestPayment() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Create a new test payment for Simran
    const payment = new Payment({
      paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      resellerId: 'F2FA9D', // Simran's reseller ID
      productId: 'test_product_249',
      amount: 249.00,
      commissionAmount: 124.50, // 50% commission
      status: 'paid',
      adminApproval: 'pending', // This makes it show up in admin approval
      customerName: 'Test Customer 249',
      customerEmail: 'test249@example.com',
      stripePaymentIntentId: `beam_test_${Date.now()}`,
      commissionStatus: 'pending'
    });
    
    await payment.save();
    console.log('Test payment created successfully:', payment.paymentId);
    console.log('Amount: $249.00, Commission: $124.50');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestPayment();
