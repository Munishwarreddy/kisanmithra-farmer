const express = require("express");
const {
  createSubscription,
  getUserSubscriptions,
  getSubscription,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} = require("../controllers/subscriptionController");
const { verifyToken, isConsumer } = require("../utils/authMiddleware");

const router = express.Router();

// All subscription routes require authentication
router.use(verifyToken);

// Get all subscriptions for the logged-in user (consumer or farmer)
router.get("/", getUserSubscriptions);

// Get a single subscription by ID
router.get("/:id", getSubscription);

// Create a new subscription (consumer only)
router.post("/", isConsumer, createSubscription);

// Update a subscription (consumer only)
router.put("/:id", isConsumer, updateSubscription);

// Pause a subscription (consumer only)
router.post("/:id/pause", isConsumer, pauseSubscription);

// Resume a subscription (consumer only)
router.post("/:id/resume", isConsumer, resumeSubscription);

// Cancel a subscription (consumer only)
router.delete("/:id", isConsumer, cancelSubscription);

module.exports = router;
