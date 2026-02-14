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
      enum: ["UPI", "Card", "NetBanking"],
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

paymentSchema.index({ appointmentId: 1 }, { unique: true });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
