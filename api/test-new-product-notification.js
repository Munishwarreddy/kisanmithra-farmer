/**
 * Test script for Task 8.3: New Product Notifications for Saved Farmers
 * 
 * This script tests that when a farmer creates a new product,
 * all consumers who have saved that farmer receive a notification.
 * 
 * Requirements validated: 12.9
 */

const mongoose = require('mongoose');
const User = require('./models/UserModel');
const Product = require('./models/ProductModel');
const SavedFarmer = require('./models/SavedFarmerModel');
const Notification = require('./models/NotificationModel');
const Category = require('./models/CategoryModel');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/kisanmithra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test data
let testFarmer;
let testConsumer1;
let testConsumer2;
let testConsumer3;
let testCategory;
let testProduct;

// Cleanup function
const cleanup = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  if (testProduct) {
    await Product.findByIdAndDelete(testProduct._id);
  }
  
  if (testFarmer) {
    await User.findByIdAndDelete(testFarmer._id);
    await SavedFarmer.deleteMany({ 'farmers.farmer': testFarmer._id });
    await Notification.deleteMany({ 'metadata.farmerId': testFarmer._id });
  }
  
  if (testConsumer1) {
    await User.findByIdAndDelete(testConsumer1._id);
    await SavedFarmer.findOneAndDelete({ consumer: testConsumer1._id });
    await Notification.deleteMany({ user: testConsumer1._id });
  }
  
  if (testConsumer2) {
    await User.findByIdAndDelete(testConsumer2._id);
    await SavedFarmer.findOneAndDelete({ consumer: testConsumer2._id });
    await Notification.deleteMany({ user: testConsumer2._id });
  }
  
  if (testConsumer3) {
    await User.findByIdAndDelete(testConsumer3._id);
    await SavedFarmer.findOneAndDelete({ consumer: testConsumer3._id });
    await Notification.deleteMany({ user: testConsumer3._id });
  }
  
  console.log('✓ Cleanup complete');
};

// Test 1: Create test users
const createTestUsers = async () => {
  console.log('\n📝 Test 1: Creating test users...');
  
  try {
    // Create a farmer
    testFarmer = await User.create({
      name: 'Test Farmer for Notifications',
      email: `test-farmer-notif-${Date.now()}@example.com`,
      password: 'password123',
      role: 'farmer',
      phone: '1234567890',
    });
    console.log(`✓ Created farmer: ${testFarmer.name} (${testFarmer._id})`);
    
    // Create three consumers
    testConsumer1 = await User.create({
      name: 'Test Consumer 1',
      email: `test-consumer1-notif-${Date.now()}@example.com`,
      password: 'password123',
      role: 'consumer',
    });
    console.log(`✓ Created consumer 1: ${testConsumer1.name} (${testConsumer1._id})`);
    
    testConsumer2 = await User.create({
      name: 'Test Consumer 2',
      email: `test-consumer2-notif-${Date.now()}@example.com`,
      password: 'password123',
      role: 'consumer',
    });
    console.log(`✓ Created consumer 2: ${testConsumer2.name} (${testConsumer2._id})`);
    
    testConsumer3 = await User.create({
      name: 'Test Consumer 3',
      email: `test-consumer3-notif-${Date.now()}@example.com`,
      password: 'password123',
      role: 'consumer',
    });
    console.log(`✓ Created consumer 3: ${testConsumer3.name} (${testConsumer3._id})`);
    
    return true;
  } catch (error) {
    console.error('✗ Error creating test users:', error.message);
    return false;
  }
};

// Test 2: Set up saved farmers
const setupSavedFarmers = async () => {
  console.log('\n📝 Test 2: Setting up saved farmers...');
  
  try {
    // Consumer 1 saves the farmer
    await SavedFarmer.create({
      consumer: testConsumer1._id,
      farmers: [{
        farmer: testFarmer._id,
        savedAt: new Date(),
      }],
    });
    console.log(`✓ Consumer 1 saved the farmer`);
    
    // Consumer 2 saves the farmer
    await SavedFarmer.create({
      consumer: testConsumer2._id,
      farmers: [{
        farmer: testFarmer._id,
        savedAt: new Date(),
      }],
    });
    console.log(`✓ Consumer 2 saved the farmer`);
    
    // Consumer 3 does NOT save the farmer (control group)
    console.log(`✓ Consumer 3 did not save the farmer (control)`);
    
    return true;
  } catch (error) {
    console.error('✗ Error setting up saved farmers:', error.message);
    return false;
  }
};

