/**
 * AI Services Router
 * Central routing layer for all AI service requests
 */

const { getCircuitBreaker, getAllStates } = require('../../utils/circuitBreaker');
const aiLogger = require('../../utils/aiLogger');
const { getRedisClient } = require('../../utils/redisClient');
const crypto = require('crypto');

class AIServicesRouter {
  constructor() {
    // Circuit breakers are managed centrally in circuitBreaker.js
  }

  /**
   * Execute AI service call with circuit breaker protection
   */
  async executeWithCircuitBreaker(serviceName, operation, fn, fallback = null) {
    const startTime = Date.now();
    const circuitBreaker = getCircuitBreaker(serviceName);
    
    if (!circuitBreaker) {
      throw new Error(`No circuit breaker found for service: ${serviceName}`);
    }
    
    try {
      aiLogger.logRequest(serviceName, operation, {});
      
      const result = await circuitBreaker.execute(fn, fallback);
      
      const duration = Date.now() - startTime;
      aiLogger.logResponse(serviceName, operation, duration, true);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      aiLogger.logError(serviceName, operation, error);
      aiLogger.logResponse(serviceName, operation, duration, false);
      throw error;
    }
  }

  /**
   * Get cached result or execute function and cache result
   */
  async getCachedOrExecute(cacheKey, ttl, fn) {
    const redis = getRedisClient();
    
    // Try to get from cache
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          aiLogger.info('Cache', 'Cache hit', { key: cacheKey });
          return JSON.parse(cached);
        }
      } catch (error) {
        aiLogger.warn('Cache', 'Cache read failed', { error: error.message });
      }
    }

    // Execute function
    const result = await fn();

    // Store in cache
    if (redis && result) {
      try {
        await redis.setEx(cacheKey, ttl, JSON.stringify(result));
        aiLogger.info('Cache', 'Cache set', { key: cacheKey, ttl });
      } catch (error) {
        aiLogger.warn('Cache', 'Cache write failed', { error: error.message });
      }
    }

    return result;
  }

  /**
   * Generate cache key from parameters
   */
  generateCacheKey(prefix, ...params) {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex');
    return `${prefix}:${hash}`;
  }

  /**
   * Get circuit breaker states for monitoring
   */
  getCircuitBreakerStates() {
    return getAllStates();
  }
}

module.exports = new AIServicesRouter();
