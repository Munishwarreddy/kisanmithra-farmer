const mongoose = require('mongoose');

/**
 * Deal Summary Model
 * Stores extracted transaction terms from chat conversations
 * Requirements: 4.1, 4.2
 */
const DealSummarySchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  product: {
    name: {
      type: String,
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  },
  quantity: {
    type: String,
    required: true
  },
  agreedPrice: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'converted_to_order'],
    default: 'draft'
  },
  linkedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  extractedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
DealSummarySchema.index({ conversationId: 1, status: 1 });
DealSummarySchema.index({ participants: 1 });
DealSummarySchema.index({ 'product.productId': 1 });
DealSummarySchema.index({ linkedOrderId: 1 });

// Virtual for checking if deal is active
DealSummarySchema.virtual('isActive').get(function() {
  return this.status === 'draft' || this.status === 'confirmed';
});

// Method to confirm deal
DealSummarySchema.methods.confirm = function(userId) {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  this.confirmedBy = userId;
  return this.save();
};

// Method to convert to order
DealSummarySchema.methods.convertToOrder = function(orderId) {
  this.status = 'converted_to_order';
  this.linkedOrderId = orderId;
  return this.save();
};

// Static method to find active deals for a conversation
DealSummarySchema.statics.findActiveByConversation = function(conversationId) {
  return this.findOne({
    conversationId,
    status: { $in: ['draft', 'confirmed'] }
  }).sort('-createdAt');
};

// Static method to find deals by participant
DealSummarySchema.statics.findByParticipant = function(userId) {
  return this.find({
    participants: userId
  }).sort('-createdAt');
};

module.exports = mongoose.model('DealSummary', DealSummarySchema);
