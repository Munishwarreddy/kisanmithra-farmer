const cron = require('node-cron');
const Subscription = require('../models/SubscriptionModel');
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const Notification = require('../models/NotificationModel');

/**
 * Create an order from a subscription
 */
const createSubscriptionOrder = async (subscription) => {
  try {
    // Populate subscription details
    await subscription.populate('product');
    await subscription.populate('consumer', 'name email');
    await subscription.populate('farmer', 'name email');

    const product = subscription.product;

    // Create order
    const order = await Order.create({
      consumer: subscription.consumer._id,
      farmer: subscription.farmer._id,
      items: [{
        product: product._id,
        name: product.name,
        quantity: subscription.quantity,
        price: product.price,
        unit: product.unit || 'kg',
      }],
      subtotal: product.price * subscription.quantity,
      deliveryFee: 0,
      tax: 0,
      totalAmount: product.price * subscription.quantity,
      status: 'placed',
      paymentMethod: subscription.paymentMethod,
      paymentStatus: 'pending',
      deliveryAddress: subscription.deliveryAddress,
      isSubscriptionOrder: true,
      subscriptionId: subscription._id,
    });

    // Update subscription
    subscription.completedDeliveries += 1;
    subscription.totalDeliveries += 1;

    // Calculate next delivery date
    const nextDelivery = new Date(subscription.nextDeliveryDate);
    switch (subscription.frequency) {
      case 'weekly':
        nextDelivery.setDate(nextDelivery.getDate() + 7);
        break;
      case 'biweekly':
        nextDelivery.setDate(nextDelivery.getDate() + 14);
        break;
      case 'monthly':
        nextDelivery.setDate(nextDelivery.getDate() + 30);
        break;
    }
    subscription.nextDeliveryDate = nextDelivery;
    await subscription.save();

    // Create notifications for consumer
    await Notification.create({
      user: subscription.consumer._id,
      type: 'subscription',
      title: 'Subscription Order Created',
      message: `Your subscription order for ${product.name} has been created and will be delivered soon.`,
      link: `/orders/${order._id}`,
      metadata: {
        orderId: order._id,
        subscriptionId: subscription._id,
        productName: product.name,
      },
    });

    // Create notification for farmer
    await Notification.create({
      user: subscription.farmer._id,
      type: 'order',
      title: 'New Subscription Order',
      message: `You have a new subscription order for ${product.name} from ${subscription.consumer.name}.`,
      link: `/orders/${order._id}`,
      metadata: {
        orderId: order._id,
        subscriptionId: subscription._id,
        productName: product.name,
        consumerName: subscription.consumer.name,
      },
    });

    console.log(`✅ Created subscription order ${order.orderNumber} for subscription ${subscription._id}`);
    return order;
  } catch (error) {
    console.error(`❌ Error creating subscription order for ${subscription._id}:`, error);
    throw error;
  }
};

/**
 * Send reminder notifications for upcoming subscriptions
 */
const sendSubscriptionReminders = async () => {
  try {
    // Find subscriptions with next delivery in 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(0, 0, 0, 0);

    const twoDaysFromNowEnd = new Date(twoDaysFromNow);
    twoDaysFromNowEnd.setHours(23, 59, 59, 999);

    const subscriptions = await Subscription.find({
      status: 'active',
      nextDeliveryDate: {
        $gte: twoDaysFromNow,
        $lte: twoDaysFromNowEnd,
      },
    })
      .populate('product', 'name')
      .populate('consumer', 'name email');

    console.log(`📧 Found ${subscriptions.length} subscriptions for reminder notifications`);

    for (const subscription of subscriptions) {
      // Check if reminder already sent today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingNotification = await Notification.findOne({
        user: subscription.consumer._id,
        type: 'subscription',
        'metadata.subscriptionId': subscription._id,
        'metadata.reminderType': 'upcoming',
        createdAt: { $gte: today },
      });

      if (!existingNotification) {
        await Notification.create({
          user: subscription.consumer._id,
          type: 'subscription',
          title: 'Upcoming Subscription Delivery',
          message: `Your subscription for ${subscription.product.name} will be delivered in 2 days.`,
          link: `/subscriptions/${subscription._id}`,
          metadata: {
            subscriptionId: subscription._id,
            productName: subscription.product.name,
            nextDeliveryDate: subscription.nextDeliveryDate,
            reminderType: 'upcoming',
          },
        });

        console.log(`✅ Sent reminder for subscription ${subscription._id}`);
      }
    }
  } catch (error) {
    console.error('❌ Error sending subscription reminders:', error);
  }
};

/**
 * Process subscriptions due today
 */
const processSubscriptions = async () => {
  try {
    console.log('🔄 Processing subscriptions...');

    // Find active subscriptions with next delivery date today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const subscriptions = await Subscription.find({
      status: 'active',
      nextDeliveryDate: {
        $gte: today,
        $lte: todayEnd,
      },
    });

    console.log(`📦 Found ${subscriptions.length} subscriptions to process`);

    for (const subscription of subscriptions) {
      try {
        await createSubscriptionOrder(subscription);
      } catch (error) {
        console.error(`❌ Failed to process subscription ${subscription._id}:`, error);
        // Continue processing other subscriptions even if one fails
      }
    }

    console.log('✅ Subscription processing completed');
  } catch (error) {
    console.error('❌ Error processing subscriptions:', error);
  }
};

/**
 * Initialize subscription automation
 */
const initializeSubscriptionAutomation = () => {
  console.log('🚀 Initializing subscription automation...');

  // Run subscription processing daily at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Running scheduled subscription processing at 6:00 AM');
    await processSubscriptions();
  });

  // Run reminder notifications daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running scheduled subscription reminders at 8:00 AM');
    await sendSubscriptionReminders();
  });

  console.log('✅ Subscription automation initialized');
  console.log('📅 Scheduled jobs:');
  console.log('   - Subscription processing: Daily at 6:00 AM');
  console.log('   - Subscription reminders: Daily at 8:00 AM');

  // For development/testing: Run immediately on startup
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Running initial subscription check...');
    setTimeout(async () => {
      await processSubscriptions();
      await sendSubscriptionReminders();
    }, 5000); // Wait 5 seconds after startup
  }
};

module.exports = {
  initializeSubscriptionAutomation,
  processSubscriptions,
  sendSubscriptionReminders,
  createSubscriptionOrder,
};
