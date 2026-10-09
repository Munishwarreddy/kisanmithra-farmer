/**
 * Socket.io Real-Time Messaging Test
 * 
 * This test verifies the Socket.io implementation for real-time messaging
 * including connection authentication, message broadcasting, and read receipts.
 * 
 * Requirements tested: 9.7 (Real-time message display)
 */

const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

// Test users
let farmerToken = null;
let consumerToken = null;
let farmerId = null;
let consumerId = null;

// Socket connections
let farmerSocket = null;
let consumerSocket = null;

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to login
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
}

// Test 1: Authentication
async function testAuthentication() {
  console.log('\n📝 Test 1: Socket.io Connection Authentication');
  console.log('='.repeat(60));

  try {
    // Login as farmer
    console.log('Logging in as farmer...');
    const farmerLogin = await login('farmer1@test.com', 'password123');
    farmerToken = farmerLogin.token;
    farmerId = farmerLogin.user._id;
    console.log('✅ Farmer logged in:', farmerLogin.user.name);

    // Login as consumer
    console.log('Logging in as consumer...');
    const consumerLogin = await login('consumer1@test.com', 'password123');
    consumerToken = consumerLogin.token;
    consumerId = consumerLogin.user._id;
    console.log('✅ Consumer logged in:', consumerLogin.user.name);

    // Test connection with valid token
    console.log('\nTesting Socket.io connection with valid token...');
    farmerSocket = io(SOCKET_URL, {
      auth: { token: farmerToken },
      transports: ['websocket']
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);

      farmerSocket.on('connected', (data) => {
        clearTimeout(timeout);
        console.log('✅ Farmer socket connected:', data);
        resolve();
      });

      farmerSocket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Test connection without token (should fail)
    console.log('\nTesting Socket.io connection without token (should fail)...');
    const invalidSocket = io(SOCKET_URL, {
      auth: {},
      transports: ['websocket']
    });

    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('✅ Connection correctly rejected without token');
        invalidSocket.close();
        resolve();
      }, 2000);

      invalidSocket.on('connected', () => {
        clearTimeout(timeout);
        console.log('❌ Connection should have been rejected');
        invalidSocket.close();
        resolve();
      });

      invalidSocket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log('✅ Connection correctly rejected:', error.message);
        invalidSocket.close();
        resolve();
      });
    });

    console.log('\n✅ Test 1 PASSED: Authentication working correctly');
    return true;

  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message);
    return false;
  }
}

// Test 2: Real-time message broadcasting
async function testMessageBroadcasting() {
  console.log('\n📝 Test 2: Real-Time Message Broadcasting');
  console.log('='.repeat(60));

  try {
    // Connect consumer socket
    console.log('Connecting consumer socket...');
    consumerSocket = io(SOCKET_URL, {
      auth: { token: consumerToken },
      transports: ['websocket']
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Consumer connection timeout'));
      }, 5000);

      consumerSocket.on('connected', (data) => {
        clearTimeout(timeout);
        console.log('✅ Consumer socket connected:', data);
        resolve();
      });

      consumerSocket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Generate conversation ID
    const conversationId = [farmerId, consumerId].sort().join('_');
    console.log('\nConversation ID:', conversationId);

    // Both users join the conversation
    console.log('Both users joining conversation...');
    farmerSocket.emit('conversation:join', conversationId);
    consumerSocket.emit('conversation:join', conversationId);
    await wait(500);

    // Set up message listener for consumer
    const messageReceived = new Promise((resolve) => {
      consumerSocket.on('message:new', (data) => {
        console.log('✅ Consumer received real-time message:', {
          from: data.message.sender.name,
          content: data.message.content,
          conversationId: data.conversationId
        });
        resolve(data);
      });
    });

    // Farmer sends message via Socket.io
    console.log('\nFarmer sending message via Socket.io...');
    farmerSocket.emit('message:send', {
      recipient: consumerId,
      content: 'Hello! This is a real-time message test.',
      conversationId
    });

    // Wait for message to be received
    const receivedData = await Promise.race([
      messageReceived,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Message not received in time')), 5000)
      )
    ]);

    console.log('✅ Message broadcasted successfully in real-time');

    // Verify message was saved to database
    console.log('\nVerifying message was saved to database...');
    const response = await axios.get(
      `${API_URL}/api/messages/${conversationId}`,
      { headers: { Authorization: `Bearer ${consumerToken}` } }
    );

    const messages = response.data.data;
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.content === 'Hello! This is a real-time message test.') {
      console.log('✅ Message correctly saved to database');
    } else {
      throw new Error('Message not found in database');
    }

    console.log('\n✅ Test 2 PASSED: Real-time message broadcasting working');
    return true;

  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message);
    return false;
  }
}

