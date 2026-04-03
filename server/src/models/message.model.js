const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "lawyer", "admin"],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    clientMessageId: {
      type: String,
      trim: true,
      index: true,
    },
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        role: {
          type: String,
          enum: ["user", "lawyer", "admin"],
          required: true,
        },
        emoji: {
          type: String,
          required: true,
          trim: true,
        },
        reactedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
