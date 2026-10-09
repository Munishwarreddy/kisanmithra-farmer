/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by monitoring service health
 * Requirement: 6.3
 */

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60 seconds
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      lastStateChange: new Date()
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute(fn, fallback = null) {
    this.stats.totalRequests++;

    // Check if circuit is open
    if (this.state === 'OPEN') {
      // Check if enough time has passed to try again
      if (Date.now() >= this.nextAttemptTime) {
        this.state = 'HALF_OPEN';
        this.stats.lastStateChange = new Date();
        console.log(`[CircuitBreaker:${this.name}] State changed to HALF_OPEN`);
      } else {
        // Circuit is still open, reject request
        this.stats.rejectedRequests++;
        console.log(`[CircuitBreaker:${this.name}] Request rejected - circuit is OPEN`);
        
        if (fallback) {
          return await fallback();
        }
        
        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      }
    }

    try {
      // Execute the function
      const result = await fn();
      
      // Record success
      this.onSuccess();
      
      return result;
    } catch (error) {
      // Record failure
      this.onFailure();
      
      // If we have a fallback, use it
      if (fallback) {
        console.log(`[CircuitBreaker:${this.name}] Using fallback due to error:`, error.message);
        return await fallback();
      }
      
      throw error;
    }
  }

  /**
   * Record a successful request
   */
  onSuccess() {
    this.stats.successfulRequests++;
    this.successCount++;
    
    if (this.state === 'HALF_OPEN') {
      // If we're in half-open state and got a success, close the circuit
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.stats.lastStateChange = new Date();
      console.log(`[CircuitBreaker:${this.name}] State changed to CLOSED after successful request`);
    }
  }

  /**
   * Record a failed request
   */
  onFailure() {
    this.stats.failedRequests++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN') {
      // If we're in half-open state and got a failure, open the circuit again
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      this.stats.lastStateChange = new Date();
      console.log(`[CircuitBreaker:${this.name}] State changed to OPEN after failed request in HALF_OPEN`);
    } else if (this.failureCount >= this.failureThreshold) {
      // If we've hit the failure threshold, open the circuit
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      this.stats.lastStateChange = new Date();
      console.log(`[CircuitBreaker:${this.name}] State changed to OPEN after ${this.failureCount} failures`);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      stats: this.stats,
      isOpen: this.state === 'OPEN',
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    this.stats.lastStateChange = new Date();
    console.log(`[CircuitBreaker:${this.name}] Manually reset to CLOSED`);
  }

  /**
   * Get success rate
   */
  getSuccessRate() {
    const total = this.stats.successfulRequests + this.stats.failedRequests;
    if (total === 0) return 1.0;
    return this.stats.successfulRequests / total;
  }
}

// Create circuit breakers for each AI service
const circuitBreakers = {
  openai: new CircuitBreaker('OpenAI', {
    failureThreshold: 5,
    resetTimeout: 60000
  }),
  googleTranslate: new CircuitBreaker('GoogleTranslate', {
    failureThreshold: 5,
    resetTimeout: 60000
  }),
  pricePredictor: new CircuitBreaker('PricePredictor', {
    failureThreshold: 3,
    resetTimeout: 120000 // 2 minutes for price predictor
  })
};

/**
 * Get circuit breaker by name
 */
function getCircuitBreaker(name) {
  return circuitBreakers[name];
}

/**
 * Get all circuit breaker states
 */
function getAllStates() {
  return Object.keys(circuitBreakers).map(name => 
    circuitBreakers[name].getState()
  );
}

/**
 * Reset all circuit breakers
 */
function resetAll() {
  Object.values(circuitBreakers).forEach(cb => cb.reset());
}

module.exports = {
  CircuitBreaker,
  getCircuitBreaker,
  getAllStates,
  resetAll,
  circuitBreakers
};
