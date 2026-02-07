import mongoose from "mongoose";

const cancellationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

cancellationSchema.index({ appointmentId: 1 }, { unique: true });

module.exports = mongoose.model("Cancellation", cancellationSchema);
