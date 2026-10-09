# Socket.io Quick Reference Guide

## Server Events (Client → Server)

### Connection
```javascript
// Client connects with JWT token
const socket = io('http://localhost:5000', {
  auth: { token: userToken }
});
```

### Join/Leave Conversation
```javascript
// Join conversation room
socket.emit('conversation:join', conversationId);

// Leave conversation room
socket.emit('conversation:leave', conversationId);
```

### Send Message
```javascript
socket.emit('message:send', {
  recipient: recipientId,
  content: messageText,
  conversationId: conversationId
});
```

### Mark as Read
```javascript
// Single message
socket.emit('message:read', {
  messageId: messageId,
  conversationId: conversationId
});

// Entire conversation
socket.emit('conversation:read', {
  conversationId: conversationId
});
```

### Typing Indicators
```javascript
// Start typing
socket.emit('typing:start', { conversationId });

// Stop typing
socket.emit('typing:stop', { conversationId });
```

## Client Events (Server → Client)

### Connection Events
```javascript
// Connection successful
socket.on('connected', (data) => {
  console.log('Connected:', data.userId);
});

// Connection error
socket.on('connect_error', (error) => {
  console.error('Error:', error.message);
});
```

### Message Events
```javascript
// New message in conversation
socket.on('message:new', (data) => {
  addMessageToUI(data.message);
});

// Message notification
socket.on('message:notification', (data) => {
  showNotification(data);
});

// Message sent confirmation
socket.on('message:sent', (data) => {
  console.log('Sent:', data.message);
});
```

### Read Receipt Events
```javascript
// Single message read
socket.on('message:read:receipt', (data) => {
  updateMessageStatus(data.messageId, 'read');
});

// Message read confirmed
socket.on('message:read:confirmed', (data) => {
  console.log('Marked as read:', data.messageId);
});

// Conversation read
socket.on('conversation:read:receipt', (data) => {
  updateConversationStatus(data.conversationId, 'read');
});

// Conversation read confirmed
socket.on('conversation:read:confirmed', (data) => {
  console.log('Conversation read:', data.count, 'messages');
});
```

### Typing Events
```javascript
// User is typing
socket.on('typing:user', (data) => {
  showTypingIndicator(data.userName);
});

// User stopped typing
socket.on('typing:stop', (data) => {
  hideTypingIndicator();
});
```

### Online Status Events
```javascript
// User came online
socket.on('user:online', (data) => {
  updateUserStatus(data.userId, 'online');
});

// User went offline
socket.on('user:offline', (data) => {
  updateUserStatus(data.userId, 'offline');
});
```

### Error Events
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
  showErrorToUser(data.message);
});
```

## Utility Functions (Server-Side)

### Check if User is Online
```javascript
const { isUserOnline } = require('./services/socketService');

if (isUserOnline(userId)) {
  console.log('User is online');
}
```

### Emit to Specific User
```javascript
const { emitToUser } = require('./services/socketService');

emitToUser(userId, 'custom:event', {
  message: 'Hello!'
});
```

### Emit to Conversation
```javascript
const { emitToConversation } = require('./services/socketService');

emitToConversation(conversationId, 'custom:event', {
  message: 'Hello everyone!'
});
```

### Get Connected Users
```javascript
const { getConnectedUsers } = require('./services/socketService');

const connectedUsers = getConnectedUsers();
console.log('Connected users:', connectedUsers.size);
```

## Room Structure

### Personal Room
- Format: `user:{userId}`
- Purpose: Send notifications to specific user
- Example: `user:507f1f77bcf86cd799439011`

### Conversation Room
- Format: `conversation:{conversationId}`
- Purpose: Broadcast messages to both participants
- Example: `conversation:507f1f77bcf86cd799439011_507f191e810c19729de860ea`

## Error Codes

| Error | Description |
|-------|-------------|
| `Authentication error: No token provided` | JWT token missing |
| `Authentication error: Invalid token` | JWT token invalid or expired |
| `Authentication error: User not found` | User doesn't exist |
| `Authentication error: User account is inactive` | User account disabled |
| `Not authorized to join this conversation` | User not part of conversation |
| `Not authorized to mark this message as read` | User not recipient |
| `Message not found` | Invalid message ID |
| `Missing required fields` | Required data missing |

## Testing

### Run Tests
```bash
# Start server
npm run dev

# In another terminal
node test-socket.js
```

### Manual Testing with Browser Console
```javascript
// Connect
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

// Listen for connection
socket.on('connected', (data) => console.log('Connected:', data));

// Send test message
socket.emit('message:send', {
  recipient: 'recipient-user-id',
  content: 'Test message',
  conversationId: 'user1_user2'
});

// Listen for new messages
socket.on('message:new', (data) => console.log('New message:', data));
```

## Common Patterns

### React Hook for Socket.io
```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connected', () => {
      setConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, connected };
};
```

### Message Component
```javascript
const MessageComponent = ({ conversationId, token }) => {
  const { socket, connected } = useSocket(token);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket || !connected) return;

    // Join conversation
    socket.emit('conversation:join', conversationId);

    // Listen for new messages
    socket.on('message:new', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    return () => {
      socket.emit('conversation:leave', conversationId);
    };
  }, [socket, connected, conversationId]);

  const sendMessage = (content) => {
    socket.emit('message:send', {
      recipient: recipientId,
      content,
      conversationId
    });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>{msg.content}</div>
      ))}
      <input onSubmit={(e) => sendMessage(e.target.value)} />
    </div>
  );
};
```

## Performance Tips

1. **Debounce Typing Indicators**
   ```javascript
   const debouncedTyping = debounce(() => {
     socket.emit('typing:stop', { conversationId });
   }, 1000);

   const handleTyping = () => {
     socket.emit('typing:start', { conversationId });
     debouncedTyping();
   };
   ```

2. **Batch Read Receipts**
   - Use `conversation:read` instead of multiple `message:read`
   - Mark all messages as read when conversation is opened

3. **Disconnect on Unmount**
   ```javascript
   useEffect(() => {
     return () => {
       socket?.close();
     };
   }, [socket]);
   ```

4. **Reconnection Strategy**
   ```javascript
   socket.on('disconnect', (reason) => {
     if (reason === 'io server disconnect') {
       // Server disconnected, reconnect manually
       socket.connect();
     }
     // else the socket will automatically try to reconnect
   });
   ```

## Security Checklist

- ✅ JWT authentication required
- ✅ Token verified on connection
- ✅ User authorization for conversations
- ✅ Input validation on all events
- ✅ CORS configured properly
- ✅ Error messages don't leak sensitive info
- ✅ Rate limiting (implement if needed)

## Troubleshooting

### Socket not connecting
- Check JWT token is valid
- Check server is running
- Check CORS configuration
- Check network/firewall

### Messages not appearing
- Verify both users joined conversation
- Check conversation ID format
- Check socket connection status

### Read receipts not working
- Verify message ID is correct
- Check user is recipient
- Verify sender is online

### Typing indicators not showing
- Check conversation ID matches
- Verify both users in same conversation
- Check debounce timing

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Socket.io Client API](https://socket.io/docs/v4/client-api/)
- [Socket.io Server API](https://socket.io/docs/v4/server-api/)
- [JWT Authentication](https://jwt.io/)

## Support

For issues or questions:
1. Check this quick reference
2. Review `TASK_5.2_SOCKET_IO.md` for detailed docs
3. Run `node verify-socket-setup.js` to verify setup
4. Check server logs for errors
5. Run tests: `node test-socket.js`
