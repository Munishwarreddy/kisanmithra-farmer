// Initialize Stripe only if API key is configured
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const Order = require('../models/OrderModel');
const Notification = require('../models/NotificationModel');
const { emitToUser } = require('./socketService');

/**
 * Create a payment intent for an order
 * @param {Object} orderData - Order data including amount, currency, metadata
 * @returns {Object} Payment intent with client secret
 */
exports.createPaymentIntent = async (orderData) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const { amount, currency = 'inr', metadata = {} } = orderData;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in smallest currency unit (paise for INR)
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        integration_check: 'accept_a_payment',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

/**
 * Handle successful payment
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @param {String} orderId - Order ID in database
 */
exports.handlePaymentSuccess = async (paymentIntentId, orderId) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    // Retrieve payment intent from Stripe to verify
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not succeeded');
    }

    // Update order with payment details
    const order = await Order.findById(orderId)
      .populate('consumer', 'name email')
      .populate('farmer', 'name email');

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status and payment info
    order.paymentStatus = 'completed';
    order.paymentId = paymentIntentId;
    order.status = 'confirmed';
    await order.save();

    // Create notifications for both consumer and farmer
    const consumerNotification = await Notification.create({
      user: order.consumer._id,
      type: 'order',
      title: 'Payment Successful',
      message: `Your payment for order ${order.orderNumber} has been processed successfully.`,
      link: `/orders/${order._id}`,
    });

    const farmerNotification = await Notification.create({
      user: order.farmer._id,
      type: 'order',
      title: 'New Order Confirmed',
      message: `You have received a new order ${order.orderNumber} from ${order.consumer.name}.`,
      link: `/orders/${order._id}`,
    });

    // Emit real-time notifications
    emitToUser(order.consumer._id.toString(), 'notification', consumerNotification);
    emitToUser(order.farmer._id.toString(), 'notification', farmerNotification);

    return {
      success: true,
      order,
      message: 'Payment processed successfully',
    };
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw new Error(`Failed to handle payment success: ${error.message}`);
  }
};

/**
 * Handle failed payment
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @param {String} orderId - Order ID in database
 * @param {String} errorMessage - Error message from Stripe
 */
exports.handlePaymentFailure = async (paymentIntentId, orderId, errorMessage) => {
  try {
    // Update order with failure status
    const order = await Order.findById(orderId)
      .populate('consumer', 'name email');

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order payment status
    order.paymentStatus = 'failed';
    order.paymentId = paymentIntentId;
    await order.save();

    // Create notification for consumer
    const notification = await Notification.create({
      user: order.consumer._id,
      type: 'order',
      title: 'Payment Failed',
      message: `Payment for order ${order.orderNumber} failed. ${errorMessage || 'Please try again.'}`,
      link: `/orders/${order._id}`,
    });

    // Emit real-time notification
    emitToUser(order.consumer._id.toString(), 'notification', notification);

    return {
      success: false,
      order,
      message: errorMessage || 'Payment failed',
    };
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw new Error(`Failed to handle payment failure: ${error.message}`);
  }
};

/**
 * Retrieve payment details
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @returns {Object} Payment intent details
 */
exports.getPaymentDetails = async (paymentIntentId) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to main currency unit
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method,
      created: new Date(paymentIntent.created * 1000),
    };
  } catch (error) {
    console.error('Error retrieving payment details:', error);
    throw new Error(`Failed to retrieve payment details: ${error.message}`);
  }
};

/**
 * Process refund for an order
 * @param {String} paymentIntentId - Stripe payment intent ID
 * @param {String} orderId - Order ID in database
 * @param {Number} amount - Amount to refund (optional, defaults to full refund)
 * @returns {Object} Refund details
 */
exports.processRefund = async (paymentIntentId, orderId, amount = null) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    // Create refund in Stripe
    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to smallest currency unit
    }

    const refund = await stripe.refunds.create(refundData);

    // Update order status
    const order = await Order.findById(orderId)
      .populate('consumer', 'name email');

    if (!order) {
      throw new Error('Order not found');
    }

    order.paymentStatus = 'refunded';
    await order.save();

    // Create notification for consumer
    const notification = await Notification.create({
      user: order.consumer._id,
      type: 'order',
      title: 'Refund Processed',
      message: `A refund of ₹${amount || order.totalAmount} has been processed for order ${order.orderNumber}.`,
      link: `/orders/${order._id}`,
    });

    // Emit real-time notification
    emitToUser(order.consumer._id.toString(), 'notification', notification);

    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
      message: 'Refund processed successfully',
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error(`Failed to process refund: ${error.message}`);
  }
};

/**
 * Verify webhook signature from Stripe
 * @param {String} payload - Raw request body
 * @param {String} signature - Stripe signature header
 * @returns {Object} Verified event object
 */
exports.verifyWebhookSignature = (payload, signature) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};
