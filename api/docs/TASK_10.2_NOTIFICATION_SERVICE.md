# Task 10.2: Notification Service Implementation

## Overview

This document describes the implementation of a centralized notification service that handles all notification creation across the KisanMithra platform. The service provides reusable functions for creating notifications for various events throughout the application.

## Requirements Addressed

- **Requirement 14.1**: Order status change notifications
- **Requirement 14.2**: New message notifications
- **Requirement 14.3**: Subscription reminder notifications
- **Requirement 14.4**: Contract action notifications
- **Requirement 14.5**: New product notifications for saved farmers

## Implementation

### File Structure

```
api/
├── services/
│   └── notificationService.js    # Centralized notification service
├── test-notification-service.js  # Comprehensive test suite
└── docs/
    └── TASK_10.2_NOTIFICATION_SERVICE.md  # This file
```

### Notification Service (`api/services/notificationService.js`)

The notification service provides a centralized API for creating notifications across the platform. It includes:

#### Core Functions

1. **`createNotification(notificationData, emitRealtime)`**
   - Creates a single notification
   - Optionally emits via Socket.io for real-time updates
   - Returns the created notification object

2. **`createBulkNotifications(notificationsData, emitRealtime)`**
   - Creates multiple notifications efficiently using `insertMany`
   - Useful for notifying multiple users about the same event
   - Optionally emits real-time notifications to all recipients

#### Order Notifications (Requirement 14.1)

3. **`notifyOrderStatusChange(userId, order, oldStatus)`**
   - Notifies consumer when order status changes
   - Includes delivery date information when order is shipped
   - Maps status to user-friendly messages
   - Example statuses: placed, confirmed, packed, shipped, delivered, completed, cancelled

4. **`notifyOrderCompletionReview(userId, order, productNames)`**
   - Prompts consumer to review products after order completion
   - Includes product names in the message
   - Links to review submission page

#### Message Notifications (Requirement 14.2)

5. **`notifyNewMessage(recipientId, senderName, senderId, conversationId, messageId)`**
   - Notifies recipient when they receive a new message
   - Includes sender information
   - Links to the conversation

#### Subscription Notifications (Requirement 14.3)

6. **`notifySubscriptionReminder(userId, subscription, productName)`**
   - Reminds consumer 2 days before subscription delivery
   - Includes product name and next delivery date
   - Links to subscription management page

7. **`notifySubscriptionOrderCreated(userId, order, productName, userType, otherPartyName)`**
   - Notifies both consumer and farmer when subscription order is created
   - Different messages for consumer vs farmer
   - Links to the order details

#### Contract Notifications (Requirement 14.4)

8. **`notifyContractProposal(recipientId, initiatorName, contract, productName)`**
   - Notifies recipient when they receive a contract proposal
   - Includes initiator name and product details
   - Links to contract review page

9. **`notifyContractAccepted(userId, acceptorName, contract, productName)`**
   - Notifies initiator when contract is accepted
   - Includes acceptor name
   - Links to contract details

10. **`notifyContractRejected(userId, rejectorName, contract, productName)`**
    - Notifies initiator when contract is rejected
    - Includes rejector name
    - Links to contract details

11. **`notifyContractDeliveryOrder(userId, order, contract, productName)`**
    - Notifies both parties when contract delivery order is created
    - Includes contract number and product name
    - Links to order details

12. **`notifyContractCompleted(userId, contract, productName)`**
    - Notifies both parties when contract is completed
    - Includes contract number
    - Links to contract details

#### Product Notifications (Requirement 14.5)

13. **`notifyNewProductFromSavedFarmer(consumerIds, farmerName, farmerId, productId, productName)`**
    - Notifies all consumers who saved a farmer when they add a new product
    - Uses bulk insert for efficiency
    - Includes farmer name and product name
    - Links to product details

#### System Notifications

14. **`notifySystem(userId, title, message, link, metadata)`**
    - Generic function for system-wide notifications
    - Useful for announcements, maintenance notices, etc.

## Integration with Existing Code

The notification service is already integrated with existing controllers and services:

### 1. Order Controller (`api/controllers/orderController.js`)

```javascript
// Order status change notification
const notification = await notificationService.notifyOrderStatusChange(
  order.consumer._id,
  order,
  oldStatus
);

// Order completion review prompt
const reviewNotification = await notificationService.notifyOrderCompletionReview(
  order.consumer._id,
  order,
  productNames
);
```

### 2. Message Controller (`api/controllers/messageController.js`)

```javascript
// New message notification
await notificationService.notifyNewMessage(
  recipient,
  req.user.name,
  req.user._id,
  conversationId,
  message._id
);
```

### 3. Subscription Service (`api/services/subscriptionService.js`)

```javascript
// Subscription reminder
await notificationService.notifySubscriptionReminder(
  subscription.consumer._id,
  subscription,
  product.name
);

// Subscription order created
await notificationService.notifySubscriptionOrderCreated(
  subscription.consumer._id,
  order,
  product.name,
  'consumer'
);
```

### 4. Contract Controller (`api/controllers/contractController.js`)

