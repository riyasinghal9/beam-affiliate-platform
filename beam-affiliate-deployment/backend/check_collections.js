const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const Commission = require('./src/models/Commission');
const Transaction = require('./src/models/Transaction');

async function checkCollections() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Check Payment collection
    const payments = await Payment.find();
    console.log('Payments collection:', payments.length);
    payments.forEach((p, i) => {
      console.log(`${i+1}. Payment - Amount: $${p.amount} - Status: ${p.status} - Admin Approval: ${p.adminApproval}`);
    });
    
    // Check Commission collection
    const commissions = await Commission.find();
    console.log('\nCommissions collection:', commissions.length);
    commissions.forEach((c, i) => {
      console.log(`${i+1}. Commission - Amount: $${c.commissionAmount} - Status: ${c.status}`);
    });
    
    // Check Transaction collection
    const transactions = await Transaction.find();
    console.log('\nTransactions collection:', transactions.length);
    transactions.forEach((t, i) => {
      console.log(`${i+1}. Transaction - Amount: $${t.commissionAmount} - Status: ${t.paymentStatus}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCollections();
