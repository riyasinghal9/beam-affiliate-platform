const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');
const User = require('./src/models/User');

async function checkTransactions() {
  try {
    // Connect to MongoDB (same as backend)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');

    // Find all transactions
    console.log('\n📊 All Transactions in Database:');
    const allTransactions = await Transaction.find({});
    console.log(`Total transactions: ${allTransactions.length}`);
    
    if (allTransactions.length > 0) {
      allTransactions.forEach((transaction, index) => {
        console.log(`\nTransaction ${index + 1}:`);
        console.log(`  ID: ${transaction._id}`);
        console.log(`  ResellerId: ${transaction.resellerId}`);
        console.log(`  Product: ${transaction.productName}`);
        console.log(`  Amount: $${transaction.productPrice}`);
        console.log(`  Commission: $${transaction.commissionAmount}`);
        console.log(`  Status: ${transaction.paymentStatus}`);
        console.log(`  Created: ${transaction.createdAt}`);
      });
    }

    // Find admin user
    console.log('\n👤 Admin User:');
    const adminUser = await User.findOne({ email: 'admin@beamwallet.com' });
    if (adminUser) {
      console.log(`  ID: ${adminUser._id}`);
      console.log(`  ResellerId: ${adminUser.resellerId}`);
      console.log(`  Balance: $${adminUser.balance}`);
      console.log(`  Total Sales: ${adminUser.totalSales}`);
      console.log(`  Total Earnings: ${adminUser.totalEarnings}`);
    } else {
      console.log('  Admin user not found!');
    }

    // Find all users
    console.log('\n👥 All Users:');
    const allUsers = await User.find({});
    console.log(`Total users: ${allUsers.length}`);
    allUsers.forEach((user, index) => {
      console.log(`  User ${index + 1}: ${user.email} (ResellerId: ${user.resellerId})`);
    });

    // Check if resellerId matches
    console.log('\n🔍 ResellerId Matching:');
    if (adminUser && allTransactions.length > 0) {
      const matchingTransactions = allTransactions.filter(t => t.resellerId === adminUser.resellerId);
      console.log(`  Admin ResellerId: ${adminUser.resellerId}`);
      console.log(`  Matching transactions: ${matchingTransactions.length}`);
      
      allTransactions.forEach(t => {
        console.log(`  Transaction ResellerId: ${t.resellerId} (matches: ${t.resellerId === adminUser.resellerId})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkTransactions();
