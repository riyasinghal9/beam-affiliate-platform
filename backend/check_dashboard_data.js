const mongoose = require('mongoose');
const Sale = require('./src/models/Sale');
const Payment = require('./src/models/Payment');
const Commission = require('./src/models/Commission');

async function checkDashboardData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Check Sale collection
    const sales = await Sale.find();
    console.log('Sales collection:', sales.length);
    sales.forEach((s, i) => {
      console.log(`${i+1}. Sale - Amount: $${s.saleAmount} - Verified: ${s.isVerified}`);
    });
    
    console.log('\n---');
    
    // Check Payment collection
    const payments = await Payment.find();
    console.log('Payments collection:', payments.length);
    payments.forEach((p, i) => {
      console.log(`${i+1}. Payment - Amount: $${p.amount} - Admin Approval: ${p.adminApproval}`);
    });
    
    console.log('\n---');
    
    // Check Commission collection
    const commissions = await Commission.find();
    console.log('Commissions collection:', commissions.length);
    const pendingCommissions = commissions.filter(c => c.status === 'pending');
    const paidCommissions = commissions.filter(c => c.status === 'paid');
    console.log(`Pending: ${pendingCommissions.length}, Paid: ${paidCommissions.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDashboardData();
