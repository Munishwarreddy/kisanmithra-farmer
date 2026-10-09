/**
 * Test script for Message API endpoints
 * Tests Requirements 9.1-9.6
 * 
 * Run with: node test-messages.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test users (will be created during test)
let consumerToken = '';
let farmerToken = '';
let consumerId = '';
let farmerId = '';
let conversationId = '';
let messageId = '';

// Helper function to log test results
const logTest = (testName, passed, details = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (details) console.log(`   ${details}`);
};

// Helper function to handle errors
const handleError = (error, testName) => {
  if (error.response) {
    logTest(testName, false, `Status: ${error.response.status}, Message: ${error.response.data.message}`);
  } else {
    logTest(testName, false, error.message);
  }
};

// Test 1: Register test users
async function registerUsers() {
  console.log('\n📝 Test 1: Register Test Users');
  
  try {
    // Register consumer
    const consumerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Consumer',
      email: `consumer_${Date.now()}@test.com`,
      password: 'password123',
      role: 'consumer'
    });
    
    consumerToken = consumerRes.data.token;
    consumerId = consumerRes.data.user._id;
    logTest('Register consumer', true, `Consumer ID: ${consumerId}`);
    
    // Register farmer
    const farmerRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Farmer',
      email: `farmer_${Date.now()}@test.com`,
      password: 'password123',
      role: 'farmer'
    });
    
    farmerToken = farmerRes.data.token;
    farmerId = farmerRes.data.user._id;
    logTest('Register farmer', true, `Farmer ID: ${farmerId}`);
    
    return true;
  } catch (error) {
    handleError(error, 'Register users');
    return false;
  }
}

// Test 2: Send message (Requirement 9.1, 9.2)
async function testSendMessage() {
  console.log('\n📝 Test 2: Send Message (Requirements 9.1, 9.2)');
  
  try {
    // Consumer sends message to farmer
    const response = await axios.post(
      `${BASE_URL}/messages`,
      {
        recipient: farmerId,
        content: 'Hello, I am interested in your organic vegetables!'
      },
      {
        headers: { Authorization: `Bearer ${consumerToken}` }
      }
    );
    
    const message = response.data.data;
    messageId = message._id;
    conversationId = message.conversationId;
    
    // Verify message structure
    const hasRequiredFields = 
      message.conversationId &&
      message.sender &&
      message.recipient &&
      message.content &&
      message.hasOwnProperty('isRead') &&
      message.createdAt;
    
    logTest(
      'Send message with required fields',
      hasRequiredFields,
      `Message ID: ${messageId}, Conversation ID: ${conversationId}`
    );
    
    // Verify sender and recipient are correct
    const correctUsers = 
      message.sender._id === consumerId &&
      message.recipient._id === farmerId;
    
    logTest('Correct sender and recipient', correctUsers);
    
    // Verify message is initially unread
    logTest('Message initially unread', message.isRead === false);
    
    return true;
  } catch (error) {
    handleError(error, 'Send message');
    return false;
  }
}

// Test 3: Send message with validation errors
async function testSendMessageValidation() {
  console.log('\n📝 Test 3: Send Message Validation');
  
  try {
    // Test empty content
    try {
      await axios.post(
        `${BASE_URL}/messages`,
        {
          recipient: farmerId,
          content: '   '
        },
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      logTest('Reject empty content', false, 'Should have rejected empty content');
    } catch (error) {
      logTest('Reject empty content', error.response?.status === 400);
    }
    
    // Test missing recipient
    try {
      await axios.post(
        `${BASE_URL}/messages`,
        {
          content: 'Test message'
        },
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      logTest('Reject missing recipient', false, 'Should have rejected missing recipient');
    } catch (error) {
      logTest('Reject missing recipient', error.response?.status === 400);
    }
    
    // Test non-existent recipient
    try {
      await axios.post(
        `${BASE_URL}/messages`,
        {
          recipient: '507f1f77bcf86cd799439011',
          content: 'Test message'
        },
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      logTest('Reject non-existent recipient', false, 'Should have rejected non-existent recipient');
    } catch (error) {
      logTest('Reject non-existent recipient', error.response?.status === 404);
    }
    
    return true;
  } catch (error) {
    handleError(error, 'Send message validation');
    return false;
  }
}

// Test 4: Get conversations (Requirement 9.3)
async function testGetConversations() {
  console.log('\n📝 Test 4: Get Conversations (Requirement 9.3)');
  
  try {
    // Farmer gets conversations
    const response = await axios.get(
      `${BASE_URL}/messages/conversations`,
      {
        headers: { Authorization: `Bearer ${farmerToken}` }
      }
    );
    
    const conversations = response.data.data;
    
    // Verify conversations array exists
    logTest('Get conversations array', Array.isArray(conversations));
    
    // Verify conversation exists
    const hasConversation = conversations.length > 0;
    logTest('Has at least one conversation', hasConversation);
    
    if (hasConversation) {
      const conversation = conversations[0];
      
      // Verify conversation structure
      const hasRequiredFields = 
        conversation.conversationId &&
        conversation.otherUser &&
        conversation.lastMessage &&
        conversation.hasOwnProperty('unreadCount');
      
      logTest('Conversation has required fields', hasRequiredFields);
      
      // Verify other user is the consumer
      logTest(
        'Other user is correct',
        conversation.otherUser._id === consumerId
      );
      
      // Verify unread count
      logTest(
        'Unread count is correct',
        conversation.unreadCount === 1,
        `Unread count: ${conversation.unreadCount}`
      );
    }
    
    return true;
  } catch (error) {
    handleError(error, 'Get conversations');
    return false;
  }
}

// Test 5: Get messages in conversation (Requirement 9.4)
async function testGetMessages() {
  console.log('\n📝 Test 5: Get Messages in Conversation (Requirement 9.4)');
  
  try {
    // Farmer gets messages in conversation
    const response = await axios.get(
      `${BASE_URL}/messages/${conversationId}`,
      {
        headers: { Authorization: `Bearer ${farmerToken}` }
      }
    );
    
    const messages = response.data.data;
    
    // Verify messages array exists
    logTest('Get messages array', Array.isArray(messages));
    
    // Verify messages exist
    logTest('Has messages', messages.length > 0);
    
    if (messages.length > 0) {
      // Verify chronological order (oldest first)
      let isChronological = true;
      for (let i = 1; i < messages.length; i++) {
        if (new Date(messages[i].createdAt) < new Date(messages[i-1].createdAt)) {
          isChronological = false;
          break;
        }
      }
      logTest('Messages in chronological order', isChronological);
    }
    
    // Test unauthorized access
    try {
      const unauthorizedConversationId = `${farmerId}_507f1f77bcf86cd799439011`;
      await axios.get(
        `${BASE_URL}/messages/${unauthorizedConversationId}`,
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      logTest('Reject unauthorized conversation access', false);
    } catch (error) {
      logTest('Reject unauthorized conversation access', error.response?.status === 403);
    }
    
    return true;
  } catch (error) {
    handleError(error, 'Get messages');
    return false;
  }
}

// Test 6: Mark message as read (Requirement 9.5, 9.6)
async function testMarkAsRead() {
  console.log('\n📝 Test 6: Mark Message as Read (Requirements 9.5, 9.6)');
  
  try {
    // Farmer marks message as read
    const response = await axios.put(
      `${BASE_URL}/messages/${messageId}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${farmerToken}` }
      }
    );
    
    const message = response.data.data;
    
    // Verify message is marked as read
    logTest('Message marked as read', message.isRead === true);
    
    // Verify readAt timestamp is set
    logTest('ReadAt timestamp set', message.readAt !== null && message.readAt !== undefined);
    
    // Verify unread indicator is updated
    const conversationsRes = await axios.get(
      `${BASE_URL}/messages/conversations`,
      {
        headers: { Authorization: `Bearer ${farmerToken}` }
      }
    );
    
    const conversations = conversationsRes.data.data;
    const conversation = conversations.find(c => c.conversationId === conversationId);
    
    logTest(
      'Unread count updated',
      conversation.unreadCount === 0,
      `Unread count: ${conversation.unreadCount}`
    );
    
    // Test unauthorized mark as read (consumer trying to mark their own sent message)
    try {
      await axios.put(
        `${BASE_URL}/messages/${messageId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      logTest('Reject unauthorized mark as read', false);
    } catch (error) {
      logTest('Reject unauthorized mark as read', error.response?.status === 403);
    }
    
    return true;
  } catch (error) {
    handleError(error, 'Mark message as read');
    return false;
  }
}

// Test 7: Two-way conversation
async function testTwoWayConversation() {
  console.log('\n📝 Test 7: Two-Way Conversation');
  
  try {
    // Farmer replies to consumer
    const response = await axios.post(
      `${BASE_URL}/messages`,
      {
        recipient: consumerId,
        content: 'Thank you for your interest! We have fresh organic vegetables available.'
      },
      {
        headers: { Authorization: `Bearer ${farmerToken}` }
      }
    );
    
    const message = response.data.data;
    
    // Verify same conversationId is used
    logTest(
      'Same conversation ID for reply',
      message.conversationId === conversationId
    );
    
    // Consumer gets messages
    const messagesRes = await axios.get(
      `${BASE_URL}/messages/${conversationId}`,
      {
        headers: { Authorization: `Bearer ${consumerToken}` }
      }
    );
    
    const messages = messagesRes.data.data;
    
    // Verify both messages are in conversation
    logTest('Both messages in conversation', messages.length === 2);
    
    // Verify chronological order
    if (messages.length === 2) {
      const isChronological = 
        new Date(messages[0].createdAt) < new Date(messages[1].createdAt);
      logTest('Messages in chronological order', isChronological);
    }
    
    return true;
  } catch (error) {
    handleError(error, 'Two-way conversation');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Message API Tests');
  console.log('================================');
  
  const results = [];
  
  results.push(await registerUsers());
  if (!results[0]) {
    console.log('\n❌ Failed to register users. Stopping tests.');
    return;
  }
  
  results.push(await testSendMessage());
  results.push(await testSendMessageValidation());
  results.push(await testGetConversations());
  results.push(await testGetMessages());
  results.push(await testMarkAsRead());
  results.push(await testTwoWayConversation());
  
  // Summary
  console.log('\n================================');
  console.log('📊 Test Summary');
  console.log('================================');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`Total: ${total} test suites`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  
  if (passed === total) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
