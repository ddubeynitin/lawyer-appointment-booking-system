const mongoose = require("mongoose");

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

    appointmentMode: {
      type: String,
      enum: ["Online", "Office"],
      required: true,
      default: "Online"
    },

    caseEvidence: {
      url: {
        type: String,
        default: null,
      },
      public_id: {
        type: String,
        default: null,
      },
      originalName: {
        type: String,
        default: null,
      },
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

    rescheduleStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: null
    },

    rescheduleRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    rescheduleRequestedAt: {
      type: Date
    },

    rescheduleRequestedDate: {
      type: Date
    },

    rescheduleRequestedTimeSlot: {
      type: String
    },

    rescheduleReason: {
      type: String,
      trim: true
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
