/**
 * Smart Reply Engine
 * Generates contextual reply suggestions for farmers
 */

const OpenAI = require('openai');
const aiRouter = require('./aiRouter');
const aiLogger = require('../../utils/aiLogger');

class SmartReplyEngine {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-not-configured'
    });
  }

  /**
   * Build prompt for smart reply generation
   */
  buildSmartReplyPrompt(buyerMessage, conversationHistory, productInfo) {
    const context = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map(m => `${m.senderRole}: ${m.content}`)
      .join('\n');
    
    const productContext = productInfo 
      ? `Product: ${productInfo.name}, Price: ₹${productInfo.price}/${productInfo.unit}, Available: ${productInfo.quantityAvailable}${productInfo.unit}`
      : '';
    
    return `You are helping a farmer respond to a buyer's message in an agricultural e-commerce platform.

Context:
${context || 'No previous conversation'}

${productContext}

Buyer's latest message: "${buyerMessage}"

Generate 3 helpful, professional reply suggestions for the farmer. Each reply should be:
- Concise (1-2 sentences)
- Professional but friendly
- Specific to the context
- Include pricing/quantity details when relevant
- In simple English that farmers can understand

Format as JSON array:
[
  {"text": "reply 1", "category": "pricing|quantity|delivery|general"},
  {"text": "reply 2", "category": "pricing|quantity|delivery|general"},
  {"text": "reply 3", "category": "pricing|quantity|delivery|general"}
]`;
  }

  /**
   * Generate smart reply suggestions
   */
  async generateSmartReplies(buyerMessage, conversationHistory = [], productInfo = null) {
    const startTime = Date.now();

    try {
      // Generate cache key
      const cacheKey = aiRouter.generateCacheKey(
        'smart-reply',
        buyerMessage,
        productInfo?.name || 'no-product'
      );

      // Try cache first, then execute with circuit breaker
      const result = await aiRouter.getCachedOrExecute(
        cacheKey,
        3600, // 1 hour TTL
        async () => {
          // Build prompt
          const prompt = this.buildSmartReplyPrompt(
            buyerMessage,
            conversationHistory,
            productInfo
          );

          // Call OpenAI API with circuit breaker
          const response = await aiRouter.executeWithCircuitBreaker(
            'openai',
            'smart-reply-generation',
            async () => {
              return await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7, // Higher temperature for creative responses
                max_tokens: 300
              });
            }
          );

          const resultText = response.choices[0].message.content.trim();
          const replies = JSON.parse(resultText);

          // Add metadata to each reply
          return replies.map((reply, index) => ({
            id: `reply-${Date.now()}-${index}`,
            text: reply.text,
            category: reply.category,
            confidence: 0.85, // Default confidence
            generatedAt: new Date()
          }));
        }
      );

      const duration = Date.now() - startTime;
      aiLogger.info('SmartReplyEngine', 'Smart replies generated', {
        count: result.length,
        duration,
        hasProduct: !!productInfo
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      aiLogger.error('SmartReplyEngine', 'Smart reply generation failed', error);

      // Return fallback generic replies
      return this.getFallbackReplies(buyerMessage);
    }
  }

  /**
   * Get fallback replies when AI fails
   */
  getFallbackReplies(buyerMessage) {
    const message = buyerMessage.toLowerCase();
    
    // Check for pricing keywords
    if (message.includes('price') || message.includes('cost') || message.includes('discount')) {
      return [
        {
          id: `fallback-${Date.now()}-0`,
          text: "Let me check the current price and get back to you.",
          category: 'pricing',
          confidence: 0.5,
          generatedAt: new Date()
        },
        {
          id: `fallback-${Date.now()}-1`,
          text: "I can offer a good price for bulk orders. How much quantity do you need?",
          category: 'pricing',
          confidence: 0.5,
          generatedAt: new Date()
        },
        {
          id: `fallback-${Date.now()}-2`,
          text: "The price depends on quantity and delivery location. Please share your requirements.",
          category: 'general',
          confidence: 0.5,
          generatedAt: new Date()
        }
      ];
    }
    
    // Check for quantity keywords
    if (message.includes('quantity') || message.includes('kg') || message.includes('bulk')) {
      return [
        {
          id: `fallback-${Date.now()}-0`,
          text: "I have good stock available. How much quantity do you need?",
          category: 'quantity',
          confidence: 0.5,
          generatedAt: new Date()
        },
        {
          id: `fallback-${Date.now()}-1`,
          text: "For bulk orders, I can arrange the quantity you need. Please specify.",
          category: 'quantity',
          confidence: 0.5,
          generatedAt: new Date()
        },
        {
          id: `fallback-${Date.now()}-2`,
          text: "Let me know your required quantity and I'll confirm availability.",
          category: 'general',
          confidence: 0.5,
          generatedAt: new Date()
        }
      ];
    }
    
    // Generic fallback
    return [
      {
        id: `fallback-${Date.now()}-0`,
        text: "Thank you for your message. I'll get back to you shortly.",
        category: 'general',
        confidence: 0.5,
        generatedAt: new Date()
      },
      {
        id: `fallback-${Date.now()}-1`,
        text: "Please share more details about your requirements.",
        category: 'general',
        confidence: 0.5,
        generatedAt: new Date()
      },
      {
        id: `fallback-${Date.now()}-2`,
        text: "I'm available to discuss this. When would be a good time to talk?",
        category: 'general',
        confidence: 0.5,
        generatedAt: new Date()
      }
    ];
  }

  /**
   * Check if message contains pricing keywords
   */
  containsPricingKeywords(message) {
    const keywords = ['price', 'cost', 'discount', 'rate', 'cheap', 'expensive', '₹', 'rupee'];
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Check if message contains quantity keywords
   */
  containsQuantityKeywords(message) {
    const keywords = ['quantity', 'kg', 'ton', 'bulk', 'how much', 'amount', 'quintal'];
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }
}

module.exports = new SmartReplyEngine();
