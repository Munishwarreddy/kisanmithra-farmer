/**
 * Test script for Notification Service
 * 
 * This script tests the centralized notification service that handles:
 * - Order status change notifications (Requirement 14.1)
 * - New message notifications (Requirement 14.2)
 * - Subscription reminder notifications (Requirement 14.3)
 * - Contract action notifications (Requirement 14.4)
 * - New product notifications for saved farmers (Requirement 14.5)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const notificationService = require('./services/notificationService');
const Notification = require('./models/NotificationModel');
const User = require('./models/UserModel');
const Order = require('./models/OrderModel');
const Product = require('./models/ProductModel');
const Subscription = require('./models/SubscriptionModel');
const Contract = require('./models/ContractModel');

// Test data
let testConsumer, testFarmer, testProduct, testOrder, testSubscription, testContract;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisanmithra');
    log('✓ Connected to MongoDB', 'green');
  } catch (error) {
    log(`✗ MongoDB connection error: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Setup test data
const setupTestData = async () => {
  log('\n=== Setting up test data ===', 'blue');

  try {
    // Create test consumer
    testConsumer = await User.create({
      name: 'Test Consumer',
      email: `consumer_${Date.now()}@test.com`,
      password: 'password123',
      role: 'consumer',
    });
    log(`✓ Created test consumer: ${testConsumer.email}`, 'green');

    // Create test farmer
    testFarmer = await User.create({
      name: 'Test Farmer',
      email: `farmer_${Date.now()}@test.com`,
      password: 'password123',
      role: 'farmer',
    });
    log(`✓ Created test farmer: ${testFarmer.email}`, 'green');

    // Create test product
    testProduct = await Product.create({
      name: 'Test Tomatoes',
      description: 'Fresh organic tomatoes',
      price: 50,
      unit: 'kg',
      farmer: testFarmer._id,
      category: new mongoose.Types.ObjectId(),
      images: ['test.jpg'],
      inStock: true,
      quantityAvailable: 100,
    });
    log(`✓ Created test product: ${testProduct.name}`, 'green');

    // Create test order
    testOrder = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      consumer: testConsumer._id,
      farmer: testFarmer._id,
      items: [{
        product: testProduct._id,
        name: testProduct.name,
        quantity: 5,
        price: testProduct.price,
        unit: testProduct.unit,
      }],
      subtotal: 250,
      deliveryFee: 0,
      tax: 0,
      totalAmount: 250,
      status: 'placed',
      paymentMethod: 'card',
      paymentStatus: 'pending',
      deliveryAddress: {
        name: 'Test Consumer',
        phone: '1234567890',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
      },
    });
    log(`✓ Created test order: ${testOrder.orderNumber}`, 'green');

    // Create test subscription
    testSubscription = await Subscription.create({
      consumer: testConsumer._id,
      farmer: testFarmer._id,
      product: testProduct._id,
      quantity: 2,
      frequency: 'weekly',
      startDate: new Date(),
      nextDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: 'active',
      deliveryAddress: {
        name: 'Test Consumer',
        phone: '1234567890',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
      },
      paymentMethod: 'card',
    });
    log(`✓ Created test subscription`, 'green');

    // Create test contract
    testContract = await Contract.create({
      contractNumber: `CNT-${Date.now()}`,
      initiator: testConsumer._id,
      recipient: testFarmer._id,
      product: testProduct._id,
      quantity: 100,
      unit: 'kg',
      pricePerUnit: 45,
      totalValue: 4500,
      duration: 3,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
      deliverySchedule: 'monthly',
      terms: 'Test contract terms',
      status: 'pending',
      deliveries: [],
    });
    log(`✓ Created test contract: ${testContract.contractNumber}`, 'green');

  } catch (error) {
    log(`✗ Error setting up test data: ${error.message}`, 'red');
    throw error;
  }
};

// Test 1: Order status change notification
const testOrderStatusNotification = async () => {
  log('\n=== Test 1: Order Status Change Notification (Requirement 14.1) ===', 'blue');

  try {
    const oldStatus = testOrder.status;
    testOrder.status = 'confirmed';

    const notification = await notificationService.notifyOrderStatusChange(
      testConsumer._id,
      testOrder,
      oldStatus
    );

    log(`✓ Created order status notification: ${notification._id}`, 'green');
    log(`  Title: ${notification.title}`, 'cyan');
    log(`  Message: ${notification.message}`, 'cyan');
    log(`  Type: ${notification.type}`, 'cyan');
    log(`  Link: ${notification.link}`, 'cyan');

    // Verify notification was created
    const savedNotification = await Notification.findById(notification._id);
    if (!savedNotification) {
      throw new Error('Notification not found in database');
    }

    // Verify notification fields
    if (savedNotification.user.toString() !== testConsumer._id.toString()) {
      throw new Error('Notification user mismatch');
    }
    if (savedNotification.type !== 'order') {
      throw new Error('Notification type should be "order"');
    }
    if (!savedNotification.metadata.orderId) {
      throw new Error('Notification metadata missing orderId');
    }

    log('✓ Order status notification test passed', 'green');
  } catch (error) {
    log(`✗ Order status notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 2: Order completion review prompt notification
const testOrderCompletionReviewNotification = async () => {
  log('\n=== Test 2: Order Completion Review Prompt (Requirement 11.8) ===', 'blue');

  try {
    const productNames = testOrder.items.map(item => item.name);

    const notification = await notificationService.notifyOrderCompletionReview(
      testConsumer._id,
      testOrder,
      productNames
    );

    log(`✓ Created review prompt notification: ${notification._id}`, 'green');
    log(`  Title: ${notification.title}`, 'cyan');
    log(`  Message: ${notification.message}`, 'cyan');
    log(`  Type: ${notification.type}`, 'cyan');

    // Verify notification
    if (notification.type !== 'review') {
      throw new Error('Notification type should be "review"');
    }
    if (!notification.message.includes(productNames[0])) {
      throw new Error('Notification should include product name');
    }

    log('✓ Order completion review notification test passed', 'green');
  } catch (error) {
    log(`✗ Order completion review notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 3: New message notification
const testNewMessageNotification = async () => {
  log('\n=== Test 3: New Message Notification (Requirement 14.2) ===', 'blue');

  try {
    const conversationId = `${testConsumer._id}_${testFarmer._id}`;
    const messageId = new mongoose.Types.ObjectId();

    const notification = await notificationService.notifyNewMessage(
      testFarmer._id,
      testConsumer.name,
      testConsumer._id,
      conversationId,
      messageId
    );

    log(`✓ Created message notification: ${notification._id}`, 'green');
    log(`  Title: ${notification.title}`, 'cyan');
    log(`  Message: ${notification.message}`, 'cyan');
    log(`  Type: ${notification.type}`, 'cyan');

    // Verify notification
    if (notification.type !== 'message') {
      throw new Error('Notification type should be "message"');
    }
    if (!notification.message.includes(testConsumer.name)) {
      throw new Error('Notification should include sender name');
    }
    if (!notification.metadata.conversationId) {
      throw new Error('Notification metadata missing conversationId');
    }

    log('✓ New message notification test passed', 'green');
  } catch (error) {
    log(`✗ New message notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 4: Subscription reminder notification
const testSubscriptionReminderNotification = async () => {
  log('\n=== Test 4: Subscription Reminder Notification (Requirement 14.3) ===', 'blue');

  try {
    const notification = await notificationService.notifySubscriptionReminder(
      testConsumer._id,
      testSubscription,
      testProduct.name
    );

    log(`✓ Created subscription reminder: ${notification._id}`, 'green');
    log(`  Title: ${notification.title}`, 'cyan');
    log(`  Message: ${notification.message}`, 'cyan');
    log(`  Type: ${notification.type}`, 'cyan');

    // Verify notification
    if (notification.type !== 'subscription') {
      throw new Error('Notification type should be "subscription"');
    }
    if (!notification.message.includes('2 days')) {
      throw new Error('Notification should mention 2 days');
    }
    if (!notification.metadata.subscriptionId) {
      throw new Error('Notification metadata missing subscriptionId');
    }

    log('✓ Subscription reminder notification test passed', 'green');
  } catch (error) {
    log(`✗ Subscription reminder notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 5: Subscription order created notifications
const testSubscriptionOrderNotifications = async () => {
  log('\n=== Test 5: Subscription Order Created Notifications ===', 'blue');

  try {
    // Consumer notification
    const consumerNotif = await notificationService.notifySubscriptionOrderCreated(
      testConsumer._id,
      testOrder,
      testProduct.name,
      'consumer'
    );

    log(`✓ Created consumer subscription order notification: ${consumerNotif._id}`, 'green');
    log(`  Message: ${consumerNotif.message}`, 'cyan');

    // Farmer notification
    const farmerNotif = await notificationService.notifySubscriptionOrderCreated(
      testFarmer._id,
      testOrder,
      testProduct.name,
      'farmer',
      testConsumer.name
    );

    log(`✓ Created farmer subscription order notification: ${farmerNotif._id}`, 'green');
    log(`  Message: ${farmerNotif.message}`, 'cyan');

    // Verify notifications
    if (consumerNotif.type !== 'subscription' || farmerNotif.type !== 'subscription') {
      throw new Error('Notification type should be "subscription"');
    }

    log('✓ Subscription order notifications test passed', 'green');
  } catch (error) {
    log(`✗ Subscription order notifications test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 6: Contract proposal notification
const testContractProposalNotification = async () => {
  log('\n=== Test 6: Contract Proposal Notification (Requirement 14.4) ===', 'blue');

  try {
    const notification = await notificationService.notifyContractProposal(
      testFarmer._id,
      testConsumer.name,
      testContract,
      testProduct.name
    );

    log(`✓ Created contract proposal notification: ${notification._id}`, 'green');
    log(`  Title: ${notification.title}`, 'cyan');
    log(`  Message: ${notification.message}`, 'cyan');
    log(`  Type: ${notification.type}`, 'cyan');

    // Verify notification
    if (notification.type !== 'contract') {
      throw new Error('Notification type should be "contract"');
    }
    if (!notification.message.includes(testConsumer.name)) {
      throw new Error('Notification should include initiator name');
    }
    if (!notification.metadata.contractNumber) {
      throw new Error('Notification metadata missing contractNumber');
    }

    log('✓ Contract proposal notification test passed', 'green');
  } catch (error) {
    log(`✗ Contract proposal notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 7: Contract acceptance notification
const testContractAcceptanceNotification = async () => {
  log('\n=== Test 7: Contract Acceptance Notification ===', 'blue');

  try {
    const notification = await notificationService.notifyContractAccepted(
      testConsumer._id,
      testFarmer.name,
      testContract,
      testProduct.name
    );

    log(`✓ Created contract acceptance notification: ${notification._id}`, 'green');
    log(`  Title: ${notification.title}`, 'cyan');
    log(`  Message: ${notification.message}`, 'cyan');

    // Verify notification
    if (notification.type !== 'contract') {
      throw new Error('Notification type should be "contract"');
    }
    if (!notification.message.includes('accepted')) {
      throw new Error('Notification should mention acceptance');
    }

    log('✓ Contract acceptance notification test passed', 'green');
  } catch (error) {
    log(`✗ Contract acceptance notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 8: Contract delivery order notification
const testContractDeliveryOrderNotification = async () => {
  log('\n=== Test 8: Contract Delivery Order Notification ===', 'blue');

  try {
    const notification = await notificationService.notifyContractDeliveryOrder(
      testConsumer._id,
      testOrder,
      testContract,
      testProduct.name
    );

    log(`✓ Created contract delivery order notification: ${notification._id}`, 'green');
    log(`  Title: ${notification.title}`, 'cyan');
    log(`  Message: ${notification.message}`, 'cyan');

    // Verify notification
    if (notification.type !== 'contract') {
      throw new Error('Notification type should be "contract"');
    }
    if (!notification.metadata.contractNumber) {
      throw new Error('Notification metadata missing contractNumber');
    }

    log('✓ Contract delivery order notification test passed', 'green');
  } catch (error) {
    log(`✗ Contract delivery order notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 9: New product from saved farmer notification
const testNewProductNotification = async () => {
  log('\n=== Test 9: New Product from Saved Farmer Notification (Requirement 14.5) ===', 'blue');

  try {
    // Create multiple test consumers
    const consumer2 = await User.create({
      name: 'Test Consumer 2',
      email: `consumer2_${Date.now()}@test.com`,
      password: 'password123',
      role: 'consumer',
    });

    const consumerIds = [testConsumer._id, consumer2._id];

    const notifications = await notificationService.notifyNewProductFromSavedFarmer(
      consumerIds,
      testFarmer.name,
      testFarmer._id,
      testProduct._id,
      testProduct.name
    );

    log(`✓ Created ${notifications.length} new product notifications`, 'green');
    
    notifications.forEach((notif, index) => {
      log(`  Notification ${index + 1}:`, 'cyan');
      log(`    Title: ${notif.title}`, 'cyan');
      log(`    Message: ${notif.message}`, 'cyan');
    });

    // Verify notifications
    if (notifications.length !== 2) {
      throw new Error('Should create 2 notifications');
    }
    if (notifications[0].type !== 'product') {
      throw new Error('Notification type should be "product"');
    }
    if (!notifications[0].message.includes(testFarmer.name)) {
      throw new Error('Notification should include farmer name');
    }

    log('✓ New product notification test passed', 'green');
  } catch (error) {
    log(`✗ New product notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 10: System notification
const testSystemNotification = async () => {
  log('\n=== Test 10: System Notification ===', 'blue');

  try {
    const notification = await notificationService.notifySystem(
      testConsumer._id,
      'System Maintenance',
      'The platform will undergo maintenance on Sunday at 2 AM',
      '/announcements/maintenance',
      { maintenanceDate: new Date() }
    );

    log(`✓ Created system notification: ${notification._id}`, 'green');
    log(`  Title: ${notification.title}`, 'cyan');
    log(`  Message: ${notification.message}`, 'cyan');
    log(`  Type: ${notification.type}`, 'cyan');

    // Verify notification
    if (notification.type !== 'system') {
      throw new Error('Notification type should be "system"');
    }

    log('✓ System notification test passed', 'green');
  } catch (error) {
    log(`✗ System notification test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Test 11: Verify notification count
const testNotificationCount = async () => {
  log('\n=== Test 11: Verify Notification Count ===', 'blue');

  try {
    const consumerNotifications = await Notification.find({ user: testConsumer._id });
    const farmerNotifications = await Notification.find({ user: testFarmer._id });

    log(`✓ Consumer has ${consumerNotifications.length} notifications`, 'green');
    log(`✓ Farmer has ${farmerNotifications.length} notifications`, 'green');

    // Verify consumer has multiple notifications
    if (consumerNotifications.length < 5) {
      throw new Error('Consumer should have at least 5 notifications');
    }

    log('✓ Notification count test passed', 'green');
  } catch (error) {
    log(`✗ Notification count test failed: ${error.message}`, 'red');
    throw error;
  }
};

// Cleanup test data
const cleanup = async () => {
  log('\n=== Cleaning up test data ===', 'blue');

  try {
    // Delete all test notifications
    await Notification.deleteMany({
      $or: [
        { user: testConsumer._id },
        { user: testFarmer._id },
      ],
    });
    log('✓ Deleted test notifications', 'green');

    // Delete test data
    if (testOrder) await Order.findByIdAndDelete(testOrder._id);
    if (testSubscription) await Subscription.findByIdAndDelete(testSubscription._id);
    if (testContract) await Contract.findByIdAndDelete(testContract._id);
    if (testProduct) await Product.findByIdAndDelete(testProduct._id);
    
    // Delete test users (and any additional consumers created)
    await User.deleteMany({
      email: { $regex: /^(consumer|farmer)_.*@test\.com$/ },
    });
    
    log('✓ Deleted test data', 'green');
  } catch (error) {
    log(`✗ Cleanup error: ${error.message}`, 'red');
  }
};

// Main test runner
const runTests = async () => {
  log('🚀 Starting Notification Service Tests', 'yellow');
  log('=' .repeat(70), 'yellow');

  try {
    await connectDB();
    await setupTestData();

    // Run all tests
    await testOrderStatusNotification();
    await testOrderCompletionReviewNotification();
    await testNewMessageNotification();
    await testSubscriptionReminderNotification();
    await testSubscriptionOrderNotifications();
    await testContractProposalNotification();
    await testContractAcceptanceNotification();
    await testContractDeliveryOrderNotification();
    await testNewProductNotification();
    await testSystemNotification();
    await testNotificationCount();

    log('\n' + '='.repeat(70), 'yellow');
    log('✓ All notification service tests passed!', 'green');
    log('=' .repeat(70), 'yellow');

  } catch (error) {
    log('\n' + '='.repeat(70), 'yellow');
    log('✗ Tests failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    log('=' .repeat(70), 'yellow');
  } finally {
    await cleanup();
    await mongoose.connection.close();
    log('\n✓ Disconnected from MongoDB', 'green');
  }
};

// Run tests
runTests();
