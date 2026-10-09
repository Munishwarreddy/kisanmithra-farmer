/**
 * AI Data Purge Job
 * Automatically purges AI-generated data older than 90 days
 * Requirement: 7.6
 */

const cron = require('node-cron');
const Message = require('../models/MessageModel');
const DealSummary = require('../models/DealSummaryModel');
const PricePrediction = require('../models/PricePredictionModel');
const aiLogger = require('../utils/aiLogger');

/**
 * Purge old AI data from messages
 */
async function purgeOldMessageAIData() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    // Find messages older than 90 days with AI data
    const result = await Message.updateMany(
      {
        createdAt: { $lt: cutoffDate },
        $or: [
          { 'sentiment.label': { $exists: true } },
          { 'smartReplies.0': { $exists: true } },
          { 'translations.en': { $exists: true } }
        ]
      },
      {
        $unset: {
          sentiment: '',
          smartReplies: '',
          translations: ''
        }
      }
    );

    aiLogger.info('AIDataPurge', 'Purged old message AI data', {
      messagesUpdated: result.modifiedCount,
      cutoffDate: cutoffDate.toISOString()
    });

    return result.modifiedCount;
  } catch (error) {
    aiLogger.error('AIDataPurge', 'Failed to purge message AI data', error);
    throw error;
  }
}

/**
 * Purge old deal summaries
 */
async function purgeOldDealSummaries() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    // Delete deal summaries older than 90 days that are not converted to orders
    const result = await DealSummary.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $ne: 'converted_to_order' } // Keep converted deals for order history
    });

    aiLogger.info('AIDataPurge', 'Purged old deal summaries', {
      summariesDeleted: result.deletedCount,
      cutoffDate: cutoffDate.toISOString()
    });

    return result.deletedCount;
  } catch (error) {
    aiLogger.error('AIDataPurge', 'Failed to purge deal summaries', error);
    throw error;
  }
}

/**
 * Purge expired price predictions
 * Note: This is handled automatically by MongoDB TTL index,
 * but we can manually clean up any that slipped through
 */
async function purgeExpiredPricePredictions() {
  try {
    const now = new Date();

    const result = await PricePrediction.deleteMany({
      validUntil: { $lt: now }
    });

    aiLogger.info('AIDataPurge', 'Purged expired price predictions', {
      predictionsDeleted: result.deletedCount
    });

    return result.deletedCount;
  } catch (error) {
    aiLogger.error('AIDataPurge', 'Failed to purge price predictions', error);
    throw error;
  }
}

/**
 * Run all purge operations
 */
async function runPurgeJob() {
  const startTime = Date.now();
  
  aiLogger.info('AIDataPurge', 'Starting AI data purge job', {
    timestamp: new Date().toISOString()
  });

  try {
    const [messagesPurged, summariesPurged, predictionsPurged] = await Promise.all([
      purgeOldMessageAIData(),
      purgeOldDealSummaries(),
      purgeExpiredPricePredictions()
    ]);

    const duration = Date.now() - startTime;

    aiLogger.info('AIDataPurge', 'AI data purge job completed', {
      messagesPurged,
      summariesPurged,
      predictionsPurged,
      duration,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messagesPurged,
      summariesPurged,
      predictionsPurged,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    aiLogger.error('AIDataPurge', 'AI data purge job failed', error);

    return {
      success: false,
      error: error.message,
      duration
    };
  }
}

/**
 * Schedule the purge job to run daily at 2 AM
 */
function scheduleAIDataPurgeJob() {
  // Run daily at 2:00 AM (off-peak hours)
  const job = cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled AI data purge job...');
    await runPurgeJob();
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('✅ AI data purge job scheduled (daily at 2:00 AM UTC)');

  return job;
}

/**
 * Run purge job immediately (for testing or manual execution)
 */
async function runPurgeJobNow() {
  console.log('Running AI data purge job immediately...');
  return await runPurgeJob();
}

module.exports = {
  scheduleAIDataPurgeJob,
  runPurgeJobNow,
  runPurgeJob,
  purgeOldMessageAIData,
  purgeOldDealSummaries,
  purgeExpiredPricePredictions
};
