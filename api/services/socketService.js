const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const Message = require('../models/MessageModel');

// Store connected users: { userId: socketId }
const connectedUsers = new Map();

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'https://vercel.app'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (!user.isActive) {
        return next(new Error('Authentication error: User account is inactive'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`✅ User connected: ${socket.user.name} (${userId})`);

    // Store connected user
    connectedUsers.set(userId, socket.id);

    // Emit online status to user
    socket.emit('connected', {
      userId,
      message: 'Connected to real-time messaging'
    });

    // Broadcast online status to other users (optional)
    socket.broadcast.emit('user:online', {
      userId,
      name: socket.user.name
    });

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Handle joining conversation rooms
    socket.on('conversation:join', (conversationId) => {
      // Verify user is part of this conversation
      const userIds = conversationId.split('_');
      if (userIds.includes(userId)) {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation: ${conversationId}`);
      } else {
        socket.emit('error', { message: 'Not authorized to join this conversation' });
      }
    });

    // Handle leaving conversation rooms
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });

    // Handle new message event
    socket.on('message:send', async (data) => {
      try {
        const { recipient, content, conversationId } = data;

        // Validate data
        if (!recipient || !content || !conversationId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Verify user is part of this conversation
        const userIds = conversationId.split('_');
        if (!userIds.includes(userId)) {
          socket.emit('error', { message: 'Not authorized for this conversation' });
          return;
        }

        // Emit loading indicator for translation (Requirement 6.5)
        const translationStartTime = Date.now();
        const loadingTimeout = setTimeout(() => {
          if (Date.now() - translationStartTime > 1000) {
            io.to(`conversation:${conversationId}`).emit('translation:loading', {
              conversationId,
              messageContent: content.substring(0, 50)
            });
          }
        }, 1000);

        // Detect language and translate message
        let originalLanguage = 'en';
        let translations = {};
        
        try {
          const translationService = require('../services/ai/translationService');
          
          // Detect source language
          const detection = await translationService.detectLanguage(content.trim());
          originalLanguage = detection.language;
          
          // Store original in translations
          translations[originalLanguage] = content.trim();
          
          // Get recipient user to check language preference
          const recipientUser = await User.findById(recipient).select('preferences');
          const recipientLanguage = recipientUser?.preferences?.language || 'en';
          
          // Translate to recipient's preferred language if different
          if (recipientLanguage !== originalLanguage) {
            const translation = await translationService.translateMessage(
              content.trim(),
              recipientLanguage
            );
            
            if (translation.confidence >= 0.8) {
              translations[recipientLanguage] = translation.translatedText;
            } else {
              // Low confidence - emit warning (Requirement 2.6)
              io.to(`conversation:${conversationId}`).emit('translation:low-confidence', {
                conversationId,
                originalLanguage,
                targetLanguage: recipientLanguage,
                confidence: translation.confidence
              });
            }
          }
          
          // Also translate to English if not already
          if (originalLanguage !== 'en' && !translations['en']) {
            const englishTranslation = await translationService.translateMessage(
              content.trim(),
              'en'
            );
            if (englishTranslation.confidence >= 0.8) {
              translations['en'] = englishTranslation.translatedText;
            }
          }
        } catch (translationError) {
          console.error('Translation error in socket:', translationError);
          // Emit translation error event (Requirement 2.6)
          io.to(`conversation:${conversationId}`).emit('translation:error', {
            conversationId,
            error: 'Translation service unavailable',
            originalContent: content.trim()
          });
          // Continue without translation if it fails
          translations[originalLanguage] = content.trim();
        } finally {
          clearTimeout(loadingTimeout);
        }

        // Create message in database with translations
        const message = await Message.create({
          conversationId,
          sender: userId,
          recipient,
          content: content.trim(),
          originalLanguage,
          translations
        });

        // Populate sender and recipient details
        await message.populate('sender', 'name role email photo preferences');
        await message.populate('recipient', 'name role email photo preferences');

        // Emit message to conversation participants with their preferred language (Requirement 2.3)
        // Get sender's preferred language
        const senderLanguage = socket.user.preferences?.language || 'en';
        
        // Emit to sender with their preferred language
        socket.emit('message:new', {
          message: {
            ...message.toObject(),
            displayContent: translations[senderLanguage] || content.trim(),
            isTranslated: senderLanguage !== originalLanguage,
            originalLanguage
          },
          conversationId
        });

        // Emit to recipient with their preferred language
        const recipientSocketId = connectedUsers.get(recipient.toString());
        if (recipientSocketId) {
          const recipientLanguage = message.recipient.preferences?.language || 'en';
          io.to(`user:${recipient}`).emit('message:new', {
            message: {
              ...message.toObject(),
              displayContent: translations[recipientLanguage] || content.trim(),
              isTranslated: recipientLanguage !== originalLanguage,
              originalLanguage
            },
            conversationId
          });

          // Also emit notification
          io.to(`user:${recipient}`).emit('message:notification', {
            conversationId,
            sender: {
              _id: socket.user._id,
              name: socket.user.name,
              role: socket.user.role
            },
            content: (translations[recipientLanguage] || content.trim()).substring(0, 50) + 
                     ((translations[recipientLanguage] || content.trim()).length > 50 ? '...' : ''),
            messageId: message._id,
            createdAt: message.createdAt
          });
        }

        // Acknowledge to sender
        socket.emit('message:sent', {
          success: true,
          message: {
            ...message.toObject(),
            displayContent: translations[senderLanguage] || content.trim()
          }
        });

        // Process sentiment analysis asynchronously for buyer->farmer messages (Requirements 3.1, 3.2, 3.3, 3.4)
        if (message.recipient.role === 'farmer' && socket.user.role === 'consumer') {
          setImmediate(async () => {
            try {
              // Check if sentiment analysis is enabled for recipient
              if (message.recipient.preferences?.enableSentimentAnalysis !== false) {
                const sentimentAnalyzer = require('../services/ai/sentimentAnalyzer');
                const sentiment = await sentimentAnalyzer.analyzeSentiment(content.trim());
                
                // Update message with sentiment
                await Message.findByIdAndUpdate(message._id, {
                  sentiment: {
                    label: sentiment.label,
                    confidence: sentiment.confidence,
                    emoji: sentiment.emoji,
                    analyzedAt: sentiment.analyzedAt
                  }
                });

                // Emit sentiment to farmer with visual indicators (Requirement 3.2)
                const recipientSocketId = connectedUsers.get(recipient.toString());
                if (recipientSocketId) {
                  io.to(`user:${recipient}`).emit('message:sentiment', {
                    messageId: message._id,
                    conversationId,
                    sentiment: {
                      label: sentiment.label,
                      emoji: sentiment.emoji,
                      confidence: sentiment.confidence,
                      // Add visual treatment flags (Requirements 3.3, 3.4)
                      isAngry: sentiment.label === 'angry',
                      isUrgent: sentiment.label === 'urgent',
                      isPriority: sentiment.label === 'urgent' || sentiment.label === 'angry'
                    }
                  });
                }
              }

              // Generate smart replies for farmer (Requirement 1.4)
              if (message.recipient.preferences?.enableSmartReplies !== false) {
                const smartReplyEngine = require('../services/ai/smartReplyEngine');
                
                // Get recent conversation history
                const recentMessages = await Message.find({ conversationId })
                  .sort('-createdAt')
                  .limit(5)
                  .populate('sender', 'role');

                const history = recentMessages.reverse().map(m => ({
                  content: m.content,
                  senderRole: m.sender.role
                }));

                const smartReplies = await smartReplyEngine.generateSmartReplies(
                  content.trim(),
                  history,
                  null // Product info can be added later
                );

                // Update message with smart replies
                await Message.findByIdAndUpdate(message._id, {
                  smartReplies: smartReplies.map(r => ({
                    text: r.text,
                    category: r.category,
                    confidence: r.confidence,
                    generatedAt: r.generatedAt
                  }))
                });

                // Emit smart replies to farmer (Requirement 1.4)
                const recipientSocketId = connectedUsers.get(recipient.toString());
                if (recipientSocketId) {
                  io.to(`user:${recipient}`).emit('message:smart-replies', {
                    messageId: message._id,
                    conversationId,
                    replies: smartReplies.map(r => ({
                      id: r.id,
                      text: r.text,
                      category: r.category,
                      confidence: r.confidence
                    }))
                  });
                }
              }
            } catch (sentimentError) {
              console.error('Sentiment analysis error in socket:', sentimentError);
              // Don't fail message delivery if sentiment analysis fails
            }
          });
        }

      } catch (error) {
        console.error('Error sending message via socket:', error);
        socket.emit('error', { 
          message: 'Failed to send message',
          error: error.message 
        });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { conversationId } = data;
      // Broadcast to conversation room except sender
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId,
        userName: socket.user.name,
        conversationId
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId } = data;
      // Broadcast to conversation room except sender
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId,
        conversationId
      });
    });

    // Handle smart reply selection (Requirement 1.4)
    socket.on('smart-reply:select', async (data) => {
      try {
        const { conversationId, replyText, recipient } = data;

        // Validate data
        if (!conversationId || !replyText || !recipient) {
          socket.emit('error', { message: 'Missing required fields for smart reply' });
          return;
        }

        // Verify user is part of this conversation
        const userIds = conversationId.split('_');
        if (!userIds.includes(userId)) {
          socket.emit('error', { message: 'Not authorized for this conversation' });
          return;
        }

        // Send the smart reply as a regular message
        // This will trigger the same flow as message:send
        socket.emit('smart-reply:sending', { conversationId });
        
        // Trigger message send with the selected reply text
        const messageData = {
          recipient,
          content: replyText,
          conversationId
        };
        
        // Reuse the message:send logic by emitting to self
        socket.emit('message:send', messageData);

      } catch (error) {
        console.error('Error handling smart reply selection:', error);
        socket.emit('error', { 
          message: 'Failed to send smart reply',
          error: error.message 
        });
      }
    });

    // Handle deal summary confirmation (Requirement 4.3)
    socket.on('deal:confirm', async (data) => {
      try {
        const { dealSummaryId, conversationId } = data;

        if (!dealSummaryId) {
          socket.emit('error', { message: 'Deal summary ID is required' });
          return;
        }

        // Verify user is part of this conversation
        const userIds = conversationId.split('_');
        if (!userIds.includes(userId)) {
          socket.emit('error', { message: 'Not authorized for this conversation' });
          return;
        }

        const DealSummary = require('../models/DealSummaryModel');
        const dealSummary = await DealSummary.findById(dealSummaryId);

        if (!dealSummary) {
          socket.emit('error', { message: 'Deal summary not found' });
          return;
        }

        // Verify user is a participant
        const isParticipant = dealSummary.participants.some(
          p => p.toString() === userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to confirm this deal' });
          return;
        }

        // Confirm the deal
        await dealSummary.confirm(userId);

        // Emit confirmation to both participants
        io.to(`conversation:${conversationId}`).emit('deal:confirmed', {
          dealSummaryId: dealSummary._id,
          conversationId,
          confirmedBy: userId,
          confirmedAt: dealSummary.confirmedAt
        });

        socket.emit('deal:confirm:success', {
          dealSummaryId: dealSummary._id
        });

      } catch (error) {
        console.error('Error confirming deal summary:', error);
        socket.emit('error', { 
          message: 'Failed to confirm deal summary',
          error: error.message 
        });
      }
    });

    // Handle deal summary edit request
    socket.on('deal:edit', async (data) => {
      try {
        const { dealSummaryId, conversationId, updates } = data;

        if (!dealSummaryId || !updates) {
          socket.emit('error', { message: 'Deal summary ID and updates are required' });
          return;
        }

        // Verify user is part of this conversation
        const userIds = conversationId.split('_');
        if (!userIds.includes(userId)) {
          socket.emit('error', { message: 'Not authorized for this conversation' });
          return;
        }

        const DealSummary = require('../models/DealSummaryModel');
        const dealSummary = await DealSummary.findById(dealSummaryId);

        if (!dealSummary) {
          socket.emit('error', { message: 'Deal summary not found' });
          return;
        }

        // Verify user is a participant
        const isParticipant = dealSummary.participants.some(
          p => p.toString() === userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to edit this deal' });
          return;
        }

        // Update allowed fields
        if (updates.quantity) dealSummary.quantity = updates.quantity;
        if (updates.agreedPrice) dealSummary.agreedPrice = updates.agreedPrice;
        if (updates.deliveryDate) dealSummary.deliveryDate = updates.deliveryDate;
        if (updates.product) dealSummary.product.name = updates.product;

        await dealSummary.save();

        // Emit update to both participants
        io.to(`conversation:${conversationId}`).emit('deal:updated', {
          dealSummaryId: dealSummary._id,
          conversationId,
          updatedBy: userId,
          updates: {
            product: dealSummary.product,
            quantity: dealSummary.quantity,
            agreedPrice: dealSummary.agreedPrice,
            deliveryDate: dealSummary.deliveryDate
          }
        });

        socket.emit('deal:edit:success', {
          dealSummaryId: dealSummary._id
        });

      } catch (error) {
        console.error('Error editing deal summary:', error);
        socket.emit('error', { 
          message: 'Failed to edit deal summary',
          error: error.message 
        });
      }
    });

    // Handle read receipt
    socket.on('message:read', async (data) => {
      try {
        const { messageId, conversationId } = data;

        if (!messageId) {
          socket.emit('error', { message: 'Message ID is required' });
          return;
        }

        // Find and update message
        const message = await Message.findById(messageId);

        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Verify current user is the recipient
        if (message.recipient.toString() !== userId) {
          socket.emit('error', { message: 'Not authorized to mark this message as read' });
          return;
        }

        // Update message if not already read
        if (!message.isRead) {
          message.isRead = true;
          message.readAt = new Date();
          await message.save();

          // Emit read receipt to sender
          const senderSocketId = connectedUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(`user:${message.sender}`).emit('message:read:receipt', {
              messageId,
              conversationId,
              readAt: message.readAt,
              readBy: userId
            });
          }

          // Acknowledge to reader
          socket.emit('message:read:confirmed', {
            messageId,
            readAt: message.readAt
          });
        }

      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { 
          message: 'Failed to mark message as read',
          error: error.message 
        });
      }
    });

    // Handle bulk read receipts (mark all messages in conversation as read)
    socket.on('conversation:read', async (data) => {
      try {
        const { conversationId } = data;

        // Verify user is part of this conversation
        const userIds = conversationId.split('_');
        if (!userIds.includes(userId)) {
          socket.emit('error', { message: 'Not authorized for this conversation' });
          return;
        }

        // Update all unread messages where current user is recipient
        const result = await Message.updateMany(
          {
            conversationId,
            recipient: userId,
            isRead: false
          },
          {
            $set: {
              isRead: true,
              readAt: new Date()
            }
          }
        );

        // Get the other user in conversation
        const otherUserId = userIds.find(id => id !== userId);

        // Emit read receipt to other user
        if (otherUserId) {
          const otherUserSocketId = connectedUsers.get(otherUserId);
          if (otherUserSocketId) {
            io.to(`user:${otherUserId}`).emit('conversation:read:receipt', {
              conversationId,
              readBy: userId,
              readAt: new Date(),
              count: result.modifiedCount
            });
          }
        }

        // Acknowledge to reader
        socket.emit('conversation:read:confirmed', {
          conversationId,
          count: result.modifiedCount
        });

      } catch (error) {
        console.error('Error marking conversation as read:', error);
        socket.emit('error', { 
          message: 'Failed to mark conversation as read',
          error: error.message 
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.user.name} (${userId}) - Reason: ${reason}`);
      
      // Remove from connected users
      connectedUsers.delete(userId);

      // Broadcast offline status to other users (optional)
      socket.broadcast.emit('user:offline', {
        userId,
        name: socket.user.name
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('✅ Socket.io initialized successfully');
  return io;
};

/**
 * Get Socket.io instance (to be used in controllers)
 */
let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const getSocketIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized. Call initializeSocketIO first.');
  }
  return ioInstance;
};

/**
 * Get connected users map
 */
const getConnectedUsers = () => {
  return connectedUsers;
};

/**
 * Check if user is online
 */
const isUserOnline = (userId) => {
  return connectedUsers.has(userId.toString());
};

/**
 * Emit event to specific user
 */
const emitToUser = (userId, event, data) => {
  if (ioInstance && connectedUsers.has(userId.toString())) {
    ioInstance.to(`user:${userId}`).emit(event, data);
    return true;
  }
  return false;
};

/**
 * Emit event to conversation
 */
const emitToConversation = (conversationId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`conversation:${conversationId}`).emit(event, data);
    return true;
  }
  return false;
};

module.exports = {
  initializeSocketIO,
  setSocketIO,
  getSocketIO,
  getConnectedUsers,
  isUserOnline,
  emitToUser,
  emitToConversation
};
