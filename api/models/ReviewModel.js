const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    comment: {
      type: String,
    },
    images: [String],
    isVerified: {
      type: Boolean,
      default: true, // verified purchase
    },
    farmerResponse: {
      comment: String,
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per consumer per product
ReviewSchema.index({ consumer: 1, product: 1 }, { unique: true });

// Indexes
ReviewSchema.index({ product: 1 });
ReviewSchema.index({ farmer: 1 });
ReviewSchema.index({ consumer: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Review", ReviewSchema);
