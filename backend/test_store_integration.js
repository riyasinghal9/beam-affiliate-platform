const axios = require('axios');

// Test script for store integration
async function testStoreIntegration() {
  const baseUrl = 'http://localhost:5001';
  
  console.log('🧪 Testing Store Integration...\n');

  try {
    // Test 1: Simulate a store purchase webhook
    console.log('1. Testing store purchase webhook...');
    const purchaseData = {
      orderId: `test_order_${Date.now()}`,
      productId: 'test_product_123',
      affiliateId: 'test_reseller_456',
      customerEmail: 'test@example.com',
      customerName: 'Test Customer',
      amount: 99.99,
      currency: 'USD',
      paymentMethod: 'beam_wallet',
      purchaseDate: new Date().toISOString(),
      orderStatus: 'completed',
      trackingData: {
        productName: 'Beam Wallet for Online Stores',
        commissionRate: 50,
        customerPhone: '+1234567890',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        utmSource: 'affiliate',
        utmMedium: 'link',
        utmCampaign: 'beam_affiliate',
        conversionTime: 30000
      }
    };

    const purchaseResponse = await axios.post(`${baseUrl}/api/store-webhooks/purchase`, purchaseData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Beam-Signature': 'test-signature'
      }
    });

    console.log('✅ Purchase webhook test passed:', purchaseResponse.data);

    // Test 2: Test order status update webhook
    console.log('\n2. Testing order status update webhook...');
    const statusUpdateData = {
      orderId: purchaseData.orderId,
      status: 'completed',
      reason: 'Payment confirmed'
    };

    const statusResponse = await axios.post(`${baseUrl}/api/store-webhooks/order-status`, statusUpdateData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Beam-Signature': 'test-signature'
      }
    });

    console.log('✅ Status update webhook test passed:', statusResponse.data);

    // Test 3: Test store purchase statistics
    console.log('\n3. Testing store purchase statistics...');
    const statsResponse = await axios.get(`${baseUrl}/api/store-webhooks/stats/${purchaseData.affiliateId}?period=30d`);
    
    console.log('✅ Store statistics test passed:', statsResponse.data);

    console.log('\n🎉 All store integration tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test store integration service
async function testStoreIntegrationService() {
  console.log('\n🧪 Testing Store Integration Service...\n');

  try {
    const storeIntegrationService = require('./src/services/storeIntegrationService');

    // Test URL generation
    console.log('1. Testing tracking URL generation...');
    const trackingUrl = storeIntegrationService.generateTrackingUrl(
      'test_product_123',
      'test_reseller_456',
      99.99,
      {
        utmSource: 'affiliate',
        utmMedium: 'link',
        utmCampaign: 'beam_affiliate'
      }
    );
    console.log('✅ Tracking URL generated:', trackingUrl);

    // Test purchase data validation
    console.log('\n2. Testing purchase data validation...');
    const validData = {
      orderId: 'test_123',
      productId: 'product_456',
      affiliateId: 'reseller_789',
      customerEmail: 'test@example.com',
      amount: 99.99
    };
    
    storeIntegrationService.validatePurchaseData(validData);
    console.log('✅ Purchase data validation passed');

    // Test invalid data
    try {
      const invalidData = {
        orderId: 'test_123',
        // Missing required fields
        customerEmail: 'invalid-email'
      };
      storeIntegrationService.validatePurchaseData(invalidData);
      console.log('❌ Validation should have failed');
    } catch (error) {
      console.log('✅ Invalid data correctly rejected:', error.message);
    }

    console.log('\n🎉 All store integration service tests passed!');

  } catch (error) {
    console.error('❌ Service test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testStoreIntegrationService();
  await testStoreIntegration();
}

runTests().catch(console.error);
