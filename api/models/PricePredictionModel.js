const mongoose = require('mongoose');

/**
 * Price Prediction Model
 * Stores AI-generated price predictions for products
 * Requirement: 5.7
 */
const PricePredictionSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  },
  region: {
    type: String,
    index: true
  },
  marketAverage: {
    type: Number,
    required: true
  },
  predictedTrend: {
    direction: {
      type: String,
      enum: ['up', 'down', 'stable'],
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    nextWeekPrice: {
      type: Number,
      required: true
    }
  },
  demandLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  recommendedPrice: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  dataPoints: {
    type: Number,
    required: true
  },
  validUntil: {
    type: Date,
    required: true,
    index: true
  }
}, { 
  timestamps: true 
});

// TTL index to auto-delete expired predictions (Requirement 5.7)
PricePredictionSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for efficient queries
PricePredictionSchema.index({ productName: 1, region: 1, validUntil: 1 });
PricePredictionSchema.index({ category: 1, region: 1, validUntil: 1 });

// Virtual for checking if prediction is still valid
PricePredictionSchema.virtual('isValid').get(function() {
  return this.validUntil > new Date();
});

// Virtual for age in hours
PricePredictionSchema.virtual('ageInHours').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60));
});

// Method to check if prediction needs refresh
PricePredictionSchema.methods.needsRefresh = function() {
  return !this.isValid || this.ageInHours >= 24;
};

// Static method to find valid prediction
PricePredictionSchema.statics.findValidPrediction = function(productName, region) {
  return this.findOne({
    productName: { $regex: new RegExp(productName, 'i') },
    region,
    validUntil: { $gt: new Date() }
  }).sort('-createdAt');
};

// Static method to find by category
PricePredictionSchema.statics.findByCategoryAndRegion = function(categoryId, region) {
  return this.find({
    category: categoryId,
    region,
    validUntil: { $gt: new Date() }
  }).sort('-createdAt');
};

// Static method to get average price for category
PricePredictionSchema.statics.getCategoryAverage = async function(categoryId, region) {
  const predictions = await this.find({
    category: categoryId,
    region,
    validUntil: { $gt: new Date() }
  });

  if (predictions.length === 0) return null;

  const avgMarketPrice = predictions.reduce((sum, p) => sum + p.marketAverage, 0) / predictions.length;
  const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

  return {
    marketAverage: Math.round(avgMarketPrice),
    confidence: avgConfidence,
    dataPoints: predictions.length
  };
};

module.exports = mongoose.model('PricePrediction', PricePredictionSchema);
