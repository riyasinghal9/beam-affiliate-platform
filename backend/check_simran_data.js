const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const User = require('./src/models/User');

async function checkSimranData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Find simran user
    const simran = await User.findOne({ email: 'simran17@gmail.com' });
    if (simran) {
      console.log('Simran user:', {
        resellerId: simran.resellerId,
        balance: simran.balance,
        totalEarnings: simran.totalEarnings,
        totalSales: simran.totalSales
      });
      
      // Find simran's payments
      const payments = await Payment.find({ resellerId: simran.resellerId });
      console.log('\nSimran payments:', payments.length);
      payments.forEach((p, i) => {
        console.log(`${i+1}. Payment ID: ${p.paymentId} - Amount: $${p.amount} - Commission: $${p.commissionAmount} - Admin Approval: ${p.adminApproval}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkSimranData();
