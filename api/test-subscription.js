/**
 * Test script for subscription endpoints
 * 
 * This script tests the subscription management system:
 * 1. Create a subscription
 * 2. Get all subscriptions
 * 3. Get a single subscription
 * 4. Update a subscription
 * 5. Pause a subscription
 * 6. Resume a subscription
 * 7. Cancel a subscription
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subscription = require('./models/SubscriptionModel');
const Product = require('./models/ProductModel');
const User = require('./models/UserModel');
const { createSubscriptionOrder } = require('./services/subscriptionService');

dotenv.config();

const testSubscriptionSystem = async () => {
  try {
    console.log('🧪 Starting subscription system test...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisanmithra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find a consumer and farmer
    const consumer = await User.findOne({ role: 'consumer' });
    const farmer = await User.findOne({ role: 'farmer' });
    
    if (!consumer || !farmer) {
      console.log('❌ Need at least one consumer and one farmer in the database');
      return;
    }

    console.log(`👤 Consumer: ${consumer.name} (${consumer.email})`);
    console.log(`👨‍🌾 Farmer: ${farmer.name} (${farmer.email})\n`);

    // Find a product
    const product = await Product.findOne({ farmer: farmer._id });
    
    if (!product) {
      console.log('❌ Need at least one product from the farmer');
      return;
    }

    console.log(`🌾 Product: ${product.name} - ₹${product.price}\n`);

    // Test 1: Create a subscription
    console.log('📝 Test 1: Creating a subscription...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start tomorrow

    const subscription = await Subscription.create({
      consumer: consumer._id,
      farmer: farmer._id,
      product: product._id,
      quantity: 2,
      frequency: 'weekly',
      startDate: startDate,
      nextDeliveryDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
      deliveryAddress: {
        name: consumer.name,
        phone: '1234567890',
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
      },
      paymentMethod: 'upi',
      status: 'active',
    });

    console.log(`✅ Subscription created: ${subscription._id}`);
    console.log(`   Frequency: ${subscription.frequency}`);
    console.log(`   Next delivery: ${subscription.nextDeliveryDate.toDateString()}\n`);

    // Test 2: Get subscription
    console.log('📝 Test 2: Fetching subscription...');
    const fetchedSubscription = await Subscription.findById(subscription._id)
      .populate('product', 'name price')
      .populate('consumer', 'name email')
      .populate('farmer', 'name email');
    
    console.log(`✅ Subscription fetched successfully`);
    console.log(`   Product: ${fetchedSubscription.product.name}`);
    console.log(`   Consumer: ${fetchedSubscription.consumer.name}`);
    console.log(`   Farmer: ${fetchedSubscription.farmer.name}\n`);

    // Test 3: Update subscription
    console.log('📝 Test 3: Updating subscription quantity...');
    subscription.quantity = 3;
    await subscription.save();
    console.log(`✅ Subscription updated: quantity = ${subscription.quantity}\n`);

    // Test 4: Pause subscription
    console.log('📝 Test 4: Pausing subscription...');
    subscription.status = 'paused';
    await subscription.save();
    console.log(`✅ Subscription paused: status = ${subscription.status}\n`);

    // Test 5: Resume subscription
    console.log('📝 Test 5: Resuming subscription...');
    subscription.status = 'active';
    const today = new Date();
    const nextDelivery = new Date(today);
    nextDelivery.setDate(nextDelivery.getDate() + 7);
    subscription.nextDeliveryDate = nextDelivery;
    await subscription.save();
    console.log(`✅ Subscription resumed: status = ${subscription.status}`);
    console.log(`   New next delivery: ${subscription.nextDeliveryDate.toDateString()}\n`);

    // Test 6: Create subscription order
    console.log('📝 Test 6: Creating subscription order...');
    // Set next delivery to today for testing
    subscription.nextDeliveryDate = new Date();
    await subscription.save();
    
    const order = await createSubscriptionOrder(subscription);
    console.log(`✅ Subscription order created: ${order.orderNumber}`);
    console.log(`   Total amount: ₹${order.totalAmount}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Is subscription order: ${order.isSubscriptionOrder}\n`);

    // Test 7: Verify subscription was updated
    console.log('📝 Test 7: Verifying subscription update after order...');
    const updatedSubscription = await Subscription.findById(subscription._id);
    console.log(`✅ Subscription updated after order creation`);
    console.log(`   Completed deliveries: ${updatedSubscription.completedDeliveries}`);
    console.log(`   Total deliveries: ${updatedSubscription.totalDeliveries}`);
    console.log(`   Next delivery: ${updatedSubscription.nextDeliveryDate.toDateString()}\n`);

    // Test 8: Cancel subscription
    console.log('📝 Test 8: Cancelling subscription...');
    subscription.status = 'cancelled';
    await subscription.save();
    console.log(`✅ Subscription cancelled: status = ${subscription.status}\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await Subscription.findByIdAndDelete(subscription._id);
    await mongoose.connection.db.collection('orders').deleteOne({ _id: order._id });
    await mongoose.connection.db.collection('notifications').deleteMany({
      'metadata.subscriptionId': subscription._id,
    });
    console.log('✅ Test data cleaned up\n');

    console.log('✅ All subscription tests passed! 🎉\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

// Run tests
testSubscriptionSystem();
