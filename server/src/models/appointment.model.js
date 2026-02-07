import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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

    lawyerName: {
      type: String,
      required: true
    },

    lawyerSpecialization: {
      type: String,
      required: true
    },

    caseCategory: {
      type: String,
      enum: ["Criminal", "Civil", "Corporate", "Family", "Property"],
      required: true
    },

    caseDescription: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    timeSlot: {
      type: String,
      required: true
    },

    feeCharged: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending"
    },
    
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ lawyerId: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ lawyerId: 1, date: 1 });
appointmentSchema.index(
  { lawyerId: 1, date: 1, timeSlot: 1 },
  { unique: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
