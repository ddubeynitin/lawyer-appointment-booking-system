const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },

    transactionId: {
      type: String,
      trim: true
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    razorpayPaymentId: {
      type: String,
      trim: true
    },

    razorpaySignature: {
      type: String,
      trim: true
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true
    },

    paymentStatus: {
      type: String,
      enum: ["Created", "Success", "Failed"],
      required: true
    },

    paymentMode: {
      type: String,
      enum: ["UPI", "Card", "NetBanking", "Wallet", "EMI", "Unknown"],
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

paymentSchema.index({ appointmentId: 1 }, { unique: true });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Payment", paymentSchema);
