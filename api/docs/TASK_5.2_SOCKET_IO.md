# Task 5.2: Socket.io Real-Time Messaging Implementation

## Overview

This document describes the Socket.io implementation for real-time messaging in the KisanMithra platform. The implementation provides instant message delivery, read receipts, typing indicators, and online status tracking.

## Requirements Addressed

- **Requirement 9.7**: Real-time message display without page reload

## Architecture

### Components

1. **Socket Service** (`services/socketService.js`)
   - Initializes Socket.io server
   - Handles authentication
   - Manages connected users
   - Provides utility functions for emitting events

2. **Server Integration** (`server.js`)
   - Creates HTTP server
   - Initializes Socket.io with the HTTP server
   - Integrates with Express application

3. **Message Controller** (`controllers/messageController.js`)
   - Enhanced with real-time notifications
   - Emits events to online users

## Features Implemented

### 1. Connection Authentication

**Implementation**: JWT-based authentication middleware for Socket.io connections

**How it works**:
- Client sends JWT token in `auth.token` or `Authorization` header
- Server verifies token and attaches user to socket
- Invalid tokens are rejected with error message

**Code**:
```javascript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  socket.user = user;
  next();
});
```

### 2. Message Broadcasting

**Implementation**: Real-time message delivery to conversation participants

**Events**:
- `message:send` - Client sends message
- `message:new` - Server broadcasts to conversation room
- `message:notification` - Server notifies recipient

**How it works**:
1. Client emits `message:send` with message data
2. Server creates message in database
3. Server emits `message:new` to conversation room (both users see it)
4. Server emits `message:notification` to recipient's personal room

**Code**:
```javascript
socket.on('message:send', async (data) => {
  const message = await Message.create({...});
  io.to(`conversation:${conversationId}`).emit('message:new', { message });
  io.to(`user:${recipient}`).emit('message:notification', {...});
});
```

### 3. Read Receipts

**Implementation**: Real-time read status updates

**Events**:
- `message:read` - Client marks single message as read
- `message:read:receipt` - Server notifies sender
- `conversation:read` - Client marks all messages in conversation as read
- `conversation:read:receipt` - Server notifies sender of bulk read

**How it works**:
1. Client emits `message:read` with message ID
2. Server updates message in database
3. Server emits `message:read:receipt` to sender
4. Sender sees real-time read status

**Code**:
```javascript
socket.on('message:read', async (data) => {
  const message = await Message.findById(messageId);
  message.isRead = true;
  message.readAt = new Date();
  await message.save();
  io.to(`user:${message.sender}`).emit('message:read:receipt', {...});
});
```

### 4. Typing Indicators

**Implementation**: Real-time typing status

**Events**:
- `typing:start` - User starts typing
- `typing:stop` - User stops typing
- `typing:user` - Broadcast to other user

**How it works**:
1. Client emits `typing:start` when user types
2. Server broadcasts to conversation room (except sender)
3. Other user sees typing indicator
4. Client emits `typing:stop` when user stops
5. Typing indicator disappears

### 5. Online Status Tracking

**Implementation**: Track connected users

**Features**:
- `connectedUsers` Map stores userId -> socketId
- `user:online` event when user connects
- `user:offline` event when user disconnects
- Helper functions to check online status

**Code**:
```javascript
const connectedUsers = new Map();

io.on('connection', (socket) => {
  connectedUsers.set(userId, socket.id);
  socket.broadcast.emit('user:online', { userId });
});

socket.on('disconnect', () => {
  connectedUsers.delete(userId);
  socket.broadcast.emit('user:offline', { userId });
});
```

## Room Structure

### Personal Rooms
- Format: `user:{userId}`
- Purpose: Send notifications to specific user
- Example: `user:507f1f77bcf86cd799439011`

### Conversation Rooms
- Format: `conversation:{conversationId}`
- Purpose: Broadcast messages to both participants
- Example: `conversation:507f1f77bcf86cd799439011_507f191e810c19729de860ea`

## Client Integration Guide

### 1. Connect to Socket.io

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: userToken // JWT token from login
  }
});

socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### 2. Join Conversation

```javascript
const conversationId = generateConversationId(userId1, userId2);
socket.emit('conversation:join', conversationId);
```

### 3. Send Message

```javascript
socket.emit('message:send', {
  recipient: recipientId,
  content: messageText,
  conversationId: conversationId
});

socket.on('message:sent', (data) => {
  console.log('Message sent:', data.message);
});
```

### 4. Receive Messages

```javascript
socket.on('message:new', (data) => {
  // Add message to UI
  addMessageToUI(data.message);
});

socket.on('message:notification', (data) => {
  // Show notification
  showNotification(`New message from ${data.sender.name}`);
});
```

