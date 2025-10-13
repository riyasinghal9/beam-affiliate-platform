const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');

async function checkRealTransactions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    const transactions = await Transaction.find({ resellerId: 'F2FA9D' }).sort({ createdAt: -1 });
    console.log('Simran real transactions:');
    transactions.forEach((t, i) => {
      console.log(`${i+1}. Transaction ID: ${t._id}`);
      console.log(`   Customer: ${t.customerName} (${t.customerEmail})`);
      console.log(`   Product: ${t.productName}`);
      console.log(`   Amount: $${t.productPrice}, Commission: $${t.commissionAmount}`);
      console.log(`   Status: ${t.paymentStatus}`);
      console.log(`   Created: ${t.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRealTransactions();
