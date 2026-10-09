const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const Notification = require("../models/NotificationModel");
const { emitToUser } = require("../services/socketService");

// @desc    Create an order
// @route   POST /api/orders
// @access  Private (Consumer only)
exports.createOrder = async (req, res) => {
  try {
    const { farmer, items, pickupDetails, deliveryDetails, notes } = req.body;

    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }

      if (product.quantityAvailable < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough quantity available for ${product.name}`,
        });
      }

      totalAmount += product.price * item.quantity;
      item.price = product.price;
      item.name = item.name || product.name;
      item.unit = item.unit || product.unit || 'kg';
    }

    const order = await Order.create({
      consumer: req.user._id,
      farmer,
      items,
      subtotal: req.body.subtotal || totalAmount,
      totalAmount: req.body.totalAmount || totalAmount,
      pickupDetails,
      deliveryDetails,
      notes,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get consumer orders
// @route   GET /api/orders/consumer
// @access  Private (Consumer only)
exports.getConsumerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user._id })
      .populate("farmer", "name")
      .populate({
        path: "items.product",
        select: "name images",
      })
      .sort("-createdAt");

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get farmer orders
// @route   GET /api/orders/farmer
// @access  Private (Farmer only)
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate("consumer", "name")
      .populate({
        path: "items.product",
        select: "name images",
      })
      .sort("-createdAt");

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("consumer", "name email phone")
      .populate("farmer", "name email phone")
      .populate({
        path: "items.product",
        select: "name images",
      });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (
      order.consumer._id.toString() !== req.user._id.toString() &&
      order.farmer._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Farmer or Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingInfo, deliveryDate } = req.body;

    const order = await Order.findById(req.params.id)
      .populate("consumer", "name email")
      .populate("farmer", "name");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (
      order.farmer._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Update status
    const oldStatus = order.status;
    order.status = status;

    // Auto-update to completed when delivered (Requirement 11.8)
    if (status === "delivered") {
      order.status = "completed";
    }

    // Update tracking info if provided
    if (trackingInfo) {
      if (!order.trackingInfo) {
        order.trackingInfo = [];
      }
      order.trackingInfo.push({
        status: trackingInfo.status || status,
        location: trackingInfo.location || "",
        timestamp: new Date(),
      });
    }

    // Update delivery date when order is shipped
    if (status === "shipped" && deliveryDate) {
      order.deliveryDate = new Date(deliveryDate);
    }

    await order.save();

    // Send notification to consumer about status change
    try {
      const notification = await Notification.create({
        user: order.consumer._id,
        type: "order",
        title: `Order ${order.orderNumber} ${order.status}`,
        message: `Your order has been ${order.status}. ${
          status === "shipped" && order.deliveryDate
            ? `Expected delivery: ${order.deliveryDate.toLocaleDateString()}`
            : ""
        }`,
        link: `/orders/${order._id}`,
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          oldStatus,
        },
      });

      // Emit real-time notification if user is online
      emitToUser(order.consumer._id.toString(), "notification:new", {
        notification,
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the request if notification fails
    }

    // Send review prompt notification when order is completed (Requirement 11.8)
    if (status === "delivered" || order.status === "completed") {
      try {
        // Get product names for the review prompt
        const productNames = order.items.map(item => item.name).join(", ");

        const reviewNotification = await Notification.create({
          user: order.consumer._id,
          type: "review",
          title: "How was your order?",
          message: `Please share your experience with ${productNames}`,
          link: `/orders/${order._id}/review`,
          metadata: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            productIds: order.items.map(item => item.product),
          },
        });

        // Emit real-time notification if user is online
        emitToUser(order.consumer._id.toString(), "notification:new", {
          notification: reviewNotification,
        });
      } catch (reviewNotifError) {
        console.error("Error creating review notification:", reviewNotifError);
        // Don't fail the request if notification fails
      }
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("consumer", "name")
      .populate("farmer", "name")
      .sort("-createdAt");

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Reorder from existing order
// @route   POST /api/orders/reorder/:id
// @access  Private (Consumer only)
exports.reorderFromOrder = async (req, res) => {
  try {
    const originalOrder = await Order.findById(req.params.id)
      .populate("items.product");

    if (!originalOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Original order not found" });
    }

    // Verify the consumer owns this order
    if (originalOrder.consumer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reorder this order",
      });
    }

    // Validate all products are still available
    const items = [];
    let subtotal = 0;

    for (const item of originalOrder.items) {
      const product = await Product.findById(item.product._id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} is no longer available`,
        });
      }

      if (!product.inStock || product.quantityAvailable < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough quantity available for ${product.name}. Available: ${product.quantityAvailable}`,
        });
      }

      // Use current price (may have changed)
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      items.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        unit: product.unit,
      });
    }

    // Calculate totals (reuse same delivery fee and tax calculation)
    const deliveryFee = originalOrder.deliveryFee || 0;
    const tax = originalOrder.tax || 0;
    const totalAmount = subtotal + deliveryFee + tax;

    // Create new order
    const newOrder = await Order.create({
      consumer: req.user._id,
      farmer: originalOrder.farmer,
      items,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      deliveryAddress: originalOrder.deliveryAddress,
      paymentMethod: originalOrder.paymentMethod,
      notes: `Reorder from ${originalOrder.orderNumber}`,
    });

    // Populate the new order
    await newOrder.populate("farmer", "name");
    await newOrder.populate("items.product", "name images");

    res.status(201).json({
      success: true,
      message: "Order created successfully from previous order",
      data: newOrder,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get order tracking info
// @route   GET /api/orders/:id/tracking
// @access  Private
exports.getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select("orderNumber status trackingInfo deliveryDate consumer farmer")
      .populate("consumer", "name")
      .populate("farmer", "name");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Verify authorization
    if (
      order.consumer._id.toString() !== req.user._id.toString() &&
      order.farmer._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order tracking",
      });
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingInfo: order.trackingInfo || [],
        deliveryDate: order.deliveryDate,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
