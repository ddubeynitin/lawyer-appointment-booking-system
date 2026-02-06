import mongoose from "mongoose";

const lawyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
    },

    phone: {
      type: String,
      required: true,
    },

    location: {
      address: String,
      city: String,
      state: String,
    },

    education: [
      {
        degree: String,
        university: String,
        year: Number,
      },
    ],

    licenseNo: {
      type: String,
      required: true,
      unique: true,
    },

    specializations: [
      {
        type: String,
        enum: ["Criminal", "Civil", "Corporate", "Family", "Property"],
      },
    ],

    feesByCategory: [
      {
        category: {
          type: String,
          enum: ["Criminal", "Civil", "Corporate", "Family", "Property"],
        },
        fee: {
          type: Number,
          required: true,
        },
      },
    ],

    experience: {
      type: Number,
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    verification: {
      type: String,
      enum: ["Pending", "Approved", "Under Review"],
      default: "Pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

lawyerSchema.index({ licenseNo: 1 }, { unique: true });
lawyerSchema.index({ specializations: 1 });
lawyerSchema.index({ rating: -1 });

module.exports = mongoose.model("Lawyer", lawyerSchema);
