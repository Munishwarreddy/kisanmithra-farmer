# Task 9.2: Order Completion and Review Prompts

## Overview

This task implements automatic order completion and review prompt notifications when an order is delivered, as specified in Requirement 11.8.

## Requirements Validated

**Requirement 11.8**: WHEN an Order is delivered, THE System SHALL mark it as completed and prompt the consumer to submit a Review.

## Implementation Details

### 1. Auto-Update Order Status to Completed

When the order status is updated to "delivered", the system automatically changes it to "completed":

```javascript
// Auto-update to completed when delivered (Requirement 11.8)
if (status === "delivered") {
  order.status = "completed";
}
```

**Location**: `api/controllers/orderController.js` - `updateOrderStatus` function

**Behavior**:
- Farmer or admin updates order status to "delivered"
- System automatically changes status to "completed"
- Order is saved with the completed status

### 2. Send Review Prompt Notification

When an order is marked as delivered or completed, the system sends a review prompt notification to the consumer:

```javascript
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
```

**Location**: `api/controllers/orderController.js` - `updateOrderStatus` function

**Notification Details**:
- **Type**: `review`
- **Title**: "How was your order?"
- **Message**: "Please share your experience with [Product Names]"
- **Link**: `/orders/{orderId}/review` (link to review submission page)
- **Metadata**: Includes order ID, order number, and product IDs

### 3. Multiple Products Handling

When an order contains multiple products, all product names are included in the review prompt message:

```javascript
const productNames = order.items.map(item => item.name).join(", ");
```

**Example**:
- Order with "Organic Tomatoes" and "Fresh Carrots"
- Message: "Please share your experience with Organic Tomatoes, Fresh Carrots"

### 4. Real-Time Notification

The review prompt notification is sent via Socket.io for real-time delivery:

```javascript
emitToUser(order.consumer._id.toString(), "notification:new", {
  notification: reviewNotification,
});
```

**Behavior**:
- If consumer is online, they receive the notification immediately
- Notification is also stored in database for later retrieval
- Consumer can access notification from notification center

## API Endpoint

**Endpoint**: `PUT /api/orders/:id/status`

**Access**: Private (Farmer or Admin only)

**Request Body**:
```json
{
  "status": "delivered",
  "trackingInfo": {
    "status": "delivered",
    "location": "Customer address"
  },
  "deliveryDate": "2024-01-15"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-123456",
    "status": "completed",
    "consumer": { ... },
    "farmer": { ... },
    "items": [ ... ],
    "trackingInfo": [ ... ],
    "deliveryDate": "2024-01-15T00:00:00.000Z"
  }
}
```

## Notifications Created

### 1. Order Status Notification

```json
{
  "user": "consumer_id",
  "type": "order",
  "title": "Order ORD-123456 completed",
  "message": "Your order has been completed.",
  "link": "/orders/order_id",
  "metadata": {
    "orderId": "order_id",
    "orderNumber": "ORD-123456",
    "status": "completed",
    "oldStatus": "shipped"
  }
}
```

### 2. Review Prompt Notification

```json
{
  "user": "consumer_id",
  "type": "review",
  "title": "How was your order?",
  "message": "Please share your experience with Organic Tomatoes, Fresh Carrots",
  "link": "/orders/order_id/review",
  "metadata": {
    "orderId": "order_id",
    "orderNumber": "ORD-123456",
    "productIds": ["product_id_1", "product_id_2"]
  }
}
```

## Testing

### Manual Testing Steps

1. **Setup**:
   - Create a test consumer account
   - Create a test farmer account
   - Create test products
   - Create a test order with status "shipped"

2. **Test Order Completion**:
   - Login as farmer
   - Update order status to "delivered" via API:
     ```bash
     PUT /api/orders/{orderId}/status
     {
       "status": "delivered"
     }
     ```
   - Verify order status is "completed" in database
   - Verify order status notification is created
   - Verify review prompt notification is created

3. **Verify Notification Content**:
   - Check notification type is "review"
   - Check title is "How was your order?"
   - Check message includes product names
   - Check link points to review page
   - Check metadata includes order and product information

4. **Test Multiple Products**:
   - Create order with multiple products
   - Update status to "delivered"
   - Verify all product names are in review message

5. **Test Real-Time Delivery**:
   - Login as consumer in browser
   - Connect to Socket.io
   - Update order status as farmer
   - Verify consumer receives notification in real-time

### Automated Testing

Run the test script:
```bash
node api/test-order-completion-simple.js
```

**Note**: Requires MongoDB to be running.

## Files Modified

1. **api/controllers/orderController.js**
   - Enhanced `updateOrderStatus` function
   - Added auto-completion logic
   - Added review prompt notification creation

## Files Created

1. **api/test-order-completion-simple.js**
   - Test script for order completion functionality
   - Validates requirement 11.8

2. **api/docs/TASK_9.2_ORDER_COMPLETION.md**
   - This documentation file

## Integration with Existing Features

### Order Status Flow

```
placed → confirmed → packed → shipped → delivered → completed
                                            ↓
                                    (auto-update)
                                            ↓
                                       completed
                                            ↓
                                  (send review prompt)
```

### Notification System Integration

The review prompt notification integrates with the existing notification system:

1. **Notification Model**: Uses existing `NotificationModel` with type "review"
2. **Notification API**: Accessible via existing notification endpoints
3. **Socket.io**: Uses existing socket service for real-time delivery
4. **Notification Center**: Appears in consumer's notification center

### Review System Integration

The review prompt notification links to the review submission page:

- **Link Format**: `/orders/{orderId}/review`
- **Frontend**: Consumer can click notification to submit review
- **Review API**: Uses existing review endpoints from Task 6.1

## Error Handling

The implementation includes robust error handling:

```javascript
try {
  // Create review notification
} catch (reviewNotifError) {
  console.error("Error creating review notification:", reviewNotifError);
  // Don't fail the request if notification fails
}
```

**Behavior**:
- If notification creation fails, error is logged
- Order status update still succeeds
- Request doesn't fail due to notification error
- Ensures order completion is not blocked by notification issues

## Future Enhancements

Potential improvements for future iterations:

1. **Duplicate Prevention**: Check if review notification already exists before creating
2. **Reminder Notifications**: Send reminder if consumer hasn't reviewed after X days
3. **Review Incentives**: Include incentive message (e.g., "Get 10% off your next order")
4. **Product-Specific Links**: Link to individual product review pages
5. **Review Templates**: Provide quick review templates in notification
6. **Notification Preferences**: Allow consumers to opt-out of review prompts

## Compliance

This implementation complies with:

- **Requirement 11.8**: Order completion and review prompts
- **Notification System**: Uses standard notification model and delivery
- **Real-Time Updates**: Integrates with Socket.io for instant delivery
- **Error Handling**: Graceful degradation if notification fails
- **Data Integrity**: Order status update is atomic and reliable

## Summary

Task 9.2 successfully implements:

✅ Auto-update order status to "completed" when set to "delivered"  
✅ Send review prompt notification to consumer  
✅ Include product names in review message  
✅ Provide link to review submission page  
✅ Store order and product metadata in notification  
✅ Real-time notification delivery via Socket.io  
✅ Handle multiple products in single order  
✅ Graceful error handling  

**Requirement 11.8 validated successfully!**
