/**
 * Translation Service
 * Handles automatic language detection and translation between Telugu, Hindi, and English
 */

const { Translate } = require('@google-cloud/translate').v2;
const aiRouter = require('./aiRouter');
const aiLogger = require('../../utils/aiLogger');

class TranslationService {
  constructor() {
    // Initialize Google Translate API
    this.translate = new Translate({
      key: process.env.GOOGLE_TRANSLATE_API_KEY
    });
    
    this.supportedLanguages = ['en', 'te', 'hi'];
    this.languageNames = {
      'en': 'English',
      'te': 'Telugu',
      'hi': 'Hindi'
    };
  }

  /**
   * Detect the language of a text
   */
  async detectLanguage(content) {
    try {
      const [detection] = await this.translate.detect(content);
      const detectedLang = detection.language;
      const confidence = detection.confidence || 0;

      aiLogger.info('TranslationService', 'Language detected', {
        detected: detectedLang,
        confidence,
        textLength: content.length
      });

      return {
        language: this.mapToSupportedLanguage(detectedLang),
        confidence,
        original: detectedLang
      };
    } catch (error) {
      aiLogger.error('TranslationService', 'Language detection failed', error);
      // Default to English if detection fails
      return {
        language: 'en',
        confidence: 0,
        original: 'unknown'
      };
    }
  }

  /**
   * Map detected language to supported language
   */
  mapToSupportedLanguage(detectedLang) {
    const mapping = {
      'en': 'en',
      'te': 'te',
      'hi': 'hi',
      'ta': 'en', // Tamil -> English fallback
      'kn': 'en', // Kannada -> English fallback
      'mr': 'hi', // Marathi -> Hindi fallback
    };
    return mapping[detectedLang] || 'en';
  }

  /**
   * Translate message to target language
   */
  async translateMessage(content, targetLanguage) {
    const startTime = Date.now();

    try {
      // Validate target language
      if (!this.supportedLanguages.includes(targetLanguage)) {
        throw new Error(`Unsupported target language: ${targetLanguage}`);
      }

      // Generate cache key
      const cacheKey = aiRouter.generateCacheKey('translation', content, targetLanguage);

      // Try cache first, then execute with circuit breaker
      const result = await aiRouter.getCachedOrExecute(
        cacheKey,
        86400, // 24 hours TTL
        async () => {
          // Detect source language
          const detection = await this.detectLanguage(content);
          const sourceLanguage = detection.language;

          // Skip translation if source === target
          if (sourceLanguage === targetLanguage) {
            return {
              originalText: content,
              translatedText: content,
              sourceLanguage,
              targetLanguage,
              confidence: 1.0
            };
          }

          // Translate using Google Translate API with circuit breaker
          const [translation] = await aiRouter.executeWithCircuitBreaker(
            'googleTranslate',
            'translate',
            async () => {
              return await this.translate.translate(content, {
                from: sourceLanguage,
                to: targetLanguage
              });
            }
          );

          return {
            originalText: content,
            translatedText: translation,
            sourceLanguage,
            targetLanguage,
            confidence: detection.confidence
          };
        }
      );

      const duration = Date.now() - startTime;
      aiLogger.info('TranslationService', 'Translation completed', {
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        confidence: result.confidence,
        duration
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      aiLogger.error('TranslationService', 'Translation failed', error);

      // Return original message with low confidence on failure
      return {
        originalText: content,
        translatedText: content,
        sourceLanguage: 'unknown',
        targetLanguage,
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Batch translate multiple messages
   */
  async translateMessages(messages, targetLanguage) {
    const translations = await Promise.all(
      messages.map(msg => this.translateMessage(msg, targetLanguage))
    );
    return translations;
  }

  /**
   * Check if translation confidence is acceptable
   */
  isConfidenceAcceptable(confidence, threshold = 0.8) {
    return confidence >= threshold;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages.map(code => ({
      code,
      name: this.languageNames[code]
    }));
  }
}

module.exports = new TranslationService();
