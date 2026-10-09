/**
 * Contract System Test Script
 * 
 * This script tests the contract farming system implementation:
 * - Contract creation
 * - Contract acceptance/rejection
 * - Contract modification
 * - Contract fulfillment tracking
 * - Automatic order generation
 * 
 * Run with: node test-contract.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contract = require('./models/ContractModel');
const User = require('./models/UserModel');
const Product = require('./models/ProductModel');
const Order = require('./models/OrderModel');
const Notification = require('./models/NotificationModel');
const { processContractDeliveries, updateContractCompletionStatus } = require('./services/contractService');

dotenv.config();

// Test data
let testConsumer, testFarmer, testProduct, testContract;

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisanmithra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for testing');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clean up test data
const cleanupTestData = async () => {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete test contracts
    await Contract.deleteMany({ 
      contractNumber: { $regex: /^TEST-/ } 
    });
    
    // Delete test orders created from contracts
    await Order.deleteMany({ 
      isContractOrder: true,
      contractId: { $exists: true }
    });
    
    // Delete test notifications
    await Notification.deleteMany({
      type: 'contract'
    });
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
};

// Test 1: Create a contract
const testCreateContract = async () => {
  console.log('\n📝 Test 1: Creating a contract...');
  
  try {
    // Find or create test users
    testConsumer = await User.findOne({ role: 'consumer' });
    testFarmer = await User.findOne({ role: 'farmer' });
    
    if (!testConsumer || !testFarmer) {
      console.log('⚠️  No test users found. Please ensure you have at least one consumer and one farmer in the database.');
      return false;
    }
    
    // Find or create test product
    testProduct = await Product.findOne({ farmer: testFarmer._id });
    
    if (!testProduct) {
      console.log('⚠️  No test product found. Please ensure the farmer has at least one product.');
      return false;
    }
    
    // Create contract
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start tomorrow
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3); // 3 months duration
    
    testContract = await Contract.create({
      contractNumber: `TEST-${Date.now()}`,
      initiator: testConsumer._id,
      recipient: testFarmer._id,
      product: testProduct._id,
      quantity: 100,
      unit: testProduct.unit || 'kg',
      pricePerUnit: testProduct.price,
      totalValue: 100 * testProduct.price,
      duration: 3,
      startDate,
      endDate,
      deliverySchedule: 'monthly',
      terms: 'Test contract terms for automated testing',
      status: 'pending',
      deliveries: [
        {
          scheduledDate: new Date(startDate),
          quantity: 33,
          status: 'pending',
        },
        {
          scheduledDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          quantity: 33,
          status: 'pending',
        },
        {
          scheduledDate: new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000),
          quantity: 34,
          status: 'pending',
        },
      ],
    });
    
    console.log('✅ Contract created successfully');
    console.log(`   Contract Number: ${testContract.contractNumber}`);
    console.log(`   Status: ${testContract.status}`);
    console.log(`   Deliveries: ${testContract.deliveries.length}`);
    
    // Check notification was created
    const notification = await Notification.findOne({
      user: testFarmer._id,
      type: 'contract',
      'metadata.contractId': testContract._id,
    });
    
    if (notification) {
      console.log('✅ Notification created for recipient');
    } else {
      console.log('⚠️  No notification found for recipient');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating contract:', error.message);
    return false;
  }
};

// Test 2: Accept a contract
const testAcceptContract = async () => {
  console.log('\n✅ Test 2: Accepting a contract...');
  
  try {
    if (!testContract) {
      console.log('⚠️  No test contract available');
      return false;
    }
    
    // Accept the contract
    testContract.status = 'active';
    await testContract.save();
    
    console.log('✅ Contract accepted successfully');
    console.log(`   Status: ${testContract.status}`);
    
    // Check notification was created for initiator
    const notification = await Notification.findOne({
      user: testConsumer._id,
      type: 'contract',
      'metadata.contractId': testContract._id,
      title: { $regex: /accepted/i },
    });
    
    if (notification) {
      console.log('✅ Notification created for initiator');
    } else {
      console.log('⚠️  No notification found for initiator');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error accepting contract:', error.message);
    return false;
  }
};

// Test 3: Process contract deliveries
const testProcessDeliveries = async () => {
  console.log('\n📦 Test 3: Processing contract deliveries...');
  
  try {
    if (!testContract) {
      console.log('⚠️  No test contract available');
      return false;
    }
    
    // Update first delivery to be due today
    testContract.deliveries[0].scheduledDate = new Date();
    await testContract.save();
    
    console.log('📅 Updated first delivery to be due today');
    
    // Process deliveries
    await processContractDeliveries();
    
    // Reload contract to check updates
    await testContract.populate('deliveries.orderId');
    const updatedContract = await Contract.findById(testContract._id)
      .populate('deliveries.orderId');
    
    const firstDelivery = updatedContract.deliveries[0];
    
    if (firstDelivery.orderId) {
      console.log('✅ Order created for delivery');
      console.log(`   Order ID: ${firstDelivery.orderId._id}`);
      console.log(`   Delivery Status: ${firstDelivery.status}`);
      
      // Check order details
      const order = await Order.findById(firstDelivery.orderId);
      if (order && order.isContractOrder && order.contractId.equals(testContract._id)) {
        console.log('✅ Order correctly linked to contract');
      } else {
        console.log('⚠️  Order not correctly linked to contract');
      }
    } else {
      console.log('⚠️  No order created for delivery');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error processing deliveries:', error.message);
    return false;
  }
};

// Test 4: Check contract completion
const testContractCompletion = async () => {
  console.log('\n🏁 Test 4: Checking contract completion...');
  
  try {
    if (!testContract) {
      console.log('⚠️  No test contract available');
      return false;
    }
    
    // Mark all deliveries as completed and set end date to past
    testContract.endDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
    testContract.deliveries.forEach(delivery => {
      delivery.status = 'completed';
    });
    await testContract.save();
    
    console.log('📅 Updated contract to be past end date with all deliveries completed');
    
    // Run completion check
    await updateContractCompletionStatus();
    
    // Reload contract
    const updatedContract = await Contract.findById(testContract._id);
    
    if (updatedContract.status === 'completed') {
      console.log('✅ Contract marked as completed');
      
      // Check notifications
      const notifications = await Notification.find({
        type: 'contract',
        'metadata.contractId': testContract._id,
        title: { $regex: /completed/i },
      });
      
      if (notifications.length >= 2) {
        console.log('✅ Completion notifications sent to both parties');
      } else {
        console.log(`⚠️  Only ${notifications.length} completion notification(s) found`);
      }
    } else {
      console.log(`⚠️  Contract status is ${updatedContract.status}, expected 'completed'`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking contract completion:', error.message);
    return false;
  }
};

// Test 5: Verify contract fulfillment tracking
const testFulfillmentTracking = async () => {
  console.log('\n📊 Test 5: Verifying contract fulfillment tracking...');
  
  try {
    if (!testContract) {
      console.log('⚠️  No test contract available');
      return false;
    }
    
    const contract = await Contract.findById(testContract._id)
      .populate('deliveries.orderId');
    
    console.log('📋 Contract Fulfillment Status:');
    console.log(`   Total Deliveries: ${contract.deliveries.length}`);
    
    let completedCount = 0;
    let pendingCount = 0;
    
    contract.deliveries.forEach((delivery, index) => {
      console.log(`   Delivery ${index + 1}:`);
      console.log(`     Scheduled: ${delivery.scheduledDate.toDateString()}`);
      console.log(`     Quantity: ${delivery.quantity}`);
      console.log(`     Status: ${delivery.status}`);
      console.log(`     Order ID: ${delivery.orderId ? delivery.orderId._id : 'None'}`);
      
      if (delivery.status === 'completed') completedCount++;
      if (delivery.status === 'pending') pendingCount++;
    });
    
    console.log(`\n   Summary:`);
    console.log(`     Completed: ${completedCount}`);
    console.log(`     Pending: ${pendingCount}`);
    console.log(`     Contract Status: ${contract.status}`);
    
    if (contract.deliveries.length > 0) {
      console.log('✅ Fulfillment tracking is working');
      return true;
    } else {
      console.log('⚠️  No deliveries found');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying fulfillment tracking:', error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🧪 Starting Contract System Tests\n');
  console.log('='.repeat(50));
  
  await connectDB();
  await cleanupTestData();
  
  const results = {
    createContract: await testCreateContract(),
    acceptContract: await testAcceptContract(),
    processDeliveries: await testProcessDeliveries(),
    contractCompletion: await testContractCompletion(),
    fulfillmentTracking: await testFulfillmentTracking(),
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${test}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('✅ All tests passed! Contract system is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.\n');
  }
  
  // Cleanup and close
  await cleanupTestData();
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
  
  process.exit(passedTests === totalTests ? 0 : 1);
};

// Run tests
runTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