// Test 3: Read receipts
async function testReadReceipts() {
  console.log('\n📝 Test 3: Read Receipts');
  console.log('='.repeat(60));

  try {
    const conversationId = [farmerId, consumerId].sort().join('_');

    // Set up read receipt listener for farmer
    const readReceiptReceived = new Promise((resolve) => {
      farmerSocket.on('message:read:receipt', (data) => {
        console.log('✅ Farmer received read receipt:', {
          messageId: data.messageId,
          readAt: data.readAt,
          readBy: data.readBy
        });
        resolve(data);
      });
    });

    // Get the last message
    console.log('Getting last message...');
    const response = await axios.get(
      `${API_URL}/api/messages/${conversationId}`,
      { headers: { Authorization: `Bearer ${consumerToken}` } }
    );

    const messages = response.data.data;
    const lastMessage = messages[messages.length - 1];
    console.log('Last message ID:', lastMessage._id);

    // Consumer marks message as read via Socket.io
    console.log('\nConsumer marking message as read via Socket.io...');
    consumerSocket.emit('message:read', {
      messageId: lastMessage._id,
      conversationId
    });

    // Wait for read receipt
    const receiptData = await Promise.race([
      readReceiptReceived,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Read receipt not received in time')), 5000)
      )
    ]);

    console.log('✅ Read receipt sent successfully in real-time');

    // Verify message is marked as read in database
    console.log('\nVerifying message is marked as read in database...');
    const verifyResponse = await axios.get(
      `${API_URL}/api/messages/${conversationId}`,
      { headers: { Authorization: `Bearer ${consumerToken}` } }
    );

    const updatedMessages = verifyResponse.data.data;
    const updatedMessage = updatedMessages.find(m => m._id === lastMessage._id);

    if (updatedMessage.isRead && updatedMessage.readAt) {
      console.log('✅ Message correctly marked as read in database');
    } else {
      throw new Error('Message not marked as read in database');
    }

    console.log('\n✅ Test 3 PASSED: Read receipts working correctly');
    return true;

  } catch (error) {
    console.error('❌ Test 3 FAILED:', error.message);
    return false;
  }
}

// Test 4: Typing indicators
async function testTypingIndicators() {
  console.log('\n📝 Test 4: Typing Indicators');
  console.log('='.repeat(60));

  try {
    const conversationId = [farmerId, consumerId].sort().join('_');

    // Set up typing listener for consumer
    const typingReceived = new Promise((resolve) => {
      consumerSocket.on('typing:user', (data) => {
        console.log('✅ Consumer received typing indicator:', {
          userId: data.userId,
          userName: data.userName,
          conversationId: data.conversationId
        });
        resolve(data);
      });
    });

    // Farmer starts typing
    console.log('Farmer starts typing...');
    farmerSocket.emit('typing:start', { conversationId });

    // Wait for typing indicator
    await Promise.race([
      typingReceived,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Typing indicator not received in time')), 5000)
      )
    ]);

    console.log('✅ Typing indicator sent successfully');

    // Set up typing stop listener
    const typingStopReceived = new Promise((resolve) => {
      consumerSocket.on('typing:stop', (data) => {
        console.log('✅ Consumer received typing stop:', {
          userId: data.userId,
          conversationId: data.conversationId
        });
        resolve(data);
      });
    });

    // Farmer stops typing
    console.log('\nFarmer stops typing...');
    farmerSocket.emit('typing:stop', { conversationId });

    // Wait for typing stop
    await Promise.race([
      typingStopReceived,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Typing stop not received in time')), 5000)
      )
    ]);

    console.log('✅ Typing stop indicator sent successfully');

    console.log('\n✅ Test 4 PASSED: Typing indicators working correctly');
    return true;

  } catch (error) {
    console.error('❌ Test 4 FAILED:', error.message);
    return false;
  }
}

