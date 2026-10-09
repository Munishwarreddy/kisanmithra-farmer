const mongoose = require("mongoose");

const FarmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    farmName: {
      type: String,
      required: [true, "Please add a farm name"],
      trim: true,
    },
    farmSize: {
      type: Number, // in acres
      required: [true, "Please add farm size"],
      min: [0, "Farm size must be positive"],
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    farmingPhilosophy: {
      type: String,
    },
    farmingPractices: {
      type: [String],
      enum: ['organic', 'sustainable', 'traditional'],
    },
    certifications: [{
      name: {
        type: String,
        required: true,
      },
      issuedBy: {
        type: String,
        required: true,
      },
      issuedDate: {
        type: Date,
        required: true,
      },
      expiryDate: Date,
      documentUrl: String,
    }],
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    specialties: [String],
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
    totalProducts: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    savedByCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Legacy fields for backward compatibility
    farmImages: [String],
    establishedYear: Number,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    acceptsPickup: {
      type: Boolean,
      default: false,
    },
    acceptsDelivery: {
      type: Boolean,
      default: false,
    },
    deliveryRadius: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FarmerProfileSchema.index({ user: 1 }, { unique: true });
FarmerProfileSchema.index({ 'location.city': 1 });
FarmerProfileSchema.index({ farmingPractices: 1 });
FarmerProfileSchema.index({ rating: -1 });

module.exports = mongoose.model("FarmerProfile", FarmerProfileSchema);
