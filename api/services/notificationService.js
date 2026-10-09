const Notification = require('../models/NotificationModel');
const { emitToUser } = require('./socketService');

/**
 * Notification Service
 * 
 * Centralized service for creating and managing notifications across the platform.
 * Handles notifications for:
 * - Order status changes (Requirement 14.1)
 * - New messages (Requirement 14.2)
 * - Subscription reminders (Requirement 14.3)
 * - Contract actions (Requirement 14.4)
 * - New products from saved farmers (Requirement 14.5)
 */

/**
 * Create a notification and optionally emit it via Socket.io
 * @param {Object} notificationData - Notification data
 * @param {String} notificationData.user - User ID to receive notification
 * @param {String} notificationData.type - Notification type (order, message, subscription, contract, product, review, system)
 * @param {String} notificationData.title - Notification title
 * @param {String} notificationData.message - Notification message
 * @param {String} notificationData.link - Optional link to related resource
 * @param {Object} notificationData.metadata - Optional metadata object
 * @param {Boolean} emitRealtime - Whether to emit via Socket.io (default: true)
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData, emitRealtime = true) => {
  try {
    const notification = await Notification.create(notificationData);

    // Emit real-time notification if user is online
    if (emitRealtime) {
      try {
        emitToUser(notificationData.user.toString(), 'notification:new', {
          notification,
        });
      } catch (socketError) {
        console.error('Error emitting real-time notification:', socketError);
        // Don't fail if socket emission fails
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create multiple notifications in bulk
 * @param {Array<Object>} notificationsData - Array of notification data objects
 * @param {Boolean} emitRealtime - Whether to emit via Socket.io (default: true)
 * @returns {Promise<Array<Object>>} Created notifications
 */
