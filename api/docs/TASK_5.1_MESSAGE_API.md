# Task 5.1: Message API Implementation

## Overview

Implementation of messaging system API endpoints as specified in Requirements 9.1-9.6.

## Completed Features

### 1. Message Model Updates
- ✅ Added `conversationId` field (composite of two user IDs)
- ✅ Changed `receiver` to `recipient` to match design spec
- ✅ Added `readAt` timestamp field
- ✅ Added validation: sender and recipient must be different
- ✅ Added indexes for efficient queries
- ✅ Removed `relatedOrder` field (not in spec)

### 2. API Endpoints

#### POST /api/messages
**Purpose:** Send a message (Requirements 9.1, 9.2)

**Request:**
```json
{
  "recipient": "userId",
  "content": "Message text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "messageId",
    "conversationId": "userId1_userId2",
    "sender": {
      "_id": "senderId",
      "name": "Sender Name",
      "role": "consumer",
      "email": "sender@example.com"
    },
    "recipient": {
      "_id": "recipientId",
      "name": "Recipient Name",
      "role": "farmer",
      "email": "recipient@example.com"
    },
    "content": "Message text",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Features:**
- Validates recipient exists
- Validates content is not empty
- Prevents sending messages to self
- Generates conversationId from sorted user IDs
- Creates notification for recipient
- Returns populated sender and recipient details

#### GET /api/messages/conversations
**Purpose:** Get all conversations for current user (Requirement 9.3)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "conversationId": "userId1_userId2",
      "otherUser": {
        "_id": "userId2",
        "name": "Other User",
        "role": "farmer",
        "email": "other@example.com",
        "photo": "photo_url"
      },
      "lastMessage": {
        "_id": "messageId",
        "content": "Last message text",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isRead": false,
        "senderId": "userId1"
      },
      "unreadCount": 3
    }
  ]
}
```

**Features:**
- Groups messages by conversationId
- Shows other user in each conversation
- Displays last message details
- Counts unread messages per conversation
- Sorted by most recent message first

#### GET /api/messages/:conversationId
**Purpose:** Get all messages in a conversation (Requirement 9.4)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "messageId1",
      "conversationId": "userId1_userId2",
      "sender": {
        "_id": "userId1",
        "name": "User 1",
        "role": "consumer"
      },
      "recipient": {
        "_id": "userId2",
        "name": "User 2",
        "role": "farmer"
      },
      "content": "First message",
      "isRead": true,
      "readAt": "2024-01-01T00:05:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "messageId2",
      "conversationId": "userId1_userId2",
      "sender": {
        "_id": "userId2",
        "name": "User 2",
        "role": "farmer"
      },
      "recipient": {
        "_id": "userId1",
        "name": "User 1",
        "role": "consumer"
      },
      "content": "Reply message",
      "isRead": false,
      "createdAt": "2024-01-01T00:10:00.000Z"
    }
  ]
}
```

**Features:**
- Returns messages in chronological order (oldest first)
- Validates user is part of the conversation
- Returns 403 if user tries to access unauthorized conversation
- Populates sender and recipient details

#### PUT /api/messages/:id/read
**Purpose:** Mark a message as read (Requirements 9.5, 9.6)

**Response:**
```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "_id": "messageId",
    "conversationId": "userId1_userId2",
    "sender": "senderId",
    "recipient": "recipientId",
    "content": "Message text",
    "isRead": true,
    "readAt": "2024-01-01T00:05:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Features:**
- Validates message exists
- Validates current user is the recipient
- Sets isRead to true
- Sets readAt timestamp
- Returns 403 if user is not the recipient

### 3. Validation & Error Handling

**Validation Rules:**
- Content cannot be empty or whitespace only
- Recipient must exist in database
- Sender and recipient must be different users
- Only recipient can mark message as read
- Only conversation participants can view messages

**Error Responses:**
- 400: Bad request (missing fields, empty content, self-messaging)
- 403: Forbidden (unauthorized access to conversation or message)
- 404: Not found (recipient or message not found)
- 500: Server error

### 4. Notification Integration

When a message is sent:
- Creates notification for recipient
- Notification type: "message"
- Includes sender information
- Links to conversation
- Metadata includes conversationId and messageId

### 5. Database Indexes

