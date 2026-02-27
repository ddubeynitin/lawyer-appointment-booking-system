const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const lawyerSchema = new mongoose.Schema(
  {
    licenseNo: {
      type: String,
      required: true,
      unique: true,
    },

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

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["lawyer"],
      default: "lawyer",
    },

    // Additional fields for lawyer profile

    profileImage: {
      url: String,
      public_id: String,
    },

    location: {
      address: String,
      city: String,
      state: String,
    },

    bio: {
      type: String,
      trim: true,
    },

    practiceCourt: {
      type: String,
      trim: true,
    },

    education: [
      {
        degree: String,
        university: String,
        year: Number,
      },
    ],

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
          default: 0,
        },
      },
    ],

    experience: {
      type: Number,
      default: 0,
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

    isProfileComplete: {
      type: Boolean,
      default: false,
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

// Hash password before saving
lawyerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Method to compare password for authentication
lawyerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

lawyerSchema.index({ specializations: 1 });
lawyerSchema.index({ rating: -1 });

module.exports = mongoose.model("Lawyer", lawyerSchema);
