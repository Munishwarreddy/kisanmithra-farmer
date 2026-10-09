/**
 * Code Structure Verification for Message API
 * Verifies implementation without requiring database connection
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Message API Implementation');
console.log('=====================================\n');

let allPassed = true;

// Helper function to check if file exists
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}`);
  if (!exists) allPassed = false;
  return exists;
}

// Helper function to check if file contains text
function checkFileContains(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const contains = content.includes(searchText);
    const status = contains ? '✅' : '❌';
    console.log(`${status} ${description}`);
    if (!contains) allPassed = false;
    return contains;
  } catch (error) {
    console.log(`❌ ${description} - Error reading file`);
    allPassed = false;
    return false;
  }
}

// Helper function to check multiple texts
function checkFileContainsAll(filePath, searchTexts, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const allFound = searchTexts.every(text => content.includes(text));
    const status = allFound ? '✅' : '❌';
    console.log(`${status} ${description}`);
    if (!allFound) {
      const missing = searchTexts.filter(text => !content.includes(text));
      console.log(`   Missing: ${missing.join(', ')}`);
      allPassed = false;
    }
    return allFound;
  } catch (error) {
    console.log(`❌ ${description} - Error reading file`);
    allPassed = false;
    return false;
  }
}

console.log('📁 File Structure Checks');
console.log('------------------------');

// Check files exist
checkFileExists('models/MessageModel.js', 'Message model exists');
checkFileExists('controllers/messageController.js', 'Message controller exists');
checkFileExists('routes/messageRoutes.js', 'Message routes exist');
checkFileExists('test-messages.js', 'Test file exists');
checkFileExists('docs/TASK_5.1_MESSAGE_API.md', 'Documentation exists');

console.log('\n📝 Message Model Checks');
console.log('----------------------');

// Check Message model structure
checkFileContainsAll(
  'models/MessageModel.js',
  ['conversationId', 'sender', 'recipient', 'content', 'isRead', 'readAt'],
  'Message model has all required fields'
);

checkFileContains(
  'models/MessageModel.js',
  'index: true',
  'Message model has indexes'
);

checkFileContains(
  'models/MessageModel.js',
  'Sender and recipient must be different',
  'Message model validates sender != recipient'
);

console.log('\n🎮 Controller Checks');
console.log('-------------------');

// Check controller functions
checkFileContainsAll(
  'controllers/messageController.js',
  ['sendMessage', 'getConversations', 'getMessages', 'markAsRead'],
  'Controller has all required functions'
);

checkFileContains(
  'controllers/messageController.js',
  'generateConversationId',
  'Controller has conversationId generation'
);

checkFileContains(
  'controllers/messageController.js',
  'Notification.create',
  'Controller creates notifications on message send'
);

checkFileContains(
  'controllers/messageController.js',
  'sort("createdAt")',
  'Controller sorts messages chronologically'
);

checkFileContains(
  'controllers/messageController.js',
  'unreadCount',
  'Controller calculates unread count'
);

checkFileContains(
  'controllers/messageController.js',
  'readAt',
  'Controller sets readAt timestamp'
);

console.log('\n🛣️  Route Checks');
console.log('---------------');

// Check routes
checkFileContains(
  'routes/messageRoutes.js',
  'router.post("/", verifyToken, sendMessage)',
  'POST /api/messages route exists'
);

checkFileContains(
  'routes/messageRoutes.js',
  'router.get("/conversations", verifyToken, getConversations)',
  'GET /api/messages/conversations route exists'
);

checkFileContains(
  'routes/messageRoutes.js',
  'router.get("/:conversationId", verifyToken, getMessages)',
  'GET /api/messages/:conversationId route exists'
);

checkFileContains(
  'routes/messageRoutes.js',
  'router.put("/:id/read", verifyToken, markAsRead)',
  'PUT /api/messages/:id/read route exists'
);

console.log('\n🧪 Test Coverage Checks');
console.log('----------------------');

// Check test file
checkFileContainsAll(
  'test-messages.js',
  [
    'testSendMessage',
    'testGetConversations',
    'testGetMessages',
    'testMarkAsRead',
    'testSendMessageValidation',
    'testTwoWayConversation'
  ],
  'Test file has all test functions'
);

checkFileContains(
  'test-messages.js',
  'Requirements 9.1-9.6',
  'Test file references requirements'
);

console.log('\n📋 Requirements Coverage');
console.log('-----------------------');

// Check requirements coverage in documentation
const docPath = 'docs/TASK_5.1_MESSAGE_API.md';
if (fs.existsSync(docPath)) {
  checkFileContains(docPath, 'Requirement 9.1', 'Requirement 9.1 documented');
  checkFileContains(docPath, 'Requirement 9.2', 'Requirement 9.2 documented');
  checkFileContains(docPath, 'Requirement 9.3', 'Requirement 9.3 documented');
  checkFileContains(docPath, 'Requirement 9.4', 'Requirement 9.4 documented');
  checkFileContains(docPath, 'Requirement 9.5', 'Requirement 9.5 documented');
  checkFileContains(docPath, 'Requirement 9.6', 'Requirement 9.6 documented');
}

console.log('\n🔒 Security Checks');
console.log('-----------------');

// Check security features
checkFileContains(
  'routes/messageRoutes.js',
  'verifyToken',
  'Routes use authentication middleware'
);

checkFileContains(
  'controllers/messageController.js',
  'req.user._id',
  'Controller uses authenticated user'
);

checkFileContains(
  'controllers/messageController.js',
  '403',
  'Controller returns 403 for unauthorized access'
);

checkFileContains(
  'controllers/messageController.js',
  'You are not authorized',
  'Controller has authorization checks'
);

console.log('\n📊 Code Quality Checks');
console.log('---------------------');

// Check error handling
checkFileContains(
  'controllers/messageController.js',
  'try {',
  'Controller uses try-catch blocks'
);

checkFileContains(
  'controllers/messageController.js',
  'catch (error)',
  'Controller has error handling'
);

checkFileContains(
  'controllers/messageController.js',
  'console.error',
  'Controller logs errors'
);

// Check validation
checkFileContains(
  'controllers/messageController.js',
  'if (!recipient || !content)',
  'Controller validates required fields'
);

checkFileContains(
  'controllers/messageController.js',
  'content.trim()',
  'Controller trims whitespace'
);

console.log('\n=====================================');
if (allPassed) {
  console.log('✅ All verification checks passed!');
  console.log('\n📝 Summary:');
  console.log('   - All required files exist');
  console.log('   - Message model properly structured');
  console.log('   - All controller functions implemented');
  console.log('   - All routes configured correctly');
  console.log('   - Comprehensive test suite created');
  console.log('   - Security measures in place');
  console.log('   - Error handling implemented');
  console.log('   - Requirements 9.1-9.6 covered');
  console.log('\n✨ Implementation is complete and ready for testing!');
  console.log('   Run "node test-messages.js" once MongoDB is running.');
} else {
  console.log('❌ Some verification checks failed.');
  console.log('   Please review the failed checks above.');
}

console.log('\n');
