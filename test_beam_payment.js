const axios = require('axios');

async function testBeamWalletPayment() {
  try {
    console.log('🧪 Testing Beam Wallet Payment Flow...\n');

    // First, let's login to get a valid token
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'simran@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Check initial transactions
    console.log('\n2. Checking initial transactions...');
    const initialTransactionsResponse = await axios.get('http://localhost:5001/api/dashboard/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const initialTransactions = initialTransactionsResponse.data.transactions || [];
    console.log(`📊 Initial transactions count: ${initialTransactions.length}`);

    // Check initial reseller stats
    console.log('\n3. Checking initial reseller stats...');
    const initialStatsResponse = await axios.get('http://localhost:5001/api/reseller/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const initialStats = initialStatsResponse.data.stats;
    console.log(`📈 Initial stats:`, {
      totalSales: initialStats.totalSales,
      totalEarnings: initialStats.totalEarnings,
      totalClicks: initialStats.totalClicks
    });

    // Make a Beam Wallet payment
    console.log('\n4. Making Beam Wallet payment...');
    const paymentResponse = await axios.post('http://localhost:5001/api/payments/process', {
      amount: 100,
      customerData: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890'
      },
      productData: {
        _id: 'test_product_123',
        name: 'Test Product',
        price: 100,
        commission: 10
      },
      resellerId: 'ABC123', // This should match the reseller's ID
      paymentMethod: 'beam_wallet'
    });

    if (!paymentResponse.data.success) {
      throw new Error('Payment failed: ' + paymentResponse.data.message);
    }

    console.log('✅ Payment successful!');
    console.log('Payment details:', {
      paymentId: paymentResponse.data.paymentId,
      saleId: paymentResponse.data.saleId,
      commissionId: paymentResponse.data.commissionId,
      amount: paymentResponse.data.amount,
      commissionAmount: paymentResponse.data.commissionAmount
    });

    // Wait a moment for the payment to be processed
    console.log('\n5. Waiting for payment processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check transactions after payment
    console.log('\n6. Checking transactions after payment...');
    const finalTransactionsResponse = await axios.get('http://localhost:5001/api/dashboard/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const finalTransactions = finalTransactionsResponse.data.transactions || [];
    console.log(`📊 Final transactions count: ${finalTransactions.length}`);
    
    if (finalTransactions.length > initialTransactions.length) {
      console.log('✅ New transaction created!');
      console.log('Latest transaction:', finalTransactions[0]);
    } else {
      console.log('❌ No new transaction found');
    }

    // Check reseller stats after payment
    console.log('\n7. Checking reseller stats after payment...');
    const finalStatsResponse = await axios.get('http://localhost:5001/api/reseller/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const finalStats = finalStatsResponse.data.stats;
    console.log(`📈 Final stats:`, {
      totalSales: finalStats.totalSales,
      totalEarnings: finalStats.totalEarnings,
      totalClicks: finalStats.totalClicks
    });

    // Compare stats
    const salesIncrease = finalStats.totalSales - initialStats.totalSales;
    const earningsIncrease = finalStats.totalEarnings - initialStats.totalEarnings;
    
    console.log('\n8. Summary:');
    console.log(`📈 Sales increase: ${salesIncrease}`);
    console.log(`💰 Earnings increase: $${earningsIncrease}`);
    console.log(`📊 Transaction count increase: ${finalTransactions.length - initialTransactions.length}`);

    if (salesIncrease > 0 && earningsIncrease > 0 && finalTransactions.length > initialTransactions.length) {
      console.log('\n🎉 SUCCESS: Beam Wallet payment flow is working correctly!');
      console.log('   - Transaction record created');
      console.log('   - Reseller stats updated');
      console.log('   - Dashboard should now show live data');
    } else {
      console.log('\n❌ ISSUE: Some data was not updated correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testBeamWalletPayment();
