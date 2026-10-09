const mongoose = require("mongoose");

const SavedFarmerSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    farmers: [{
      farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      savedAt: {
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
SavedFarmerSchema.index({ consumer: 1 }, { unique: true });
SavedFarmerSchema.index({ 'farmers.farmer': 1 });

module.exports = mongoose.model("SavedFarmer", SavedFarmerSchema);
