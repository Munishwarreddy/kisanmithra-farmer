# Contract Farming System Implementation

## Overview

The contract farming system enables farmers and consumers to create formal agreements for bulk or long-term purchases. This implementation covers Task 4 from the enhanced-ecommerce-platform spec, including:

- **Task 4.1**: Contract API endpoints (POST, GET, PUT, DELETE for contracts, accept, reject, modify)
- **Task 4.2**: Contract fulfillment tracking (delivery schedule, auto-generate orders, update status)

## Requirements Implemented

This implementation satisfies **Requirements 8.1-8.8**:

- ✅ 8.1: Contract creation form with product, quantity, duration, price, and delivery terms
- ✅ 8.2: Notification sent to other party for review and acceptance
- ✅ 8.3: Ability to accept, reject, or propose modifications
- ✅ 8.4: Active status when accepted by both parties
- ✅ 8.5: Fulfillment progress tracking and upcoming deliveries
- ✅ 8.6: Automatic order creation for contract deliveries
- ✅ 8.7: Display all contracts with status (pending, active, completed, cancelled)
- ✅ 8.8: Mark as completed when term is finished

## Architecture

### Components Created

1. **ContractController** (`api/controllers/contractController.js`)
   - Handles all contract-related HTTP requests
   - Implements business logic for contract lifecycle
   - Manages notifications for contract events

2. **ContractRoutes** (`api/routes/contractRoutes.js`)
   - Defines API endpoints for contract operations
   - Applies authentication middleware
   - Maps routes to controller functions

3. **ContractService** (`api/services/contractService.js`)
   - Automated contract fulfillment processing
   - Scheduled jobs for delivery order creation
   - Contract completion status updates

4. **ContractModel** (`api/models/ContractModel.js`)
   - Already existed from Task 1.2
   - Defines contract schema and validation rules

## API Endpoints

### 1. Create Contract
```
POST /api/contracts
```

**Authentication**: Required (Consumer or Farmer)

**Request Body**:
```json
{
  "recipientId": "user_id",
  "productId": "product_id",
  "quantity": 100,
  "pricePerUnit": 50,
  "duration": 3,
  "startDate": "2024-02-01",
  "deliverySchedule": "monthly",
  "terms": "Contract terms and conditions"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Contract created successfully",
  "data": {
    "_id": "contract_id",
    "contractNumber": "CNT-20240101-12345",
    "initiator": { "name": "John Doe", "role": "consumer" },
    "recipient": { "name": "Jane Smith", "role": "farmer" },
    "product": { "name": "Organic Tomatoes" },
    "status": "pending",
    "deliveries": [...]
  }
}
```

**Features**:
- Validates all required fields
- Verifies recipient exists and has different role
- Calculates total value and end date
- Generates delivery schedule (weekly/monthly)
- Creates notification for recipient (Req 8.2)

### 2. Get User Contracts
```
GET /api/contracts
```

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "contract_id",
      "contractNumber": "CNT-20240101-12345",
      "status": "active",
      "product": { "name": "Organic Tomatoes" },
      "totalValue": 5000,
      "startDate": "2024-02-01",
      "endDate": "2024-05-01"
    }
  ]
}
```

**Features**:
- Returns contracts where user is initiator or recipient (Req 8.7)
- Sorted by creation date (newest first)
- Includes populated product and user details

### 3. Get Contract Details
```
GET /api/contracts/:id
```

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "contract_id",
    "contractNumber": "CNT-20240101-12345",
    "status": "active",
    "deliveries": [
      {
        "scheduledDate": "2024-02-01",
        "quantity": 33,
        "status": "completed",
        "orderId": "order_id"
      }
    ]
  }
}
```

**Features**:
- Verifies user has access to contract
- Includes delivery tracking information (Req 8.5)
- Populates order details for completed deliveries

### 4. Accept Contract
```
PUT /api/contracts/:id/accept
```

**Authentication**: Required (Recipient only)

**Response**:
```json
{
  "success": true,
  "message": "Contract accepted successfully",
  "data": { "status": "active" }
}
```

**Features**:
- Verifies user is the recipient
- Updates status to 'active' (Req 8.4)
- Creates notification for initiator
- Only works on 'pending' contracts

### 5. Reject Contract
```
PUT /api/contracts/:id/reject
```

**Authentication**: Required (Recipient only)

**Response**:
```json
{
  "success": true,
  "message": "Contract rejected successfully",
  "data": { "status": "rejected" }
}
```

**Features**:
- Verifies user is the recipient
- Updates status to 'rejected'
- Creates notification for initiator
- Only works on 'pending' contracts