```javascript
// Contract proposal
await notificationService.notifyContractProposal(
  recipientId,
  req.user.name,
  contract,
  product.name
);

// Contract acceptance
await notificationService.notifyContractAccepted(
  contract.initiator._id,
  req.user.name,
  contract,
  product.name
);
```

### 5. Contract Service (`api/services/contractService.js`)

```javascript
// Contract delivery order
await notificationService.notifyContractDeliveryOrder(
  consumer._id,
  order,
  contract,
  product.name
);

// Contract completion
await notificationService.notifyContractCompleted(
  consumer._id,
  contract,
  product.name
);
```

### 6. Product Controller (`api/controllers/productController.js`)

```javascript
// New product from saved farmer
await notificationService.notifyNewProductFromSavedFarmer(
  consumerIds,
  farmerName,
  farmerId,
  product._id,
  product.name
);
```

## Notification Structure

All notifications follow a consistent structure:

```javascript
{
  user: ObjectId,           // User who receives the notification
  type: String,             // 'order', 'message', 'subscription', 'contract', 'product', 'review', 'system'
  title: String,            // Short notification title
  message: String,          // Detailed notification message
  link: String,             // Optional link to related resource
  isRead: Boolean,          // Read status (default: false)
  readAt: Date,             // Timestamp when read
  metadata: Object,         // Additional data (orderId, contractNumber, etc.)
  createdAt: Date,          // Timestamp when created
}
```

## Real-Time Notifications

The service integrates with Socket.io for real-time notifications:

1. When a notification is created, it's automatically emitted to the user if they're online
2. The Socket.io event is `notification:new`
3. The client receives the full notification object
4. If Socket.io emission fails, the notification is still saved to the database

## Error Handling

The service includes comprehensive error handling:

1. **Database Errors**: Logged and thrown to caller
2. **Socket.io Errors**: Logged but don't affect notification creation
3. **Validation Errors**: Handled by Mongoose schema validation

## Testing

The test suite (`api/test-notification-service.js`) includes:

1. ✅ Order status change notification
2. ✅ Order completion review prompt
3. ✅ New message notification
4. ✅ Subscription reminder notification
5. ✅ Subscription order created notifications (consumer and farmer)
6. ✅ Contract proposal notification
7. ✅ Contract acceptance notification
8. ✅ Contract delivery order notification
9. ✅ New product from saved farmer notification (bulk)
10. ✅ System notification
11. ✅ Notification count verification

### Running Tests

```bash
cd api
node test-notification-service.js
```

**Prerequisites**:
- MongoDB must be running
- Environment variables must be configured

## Benefits of Centralized Service

1. **Consistency**: All notifications follow the same structure and patterns
2. **Maintainability**: Changes to notification logic only need to be made in one place
3. **Reusability**: Functions can be called from any controller or service
4. **Real-time Support**: Built-in Socket.io integration
5. **Error Handling**: Centralized error handling and logging
6. **Testing**: Single test suite covers all notification types
7. **Documentation**: Clear API with JSDoc comments

## Usage Examples

### Creating an Order Status Notification

```javascript
const notificationService = require('../services/notificationService');

// In order controller
const notification = await notificationService.notifyOrderStatusChange(
  order.consumer._id,
  order,
  'placed' // old status
);
```

### Creating Multiple Notifications

```javascript
// Notify all consumers who saved a farmer
const consumerIds = savedFarmerDocs.map(doc => doc.consumer);
const notifications = await notificationService.notifyNewProductFromSavedFarmer(
  consumerIds,
  farmer.name,
  farmer._id,
  product._id,
  product.name
);
```

### Creating a Custom System Notification

```javascript
await notificationService.notifySystem(
  userId,
  'Platform Update',
  'We have added new features to improve your experience',
  '/announcements/new-features',
  { version: '2.0.0' }
);
```

## Future Enhancements

Potential improvements for the notification service:

1. **Email Notifications**: Send email for important notifications
2. **SMS Notifications**: Send SMS for critical updates
3. **Push Notifications**: Mobile app push notifications
4. **Notification Preferences**: Allow users to customize notification settings
5. **Notification Batching**: Group similar notifications
6. **Notification Templates**: Use templates for consistent formatting
7. **Notification Analytics**: Track notification open rates and engagement

## Conclusion

The notification service successfully centralizes all notification creation logic, making the codebase more maintainable and consistent. It addresses all requirements (14.1-14.5) and provides a solid foundation for future notification enhancements.

## Related Files

- `api/services/notificationService.js` - Main service implementation
- `api/controllers/notificationController.js` - Notification API endpoints
- `api/models/NotificationModel.js` - Notification data model
- `api/services/socketService.js` - Real-time Socket.io service
- `api/test-notification-service.js` - Comprehensive test suite

## Task Completion

✅ **Task 10.2 Complete**: Notification service created for all required events:
- ✅ Order status changes (Requirement 14.1)
- ✅ New messages (Requirement 14.2)
- ✅ Subscription reminders (Requirement 14.3)
- ✅ Contract actions (Requirement 14.4)
- ✅ New products from saved farmers (Requirement 14.5)
