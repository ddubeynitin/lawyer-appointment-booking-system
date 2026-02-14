const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    slots: [
      {
        time: {
          type: String,
          required: true
        },
        isBooked: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  {
    timestamps: false
  }
);

availabilitySchema.index({ lawyerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);