### 6. Modify Contract
```
PUT /api/contracts/:id/modify
```

**Authentication**: Required (Recipient only)

**Request Body**:
```json
{
  "quantity": 150,
  "pricePerUnit": 45,
  "duration": 4
}
```

**Response**:
```json
{
  "success": true,
  "message": "Contract modifications proposed successfully",
  "data": { "quantity": 150, "totalValue": 6750 }
}
```

**Features**:
- Verifies user is the recipient
- Allows modifying quantity, price, duration, schedule, terms
- Recalculates dependent fields (totalValue, endDate)
- Regenerates delivery schedule if needed
- Creates notification for initiator
- Only works on 'pending' contracts

### 7. Cancel Contract
```
DELETE /api/contracts/:id
```

**Authentication**: Required (Initiator or Recipient)

**Response**:
```json
{
  "success": true,
  "message": "Contract cancelled successfully",
  "data": { "status": "cancelled" }
}
```

**Features**:
- Verifies user is initiator or recipient
- Updates status to 'cancelled'
- Creates notification for other party
- Cannot cancel completed contracts

## Automated Fulfillment System

### Contract Service

The `contractService.js` implements automated contract fulfillment:

#### 1. Process Contract Deliveries
```javascript
processContractDeliveries()
```

**Schedule**: Daily at 6:30 AM

**Functionality**:
- Finds all active contracts
- Identifies deliveries scheduled for today
- Creates orders for due deliveries (Req 8.6)
- Updates delivery status to 'completed'
- Links order to delivery via orderId
- Sends notifications to both parties

**Order Creation**:
- Determines consumer and farmer based on roles
- Creates order with contract pricing
- Marks as `isContractOrder: true`
- Links to contract via `contractId`
- Uses special payment method: 'contract'

#### 2. Update Contract Completion Status
```javascript
updateContractCompletionStatus()
```

**Schedule**: Daily at 7:00 AM

**Functionality**:
- Finds all active contracts
- Checks if end date has passed
- Verifies all deliveries are completed
- Updates status to 'completed' (Req 8.8)
- Sends completion notifications to both parties

### Scheduled Jobs

The contract automation is initialized in `server.js`:

```javascript
const { initializeContractAutomation } = require('./services/contractService');

mongoose.connect(...)
  .then(() => {
    initializeContractAutomation();
  });
```

**Cron Schedules**:
- `30 6 * * *` - Process deliveries at 6:30 AM daily
- `0 7 * * *` - Check completion at 7:00 AM daily

**Development Mode**:
- Runs initial checks 5 seconds after startup
- Helps with testing and debugging

## Data Flow

### Contract Creation Flow

1. User submits contract proposal
2. System validates input data
3. Verifies recipient exists and has different role
4. Calculates total value and end date
5. Generates delivery schedule based on frequency
6. Creates contract with 'pending' status
7. Creates notification for recipient
8. Returns contract details to initiator

### Contract Acceptance Flow

1. Recipient reviews contract
2. Recipient accepts contract
3. System updates status to 'active'
4. Creates notification for initiator
5. Contract becomes eligible for fulfillment processing

### Delivery Processing Flow

1. Cron job runs daily at 6:30 AM
2. System finds active contracts
3. Identifies deliveries due today
4. For each due delivery:
   - Creates order with contract details
   - Links order to delivery
   - Updates delivery status to 'completed'
   - Sends notifications to both parties
5. Logs processing results

### Completion Check Flow

1. Cron job runs daily at 7:00 AM
2. System finds active contracts
3. For each contract:
   - Checks if end date has passed
   - Verifies all deliveries are completed
   - If both conditions met:
     - Updates status to 'completed'
     - Sends completion notifications
4. Logs completion results

## Notifications

The system creates notifications for key contract events:

### Contract Created
- **Recipient**: "New Contract Proposal"
- **Message**: "{Initiator} has proposed a contract for {Product}"
- **Link**: `/contracts/{contractId}`

### Contract Accepted
- **Initiator**: "Contract Accepted"
- **Message**: "{Recipient} has accepted your contract proposal"
- **Link**: `/contracts/{contractId}`

### Contract Rejected
- **Initiator**: "Contract Rejected"
- **Message**: "{Recipient} has rejected your contract proposal"
- **Link**: `/contracts/{contractId}`

### Contract Modified
- **Initiator**: "Contract Modification Proposed"
- **Message**: "{Recipient} has proposed modifications to the contract"
- **Link**: `/contracts/{contractId}`

