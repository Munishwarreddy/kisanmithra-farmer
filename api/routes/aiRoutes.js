/**
 * AI Services API Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../utils/authMiddleware');
const aiRouter = require('../services/ai/aiRouter');
const sentimentAnalyzer = require('../services/ai/sentimentAnalyzer');
const smartReplyEngine = require('../services/ai/smartReplyEngine');
const dealSummarizer = require('../services/ai/dealSummarizer');
const pricePredictor = require('../services/ai/pricePredictor');
const chatbotService = require('../services/ai/chatbotService');
const Message = require('../models/MessageModel');
const Product = require('../models/ProductModel');

/**
 * @route   GET /api/ai/health
 * @desc    Check AI services health and circuit breaker states
 * @access  Private (Admin only)
 */
router.get('/health', protect, async (req, res) => {
  try {
    const circuitBreakers = aiRouter.getCircuitBreakerStates();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: circuitBreakers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI services health',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai/metrics
 * @desc    Get AI service metrics (success rates, response times, cache hit rates)
 * @access  Private (Admin only)
 * Requirement: 6.6
 */
router.get('/metrics', protect, async (req, res) => {
  try {
    // Only allow admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { getRedisClient } = require('../utils/redisClient');
    const redis = getRedisClient();
    
    // Get circuit breaker states
    const circuitBreakers = aiRouter.getCircuitBreakerStates();
    
    // Calculate metrics for each service
    const metrics = circuitBreakers.map(cb => {
      const totalRequests = cb.stats.successfulRequests + cb.stats.failedRequests;
      const successRate = totalRequests > 0 
        ? (cb.stats.successfulRequests / totalRequests * 100).toFixed(2)
        : 100;
      
      return {
        service: cb.name,
        state: cb.state,
        isHealthy: cb.state === 'CLOSED',
        successRate: parseFloat(successRate),
        totalRequests: cb.stats.totalRequests,
        successfulRequests: cb.stats.successfulRequests,
        failedRequests: cb.stats.failedRequests,
        rejectedRequests: cb.stats.rejectedRequests,
        lastStateChange: cb.stats.lastStateChange
      };
    });

    // Get cache statistics (if Redis is available)
    let cacheStats = null;
    if (redis) {
      try {
        const info = await redis.info('stats');
        const lines = info.split('\r\n');
        const stats = {};
        
        lines.forEach(line => {
          const [key, value] = line.split(':');
          if (key && value) {
            stats[key] = value;
          }
        });

        cacheStats = {
          connected: true,
          keyspaceHits: parseInt(stats.keyspace_hits) || 0,
          keyspaceMisses: parseInt(stats.keyspace_misses) || 0,
          hitRate: stats.keyspace_hits && stats.keyspace_misses
            ? ((parseInt(stats.keyspace_hits) / 
                (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses))) * 100).toFixed(2)
            : 'N/A'
        };
      } catch (cacheError) {
        cacheStats = {
          connected: false,
          error: cacheError.message
        };
      }
    } else {
      cacheStats = {
        connected: false,
        message: 'Redis not configured'
      };
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      services: metrics,
      cache: cacheStats,
      summary: {
        totalServices: metrics.length,
        healthyServices: metrics.filter(m => m.isHealthy).length,
        averageSuccessRate: (
          metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
        ).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI service metrics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/smart-replies
 * @desc    Generate smart reply suggestions for a message
 * @access  Private
 */
router.post('/smart-replies', protect, async (req, res) => {
  try {
    const { messageId, productId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required'
      });
    }

    // Get the message
    const message = await Message.findById(messageId)
      .populate('sender', 'name role')
      .populate('recipient', 'name role');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Get conversation history
    const conversationHistory = await Message.find({
      conversationId: message.conversationId
    })
      .sort('createdAt')
      .limit(10)
      .select('content sender')
      .populate('sender', 'role');

    const formattedHistory = conversationHistory.map(m => ({
      content: m.content,
      senderRole: m.sender.role
    }));

    // Get product info if provided
    let productInfo = null;
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        productInfo = {
          name: product.name,
          price: product.price,
          unit: product.unit,
          quantityAvailable: product.quantityAvailable
        };
      }
    }

    // Generate smart replies
    const replies = await smartReplyEngine.generateSmartReplies(
      message.content,
      formattedHistory,
      productInfo
    );

    res.json({
      success: true,
      data: replies
    });
  } catch (error) {
    console.error('Smart replies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate smart replies',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/deal-summary
 * @desc    Generate deal summary from conversation
 * @access  Private
 */
router.post('/deal-summary', protect, async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }

    // Get all messages in conversation
    const messages = await Message.find({ conversationId })
      .sort('createdAt')
      .populate('sender', 'role');

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No messages found in conversation'
      });
    }

    // Verify user is part of conversation
    const userInConversation = messages.some(
      m => m.sender._id.toString() === req.user._id.toString() ||
           m.recipient.toString() === req.user._id.toString()
    );

    if (!userInConversation) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this conversation'
      });
    }

    const formattedMessages = messages.map(m => ({
      content: m.content,
      senderRole: m.sender.role
    }));

    // Generate deal summary
    const summary = await dealSummarizer.generateDealSummary(
      conversationId,
      formattedMessages
    );

    if (!summary) {
      return res.json({
        success: true,
        data: null,
        message: 'No deal details found in conversation'
      });
    }

    res.json({
      success: true,
      data: dealSummarizer.formatDealSummary(summary)
    });
  } catch (error) {
    console.error('Deal summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate deal summary',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/price-prediction
 * @desc    Get price prediction for a product
 * @access  Private
 */
router.post('/price-prediction', protect, async (req, res) => {
  try {
    const { productName, category, region } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    // Generate price prediction
    const prediction = await pricePredictor.predictPrice(
      productName,
      category,
      region
    );

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Price prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate price prediction',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with the AI Assistant
 * @access  Public
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await chatbotService.processChat(message, history);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        message: response.error
      });
    }

    res.json({
      success: true,
      data: response.text
    });
  } catch (error) {
    console.error('Chatbot route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat',
      error: error.message
    });
  }
});

module.exports = router;
