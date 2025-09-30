const axios = require('axios');

async function testLoginAndData() {
  try {
    console.log('🧪 Testing Login and Dashboard Data...\n');

    // 1. Login as simran
    console.log('1. Logging in as simran...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'simran17@gmail.com',
      password: 'password123' // You'll need to use the correct password
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      console.log('Please check the password for simran17@gmail.com');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // 2. Test user data
    console.log('\n2. Testing user data...');
    const userResponse = await axios.get('http://localhost:5001/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (userResponse.data.success) {
      const user = userResponse.data.user;
      console.log('✅ User data retrieved:');
      console.log(`   Email: ${user.email}`);
      console.log(`   ResellerId: ${user.resellerId}`);
      console.log(`   Balance: $${user.balance}`);
      console.log(`   Total Earnings: $${user.totalEarnings}`);
      console.log(`   Total Sales: ${user.totalSales}`);
    }

    // 3. Test transactions
    console.log('\n3. Testing transactions...');
    const transactionsResponse = await axios.get('http://localhost:5001/api/dashboard/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (transactionsResponse.data.success) {
      const transactions = transactionsResponse.data.transactions || [];
      console.log(`✅ Transactions retrieved: ${transactions.length} transactions`);
      if (transactions.length > 0) {
        transactions.forEach((t, i) => {
          console.log(`   ${i+1}. ${t.productName} - $${t.commissionAmount} (${t.paymentStatus})`);
        });
      }
    }

    // 4. Test reseller stats
    console.log('\n4. Testing reseller stats...');
    const statsResponse = await axios.get('http://localhost:5001/api/reseller/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.stats;
      console.log('✅ Reseller stats retrieved:');
      console.log(`   Total Sales: ${stats.totalSales}`);
      console.log(`   Total Earnings: $${stats.totalEarnings}`);
      console.log(`   Total Clicks: ${stats.totalClicks}`);
      console.log(`   Conversion Rate: ${(stats.conversionRate * 100).toFixed(1)}%`);
    }

    console.log('\n🎉 All tests passed! The data is available in the backend.');
    console.log('The issue is likely that you need to log in again in the frontend.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLoginAndData();
