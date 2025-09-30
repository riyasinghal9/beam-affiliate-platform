const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');
const User = require('./src/models/User');

async function createSimranTransactions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    
    // Find simran user
    const simran = await User.findOne({ email: 'simran17@gmail.com' });
    if (!simran) {
      console.log('Simran user not found!');
      return;
    }
    
    console.log('Found simran user:', {
      email: simran.email,
      resellerId: simran.resellerId,
      balance: simran.balance,
      totalEarnings: simran.totalEarnings
    });
    
    // Create transactions one by one to avoid duplicate key errors
    const transactionData = [
      {
        productName: 'Beam Wallet Pro',
        productPrice: 150,
        commissionPercentage: 15,
        commissionAmount: 22.5,
        customerEmail: 'customer1@example.com',
        customerName: 'John Doe'
      },
      {
        productName: 'Beam Mobile App',
        productPrice: 99,
        commissionPercentage: 12,
        commissionAmount: 11.88,
        customerEmail: 'customer2@example.com',
        customerName: 'Jane Smith'
      },
      {
        productName: 'Beam Premium',
        productPrice: 200,
        commissionPercentage: 20,
        commissionAmount: 40,
        customerEmail: 'customer3@example.com',
        customerName: 'Bob Johnson'
      }
    ];
    
    let totalCommission = 0;
    for (const data of transactionData) {
      const transaction = new Transaction({
        resellerId: simran.resellerId,
        productId: new mongoose.Types.ObjectId(),
        productName: data.productName,
        productPrice: data.productPrice,
        commissionPercentage: data.commissionPercentage,
        commissionAmount: data.commissionAmount,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        paymentMethod: 'BeamPay',
        paymentStatus: 'Confirmed',
        commissionStatus: 'Paid',
        customerIp: '192.168.1.100',
        customerDevice: 'Chrome/91.0',
        notes: `Beam Wallet payment - ${data.productName}`
      });
      
      try {
        await transaction.save();
        totalCommission += data.commissionAmount;
        console.log(`Created transaction: ${data.productName} - $${data.commissionAmount}`);
      } catch (error) {
        console.log(`Transaction already exists or error: ${data.productName}`);
      }
    }
    
    // Update simran's stats
    await User.findByIdAndUpdate(simran._id, {
      $inc: {
        totalSales: transactionData.length,
        totalEarnings: totalCommission,
        balance: totalCommission
      }
    });
    
    console.log(`Updated simran's stats: +${transactionData.length} sales, +$${totalCommission} earnings`);
    
    // Verify the transactions
    const simranTransactions = await Transaction.find({ resellerId: simran.resellerId });
    console.log(`Simran now has ${simranTransactions.length} transactions`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createSimranTransactions();
