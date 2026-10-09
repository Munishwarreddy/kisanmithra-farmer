/**
 * Sentiment Analyzer
 * Classifies the emotional tone of buyer messages
 */

const OpenAI = require('openai');
const aiRouter = require('./aiRouter');
const aiLogger = require('../../utils/aiLogger');

class SentimentAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-not-configured'
    });
    
    this.emojiMap = {
      'positive': '😊',
      'neutral': '😐',
      'urgent': '⚠️',
      'angry': '🔴'
    };
  }

  /**
   * Analyze sentiment of a message
   */
  async analyzeSentiment(content) {
    const startTime = Date.now();

    try {
      // Generate cache key
      const cacheKey = aiRouter.generateCacheKey('sentiment', content);

      // Try cache first, then execute with circuit breaker
      const result = await aiRouter.getCachedOrExecute(
        cacheKey,
        3600, // 1 hour TTL
        async () => {
          // Build prompt for OpenAI
          const prompt = `Analyze the sentiment of this message from a buyer to a farmer in an e-commerce context.

Message: "${content}"

Classify as one of: positive, neutral, urgent, angry

Consider:
- Positive: Happy, satisfied, friendly tone
- Neutral: Informational, straightforward questions
- Urgent: Time-sensitive, needs quick response
- Angry: Frustrated, disappointed, demanding

Respond with JSON only: {"label": "...", "confidence": 0.0-1.0, "reasoning": "..."}`;

          // Call OpenAI API with circuit breaker
          const response = await aiRouter.executeWithCircuitBreaker(
            'openai',
            'sentiment-analysis',
            async () => {
              return await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3, // Lower temperature for consistent classification
                max_tokens: 100
              });
            }
          );

          const resultText = response.choices[0].message.content.trim();
          const parsed = JSON.parse(resultText);

          return {
            label: parsed.label,
            confidence: parsed.confidence,
            reasoning: parsed.reasoning
          };
        }
      );

      // Map to emoji
      let sentimentResult = {
        label: result.label,
        confidence: result.confidence,
        emoji: this.emojiMap[result.label] || '😐',
        analyzedAt: new Date()
      };

      // Default to neutral if confidence < 70%
      if (sentimentResult.confidence < 0.7) {
        sentimentResult.label = 'neutral';
        sentimentResult.emoji = '😐';
        aiLogger.info('SentimentAnalyzer', 'Low confidence - defaulting to neutral', {
          originalLabel: result.label,
          confidence: result.confidence
        });
      }

      const duration = Date.now() - startTime;
      aiLogger.info('SentimentAnalyzer', 'Sentiment analyzed', {
        label: sentimentResult.label,
        confidence: sentimentResult.confidence,
        duration
      });

      return sentimentResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      aiLogger.error('SentimentAnalyzer', 'Sentiment analysis failed', error);

      // Return neutral sentiment on failure
      return {
        label: 'neutral',
        confidence: 0,
        emoji: '😐',
        analyzedAt: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Batch analyze sentiments for multiple messages
   */
  async analyzeSentiments(messages) {
    const sentiments = await Promise.all(
      messages.map(msg => this.analyzeSentiment(msg))
    );
    return sentiments;
  }

  /**
   * Check if sentiment requires immediate attention
   */
  requiresImmediateAttention(sentiment) {
    return sentiment.label === 'angry' || sentiment.label === 'urgent';
  }

  /**
   * Get sentiment statistics
   */
  getSentimentStats(sentiments) {
    const stats = {
      positive: 0,
      neutral: 0,
      urgent: 0,
      angry: 0,
      total: sentiments.length
    };

    sentiments.forEach(s => {
      if (stats.hasOwnProperty(s.label)) {
        stats[s.label]++;
      }
    });

    return stats;
  }
}

module.exports = new SentimentAnalyzer();