Optimized queries with indexes on:
- `conversationId` + `createdAt` (for conversation messages)
- `sender` + `createdAt` (for user's sent messages)
- `recipient` + `createdAt` (for user's received messages)
- `isRead` (for unread message queries)

## Testing

### Automated Tests

Run the comprehensive test suite:
```bash
cd api
node test-messages.js
```

**Test Coverage:**
1. ✅ Register test users (consumer and farmer)
2. ✅ Send message with required fields
3. ✅ Validate message structure
4. ✅ Test validation errors (empty content, missing recipient, non-existent recipient)
5. ✅ Get conversations list
6. ✅ Verify conversation structure and unread count
7. ✅ Get messages in conversation
8. ✅ Verify chronological ordering
9. ✅ Test unauthorized conversation access
10. ✅ Mark message as read
11. ✅ Verify readAt timestamp
12. ✅ Verify unread count update
13. ✅ Test unauthorized mark as read
14. ✅ Two-way conversation with same conversationId

### Manual Testing with curl

**1. Register Users:**
```bash
# Register consumer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Consumer",
    "email": "consumer@test.com",
    "password": "password123",
    "role": "consumer"
  }'

# Register farmer
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "farmer@test.com",
    "password": "password123",
    "role": "farmer"
  }'
```

**2. Send Message:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CONSUMER_TOKEN" \
  -d '{
    "recipient": "FARMER_USER_ID",
    "content": "Hello, I am interested in your products!"
  }'
```

**3. Get Conversations:**
```bash
curl -X GET http://localhost:5000/api/messages/conversations \
  -H "Authorization: Bearer YOUR_FARMER_TOKEN"
```

**4. Get Messages:**
```bash
curl -X GET http://localhost:5000/api/messages/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_FARMER_TOKEN"
```

**5. Mark as Read:**
```bash
curl -X PUT http://localhost:5000/api/messages/MESSAGE_ID/read \
  -H "Authorization: Bearer YOUR_FARMER_TOKEN"
```

## Requirements Validation

### Requirement 9.1: Message Option Available
✅ POST /api/messages endpoint provides option to send message from any product or farmer profile

### Requirement 9.2: Message Delivery and Notification
✅ Message is stored in database and notification is created for recipient

### Requirement 9.3: Conversation Organization
✅ GET /api/messages/conversations returns all conversations organized by contact

### Requirement 9.4: Chronological Message Display
✅ GET /api/messages/:conversationId returns messages in chronological order with timestamps

### Requirement 9.5: Unread Indicator
✅ Conversations endpoint includes unreadCount, messages have isRead field

### Requirement 9.6: Message Composition
✅ POST /api/messages accepts text content and provides send functionality

### Requirement 9.7: Real-Time Display (Partial)
⚠️ Backend ready for real-time updates. Socket.io integration needed for Task 5.2

### Requirement 9.8: Mobile Responsive
✅ API endpoints work on all devices (frontend implementation in later tasks)

## Files Modified

1. **api/models/MessageModel.js**
   - Updated schema with conversationId
   - Changed receiver to recipient
   - Added readAt field
   - Added validation and indexes

2. **api/controllers/messageController.js**
   - Implemented sendMessage with notification creation
   - Implemented getConversations with unread counts
   - Implemented getMessages with authorization
   - Implemented markAsRead with validation

3. **api/routes/messageRoutes.js**
   - Updated routes to match spec requirements
   - POST /api/messages
   - GET /api/messages/conversations
   - GET /api/messages/:conversationId
   - PUT /api/messages/:id/read

4. **api/server.js**
   - Message routes already registered (no changes needed)

## Files Created

1. **api/test-messages.js**
   - Comprehensive test suite for all message endpoints
   - Tests all requirements 9.1-9.6

2. **api/docs/MONGODB_SETUP.md**
   - MongoDB installation and setup guide

3. **api/docs/TASK_5.1_MESSAGE_API.md**
   - This documentation file

## Next Steps

### Task 5.2: Implement Socket.io for Real-Time Messaging
- Set up Socket.io server
- Handle connection authentication
- Implement message broadcasting
- Handle read receipts in real-time

### Frontend Integration (Later Tasks)
- Create MessagesPage component
- Implement conversation list UI
- Implement message thread UI
- Add real-time updates with Socket.io client
- Add "Contact Farmer" buttons on product/farmer pages

## Notes

- ConversationId format: `{smallerUserId}_{largerUserId}` (sorted alphabetically)
- Messages are soft-deleted (not implemented yet, can be added if needed)
- Message search/filtering not implemented (can be added if needed)
- File attachments not implemented (can be added if needed)
- Message editing not implemented (by design - messages are immutable)
