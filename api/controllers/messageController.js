const Message = require("../models/MessageModel");
const User = require("../models/UserModel");
const Notification = require("../models/NotificationModel");
const { emitToUser, emitToConversation, isUserOnline } = require("../services/socketService");
const translationService = require("../services/ai/translationService");
const sentimentAnalyzer = require("../services/ai/sentimentAnalyzer");
const smartReplyEngine = require("../services/ai/smartReplyEngine");

// Helper function to generate conversationId from two user IDs
const generateConversationId = (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipient, content } = req.body;

    // Validate required fields
    if (!recipient || !content) {
      return res.status(400).json({
        success: false,
        message: "Recipient and content are required",
      });
    }

    // Validate content is not empty
    if (!content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    // Check if recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient not found",
      });
    }

    // Check if sender and recipient are different
    if (req.user._id.toString() === recipient.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send message to yourself",
      });
    }

    // Generate conversationId
    const conversationId = generateConversationId(req.user._id, recipient);

    // Detect language and translate message asynchronously
    let originalLanguage = 'en';
    let translations = {};
    
    try {
      // Detect source language
      const detection = await translationService.detectLanguage(content.trim());
      originalLanguage = detection.language;
      
      // Store original in translations
      translations[originalLanguage] = content.trim();
      
      // Translate to recipient's preferred language if different
      const recipientLanguage = recipientUser.preferences?.language || 'en';
      if (recipientLanguage !== originalLanguage) {
        const translation = await translationService.translateMessage(
          content.trim(),
          recipientLanguage
        );
        
        if (translation.confidence >= 0.8) {
          translations[recipientLanguage] = translation.translatedText;
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
      console.error('Translation error:', translationError);
      // Continue without translation if it fails
      translations[originalLanguage] = content.trim();
    }

    // Create message with AI fields
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      recipient,
      content: content.trim(),
      originalLanguage,
      translations
    });

    // Populate sender and recipient details
    await message.populate("sender", "name role email");
    await message.populate("recipient", "name role email");

    // Create notification for recipient (Requirement 9.2)
    await Notification.create({
      user: recipient,
      type: "message",
      title: "New Message",
      message: `You have a new message from ${req.user.name}`,
      link: `/messages/${conversationId}`,
      metadata: {
        senderId: req.user._id,
        senderName: req.user.name,
        messageId: message._id,
        conversationId,
      },
    });

    // Emit real-time notification if recipient is online
    const recipientOnline = isUserOnline(recipient);
    if (recipientOnline) {
      // Get translated content for recipient
      const recipientLanguage = recipientUser.preferences?.language || 'en';
      const translatedContent = translations[recipientLanguage] || content.trim();
      
      emitToUser(recipient, 'message:notification', {
        conversationId,
        sender: {
          _id: req.user._id,
          name: req.user.name,
          role: req.user.role
        },
        content: translatedContent.substring(0, 50) + (translatedContent.length > 50 ? '...' : ''),
        messageId: message._id,
        createdAt: message.createdAt
      });
    }

    res.status(201).json({
      success: true,
      data: message,
    });

    // Process AI features asynchronously (don't block response)
    setImmediate(async () => {
      try {
        // Analyze sentiment if recipient is a farmer and sender is a buyer
        if (recipientUser.role === 'farmer' && req.user.role === 'consumer') {
          if (recipientUser.preferences?.enableSentimentAnalysis !== false) {
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

            // Emit sentiment to farmer if online
            if (recipientOnline) {
              emitToUser(recipient, 'message:sentiment', {
                messageId: message._id,
                sentiment: {
                  label: sentiment.label,
                  emoji: sentiment.emoji
                }
              });
            }
          }

          // Generate smart replies for farmer
          if (recipientUser.preferences?.enableSmartReplies !== false) {
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

            // Emit smart replies to farmer if online
            if (recipientOnline) {
              emitToUser(recipient, 'message:smart-replies', {
                messageId: message._id,
                replies: smartReplies
              });
            }
          }
        }

        // Check for deal summary generation (Requirement 4.1)
        const dealSummarizer = require('../services/ai/dealSummarizer');
        const DealSummary = require('../models/DealSummaryModel');
        
        // Get recent conversation messages
        const conversationMessages = await Message.find({ conversationId })
          .sort('-createdAt')
          .limit(20)
          .populate('sender', 'role');

        // Check if conversation contains deal keywords
        const messages = conversationMessages.reverse();
        const dealSummary = await dealSummarizer.generateDealSummary(conversationId, messages);
        
        if (dealSummary) {
          // Check if there's already an active deal summary for this conversation
          const existingSummary = await DealSummary.findActiveByConversation(conversationId);
          
          if (!existingSummary || dealSummary.confidence > existingSummary.confidence) {
            // Create or update deal summary
            const summary = existingSummary || new DealSummary({
              conversationId,
              participants: [req.user._id, recipient]
            });
            
            summary.product = {
              name: dealSummary.product,
              productId: dealSummary.productId
            };
            summary.quantity = dealSummary.quantity;
            summary.agreedPrice = dealSummary.agreedPrice;
            summary.deliveryDate = dealSummary.deliveryDate;
            summary.confidence = dealSummary.confidence;
            summary.extractedAt = new Date();
            
            await summary.save();
            
            // Emit deal summary to both participants (Requirement 4.3)
            const summaryData = {
              _id: summary._id,
              conversationId: summary.conversationId,
              product: summary.product,
              quantity: summary.quantity,
              agreedPrice: summary.agreedPrice,
              deliveryDate: summary.deliveryDate,
              confidence: summary.confidence,
              status: summary.status,
              extractedAt: summary.extractedAt
            };
            
            // Emit to sender
            emitToUser(req.user._id, 'deal:summary', summaryData);
            
            // Emit to recipient if online
            if (recipientOnline) {
              emitToUser(recipient, 'deal:summary', summaryData);
            }
            
            console.log('Deal summary generated and emitted:', summary._id);
          }
        }
      } catch (aiError) {
        console.error('AI processing error:', aiError);
        // Don't fail the message send if AI processing fails
      }
    });
  } catch (error) {
    require('fs').appendFileSync('api_error.txt', new Date().toISOString() + '\\n' + error.stack + '\n\n');
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    })
      .sort("-createdAt")
      .populate("sender", "name role email photo")
      .populate("recipient", "name role email photo");

    // Group messages by conversationId
    const conversationsMap = {};

    messages.forEach((message) => {
      const conversationId = message.conversationId;

      // Determine the other user in the conversation
      const otherUser =
        message.sender._id.toString() === req.user._id.toString()
          ? message.recipient
          : message.sender;

      if (!conversationsMap[conversationId]) {
        // First message in this conversation
        conversationsMap[conversationId] = {
          conversationId,
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name,
            role: otherUser.role,
            email: otherUser.email,
            photo: otherUser.photo,
          },
          lastMessage: {
            _id: message._id,
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            senderId: message.sender._id,
          },
          unreadCount: 0,
        };

        // Count unread messages where current user is recipient
        if (
          message.recipient._id.toString() === req.user._id.toString() &&
          !message.isRead
        ) {
          conversationsMap[conversationId].unreadCount = 1;
        }
      } else {
        // Additional messages in this conversation - only count unread
        if (
          message.recipient._id.toString() === req.user._id.toString() &&
          !message.isRead
        ) {
          conversationsMap[conversationId].unreadCount += 1;
        }
      }
    });

    // Convert map to array
    const conversations = Object.values(conversationsMap);

    res.json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Validate conversationId format (should be userId1_userId2)
    const userIds = conversationId.split("_");
    if (userIds.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
    }

    // Verify that current user is part of this conversation
    if (
      !userIds.includes(req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this conversation",
      });
    }

    // Get all messages in this conversation
    const messages = await Message.find({ conversationId })
      .sort("createdAt")
      .populate("sender", "name role email photo")
      .populate("recipient", "name role email photo");

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Mark a message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the message
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Verify that current user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to mark this message as read",
      });
    }

    // Update message if not already read
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();

      // Emit read receipt to sender if online
      const senderOnline = isUserOnline(message.sender);
      if (senderOnline) {
        emitToUser(message.sender, 'message:read:receipt', {
          messageId: message._id,
          conversationId: message.conversationId,
          readAt: message.readAt,
          readBy: req.user._id
        });
      }
    }

    res.json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
