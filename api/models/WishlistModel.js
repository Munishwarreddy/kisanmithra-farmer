const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
WishlistSchema.index({ consumer: 1 }, { unique: true });
WishlistSchema.index({ 'products.product': 1 });

module.exports = mongoose.model("Wishlist", WishlistSchema);
