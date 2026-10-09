const paymentService = require('../services/paymentService');
const Order = require('../models/OrderModel');

/**
 * @desc    Create payment intent for an order
 * @route   POST /api/payments/create-intent
 * @access  Private (Consumer only)
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, currency } = req.body;

    // Validate required fields
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required',
      });
    }

    // Verify order exists and belongs to the user
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this order',
      });
    }

    // Verify amount matches order total
    if (Math.abs(amount - order.totalAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match order total',
      });
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency: currency || 'inr',
      metadata: {
        orderId: orderId,
        orderNumber: order.orderNumber,
        consumerId: req.user._id.toString(),
        farmerId: order.farmer.toString(),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.clientSecret,
        paymentIntentId: paymentIntent.paymentIntentId,
      },
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

/**
 * @desc    Handle payment success callback
 * @route   POST /api/payments/success
 * @access  Private (Consumer only)
 */
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Validate required fields
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and order ID are required',
      });
    }

    // Verify order belongs to the user
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order',
      });
    }

    // Handle payment success
    const result = await paymentService.handlePaymentSuccess(paymentIntentId, orderId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        order: result.order,
      },
    });
  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment success',
      error: error.message,
    });
  }
};

/**
 * @desc    Handle payment failure callback
 * @route   POST /api/payments/failure
 * @access  Private (Consumer only)
 */
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { paymentIntentId, orderId, errorMessage } = req.body;

    // Validate required fields
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and order ID are required',
      });
    }

    // Verify order belongs to the user
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order',
      });
    }

    // Handle payment failure
    const result = await paymentService.handlePaymentFailure(
      paymentIntentId,
      orderId,
      errorMessage
    );

    res.status(200).json({
      success: false,
      message: result.message,
      data: {
        order: result.order,
      },
    });
  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment failure',
      error: error.message,
    });
  }
};

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:paymentIntentId
 * @access  Private
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    // Get payment details from Stripe
    const paymentDetails = await paymentService.getPaymentDetails(paymentIntentId);

    res.status(200).json({
      success: true,
      data: paymentDetails,
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment details',
      error: error.message,
    });
  }
};

/**
 * @desc    Process refund for an order
 * @route   POST /api/payments/refund
 * @access  Private (Admin or Farmer only)
 */
exports.processRefund = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization (admin or the farmer who received the order)
    if (
      req.user.role !== 'admin' &&
      order.farmer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refund for this order',
      });
    }

    // Verify order has a payment ID
    if (!order.paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Order does not have a payment ID',
      });
    }

    // Verify payment was completed
    if (order.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund an order that was not paid',
      });
    }

    // Process refund
    const result = await paymentService.processRefund(
      order.paymentId,
      orderId,
      amount
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        refund: result.refund,
      },
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payments/webhook
 * @access  Public (but verified by Stripe signature)
 */
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(payload, signature);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await paymentService.handlePaymentSuccess(paymentIntent.id, orderId);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedOrderId = failedPayment.metadata.orderId;
        
        if (failedOrderId) {
          await paymentService.handlePaymentFailure(
            failedPayment.id,
            failedOrderId,
            failedPayment.last_payment_error?.message
          );
        }
        break;

      case 'charge.refunded':
        // Handle refund event if needed
        console.log('Refund processed:', event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook error',
      error: error.message,
    });
  }
};
