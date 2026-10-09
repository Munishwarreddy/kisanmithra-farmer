const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
    },
    unit: {
      type: String,
      required: [true, "Please add a unit (e.g., lb, kg, bunch)"],
    },
    quantityAvailable: {
      type: Number,
      required: [true, "Please add available quantity"],
    },
    images: {
      type: [String],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one image is required'
      }
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    farmingPractice: {
      type: String,
      enum: ['organic', 'sustainable', 'traditional'],
      default: 'traditional',
    },
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      vitamins: [String],
    },
    harvestDate: Date,
    shelfLife: {
      type: Number, // in days
      min: 0,
    },
    availableUntil: Date,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProductSchema.index({ farmer: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ inStock: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ isActive: 1 });
// Text indexes for search
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model("Product", ProductSchema);
