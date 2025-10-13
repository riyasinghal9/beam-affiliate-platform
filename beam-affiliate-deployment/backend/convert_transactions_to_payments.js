const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');
const Payment = require('./src/models/Payment');
const Commission = require('./src/models/Commission');
const User = require('./src/models/User');

async function convertTransactionsToPayments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Get all transactions that don't have corresponding payments
    const transactions = await Transaction.find();
    console.log(`Found ${transactions.length} transactions to process`);
    
    for (const transaction of transactions) {
      // Check if payment already exists for this transaction
      const existingPayment = await Payment.findOne({ 
        resellerId: transaction.resellerId,
        amount: transaction.productPrice,
        commissionAmount: transaction.commissionAmount
      });
      
      if (existingPayment) {
        console.log(`Payment already exists for transaction ${transaction._id}`);
        continue;
      }
      
      // Find the user to get their ID
      const user = await User.findOne({ resellerId: transaction.resellerId });
      if (!user) {
        console.log(`User not found for resellerId: ${transaction.resellerId}`);
        continue;
      }
      
      // Find the corresponding commission
      const commission = await Commission.findOne({
        resellerId: transaction.resellerId,
        commissionAmount: transaction.commissionAmount
      });
      
      // Create payment record
      const payment = new Payment({
        paymentId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        resellerId: transaction.resellerId,
        productId: transaction.productId?.toString() || new mongoose.Types.ObjectId().toString(),
        amount: transaction.productPrice,
        commissionAmount: transaction.commissionAmount,
        status: 'paid', // Use valid enum value
        adminApproval: 'pending', // This makes it show up in admin approval
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        stripePaymentIntentId: `beam_${transaction._id}`, // Generate a fake Stripe ID for Beam payments
        commissionStatus: 'pending'
      });
      
      await payment.save();
      console.log(`Created payment for transaction ${transaction._id}: $${transaction.commissionAmount}`);
    }
    
    // Check results
    const payments = await Payment.find();
    console.log(`\nTotal payments now: ${payments.length}`);
    payments.forEach((p, i) => {
      console.log(`${i+1}. Payment - Amount: $${p.amount} - Commission: $${p.commissionAmount} - Admin Approval: ${p.adminApproval}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

convertTransactionsToPayments();
