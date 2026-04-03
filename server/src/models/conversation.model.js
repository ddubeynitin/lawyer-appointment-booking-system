const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "lawyer"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const unreadCountSchema = new mongoose.Schema(
  {
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const lastMessageSchema = new mongoose.Schema(
  {
    messageId: String,
    text: String,
    senderId: mongoose.Schema.Types.ObjectId,
    senderRole: {
      type: String,
      enum: ["user", "lawyer", "admin"],
    },
    senderName: String,
    createdAt: Date,
    time: String,
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lawyer",
      index: true,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    unreadCounts: {
      type: [unreadCountSchema],
      default: [],
    },
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ clientId: 1, lawyerId: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
