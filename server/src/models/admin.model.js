const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin"],
      default: "admin"
    }
  },
  {
    timestamps: false
  }
);

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Method to compare password for authentication
adminSchema.methods.comparePassword = async function (candidatePassword) {
  const storedPassword = String(this.password || "");
  const looksHashed = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

  if (!looksHashed) {
    return String(candidatePassword || "") === storedPassword;
  }

  return bcrypt.compare(candidatePassword, storedPassword);
};

module.exports = mongoose.model("Admin", adminSchema);
