/**
 * Price Predictor
 * Analyzes market data to provide price recommendations and trend forecasts
 */

const aiRouter = require('./aiRouter');
const aiLogger = require('../../utils/aiLogger');
const Product = require('../../models/ProductModel');
const Order = require('../../models/OrderModel');
const Message = require('../../models/MessageModel');

class PricePredictor {
  /**
   * Predict price for a product
   */
  async predictPrice(productName, category, region) {
    const startTime = Date.now();

    try {
      // Generate cache key
      const cacheKey = aiRouter.generateCacheKey('price', productName, category, region);

      // Try cache first (24-hour TTL)
      const result = await aiRouter.getCachedOrExecute(
        cacheKey,
        86400, // 24 hours
        async () => {
          // Query historical data (last 90 days)
          const historicalData = await this.getHistoricalData(
            productName,
            category,
            region,
            90
          );

          if (historicalData.length < 5) {
            // Insufficient data - use broader averages
            return await this.getFallbackPrediction(productName, category);
          }

          // Calculate market average
          const marketAverage = this.calculateAverage(
            historicalData.map(d => d.price)
          );

          // Analyze trend (last 30 days vs previous 30 days)
          const recentPrices = historicalData.slice(0, Math.min(30, historicalData.length));
          const olderPrices = historicalData.slice(30, Math.min(60, historicalData.length));

          const recentAvg = this.calculateAverage(recentPrices.map(d => d.price));
          const olderAvg = olderPrices.length > 0 
            ? this.calculateAverage(olderPrices.map(d => d.price))
            : recentAvg;

          const trendPercentage = olderAvg > 0 
            ? ((recentAvg - olderAvg) / olderAvg) * 100 
            : 0;
          
          const trendDirection = trendPercentage > 2 ? 'up' 
                               : trendPercentage < -2 ? 'down' 
                               : 'stable';

          // Predict next week price (simple linear extrapolation)
          const nextWeekPrice = recentAvg * (1 + (trendPercentage / 100));

          // Calculate demand level
          const demandLevel = await this.calculateDemandLevel(
            productName,
            category,
            region
          );

          // Generate recommended price range
          const recommendedPrice = this.calculateRecommendedPrice(
            marketAverage,
            demandLevel,
            trendDirection
          );

          return {
            productName,
            region: region || 'All Regions',
            marketAverage: Math.round(marketAverage),
            predictedTrend: {
              direction: trendDirection,
              percentage: Math.abs(Math.round(trendPercentage * 10) / 10),
              nextWeekPrice: Math.round(nextWeekPrice)
            },
            demandLevel,
            recommendedPrice: {
              min: Math.round(recommendedPrice.min),
              max: Math.round(recommendedPrice.max)
            },
            confidence: this.calculateConfidence(historicalData.length),
            dataPoints: historicalData.length,
            lastUpdated: new Date()
          };
        }
      );

      const duration = Date.now() - startTime;
      aiLogger.info('PricePredictor', 'Price prediction generated', {
        productName,
        region,
        dataPoints: result.dataPoints,
        confidence: result.confidence,
        duration
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      aiLogger.error('PricePredictor', 'Price prediction failed', error);
      
      // Return fallback prediction
      return await this.getFallbackPrediction(productName, category);
    }
  }

  /**
   * Get historical product data
   */
  async getHistoricalData(productName, category, region, days) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Query products with similar name in category
      const query = {
        name: { $regex: productName, $options: 'i' },
        createdAt: { $gte: cutoffDate }
      };

      if (category) {
        query.category = category;
      }

      const products = await Product.find(query)
        .populate('farmer', 'address')
        .sort('-createdAt')
        .limit(100);

      // Filter by region if specified
      let filtered = products;
      if (region) {
        filtered = products.filter(p => 
          p.farmer?.address?.city?.toLowerCase().includes(region.toLowerCase()) ||
          p.farmer?.address?.state?.toLowerCase().includes(region.toLowerCase())
        );
      }

      return filtered.map(p => ({
        price: p.price,
        date: p.createdAt
      }));
    } catch (error) {
      aiLogger.error('PricePredictor', 'Failed to get historical data', error);
      return [];
    }
  }

  /**
   * Calculate demand level based on recent activity
   */
  async calculateDemandLevel(productName, category, region) {
    try {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      // Count recent orders
      const orderCount = await Order.countDocuments({
        'items.product.name': { $regex: productName, $options: 'i' },
        createdAt: { $gte: last7Days }
      });

      // Count messages mentioning this product
      const messageCount = await Message.countDocuments({
        content: { $regex: productName, $options: 'i' },
        createdAt: { $gte: last7Days }
      });

      const totalActivity = orderCount + (messageCount * 0.5);

      if (totalActivity > 20) return 'high';
      if (totalActivity > 10) return 'medium';
      return 'low';
    } catch (error) {
      aiLogger.error('PricePredictor', 'Failed to calculate demand level', error);
      return 'medium';
    }
  }

  /**
   * Calculate recommended price range
   */
  calculateRecommendedPrice(marketAverage, demandLevel, trendDirection) {
    let multiplier = 1.0;

    // Adjust based on demand
    if (demandLevel === 'high') multiplier += 0.05;
    if (demandLevel === 'low') multiplier -= 0.05;

    // Adjust based on trend
    if (trendDirection === 'up') multiplier += 0.03;
    if (trendDirection === 'down') multiplier -= 0.03;

    const recommended = marketAverage * multiplier;

    return {
      min: recommended * 0.95,
      max: recommended * 1.05
    };
  }

  /**
   * Calculate average of numbers
   */
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Calculate confidence based on data points
   */
  calculateConfidence(dataPoints) {
    if (dataPoints >= 50) return 0.95;
    if (dataPoints >= 30) return 0.85;
    if (dataPoints >= 15) return 0.75;
    if (dataPoints >= 5) return 0.65;
    return 0.50;
  }

  /**
   * Get fallback prediction when insufficient data
   */
  async getFallbackPrediction(productName, category) {
    try {
      // Use category-wide averages
      const query = category ? { category } : {};
      const categoryProducts = await Product.find(query)
        .limit(100)
        .sort('-createdAt');

      if (categoryProducts.length === 0) {
        return this.getDefaultPrediction(productName);
      }

      const avgPrice = this.calculateAverage(
        categoryProducts.map(p => p.price)
      );

      return {
        productName,
        region: 'All Regions',
        marketAverage: Math.round(avgPrice),
        predictedTrend: {
          direction: 'stable',
          percentage: 0,
          nextWeekPrice: Math.round(avgPrice)
        },
        demandLevel: 'medium',
        recommendedPrice: {
          min: Math.round(avgPrice * 0.9),
          max: Math.round(avgPrice * 1.1)
        },
        confidence: 0.5,
        dataPoints: categoryProducts.length,
        lastUpdated: new Date(),
        note: 'Limited data available - showing category averages'
      };
    } catch (error) {
      aiLogger.error('PricePredictor', 'Fallback prediction failed', error);
      return this.getDefaultPrediction(productName);
    }
  }

  /**
   * Get default prediction when all else fails
   */
  getDefaultPrediction(productName) {
    return {
      productName,
      region: 'All Regions',
      marketAverage: 50,
      predictedTrend: {
        direction: 'stable',
        percentage: 0,
        nextWeekPrice: 50
      },
      demandLevel: 'medium',
      recommendedPrice: {
        min: 45,
        max: 55
      },
      confidence: 0.3,
      dataPoints: 0,
      lastUpdated: new Date(),
      note: 'Insufficient data - showing estimated values'
    };
  }
}

module.exports = new PricePredictor();
