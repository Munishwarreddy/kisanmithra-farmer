# Subscription Management System

## Overview

The subscription management system allows consumers to set up recurring orders for products they regularly purchase. The system automatically creates orders based on the subscription schedule and sends notifications to both consumers and farmers.

## Features

### 1. Subscription Creation
- Consumers can create subscriptions for any product
- Specify delivery frequency: weekly, biweekly, or monthly
- Set start date and delivery address
- Choose payment method

### 2. Subscription Management
- View all subscriptions (consumer and farmer views)
- Update subscription details (quantity, frequency, address)
- Pause subscriptions temporarily
- Resume paused subscriptions
- Cancel subscriptions

### 3. Automated Order Creation
- Scheduled job runs daily at 6:00 AM
- Automatically creates orders for subscriptions due today
- Updates subscription delivery counters
- Calculates next delivery date based on frequency

### 4. Notification System
- Reminder notifications 2 days before delivery
- Order creation notifications for consumer and farmer
- Sent daily at 8:00 AM

## API Endpoints

### Create Subscription
```
POST /api/subscriptions
Authorization: Bearer <token>
Role: Consumer

Request Body:
{
  "productId": "product_id",
  "quantity": 2,
  "frequency": "weekly",
  "startDate": "2024-01-15",
  "deliveryAddress": {
    "name": "John Doe",
    "phone": "1234567890",
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "upi"
}

Response:
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "_id": "subscription_id",
    "consumer": {...},
    "farmer": {...},
    "product": {...},
    "quantity": 2,
    "frequency": "weekly",
    "startDate": "2024-01-15",
    "nextDeliveryDate": "2024-01-22",
    "status": "active",
    ...
  }
}
```

### Get All Subscriptions
```
GET /api/subscriptions
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### Get Single Subscription
```
GET /api/subscriptions/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {...}
}
```

### Update Subscription
```
PUT /api/subscriptions/:id
Authorization: Bearer <token>
Role: Consumer

Request Body:
{
  "quantity": 3,
  "frequency": "biweekly",
  "deliveryAddress": {...}
}

Response:
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {...}
}
```

### Pause Subscription
```
POST /api/subscriptions/:id/pause
Authorization: Bearer <token>
Role: Consumer

Response:
{
  "success": true,
  "message": "Subscription paused successfully",
  "data": {...}
}
```

### Resume Subscription
```
POST /api/subscriptions/:id/resume
Authorization: Bearer <token>
Role: Consumer

Response:
{
  "success": true,
  "message": "Subscription resumed successfully",
  "data": {...}
}
```

### Cancel Subscription
```
DELETE /api/subscriptions/:id
Authorization: Bearer <token>
Role: Consumer

