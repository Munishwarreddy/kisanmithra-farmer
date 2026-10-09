const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    // AI-related fields
    originalLanguage: {
      type: String,
      enum: ['en', 'te', 'hi'],
      default: 'en'
    },
    translations: {
      en: String,
      te: String,
      hi: String
    },
    sentiment: {
      label: {
        type: String,
        enum: ['positive', 'neutral', 'urgent', 'angry']
      },
      confidence: Number,
      emoji: String,
      analyzedAt: Date
    },
    smartReplies: [{
      text: String,
      category: {
        type: String,
        enum: ['pricing', 'quantity', 'delivery', 'general']
      },
      confidence: Number,
      generatedAt: Date
    }]
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, createdAt: -1 });

// Validation: sender and recipient must be different
MessageSchema.pre('validate', function(next) {
  if (this.sender && this.recipient && this.sender.toString() === this.recipient.toString()) {
    next(new Error('Sender and recipient must be different'));
  } else {
    next();
  }
});

// Cascade deletion for AI data (Requirement 7.4)
MessageSchema.pre('remove', async function(next) {
  try {
    const DealSummary = mongoose.model('DealSummary');
    
    // Delete deal summaries associated with this conversation
    await DealSummary.deleteMany({ conversationId: this.conversationId });
    
    // Note: Cached translations and sentiment data in Redis will expire naturally via TTL
    // No need to manually delete from Redis as it's temporary cache
    
    next();
  } catch (error) {
    next(error);
  }
});

// Cascade deletion for conversation (static method)
MessageSchema.statics.deleteConversation = async function(conversationId) {
  const DealSummary = mongoose.model('DealSummary');
  
  // Delete all messages in conversation
  await this.deleteMany({ conversationId });
  
  // Delete deal summaries
  await DealSummary.deleteMany({ conversationId });
  
  return { success: true, conversationId };
};

module.exports = mongoose.model("Message", MessageSchema);
