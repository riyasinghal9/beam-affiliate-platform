const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');

async function checkPaymentData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    const payments = await Payment.find({ resellerId: 'F2FA9D' }).sort({ createdAt: -1 });
    console.log('Simran payments:');
    payments.forEach((p, i) => {
      console.log(`${i+1}. Payment ID: ${p.paymentId}`);
      console.log(`   Customer: ${p.customerName} (${p.customerEmail})`);
      console.log(`   Amount: $${p.amount}, Commission: $${p.commissionAmount}`);
      console.log(`   Admin Approval: ${p.adminApproval}`);
      console.log(`   Created: ${p.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkPaymentData();