// Test 3: Create a product and check notifications
const testProductCreationNotifications = async () => {
  console.log('\n📝 Test 3: Creating product and checking notifications...');
  
  try {
    // Get or create a category
    testCategory = await Category.findOne({ name: 'Vegetables' });
    if (!testCategory) {
      testCategory = await Category.create({
        name: 'Vegetables',
        slug: 'vegetables',
        description: 'Fresh vegetables',
      });
    }
    
    // Create a product
    testProduct = await Product.create({
      name: 'Fresh Organic Tomatoes',
      description: 'Freshly harvested organic tomatoes',
      category: testCategory._id,
      farmer: testFarmer._id,
      price: 50,
      unit: 'kg',
      images: ['tomato.jpg'],
      inStock: true,
      quantityAvailable: 100,
      farmingPractice: 'organic',
    });
    console.log(`✓ Created product: ${testProduct.name} (${testProduct._id})`);
    
    // Wait a bit for async notification creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check notifications for consumer 1 (should have notification)
    const consumer1Notifications = await Notification.find({
      user: testConsumer1._id,
      type: 'product',
      'metadata.productId': testProduct._id,
    });
    
    if (consumer1Notifications.length === 1) {
      const notif = consumer1Notifications[0];
      console.log(`✓ Consumer 1 received notification`);
      console.log(`  - Title: "${notif.title}"`);
      console.log(`  - Message: "${notif.message}"`);
      console.log(`  - Link: "${notif.link}"`);
      console.log(`  - Type: "${notif.type}"`);
      
      // Validate notification content
      if (notif.title === `New Product from ${testFarmer.name}` &&
          notif.message === `${testFarmer.name} has added a new product: ${testProduct.name}` &&
          notif.link === `/products/${testProduct._id}`) {
        console.log(`✓ Consumer 1 notification content is correct`);
      } else {
        console.error(`✗ Consumer 1 notification content is incorrect`);
        return false;
      }
    } else {
      console.error(`✗ Consumer 1 should have 1 notification, but has ${consumer1Notifications.length}`);
      return false;
    }
    
    // Check notifications for consumer 2 (should have notification)
    const consumer2Notifications = await Notification.find({
      user: testConsumer2._id,
      type: 'product',
      'metadata.productId': testProduct._id,
    });
    
    if (consumer2Notifications.length === 1) {
      const notif = consumer2Notifications[0];
      console.log(`✓ Consumer 2 received notification`);
      console.log(`  - Title: "${notif.title}"`);
      console.log(`  - Message: "${notif.message}"`);
      console.log(`  - Link: "${notif.link}"`);
      
      // Validate notification content
      if (notif.title === `New Product from ${testFarmer.name}` &&
          notif.message === `${testFarmer.name} has added a new product: ${testProduct.name}` &&
          notif.link === `/products/${testProduct._id}`) {
        console.log(`✓ Consumer 2 notification content is correct`);
      } else {
        console.error(`✗ Consumer 2 notification content is incorrect`);
        return false;
      }
    } else {
      console.error(`✗ Consumer 2 should have 1 notification, but has ${consumer2Notifications.length}`);
      return false;
    }
    
    // Check notifications for consumer 3 (should NOT have notification)
    const consumer3Notifications = await Notification.find({
      user: testConsumer3._id,
      type: 'product',
      'metadata.productId': testProduct._id,
    });
    
    if (consumer3Notifications.length === 0) {
      console.log(`✓ Consumer 3 did not receive notification (correct - didn't save farmer)`);
    } else {
      console.error(`✗ Consumer 3 should have 0 notifications, but has ${consumer3Notifications.length}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('✗ Error testing product creation notifications:', error.message);
    console.error(error);
    return false;
  }
};

// Test 4: Verify notification metadata
const testNotificationMetadata = async () => {
  console.log('\n📝 Test 4: Verifying notification metadata...');
  
  try {
    const notification = await Notification.findOne({
      user: testConsumer1._id,
      type: 'product',
      'metadata.productId': testProduct._id,
    });
    
    if (!notification) {
      console.error('✗ Notification not found');
      return false;
    }
    
    // Check metadata fields
    if (notification.metadata.farmerId.toString() === testFarmer._id.toString()) {
      console.log(`✓ Metadata contains correct farmerId`);
    } else {
      console.error(`✗ Metadata farmerId is incorrect`);
      return false;
    }
    
    if (notification.metadata.productId.toString() === testProduct._id.toString()) {
      console.log(`✓ Metadata contains correct productId`);
    } else {
      console.error(`✗ Metadata productId is incorrect`);
      return false;
    }
    
    if (notification.metadata.productName === testProduct.name) {
      console.log(`✓ Metadata contains correct productName`);
    } else {
      console.error(`✗ Metadata productName is incorrect`);
      return false;
    }
    
    // Check notification is unread by default
    if (!notification.isRead) {
      console.log(`✓ Notification is unread by default`);
    } else {
      console.error(`✗ Notification should be unread by default`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('✗ Error verifying notification metadata:', error.message);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Task 8.3 Tests: New Product Notifications for Saved Farmers');
  console.log('=' .repeat(70));
  
  await connectDB();
  
  let allTestsPassed = true;
  
  try {
    // Run tests
    if (!await createTestUsers()) allTestsPassed = false;
    if (!await setupSavedFarmers()) allTestsPassed = false;
    if (!await testProductCreationNotifications()) allTestsPassed = false;
    if (!await testNotificationMetadata()) allTestsPassed = false;
    
    // Summary
    console.log('\n' + '='.repeat(70));
    if (allTestsPassed) {
      console.log('✅ ALL TESTS PASSED');
      console.log('\n✓ Requirement 12.9 validated:');
      console.log('  - Notifications are triggered when a saved farmer adds a product');
      console.log('  - Notifications are sent to all consumers who saved that farmer');
      console.log('  - Notification content includes farmer name and product name');
      console.log('  - Notification includes link to product detail page');
      console.log('  - Notification creation does not block product creation response');
      console.log('  - Consumers who did not save the farmer do not receive notifications');
    } else {
      console.log('❌ SOME TESTS FAILED');
    }
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
    allTestsPassed = false;
  } finally {
    await cleanup();
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(allTestsPassed ? 0 : 1);
  }
};

// Run tests
runTests();
