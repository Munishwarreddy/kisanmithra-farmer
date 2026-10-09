const Subscription = require("../models/SubscriptionModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");

/**
 * @desc    Create a new subscription
 * @route   POST /api/subscriptions
 * @access  Private (Consumer only)
 */
const createSubscription = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      frequency,
      startDate,
      deliveryAddress,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (!productId || !quantity || !frequency || !startDate || !deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Verify product exists
    const product = await Product.findById(productId).populate("farmer");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Calculate next delivery date based on frequency
    const start = new Date(startDate);
    let nextDelivery = new Date(start);
    
    switch (frequency) {
      case 'weekly':
        nextDelivery.setDate(nextDelivery.getDate() + 7);
        break;
      case 'biweekly':
        nextDelivery.setDate(nextDelivery.getDate() + 14);
        break;
      case 'monthly':
        nextDelivery.setDate(nextDelivery.getDate() + 30);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid frequency. Must be weekly, biweekly, or monthly",
        });
    }

    // Create subscription
    const subscription = await Subscription.create({
      consumer: req.user._id,
      farmer: product.farmer._id,
      product: productId,
      quantity,
      frequency,
      startDate: start,
      nextDeliveryDate: nextDelivery,
      deliveryAddress,
      paymentMethod,
      status: 'active',
    });

    // Populate subscription details
    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('product', 'name price image')
      .populate('farmer', 'name email')
      .populate('consumer', 'name email');

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: populatedSubscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all subscriptions for the logged-in user
 * @route   GET /api/subscriptions
 * @access  Private
 */
const getUserSubscriptions = async (req, res) => {
  try {
    const query = req.user.role === 'farmer' 
      ? { farmer: req.user._id }
      : { consumer: req.user._id };

    const subscriptions = await Subscription.find(query)
      .populate('product', 'name price image')
      .populate('farmer', 'name email')
      .populate('consumer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('product', 'name price image description')
      .populate('farmer', 'name email phone')
      .populate('consumer', 'name email phone');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Verify user has access to this subscription
    const userId = req.user._id.toString();
    const consumerId = subscription.consumer._id.toString();
    const farmerId = subscription.farmer._id.toString();

    if (userId !== consumerId && userId !== farmerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this subscription",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a subscription
 * @route   PUT /api/subscriptions/:id
 * @access  Private (Consumer only)
 */
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Verify user owns this subscription
    if (subscription.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this subscription",
      });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['quantity', 'frequency', 'deliveryAddress', 'paymentMethod'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // If frequency is updated, recalculate next delivery date
    if (updates.frequency && updates.frequency !== subscription.frequency) {
      const nextDelivery = new Date(subscription.nextDeliveryDate);
      
      switch (updates.frequency) {
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
      
      updates.nextDeliveryDate = nextDelivery;
    }

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('product', 'name price image')
      .populate('farmer', 'name email')
      .populate('consumer', 'name email');

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subscription",
      error: error.message,
    });
  }
};

/**
 * @desc    Pause a subscription
 * @route   POST /api/subscriptions/:id/pause
 * @access  Private (Consumer only)
 */
const pauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Verify user owns this subscription
    if (subscription.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pause this subscription",
      });
    }

    // Check if subscription is already paused
    if (subscription.status === 'paused') {
      return res.status(400).json({
        success: false,
        message: "Subscription is already paused",
      });
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "Only active subscriptions can be paused",
      });
    }

    subscription.status = 'paused';
    await subscription.save();

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('product', 'name price image')
      .populate('farmer', 'name email')
      .populate('consumer', 'name email');

    res.status(200).json({
      success: true,
      message: "Subscription paused successfully",
      data: populatedSubscription,
    });
  } catch (error) {
    console.error("Error pausing subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to pause subscription",
      error: error.message,
    });
  }
};

/**
 * @desc    Resume a paused subscription
 * @route   POST /api/subscriptions/:id/resume
 * @access  Private (Consumer only)
 */
const resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Verify user owns this subscription
    if (subscription.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to resume this subscription",
      });
    }

    // Check if subscription is paused
    if (subscription.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: "Only paused subscriptions can be resumed",
      });
    }

    subscription.status = 'active';
    
    // Recalculate next delivery date from today
    const today = new Date();
    const nextDelivery = new Date(today);
    
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

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('product', 'name price image')
      .populate('farmer', 'name email')
      .populate('consumer', 'name email');

    res.status(200).json({
      success: true,
      message: "Subscription resumed successfully",
      data: populatedSubscription,
    });
  } catch (error) {
    console.error("Error resuming subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resume subscription",
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel a subscription
 * @route   DELETE /api/subscriptions/:id
 * @access  Private (Consumer only)
 */
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Verify user owns this subscription
    if (subscription.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this subscription",
      });
    }

    // Check if subscription is already cancelled
    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Subscription is already cancelled",
      });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};

module.exports = {
  createSubscription,
  getUserSubscriptions,
  getSubscription,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
};
