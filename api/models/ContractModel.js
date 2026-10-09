const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      unique: true,
      required: true,
    },
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
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
      min: [1, "Quantity must be positive"],
    },
    unit: {
      type: String,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Please add price per unit"],
      min: [0, "Price must be positive"],
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number, // in months
      required: [true, "Please specify duration"],
      min: 1,
    },
    startDate: {
      type: Date,
      required: [true, "Please specify start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please specify end date"],
    },
    deliverySchedule: {
      type: String,
      enum: ['weekly', 'monthly', 'on-demand'],
      required: true,
    },
    terms: {
      type: String,
      required: [true, "Please specify contract terms"],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    deliveries: [{
      scheduledDate: {
        type: Date,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Auto-generate contract number before saving
ContractSchema.pre('save', async function(next) {
  if (!this.contractNumber) {
    // Generate contract number: CNT-YYYYMMDD-XXXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.contractNumber = `CNT-${dateStr}-${randomNum}`;
  }
  next();
});

// Validate that initiator and recipient are different
ContractSchema.pre('save', function(next) {
  if (this.initiator.equals(this.recipient)) {
    next(new Error('Initiator and recipient must be different users'));
  }
  next();
});

// Validate that end date is after start date
ContractSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Indexes
ContractSchema.index({ contractNumber: 1 }, { unique: true });
ContractSchema.index({ initiator: 1 });
ContractSchema.index({ recipient: 1 });
ContractSchema.index({ status: 1 });
ContractSchema.index({ startDate: 1 });

module.exports = mongoose.model("Contract", ContractSchema);