### Contract Cancelled
- **Other Party**: "Contract Cancelled"
- **Message**: "{User} has cancelled the contract"
- **Link**: `/contracts/{contractId}`

### Delivery Order Created
- **Both Parties**: "Contract Delivery Order Created"
- **Message**: "A delivery order has been created as part of contract {Number}"
- **Link**: `/orders/{orderId}`

### Contract Completed
- **Both Parties**: "Contract Completed"
- **Message**: "Contract {Number} has been completed successfully"
- **Link**: `/contracts/{contractId}`

## Error Handling

### Validation Errors (400)
- Missing required fields
- Invalid recipient (same user or same role)
- Invalid contract status for operation
- Product not found

### Authorization Errors (403)
- User not authorized to access contract
- User not authorized to perform action
- Only recipient can accept/reject/modify
- Only initiator or recipient can cancel

### Not Found Errors (404)
- Contract not found
- Recipient not found
- Product not found

### Server Errors (500)
- Database errors
- Unexpected errors during processing
- All errors logged with details

## Testing

A comprehensive test script is provided in `api/test-contract.js`:

### Test Coverage

1. **Contract Creation**
   - Creates test contract
   - Verifies contract details
   - Checks notification creation

2. **Contract Acceptance**
   - Accepts pending contract
   - Verifies status change to 'active'
   - Checks notification for initiator

3. **Delivery Processing**
   - Updates delivery to be due today
   - Runs processing function
   - Verifies order creation
   - Checks delivery status update

4. **Contract Completion**
   - Sets contract past end date
   - Marks all deliveries completed
   - Runs completion check
   - Verifies status change to 'completed'
   - Checks completion notifications

5. **Fulfillment Tracking**
   - Displays delivery schedule
   - Shows completion status
   - Verifies order linkage

### Running Tests

```bash
cd api
node test-contract.js
```

**Note**: Requires MongoDB connection and test data (users, products)

## Integration with Existing Systems

### Order System
- Contract orders are marked with `isContractOrder: true`
- Linked to contract via `contractId` field
- Uses special payment method: 'contract'
- Follows same order lifecycle as regular orders

### Notification System
- Uses existing Notification model
- Type: 'contract'
- Includes metadata for contract details
- Links to contract or order pages

### User System
- Leverages existing authentication
- Uses role-based authorization
- Verifies farmer/consumer roles for contracts

### Product System
- References existing products
- Uses product pricing and units
- Populates product details in responses

## Security Considerations

### Authentication
- All endpoints require valid JWT token
- Token verified via `verifyToken` middleware

### Authorization
- Users can only access their own contracts
- Only recipient can accept/reject/modify
- Both parties can cancel
- Role verification (farmer vs consumer)

### Data Validation
- All inputs validated before processing
- Mongoose schema validation
- Business rule validation (dates, quantities)
- Prevents self-contracts

### Error Messages
- Generic messages for security
- Detailed logging server-side
- No sensitive data in responses

## Performance Considerations

### Database Queries
- Indexed fields: contractNumber, initiator, recipient, status, startDate
- Efficient queries with proper filters
- Population only when needed

### Scheduled Jobs
- Run during off-peak hours (6:30 AM, 7:00 AM)
- Process only active contracts
- Batch processing for efficiency
- Error handling prevents job failure

### Scalability
- Stateless API design
- Horizontal scaling possible
- Cron jobs can run on single instance
- Database indexes for performance

## Future Enhancements

### Potential Improvements

1. **Contract Templates**
   - Pre-defined contract templates
   - Quick contract creation
   - Standard terms and conditions

2. **Contract Amendments**
   - Allow amendments to active contracts
   - Require mutual agreement
   - Track amendment history

3. **Payment Integration**
   - Automatic payment processing
   - Escrow services
   - Payment schedules

4. **Analytics**
   - Contract performance metrics
   - Fulfillment rate tracking
   - Revenue analytics

5. **Dispute Resolution**
   - Dispute filing system
   - Admin mediation
   - Resolution tracking

6. **Contract Renewal**
   - Automatic renewal options
   - Renewal notifications
   - Updated terms negotiation

## Conclusion

The contract farming system is fully implemented and ready for use. It provides:

- ✅ Complete API for contract lifecycle management
- ✅ Automated fulfillment tracking and order generation
- ✅ Comprehensive notification system
- ✅ Robust error handling and validation
- ✅ Integration with existing systems
- ✅ Scalable and maintainable architecture

All requirements (8.1-8.8) have been satisfied, and the system is production-ready.