Response:
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {...}
}
```

## Data Model

### Subscription Schema
```javascript
{
  consumer: ObjectId (ref: User),
  farmer: ObjectId (ref: User),
  product: ObjectId (ref: Product),
  quantity: Number,
  frequency: String (enum: ['weekly', 'biweekly', 'monthly']),
  startDate: Date,
  nextDeliveryDate: Date,
  endDate: Date (optional),
  status: String (enum: ['active', 'paused', 'cancelled', 'completed']),
  deliveryAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: String,
  totalDeliveries: Number,
  completedDeliveries: Number,
  timestamps: true
}
```

## Automation Service

### Scheduled Jobs

#### 1. Subscription Processing (6:00 AM Daily)
- Finds all active subscriptions with `nextDeliveryDate` = today
- Creates an order for each subscription
- Updates subscription counters and next delivery date
- Sends notifications to consumer and farmer

#### 2. Subscription Reminders (8:00 AM Daily)
- Finds all active subscriptions with `nextDeliveryDate` = 2 days from now
- Sends reminder notification to consumer
- Prevents duplicate reminders on the same day

### Next Delivery Date Calculation

The system calculates the next delivery date based on frequency:
- **Weekly**: Current date + 7 days
- **Biweekly**: Current date + 14 days
- **Monthly**: Current date + 30 days

When a subscription is resumed, the next delivery date is recalculated from the current date.

## Authorization

### Consumer Permissions
- Create subscriptions
- View own subscriptions
- Update own subscriptions
- Pause/resume own subscriptions
- Cancel own subscriptions

### Farmer Permissions
- View subscriptions for their products
- Cannot modify subscriptions

### Admin Permissions
- View all subscriptions
- Can modify any subscription (if needed)

## Error Handling

### Common Errors

1. **Product Not Found (404)**
   - Product ID doesn't exist
   - Product has been deleted

2. **Unauthorized (403)**
   - User trying to access/modify another user's subscription
   - Non-consumer trying to create subscription

3. **Invalid Frequency (400)**
   - Frequency not in ['weekly', 'biweekly', 'monthly']

4. **Invalid Status Transition (400)**
   - Trying to pause already paused subscription
   - Trying to resume non-paused subscription

5. **Missing Required Fields (400)**
   - Missing productId, quantity, frequency, etc.

## Testing

Run the test script to verify the subscription system:

```bash
node test-subscription.js
```

The test script covers:
1. Creating a subscription
2. Fetching subscriptions
3. Updating subscription
4. Pausing subscription
5. Resuming subscription
6. Creating subscription order
7. Verifying subscription updates
8. Cancelling subscription

## Integration with Orders

Subscription orders are marked with:
- `isSubscriptionOrder: true`
- `subscriptionId: <subscription_id>`

This allows tracking which orders came from subscriptions and linking back to the subscription for analytics and management.

## Notifications

### Notification Types

1. **Upcoming Delivery Reminder**
   - Type: `subscription`
   - Sent: 2 days before delivery
   - Recipient: Consumer
   - Message: "Your subscription for {product} will be delivered in 2 days."

2. **Subscription Order Created**
   - Type: `subscription`
   - Sent: When order is created
   - Recipient: Consumer
   - Message: "Your subscription order for {product} has been created and will be delivered soon."

3. **New Subscription Order**
   - Type: `order`
   - Sent: When order is created
   - Recipient: Farmer
   - Message: "You have a new subscription order for {product} from {consumer}."

## Best Practices

1. **Start Date**: Set start date to future date to allow preparation time
2. **Frequency**: Choose frequency based on product shelf life
3. **Pause vs Cancel**: Use pause for temporary breaks, cancel for permanent stop
4. **Address Updates**: Update delivery address before next delivery date
5. **Payment Method**: Ensure payment method is valid and active

## Future Enhancements

1. **Flexible Schedules**: Allow custom delivery schedules (e.g., every 10 days)
2. **Quantity Adjustments**: Allow one-time quantity changes for specific deliveries
3. **Skip Delivery**: Allow skipping a single delivery without pausing
4. **Subscription Analytics**: Track subscription metrics and trends
5. **Bulk Discounts**: Offer discounts for long-term subscriptions
6. **Auto-renewal**: Automatically renew subscriptions after end date
7. **Email Notifications**: Send email notifications in addition to in-app
8. **SMS Notifications**: Send SMS for critical subscription updates

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 7.1**: Subscription creation option on product pages ✅
- **Requirement 7.2**: Delivery frequency specification (weekly, bi-weekly, monthly) ✅
- **Requirement 7.3**: Quantity and start date specification ✅
- **Requirement 7.4**: Subscription confirmation with next delivery date ✅
- **Requirement 7.5**: Display all active subscriptions ✅
- **Requirement 7.6**: Pause, modify, or cancel subscription options ✅
- **Requirement 7.7**: Notification 2 days before delivery ✅
- **Requirement 7.8**: Automatic order creation and notifications ✅

## Support

For issues or questions about the subscription system:
1. Check the error messages in the API response
2. Review the server logs for detailed error information
3. Run the test script to verify system functionality
4. Check the scheduled job logs for automation issues