const createBulkNotifications = async (notificationsData, emitRealtime = true) => {
  try {
    const notifications = await Notification.insertMany(notificationsData);

    // Emit real-time notifications if requested
    if (emitRealtime) {
      notifications.forEach(notification => {
        try {
          emitToUser(notification.user.toString(), 'notification:new', {
            notification,
          });
        } catch (socketError) {
          console.error('Error emitting real-time notification:', socketError);
          // Don't fail if socket emission fails
        }
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Create order status change notification (Requirement 14.1)
 * @param {String} userId - Consumer user ID
 * @param {Object} order - Order object
 * @param {String} oldStatus - Previous order status
 * @returns {Promise<Object>} Created notification
 */
const notifyOrderStatusChange = async (userId, order, oldStatus) => {
  const statusMessages = {
    placed: 'Your order has been placed successfully',
    confirmed: 'Your order has been confirmed by the farmer',
    packed: 'Your order is being packed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    completed: 'Your order is complete',
    cancelled: 'Your order has been cancelled',
  };

  const message = statusMessages[order.status] || `Your order status has been updated to ${order.status}`;
  
  // Add delivery date info if shipped
  const deliveryInfo = order.status === 'shipped' && order.deliveryDate
    ? ` Expected delivery: ${new Date(order.deliveryDate).toLocaleDateString()}`
    : '';

  return createNotification({
    user: userId,
    type: 'order',
    title: `Order ${order.orderNumber} ${order.status}`,
    message: message + deliveryInfo,
    link: `/orders/${order._id}`,
    metadata: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      oldStatus,
    },
  });
};

/**
 * Create order completion and review prompt notification (Requirement 11.8)
 * @param {String} userId - Consumer user ID
 * @param {Object} order - Order object
 * @param {Array<String>} productNames - Array of product names
 * @returns {Promise<Object>} Created notification
 */
const notifyOrderCompletionReview = async (userId, order, productNames) => {
  return createNotification({
    user: userId,
    type: 'review',
    title: 'How was your order?',
    message: `Please share your experience with ${productNames.join(', ')}`,
    link: `/orders/${order._id}/review`,
    metadata: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      productIds: order.items.map(item => item.product),
    },
  });
};

/**
 * Create new message notification (Requirement 14.2)
 * @param {String} recipientId - Recipient user ID
 * @param {String} senderName - Sender's name
 * @param {String} senderId - Sender's user ID
 * @param {String} conversationId - Conversation ID
 * @param {String} messageId - Message ID
 * @returns {Promise<Object>} Created notification
 */
const notifyNewMessage = async (recipientId, senderName, senderId, conversationId, messageId) => {
  return createNotification({
    user: recipientId,
    type: 'message',
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    link: `/messages/${conversationId}`,
    metadata: {
      senderId,
      senderName,
      messageId,
      conversationId,
    },
  });
};

/**
 * Create subscription reminder notification (Requirement 14.3)
 * @param {String} userId - Consumer user ID
 * @param {Object} subscription - Subscription object
 * @param {String} productName - Product name
 * @returns {Promise<Object>} Created notification
 */
const notifySubscriptionReminder = async (userId, subscription, productName) => {
  return createNotification({
    user: userId,
    type: 'subscription',
    title: 'Upcoming Subscription Delivery',
    message: `Your subscription for ${productName} will be delivered in 2 days.`,
    link: `/subscriptions/${subscription._id}`,
    metadata: {
      subscriptionId: subscription._id,
      productName,
      nextDeliveryDate: subscription.nextDeliveryDate,
      reminderType: 'upcoming',
    },
  });
};

/**
 * Create subscription order created notification
 * @param {String} userId - User ID (consumer or farmer)
 * @param {Object} order - Order object
 * @param {String} productName - Product name
 * @param {String} userType - 'consumer' or 'farmer'
 * @param {String} otherPartyName - Name of the other party (optional for farmer)
 * @returns {Promise<Object>} Created notification
 */
const notifySubscriptionOrderCreated = async (userId, order, productName, userType, otherPartyName = null) => {
  const isConsumer = userType === 'consumer';
  
  return createNotification({
    user: userId,
    type: 'subscription',
    title: isConsumer ? 'Subscription Order Created' : 'New Subscription Order',
    message: isConsumer
      ? `Your subscription order for ${productName} has been created and will be delivered soon.`
      : `You have a new subscription order for ${productName}${otherPartyName ? ` from ${otherPartyName}` : ''}.`,
    link: `/orders/${order._id}`,
    metadata: {
      orderId: order._id,
      subscriptionId: order.subscriptionId,
      productName,
      ...(otherPartyName && { consumerName: otherPartyName }),
    },
  });
};

/**
 * Create contract proposal notification (Requirement 14.4)
 * @param {String} recipientId - Recipient user ID
 * @param {String} initiatorName - Initiator's name
 * @param {Object} contract - Contract object
 * @param {String} productName - Product name
 * @returns {Promise<Object>} Created notification
 */
const notifyContractProposal = async (recipientId, initiatorName, contract, productName) => {
  return createNotification({
    user: recipientId,
    type: 'contract',
    title: 'New Contract Proposal',
    message: `${initiatorName} has proposed a contract for ${productName}. Please review and respond.`,
    link: `/contracts/${contract._id}`,
    metadata: {
      contractId: contract._id,
      contractNumber: contract.contractNumber,
      initiatorName,
      productName,
    },
  });
};

/**
 * Create contract acceptance notification
 * @param {String} userId - Initiator user ID
 * @param {String} acceptorName - Name of person who accepted
 * @param {Object} contract - Contract object
 * @param {String} productName - Product name
 * @returns {Promise<Object>} Created notification
 */
const notifyContractAccepted = async (userId, acceptorName, contract, productName) => {
  return createNotification({
    user: userId,
    type: 'contract',
    title: 'Contract Accepted',
    message: `${acceptorName} has accepted your contract proposal for ${productName}.`,
    link: `/contracts/${contract._id}`,
    metadata: {
      contractId: contract._id,
      contractNumber: contract.contractNumber,
      acceptorName,
      productName,
    },
  });
};

/**
 * Create contract rejection notification
 * @param {String} userId - Initiator user ID
 * @param {String} rejectorName - Name of person who rejected
 * @param {Object} contract - Contract object
 * @param {String} productName - Product name
 * @returns {Promise<Object>} Created notification
 */
const notifyContractRejected = async (userId, rejectorName, contract, productName) => {
  return createNotification({
    user: userId,
    type: 'contract',
    title: 'Contract Rejected',
    message: `${rejectorName} has rejected your contract proposal for ${productName}.`,
    link: `/contracts/${contract._id}`,
    metadata: {
      contractId: contract._id,
      contractNumber: contract.contractNumber,
      rejectorName,
      productName,
    },
  });
};

/**
 * Create contract delivery order notification
 * @param {String} userId - User ID (consumer or farmer)
 * @param {Object} order - Order object
 * @param {Object} contract - Contract object
 * @param {String} productName - Product name
 * @returns {Promise<Object>} Created notification
 */
const notifyContractDeliveryOrder = async (userId, order, contract, productName) => {
  return createNotification({
    user: userId,
    type: 'contract',
    title: 'Contract Delivery Order Created',
    message: `A delivery order for ${productName} has been created as part of contract ${contract.contractNumber}.`,
    link: `/orders/${order._id}`,
    metadata: {
      orderId: order._id,
      contractId: contract._id,
      contractNumber: contract.contractNumber,
      productName,
    },
  });
};

/**
 * Create contract completion notification
 * @param {String} userId - User ID (consumer or farmer)
 * @param {Object} contract - Contract object
 * @param {String} productName - Product name
 * @returns {Promise<Object>} Created notification
 */
const notifyContractCompleted = async (userId, contract, productName) => {
  return createNotification({
    user: userId,
    type: 'contract',
    title: 'Contract Completed',
    message: `Contract ${contract.contractNumber} for ${productName} has been completed successfully.`,
    link: `/contracts/${contract._id}`,
    metadata: {
      contractId: contract._id,
      contractNumber: contract.contractNumber,
      productName,
    },
  });
};

/**
 * Create new product notification for saved farmers (Requirement 14.5)
 * @param {Array<String>} consumerIds - Array of consumer user IDs
 * @param {String} farmerName - Farmer's name
 * @param {String} farmerId - Farmer's user ID
 * @param {String} productId - Product ID
 * @param {String} productName - Product name
 * @returns {Promise<Array<Object>>} Created notifications
 */
const notifyNewProductFromSavedFarmer = async (consumerIds, farmerName, farmerId, productId, productName) => {
  const notificationsData = consumerIds.map(consumerId => ({
    user: consumerId,
    type: 'product',
    title: `New Product from ${farmerName}`,
    message: `${farmerName} has added a new product: ${productName}`,
    link: `/products/${productId}`,
    metadata: {
      farmerId,
      productId,
      productName,
    },
  }));

  return createBulkNotifications(notificationsData);
};

/**
 * Create system notification
 * @param {String} userId - User ID
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} link - Optional link
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<Object>} Created notification
 */
const notifySystem = async (userId, title, message, link = null, metadata = {}) => {
  return createNotification({
    user: userId,
    type: 'system',
    title,
    message,
    link,
    metadata,
  });
};

module.exports = {
  // Core functions
  createNotification,
  createBulkNotifications,
  
  // Order notifications (Requirement 14.1)
  notifyOrderStatusChange,
  notifyOrderCompletionReview,
  
  // Message notifications (Requirement 14.2)
  notifyNewMessage,
  
  // Subscription notifications (Requirement 14.3)
  notifySubscriptionReminder,
  notifySubscriptionOrderCreated,
  
  // Contract notifications (Requirement 14.4)
  notifyContractProposal,
  notifyContractAccepted,
  notifyContractRejected,
  notifyContractDeliveryOrder,
  notifyContractCompleted,
  
  // Product notifications (Requirement 14.5)
  notifyNewProductFromSavedFarmer,
  
  // System notifications
  notifySystem,
};
