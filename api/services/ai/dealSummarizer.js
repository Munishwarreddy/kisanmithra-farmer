/**
 * Deal Summarizer
 * Extracts and structures transaction terms from chat conversations
 */

const OpenAI = require('openai');
const aiRouter = require('./aiRouter');
const aiLogger = require('../../utils/aiLogger');

class DealSummarizer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-not-configured'
    });
    
    this.dealKeywords = [
      'price', 'quantity', 'kg', 'ton', 'delivery', 'date',
      'discount', 'bulk', 'order', 'buy', 'purchase', 'rupee', '₹'
    ];
  }

  /**
   * Check if conversation contains deal-related content
   */
  containsDealKeywords(messages) {
    const allText = messages.map(m => m.content.toLowerCase()).join(' ');
    return this.dealKeywords.some(keyword => allText.includes(keyword));
  }

  /**
   * Generate deal summary from conversation
   */
  async generateDealSummary(conversationId, messages) {
    const startTime = Date.now();

    try {
      // Check if conversation contains deal-related content
      if (!this.containsDealKeywords(messages)) {
        aiLogger.info('DealSummarizer', 'No deal keywords found', {
          conversationId,
          messageCount: messages.length
        });
        return null;
      }

      // Build conversation context
      const conversationText = messages
        .map(m => `${m.senderRole || 'User'}: ${m.content}`)
        .join('\n');

      // Build extraction prompt
      const prompt = `Extract transaction details from this conversation between a farmer and buyer.

Conversation:
${conversationText}

Extract the following if mentioned:
- Product name
- Quantity (with units like kg, ton, quintal)
- Agreed price (per unit, include ₹ symbol)
- Delivery date (in DD MMM format like 18 Feb)

If multiple values are mentioned for the same field, use the most recent one.

Respond with JSON only:
{
  "product": "...",
  "quantity": "...",
  "agreedPrice": "...",
  "deliveryDate": "...",
  "confidence": 0.0-1.0
}

If any field is not clearly mentioned, use null for that field.`;

      // Call OpenAI API with circuit breaker
      const response = await aiRouter.executeWithCircuitBreaker(
        'openai',
        'deal-summary-extraction',
        async () => {
          return await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2, // Low temperature for consistent extraction
            max_tokens: 200
          });
        }
      );

      const resultText = response.choices[0].message.content.trim();
      const extracted = JSON.parse(resultText);

      // Only return summary if confidence is high and key fields present
      if (extracted.confidence > 0.7 && extracted.product && extracted.quantity) {
        const summary = {
          conversationId,
          product: extracted.product,
          quantity: extracted.quantity,
          agreedPrice: extracted.agreedPrice,
          deliveryDate: extracted.deliveryDate,
          confidence: extracted.confidence,
          extractedAt: new Date()
        };

        const duration = Date.now() - startTime;
        aiLogger.info('DealSummarizer', 'Deal summary generated', {
          conversationId,
          confidence: summary.confidence,
          duration
        });

        return summary;
      }

      aiLogger.info('DealSummarizer', 'Insufficient data for deal summary', {
        conversationId,
        confidence: extracted.confidence,
        hasProduct: !!extracted.product,
        hasQuantity: !!extracted.quantity
      });

      return null;
    } catch (error) {
      const duration = Date.now() - startTime;
      aiLogger.error('DealSummarizer', 'Deal summary generation failed', error);
      return null;
    }
  }

  /**
   * Format deal summary for display
   */
  formatDealSummary(summary) {
    if (!summary) return null;

    return {
      title: '📋 Deal Summary',
      fields: [
        { label: '📦 Product', value: summary.product || 'Not specified' },
        { label: '📊 Quantity', value: summary.quantity || 'Not specified' },
        { label: '💰 Agreed Price', value: summary.agreedPrice || 'Not specified' },
        { label: '📅 Delivery Date', value: summary.deliveryDate || 'Not specified' }
      ],
      confidence: summary.confidence,
      extractedAt: summary.extractedAt
    };
  }

  /**
   * Check if deal summary is complete
   */
  isComplete(summary) {
    return summary && 
           summary.product && 
           summary.quantity && 
           summary.agreedPrice && 
           summary.deliveryDate;
  }

  /**
   * Get missing fields from deal summary
   */
  getMissingFields(summary) {
    const missing = [];
    if (!summary) return ['product', 'quantity', 'agreedPrice', 'deliveryDate'];
    
    if (!summary.product) missing.push('product');
    if (!summary.quantity) missing.push('quantity');
    if (!summary.agreedPrice) missing.push('agreedPrice');
    if (!summary.deliveryDate) missing.push('deliveryDate');
    
    return missing;
  }
}

module.exports = new DealSummarizer();
