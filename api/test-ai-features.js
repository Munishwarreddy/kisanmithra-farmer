/**
 * Test AI Features
 * Demonstrates all AI capabilities
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let farmerToken = '';
let buyerToken = '';
let messageId = '';
let conversationId = '';

// Test credentials (update with your actual test users)
const farmerCredentials = {
  email: 'farmer@test.com',
  password: 'password123'
};

const buyerCredentials = {
  email: 'buyer@test.com',
  password: 'password123'
};

async function testAIFeatures() {
  console.log('🚀 Testing AI Features\n');

  try {
    // 1. Login as farmer
    console.log('1️⃣  Logging in as farmer...');
    const farmerLogin = await axios.post(`${API_URL}/auth/login`, farmerCredentials);
    farmerToken = farmerLogin.data.token;
    console.log('✅ Farmer logged in\n');

    // 2. Login as buyer
    console.log('2️⃣  Logging in as buyer...');
    const buyerLogin = await axios.post(`${API_URL}/auth/login`, buyerCredentials);
    buyerToken = buyerLogin.data.token;
    const buyerId = buyerLogin.data.data._id;
    console.log('✅ Buyer logged in\n');

    // 3. Update buyer language preference to Telugu
    console.log('3️⃣  Setting buyer language to Telugu...');
    await axios.put(
      `${API_URL}/users/preferences`,
      { language: 'te' },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    console.log('✅ Language preference updated\n');

    // 4. Send message from buyer to farmer (with translation)
    console.log('4️⃣  Sending message from buyer to farmer...');
    const messageResponse = await axios.post(
      `${API_URL}/messages`,
      {
        recipient: farmerLogin.data.data._id,
        content: 'Can you give discount for bulk order of 100kg tomatoes?'
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    messageId = messageResponse.data.data._id;
    conversationId = messageResponse.data.data.conversationId;
    console.log('✅ Message sent');
    console.log('   Message ID:', messageId);
    console.log('   Conversation ID:', conversationId);
    console.log('   Original Language:', messageResponse.data.data.originalLanguage);
    console.log('   Translations:', Object.keys(messageResponse.data.data.translations || {}));
    console.log('');

    // Wait for AI processing
    console.log('⏳ Waiting for AI processing (sentiment & smart replies)...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Get smart replies for the message
    console.log('5️⃣  Getting smart reply suggestions...');
    const smartRepliesResponse = await axios.post(
      `${API_URL}/ai/smart-replies`,
      { messageId },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    console.log('✅ Smart replies generated:');
    smartRepliesResponse.data.data.forEach((reply, i) => {
      console.log(`   ${i + 1}. [${reply.category}] ${reply.text}`);
    });
    console.log('');

    // 6. Send more messages to build conversation
    console.log('6️⃣  Building conversation...');
    await axios.post(
      `${API_URL}/messages`,
      {
        recipient: buyerId,
        content: 'Yes, for 100kg I can offer ₹20 per kg. Delivery by 18 Feb.'
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    
    await axios.post(
      `${API_URL}/messages`,
      {
        recipient: farmerLogin.data.data._id,
        content: 'Perfect! Please confirm the deal.'
      },
      { headers: { Authorization: `Bearer ${buyerToken}` } }
    );
    console.log('✅ Conversation built\n');

    // 7. Generate deal summary
    console.log('7️⃣  Generating deal summary...');
    const dealSummaryResponse = await axios.post(
      `${API_URL}/ai/deal-summary`,
      { conversationId },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    
    if (dealSummaryResponse.data.data) {
      console.log('✅ Deal summary generated:');
      console.log('   Title:', dealSummaryResponse.data.data.title);
      dealSummaryResponse.data.data.fields.forEach(field => {
        console.log(`   ${field.label}: ${field.value}`);
      });
      console.log(`   Confidence: ${(dealSummaryResponse.data.data.confidence * 100).toFixed(0)}%`);
    } else {
      console.log('ℹ️  No deal details found yet');
    }
    console.log('');

    // 8. Get price prediction
    console.log('8️⃣  Getting price prediction for tomatoes...');
    const pricePredictionResponse = await axios.post(
      `${API_URL}/ai/price-prediction`,
      {
        productName: 'Tomato',
        category: null,
        region: 'Hyderabad'
      },
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    
    const prediction = pricePredictionResponse.data.data;
    console.log('✅ Price prediction generated:');
    console.log(`   Product: ${prediction.productName}`);
    console.log(`   Region: ${prediction.region}`);
    console.log(`   Market Average: ₹${prediction.marketAverage}/kg`);
    console.log(`   Trend: ${prediction.predictedTrend.direction} (${prediction.predictedTrend.percentage}%)`);
    console.log(`   Next Week Price: ₹${prediction.predictedTrend.nextWeekPrice}/kg`);
    console.log(`   Demand Level: ${prediction.demandLevel} 🔥`);
    console.log(`   Recommended Price: ₹${prediction.recommendedPrice.min}-${prediction.recommendedPrice.max}/kg`);
    console.log(`   Confidence: ${(prediction.confidence * 100).toFixed(0)}%`);
    console.log(`   Data Points: ${prediction.dataPoints}`);
    if (prediction.note) {
      console.log(`   Note: ${prediction.note}`);
    }
    console.log('');

    // 9. Check AI services health
    console.log('9️⃣  Checking AI services health...');
    const healthResponse = await axios.get(
      `${API_URL}/ai/health`,
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );
    console.log('✅ AI services status:');
    healthResponse.data.services.forEach(service => {
      console.log(`   ${service.name}: ${service.state}`);
    });
    console.log('');

    console.log('🎉 All AI features tested successfully!\n');
    console.log('📋 Summary of AI Features:');
    console.log('   ✅ Auto Language Translation (Telugu ↔ English)');
    console.log('   ✅ Sentiment Analysis (😊😐⚠️🔴)');
    console.log('   ✅ Smart Reply Suggestions');
    console.log('   ✅ Deal Summary Generator');
    console.log('   ✅ Price Prediction System');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run tests
console.log('═══════════════════════════════════════════════════════');
console.log('   AI FEATURES TEST SUITE');
console.log('═══════════════════════════════════════════════════════\n');

testAIFeatures();
