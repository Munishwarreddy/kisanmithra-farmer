const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Please add quantity"],
      min: [1, "Quantity must be at least 1"],
    },
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      required: [true, "Please specify frequency"],
    },
    startDate: {
      type: Date,
      required: [true, "Please specify start date"],
    },
    nextDeliveryDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'completed'],
      default: 'active',
    },
    deliveryAddress: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      street: {
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
      pincode: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionSchema.index({ consumer: 1 });
SubscriptionSchema.index({ farmer: 1 });
SubscriptionSchema.index({ product: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ nextDeliveryDate: 1 });

module.exports = mongoose.model("Subscription", SubscriptionSchema);
