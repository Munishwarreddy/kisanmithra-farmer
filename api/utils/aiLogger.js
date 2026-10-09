/**
 * AI Services Logger
 * Logs all AI service requests, responses, and errors for monitoring
 */

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'ai-services.log');

const logLevels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const log = (level, service, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    service,
    message,
    ...data
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  // Write to file
  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level}] ${service}: ${message}`, data);
  }
};

const aiLogger = {
  info: (service, message, data) => log(logLevels.INFO, service, message, data),
  warn: (service, message, data) => log(logLevels.WARN, service, message, data),
  error: (service, message, data) => log(logLevels.ERROR, service, message, data),

  logRequest: (service, operation, params) => {
    log(logLevels.INFO, service, `Request: ${operation}`, { params });
  },

  logResponse: (service, operation, duration, success = true) => {
    log(logLevels.INFO, service, `Response: ${operation}`, { duration, success });
  },

  logError: (service, operation, error) => {
    log(logLevels.ERROR, service, `Error: ${operation}`, {
      error: error.message,
      stack: error.stack
    });
  }
};

module.exports = aiLogger;
