const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } 
  }
);

reviewSchema.index({ lawyerId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index(
  { appointmentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      appointmentId: { $type: "objectId" },
    },
  },
);


module.exports = mongoose.model("Review", reviewSchema);
