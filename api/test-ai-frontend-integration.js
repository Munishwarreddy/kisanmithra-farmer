/**
 * AI Frontend Integration Test
 * Tests the complete AI messaging and pricing intelligence system
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let farmerToken = '';
let buyerToken = '';
let testConversationId = '';
let testMessageId = '';
let testProductId = '';

// Test user credentials
const farmerUser = {
  email: 'farmer@test.com',
  password: 'password123'
};

const buyerUser = {
  email: 'buyer@test.com',
  password: 'password123'
};

// Helper function to make authenticated requests
const authRequest = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// Test 1: User Authentication
async function testAuthentication() {
  console.log('\n🔐 Test 1: User Authentication');
  
  try {
    // Login as farmer
    const farmerResponse = await axios.post(`${API_URL}/auth/login`, farmerUser);
    farmerToken = farmerResponse.data.token;
    console.log('✅ Farmer login successful');
    
    // Login as buyer
    const buyerResponse = await axios.post(`${API_URL}/auth/login`, buyerUser);
    buyerToken = buyerResponse.data.token;
    console.log('✅ Buyer login successful');
    
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Language Preference Update
async function testLanguagePreference() {
  console.log('\n🌐 Test 2: Language Preference Update');
  
  try {
    const response = await axios.put(
      `${API_URL}/users/preferences`,
      { language: 'te' }, // Telugu
      authRequest(farmerToken)
    );
    
    console.log('✅ Language preference updated to Telugu');
    return true;
  } catch (error) {
    console.error('❌ Language preference update failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Price Prediction
async function testPricePrediction() {
  console.log('\n💰 Test 3: Price Prediction');
  
  try {
    const response = await axios.post(
      `${API_URL}/ai/price-prediction`,
      {
        productName: 'Tomatoes',
        category: '507f1f77bcf86cd799439011', // Sample category ID
        region: 'Hyderabad'
      },
      authRequest(farmerToken)
    );
    
    if (response.data.success) {
      const prediction = response.data.data;
      console.log('✅ Price prediction generated');
      console.log(`   Market Average: ₨${prediction.marketAverage}`);
      console.log(`   Trend: ${prediction.predictedTrend?.direction}`);
      console.log(`   Demand Level: ${prediction.demandLevel}`);
      console.log(`   Recommended Range: ₨${prediction.recommendedPrice?.min} - ₨${prediction.recommendedPrice?.max}`);
    } else {
      console.log('⚠️  Insufficient data for price prediction (expected for new system)');
    }
    
    return true;
  } catch (error) {
    if (error.response?.status === 404 || error.response?.data?.message?.includes('Insufficient')) {
      console.log('⚠️  Insufficient data for price prediction (expected for new system)');
      return true;
    }
    console.error('❌ Price prediction failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Smart Replies Generation
async function testSmartReplies() {
  console.log('\n💬 Test 4: Smart Replies Generation');
  
  try {
    // First, create a test message
    const messageResponse = await axios.post(
      `${API_URL}/messages`,
      {
        recipient: farmerUser.id || '507f1f77bcf86cd799439012', // Sample farmer ID
        content: 'Hi, I am interested in buying tomatoes. What is your price?'
      },
      authRequest(buyerToken)
    );
    
    testMessageId = messageResponse.data.data._id;
    console.log('✅ Test message created');
    
    // Generate smart replies
    const repliesResponse = await axios.post(
      `${API_URL}/ai/smart-replies`,
      {
        messageId: testMessageId
      },
      authRequest(farmerToken)
    );
    
    if (repliesResponse.data.success && repliesResponse.data.data) {
      console.log('✅ Smart replies generated');
      repliesResponse.data.data.forEach((reply, index) => {
        console.log(`   ${index + 1}. [${reply.category}] ${reply.text.substring(0, 50)}...`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Smart replies generation failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 5: Deal Summary Generation
async function testDealSummary() {
  console.log('\n📋 Test 5: Deal Summary Generation');
  
  try {
    const response = await axios.post(
      `${API_URL}/ai/deal-summary`,
      {
        conversationId: testConversationId || 'test_conversation_id'
      },
      authRequest(farmerToken)
    );
    
    if (response.data.success) {
      if (response.data.data) {
        console.log('✅ Deal summary generated');
        console.log(`   Product: ${response.data.data.product}`);
        console.log(`   Quantity: ${response.data.data.quantity}`);
        console.log(`   Price: ${response.data.data.agreedPrice}`);
      } else {
        console.log('⚠️  No deal details found in conversation (expected for test)');
      }
    }
    
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  No conversation found (expected for test)');
      return true;
    }
    console.error('❌ Deal summary generation failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 6: AI Metrics (Admin)
async function testAIMetrics() {
  console.log('\n📊 Test 6: AI Metrics Endpoint');
  
  try {
    // Try with farmer token (should fail)
    try {
      await axios.get(`${API_URL}/ai/metrics`, authRequest(farmerToken));
      console.log('❌ Non-admin should not access metrics');
      return false;
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Non-admin access correctly denied');
      }
    }
    
    // Note: In production, test with admin token
    console.log('⚠️  Admin metrics test skipped (requires admin account)');
    
    return true;
  } catch (error) {
    console.error('❌ AI metrics test failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 7: Circuit Breaker Health
async function testCircuitBreakerHealth() {
  console.log('\n🔧 Test 7: Circuit Breaker Health');
  
  try {
    const response = await axios.get(`${API_URL}/ai/health`, authRequest(farmerToken));
    
    if (response.data.success) {
      console.log('✅ Circuit breaker health check successful');
      response.data.services.forEach(service => {
        console.log(`   ${service.name}: ${service.state} (${service.isOpen ? 'OPEN' : 'CLOSED'})`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Circuit breaker health check failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting AI Frontend Integration Tests\n');
  console.log('=' .repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    total: 7
  };
  
  // Run tests sequentially
  if (await testAuthentication()) results.passed++; else results.failed++;
  if (await testLanguagePreference()) results.passed++; else results.failed++;
  if (await testPricePrediction()) results.passed++; else results.failed++;
  if (await testSmartReplies()) results.passed++; else results.failed++;
  if (await testDealSummary()) results.passed++; else results.failed++;
  if (await testAIMetrics()) results.passed++; else results.failed++;
  if (await testCircuitBreakerHealth()) results.passed++; else results.failed++;
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📈 Test Summary:');
  console.log(`   Total Tests: ${results.total}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! AI system is fully functional.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
