const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  handlePaymentSuccess,
  handlePaymentFailure,
  getPaymentDetails,
  processRefund,
  handleWebhook,
} = require('../controllers/paymentController');
const { verifyToken, isConsumer, isAdmin, isFarmer } = require('../utils/authMiddleware');

// Public route for webhook (Stripe will call this)
// Note: This should use raw body parser, not JSON parser
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-intent', verifyToken, isConsumer, createPaymentIntent);
router.post('/success', verifyToken, isConsumer, handlePaymentSuccess);
router.post('/failure', verifyToken, isConsumer, handlePaymentFailure);
router.get('/:paymentIntentId', verifyToken, getPaymentDetails);
router.post('/refund', verifyToken, isAdmin, processRefund);

module.exports = router;
