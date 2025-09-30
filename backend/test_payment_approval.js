const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const Commission = require('./src/models/Commission');
const User = require('./src/models/User');

async function testPaymentApproval() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Find the payment
    const payment = await Payment.findOne({ paymentId: 'PAY-1757065167779-XZ0PJHMJF' });
    if (!payment) {
      console.log('Payment not found!');
      return;
    }
    
    console.log('Payment found:', {
      _id: payment._id,
      paymentId: payment.paymentId,
      resellerId: payment.resellerId,
      amount: payment.amount,
      commissionAmount: payment.commissionAmount,
      adminApproval: payment.adminApproval,
      status: payment.status
    });
    
    // Test approval logic
    if (payment.adminApproval !== 'pending') {
      console.log('Payment is not pending approval:', payment.adminApproval);
      return;
    }
    
    console.log('Payment is pending approval, testing approval...');
    
    // Update payment
    payment.adminApproval = 'approved';
    payment.status = 'approved';
    payment.approvedBy = '689dc58878f7cca17cca5243'; // Admin user ID
    payment.approvedAt = new Date();
    payment.adminNotes = 'Test approval';
    
    await payment.save();
    console.log('Payment updated successfully');
    
    // Test commission creation
    const commission = new Commission({
      resellerId: payment.resellerId,
      saleId: payment._id.toString(),
      productId: payment.productId,
      commissionAmount: payment.commissionAmount,
      commissionRate: (payment.commissionAmount / payment.amount) * 100,
      status: 'paid',
      paidAt: new Date()
    });
    
    await commission.save();
    console.log('Commission created successfully:', commission._id);
    
    // Test user update
    const userUpdate = await User.findOneAndUpdate(
      { resellerId: payment.resellerId },
      { 
        $inc: { 
          totalEarnings: payment.commissionAmount,
          balance: payment.commissionAmount,
          totalSales: 1
        }
      },
      { new: true }
    );
    
    console.log('User updated successfully:', {
      balance: userUpdate.balance,
      totalEarnings: userUpdate.totalEarnings,
      totalSales: userUpdate.totalSales
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testPaymentApproval();
