const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');
const User = require('./src/models/User');

async function checkTransactions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Check simran's transactions
    const simran = await User.findOne({ email: 'simran17@gmail.com' });
    if (simran) {
      console.log('Simran user found:', simran.resellerId);
      
      const transactions = await Transaction.find({ resellerId: simran.resellerId });
      console.log('Simran transactions:', transactions.length);
      transactions.forEach((t, i) => {
        console.log(`${i+1}. ${t.productName} - $${t.commissionAmount} - Status: ${t.paymentStatus} - Created: ${t.createdAt}`);
      });
    }
    
    // Check all transactions
    const allTransactions = await Transaction.find().sort({ createdAt: -1 }).limit(10);
    console.log('\nRecent transactions (all):', allTransactions.length);
    allTransactions.forEach((t, i) => {
      console.log(`${i+1}. ${t.resellerId} - ${t.productName} - $${t.commissionAmount} - Status: ${t.paymentStatus}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkTransactions();
