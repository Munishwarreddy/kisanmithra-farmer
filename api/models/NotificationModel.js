const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'message', 'subscription', 'contract', 'review', 'product', 'system'],
      required: [true, "Please specify notification type"],
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Please add a message"],
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ user: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 }); // Compound index for unread notifications

module.exports = mongoose.model("Notification", NotificationSchema);
