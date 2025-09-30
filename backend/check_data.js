const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');
const User = require('./src/models/User');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    
    console.log('=== All Transactions ===');
    const transactions = await Transaction.find({});
    console.log('Total transactions:', transactions.length);
    transactions.forEach((t, i) => {
      console.log(`${i+1}. ResellerId: ${t.resellerId}, Amount: $${t.productPrice}, Commission: $${t.commissionAmount}`);
    });
    
    console.log('\n=== All Users ===');
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach((u, i) => {
      console.log(`${i+1}. Email: ${u.email}, ResellerId: ${u.resellerId}, Balance: $${u.balance}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkData();