### 5. Mark as Read

```javascript
socket.emit('message:read', {
  messageId: messageId,
  conversationId: conversationId
});

socket.on('message:read:confirmed', (data) => {
  console.log('Message marked as read:', data);
});
```

### 6. Receive Read Receipts

```javascript
socket.on('message:read:receipt', (data) => {
  // Update UI to show message was read
  updateMessageReadStatus(data.messageId, data.readAt);
});
```

### 7. Typing Indicators

```javascript
// Start typing
socket.emit('typing:start', { conversationId });

// Stop typing
socket.emit('typing:stop', { conversationId });

// Listen for typing
socket.on('typing:user', (data) => {
  showTypingIndicator(data.userName);
});

socket.on('typing:stop', (data) => {
  hideTypingIndicator();
});
```

### 8. Online Status

```javascript
socket.on('user:online', (data) => {
  updateUserStatus(data.userId, 'online');
});

socket.on('user:offline', (data) => {
  updateUserStatus(data.userId, 'offline');
});
```

## Error Handling

### Server-Side Errors

All socket event handlers include try-catch blocks:

```javascript
socket.on('message:send', async (data) => {
  try {
    // Handle message
  } catch (error) {
    socket.emit('error', {
      message: 'Failed to send message',
      error: error.message
    });
  }
});
```

### Client-Side Error Handling

```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
  showErrorToUser(data.message);
});
```

## Security Features

### 1. Authentication
- JWT token required for connection
- Token verified on every connection
- Invalid tokens rejected immediately

### 2. Authorization
- Users can only join conversations they're part of
- Users can only mark their own messages as read
- Conversation ID validation ensures user participation

### 3. Input Validation
- All incoming data validated
- Empty messages rejected
- Invalid conversation IDs rejected

## Performance Considerations

### 1. Connection Management
- Ping timeout: 60 seconds
- Ping interval: 25 seconds
- Automatic reconnection on disconnect

### 2. Room Management
- Users automatically join personal room on connect
- Users manually join conversation rooms as needed
- Users leave rooms on disconnect

### 3. Memory Management
- Connected users stored in Map for O(1) lookup
- Disconnected users removed from Map
- No memory leaks from socket connections

## Testing

### Test File: `test-socket.js`

**Tests Included**:
1. ✅ Connection authentication (valid/invalid tokens)
2. ✅ Real-time message broadcasting
3. ✅ Read receipts (single message)
4. ✅ Typing indicators
5. ✅ Bulk read receipts (entire conversation)

**Run Tests**:
```bash
# Start server
npm run dev

# In another terminal
node test-socket.js
```

**Expected Output**:
```
📊 TEST SUMMARY
Total Tests: 5
✅ Passed: 5
❌ Failed: 0
Success Rate: 100.0%
🎉 All tests passed!
```

## API Endpoints Enhanced

### POST /api/messages
- Now emits real-time notification to recipient if online
- Backward compatible with non-Socket.io clients

### PUT /api/messages/:id/read
- Now emits read receipt to sender if online
- Backward compatible with non-Socket.io clients

## Utility Functions

### `isUserOnline(userId)`
Check if user is currently connected

### `emitToUser(userId, event, data)`
Emit event to specific user's personal room

### `emitToConversation(conversationId, event, data)`
Emit event to conversation room (both participants)

### `getConnectedUsers()`
Get Map of all connected users

## Future Enhancements

1. **Message Delivery Status**
   - Sent, Delivered, Read statuses
   - Delivery confirmation events

2. **Group Messaging**
   - Support for multi-user conversations
   - Group typing indicators

3. **File Sharing**
   - Real-time file upload progress
   - File received notifications

4. **Voice/Video Calls**
   - WebRTC signaling via Socket.io
   - Call status events

5. **Message Reactions**
   - Real-time emoji reactions
   - Reaction notifications

## Troubleshooting

### Issue: Socket not connecting
**Solution**: Check JWT token is valid and not expired

### Issue: Messages not appearing in real-time
**Solution**: Ensure both users have joined the conversation room

### Issue: Read receipts not working
**Solution**: Verify recipient is marking message as read with correct message ID

### Issue: Typing indicators not showing
**Solution**: Check conversation ID matches on both clients

## Conclusion

The Socket.io implementation provides a robust, secure, and performant real-time messaging system for the KisanMithra platform. All features are tested and ready for production use.

**Status**: ✅ Complete and Tested

**Requirements Met**: 9.7 (Real-time message display)

**Next Steps**: Integrate with frontend React application
