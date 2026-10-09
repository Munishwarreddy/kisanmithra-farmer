/**
 * Verification script for Task 9.1: Order API Enhancements
 * 
 * This script verifies the implementation without requiring MongoDB
 * It checks:
 * - File existence
 * - Function exports
 * - Route definitions
 * - Code structure
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

let passCount = 0;
let failCount = 0;

const checkFile = (filePath, description) => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    log.success(`${description}: ${filePath}`);
    passCount++;
    return true;
  } else {
    log.error(`${description} not found: ${filePath}`);
    failCount++;
    return false;
  }
};

const checkFileContains = (filePath, searchString, description) => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    log.error(`File not found: ${filePath}`);
    failCount++;
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(searchString)) {
    log.success(`${description}`);
    passCount++;
    return true;
  } else {
    log.error(`${description} - Not found: "${searchString}"`);
    failCount++;
    return false;
  }
};

const checkMultipleStrings = (filePath, strings, description) => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    log.error(`File not found: ${filePath}`);
    failCount++;
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const allFound = strings.every(str => content.includes(str));
  
  if (allFound) {
    log.success(`${description}`);
    passCount++;
    return true;
  } else {
    const missing = strings.filter(str => !content.includes(str));
    log.error(`${description} - Missing: ${missing.join(', ')}`);
    failCount++;
    return false;
  }
};

console.log('\n' + '='.repeat(70));
console.log('🔍 TASK 9.1: ORDER API ENHANCEMENTS - VERIFICATION');
console.log('='.repeat(70) + '\n');

// 1. Check order controller enhancements
log.info('Checking Order Controller...');
checkFile('controllers/orderController.js', 'Order controller exists');
checkFileContains(
  'controllers/orderController.js',
  'const Notification = require("../models/NotificationModel")',
  'Notification model imported'
);
checkFileContains(
  'controllers/orderController.js',
  'const { emitToUser } = require("../services/socketService")',
  'Socket service imported'
);
checkFileContains(
  'controllers/orderController.js',
  'exports.reorderFromOrder',
  'Reorder function exported'
);
checkFileContains(
  'controllers/orderController.js',
  'exports.getOrderTracking',
  'Get tracking function exported'
);
checkMultipleStrings(
  'controllers/orderController.js',
  ['trackingInfo', 'deliveryDate', 'Notification.create'],
  'Enhanced updateOrderStatus with tracking and notifications'
);

console.log('');

// 2. Check order routes
log.info('Checking Order Routes...');
checkFile('routes/orderRoutes.js', 'Order routes file exists');
checkFileContains(
  'routes/orderRoutes.js',
  'reorderFromOrder',
  'Reorder function imported'
);
checkFileContains(
  'routes/orderRoutes.js',
  'getOrderTracking',
  'Get tracking function imported'
);
checkFileContains(
  'routes/orderRoutes.js',
  'router.post("/reorder/:id"',
  'Reorder route defined'
);
checkFileContains(
  'routes/orderRoutes.js',
  'router.get("/:id/tracking"',
  'Tracking route defined'
);
checkFileContains(
  'routes/orderRoutes.js',
  'router.put("/:id/status"',
  'Status update route defined'
);

console.log('');

// 3. Check notification controller
log.info('Checking Notification Controller...');
checkFile('controllers/notificationController.js', 'Notification controller exists');
checkFileContains(
  'controllers/notificationController.js',
  'exports.getNotifications',
  'Get notifications function exported'
);
checkFileContains(
  'controllers/notificationController.js',
  'exports.markAsRead',
  'Mark as read function exported'
);
checkFileContains(
  'controllers/notificationController.js',
  'exports.markAllAsRead',
  'Mark all as read function exported'
);
checkFileContains(
  'controllers/notificationController.js',
  'exports.deleteNotification',
  'Delete notification function exported'
);
checkFileContains(
  'controllers/notificationController.js',
  'exports.getUnreadCount',
  'Get unread count function exported'
);

console.log('');

// 4. Check notification routes
log.info('Checking Notification Routes...');
checkFile('routes/notificationRoutes.js', 'Notification routes file exists');
checkMultipleStrings(
  'routes/notificationRoutes.js',
  [
    'getNotifications',
    'markAsRead',
    'markAllAsRead',
    'deleteNotification',
    'getUnreadCount'
  ],
  'All notification functions imported'
);
checkMultipleStrings(
  'routes/notificationRoutes.js',
  [
    'router.get("/"',
    'router.get("/unread-count"',
    'router.put("/read-all"',
    'router.put("/:id/read"',
    'router.delete("/:id"'
  ],
  'All notification routes defined'
);

console.log('');

// 5. Check server integration
log.info('Checking Server Integration...');
checkFileContains(
  'server.js',
  'const notificationRoutes = require(\'./routes/notificationRoutes\')',
  'Notification routes imported in server.js'
);
checkFileContains(
  'server.js',
  'app.use(\'/api/notifications\', notificationRoutes)',
  'Notification routes registered in server.js'
);

console.log('');

// 6. Check documentation
log.info('Checking Documentation...');
checkFile('docs/TASK_9.1_ORDER_ENHANCEMENTS.md', 'Implementation documentation exists');
checkFile('test-order-enhancements.js', 'Test file exists');

console.log('');

// 7. Check Order Model has required fields
log.info('Checking Order Model...');
checkMultipleStrings(
  'models/OrderModel.js',
  ['trackingInfo', 'deliveryDate', 'orderNumber'],
  'Order model has required fields'
);

console.log('');

// 8. Check Notification Model
log.info('Checking Notification Model...');
checkFile('models/NotificationModel.js', 'Notification model exists');
checkMultipleStrings(
  'models/NotificationModel.js',
  ['user', 'type', 'title', 'message', 'isRead', 'metadata'],
  'Notification model has required fields'
);

console.log('');

// Summary
console.log('='.repeat(70));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log(`${colors.green}✅ Passed: ${passCount}${colors.reset}`);
console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
console.log(`📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
console.log('='.repeat(70) + '\n');

if (failCount === 0) {
  log.success('All verification checks passed! ✨');
  console.log('\n📝 Next Steps:');
  console.log('   1. Start MongoDB (see api/docs/MONGODB_SETUP.md)');
  console.log('   2. Start the server: npm run dev');
  console.log('   3. Run tests: node test-order-enhancements.js');
  console.log('');
  process.exit(0);
} else {
  log.error('Some verification checks failed. Please review the errors above.');
  console.log('');
  process.exit(1);
}
