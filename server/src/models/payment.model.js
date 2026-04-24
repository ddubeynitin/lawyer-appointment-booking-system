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
      required: true,
      unique: true
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      default: null,
      index: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["Success", "Failed"],
      required: true
    },

    paymentMode: {
      type: String,
      enum: ["UPI", "Card", "NetBanking", "Razorpay"],
      required: true
    },

    confirmationEmailSent: {
      type: Boolean,
      default: false
    },

    lawyerConfirmationEmailSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

paymentSchema.index({ appointmentId: 1 }, { unique: true });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
