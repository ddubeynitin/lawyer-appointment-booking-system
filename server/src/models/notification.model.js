const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    recipientRole: {
      type: String,
      enum: ["user", "lawyer"],
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
    },

    type: {
      type: String,
      trim: true,
      default: "appointment_update",
    },

    title: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    notificationMsg: {
      type: String,
      required: true,
      trim: true,
    },

    channel: {
      type: String,
      enum: ["in_app", "email", "sms", "all"],
      default: "in_app",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ lawyerId: 1 });
notificationSchema.index({ recipientRole: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
