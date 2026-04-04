const mongoose = require("mongoose");

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "lawyer", "admin"],
      required: true,
    },

    purpose: {
      type: String,
      enum: ["login", "password_reset", "registration"],
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    lastSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

emailOtpSchema.index({ email: 1, role: 1, purpose: 1 });
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmailOtp", emailOtpSchema);