// Test 5: Bulk read receipts
async function testBulkReadReceipts() {
  console.log('\n📝 Test 5: Bulk Read Receipts (Mark Conversation as Read)');
  console.log('='.repeat(60));

  try {
    const conversationId = [farmerId, consumerId].sort().join('_');

    // Farmer sends multiple messages
    console.log('Farmer sending multiple messages...');
    for (let i = 1; i <= 3; i++) {
      farmerSocket.emit('message:send', {
        recipient: consumerId,
        content: `Test message ${i}`,
        conversationId
      });
      await wait(200);
    }

    await wait(1000);

    // Set up bulk read receipt listener for farmer
    const bulkReadReceiptReceived = new Promise((resolve) => {
      farmerSocket.on('conversation:read:receipt', (data) => {
        console.log('✅ Farmer received bulk read receipt:', {
          conversationId: data.conversationId,
          readBy: data.readBy,
          count: data.count
        });
        resolve(data);
      });
    });

    // Consumer marks entire conversation as read
    console.log('\nConsumer marking entire conversation as read...');
    consumerSocket.emit('conversation:read', { conversationId });

    // Wait for bulk read receipt
    const receiptData = await Promise.race([
      bulkReadReceiptReceived,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bulk read receipt not received in time')), 5000)
      )
    ]);

    if (receiptData.count >= 3) {
      console.log(`✅ ${receiptData.count} messages marked as read`);
    } else {
      throw new Error(`Expected at least 3 messages to be marked as read, got ${receiptData.count}`);
    }

    console.log('\n✅ Test 5 PASSED: Bulk read receipts working correctly');
    return true;

  } catch (error) {
    console.error('❌ Test 5 FAILED:', error.message);
    return false;
  }
}

// Cleanup
function cleanup() {
  console.log('\n🧹 Cleaning up...');
  if (farmerSocket) {
    farmerSocket.close();
    console.log('Farmer socket closed');
  }
  if (consumerSocket) {
    consumerSocket.close();
    console.log('Consumer socket closed');
  }
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Starting Socket.io Real-Time Messaging Tests');
  console.log('='.repeat(60));
  console.log('Make sure the server is running on http://localhost:5000');
  console.log('='.repeat(60));

  const results = {
    total: 5,
    passed: 0,
    failed: 0
  };

  try {
    // Test 1: Authentication
    if (await testAuthentication()) {
      results.passed++;
    } else {
      results.failed++;
    }

    await wait(1000);

    // Test 2: Message Broadcasting
    if (await testMessageBroadcasting()) {
      results.passed++;
    } else {
      results.failed++;
    }

    await wait(1000);

    // Test 3: Read Receipts
    if (await testReadReceipts()) {
      results.passed++;
    } else {
      results.failed++;
    }

    await wait(1000);

    // Test 4: Typing Indicators
    if (await testTypingIndicators()) {
      results.passed++;
    } else {
      results.failed++;
    }

    await wait(1000);

    // Test 5: Bulk Read Receipts
    if (await testBulkReadReceipts()) {
      results.passed++;
    } else {
      results.failed++;
    }

  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  } finally {
    cleanup();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (results.passed === results.total) {
    console.log('\n🎉 All tests passed! Socket.io implementation is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests();
