const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const Lawyer = require("../models/lawyer.model");

const DEFAULT_USER_AVATAR = "/assets/images/user.png";
const DEFAULT_LAWYER_AVATAR = "/assets/images/profile.png";
const ALLOWED_MESSAGE_REACTIONS = ["👍", "❤️", "😂", "😮", "🙏"];

const buildConversationId = ({ clientId, lawyerId }) =>
  `pair:${clientId}:${lawyerId}`;

const formatMessageTime = (dateValue) =>
  new Date(dateValue).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const parseConversationId = (conversationId = "") => {
  const value = String(conversationId);

  if (value.startsWith("pair:")) {
    const [, clientId, lawyerId] = value.split(":");
    return clientId && lawyerId ? { clientId, lawyerId } : null;
  }

  return null;
};

const loadConversationContext = async (conversation) => {
  if (!conversation) {
    return null;
  }

  const [client, lawyer] = await Promise.all([
    User.findById(conversation.clientId).select("name email phone role profilePicture"),
    Lawyer.findById(conversation.lawyerId).select("name email phone role profileImage"),
  ]);

  return { client, lawyer };
};

const getParticipantInfoForViewer = async (conversation, viewerId, viewerRole) => {
  const context = await loadConversationContext(conversation);

  if (viewerRole === "lawyer") {
    return {
      currentParticipantId: conversation.lawyerId,
      counterpartId: conversation.clientId,
      counterpartRole: "user",
      counterpartName:
        context?.client?.name ||
        conversation.participants.find((participant) => participant.role === "user")?.name ||
        "Client",
      avatar: context?.client?.profilePicture || DEFAULT_USER_AVATAR,
    };
  }

  return {
    currentParticipantId: conversation.clientId,
    counterpartId: conversation.lawyerId,
    counterpartRole: "lawyer",
    counterpartName:
      context?.lawyer?.name ||
      conversation.participants.find((participant) => participant.role === "lawyer")?.name ||
      "Lawyer",
    avatar: context?.lawyer?.profileImage?.url || DEFAULT_LAWYER_AVATAR,
  };
};

const ensureConversationForPair = async ({
  clientId,
  lawyerId,
}) => {
  if (!clientId || !lawyerId) {
    const error = new Error("clientId and lawyerId are required");
    error.statusCode = 400;
    throw error;
  }

  const client = await User.findById(clientId).select("name email phone role profilePicture");
  const lawyer = await Lawyer.findById(lawyerId).select("name email phone role profileImage");

  if (!client || !lawyer) {
    const error = new Error("Client or lawyer not found");
    error.statusCode = 404;
    throw error;
  }

  const conversationId = buildConversationId({ clientId, lawyerId });

  let conversation = await Conversation.findOne({ clientId, lawyerId });

  if (!conversation) {
    conversation = await Conversation.create({
      conversationId,
      clientId,
      lawyerId,
      participants: [
        {
          participantId: client._id,
          role: "user",
          name: client.name,
        },
        {
          participantId: lawyer._id,
          role: "lawyer",
          name: lawyer.name,
        },
      ],
      unreadCounts: [
        { participantId: client._id, count: 0 },
        { participantId: lawyer._id, count: 0 },
      ],
    });
  }

  return { conversation, client, lawyer };
};

const ensureConversationByConversationId = async (conversationId) => {
  const parsed = parseConversationId(conversationId);

  if (!parsed) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const { conversation, client, lawyer } = await ensureConversationForPair({
    clientId: parsed.clientId,
    lawyerId: parsed.lawyerId,
  });

  return {
    conversation,
    client,
    lawyer,
  };
};

const getUnreadCountForParticipant = (conversation, participantId) => {
  const entry = conversation.unreadCounts.find(
    (item) => String(item.participantId) === String(participantId),
  );

  return entry?.count || 0;
};

const serializeConversationForUser = async (conversation, viewer) => {
  const viewerRole = viewer?.role;
  const viewerId = viewer?.userId;
  const isLawyerViewer = viewerRole === "lawyer";
  const isClientViewer = viewerRole === "user";

  if (!isLawyerViewer && !isClientViewer) {
    const error = new Error("Invalid viewer role");
    error.statusCode = 400;
    throw error;
  }

  if (
    (isLawyerViewer && String(conversation.lawyerId) !== String(viewerId)) ||
    (isClientViewer && String(conversation.clientId) !== String(viewerId))
  ) {
    const error = new Error("Conversation does not belong to this user");
    error.statusCode = 403;
    throw error;
  }

  const participantInfo = await getParticipantInfoForViewer(conversation, viewerId, viewerRole);

  return {
    conversationId: conversation.conversationId,
    clientId: String(conversation.clientId),
    lawyerId: String(conversation.lawyerId),
    counterpartId: String(participantInfo.counterpartId),
    counterpartName: participantInfo.counterpartName,
    counterpartRole: participantInfo.counterpartRole,
    avatar: participantInfo.avatar,
    title: viewerRole === "lawyer" ? "Client" : "Lawyer",
    subtitle: "Legal consultation",
    lastMessage: conversation.lastMessage
      ? {
          text: conversation.lastMessage.text,
          time:
            conversation.lastMessage.time ||
            formatMessageTime(conversation.lastMessage.createdAt),
          senderId: conversation.lastMessage.senderId,
          senderRole: conversation.lastMessage.senderRole,
          senderName: conversation.lastMessage.senderName,
          createdAt: conversation.lastMessage.createdAt,
        }
      : null,
    unreadCount: getUnreadCountForParticipant(conversation, participantInfo.currentParticipantId),
    online: false,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
  };
};

const dedupeConversationsByCounterpart = (conversations = []) => {
  const seen = new Map();

  conversations.forEach((conversation) => {
    const key = String(conversation.counterpartId || "");
    if (!key) {
      return;
    }

    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, conversation);
      return;
    }

    const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
    const nextTime = new Date(conversation.updatedAt || conversation.createdAt || 0).getTime();

    if (nextTime >= existingTime) {
      seen.set(key, conversation);
    }
  });

  return Array.from(seen.values()).sort((first, second) => {
    const firstTime = new Date(first.updatedAt || first.createdAt || 0).getTime();
    const secondTime = new Date(second.updatedAt || second.createdAt || 0).getTime();
    return secondTime - firstTime;
  });
};

const getConversationsForUser = async ({ userId, role }) => {
  if (!userId || !role) {
    return [];
  }

  const query = role === "lawyer" ? { lawyerId: userId } : { clientId: userId };
  const conversations = await Conversation.find(query).sort({ updatedAt: -1 });

  const serialized = await Promise.all(
    conversations.map((conversation) =>
      serializeConversationForUser(conversation, { userId, role }),
    ),
  );

  return dedupeConversationsByCounterpart(serialized);
};

const getConversationMessages = async ({ conversationId, userId, role }) => {
  const { conversation } = await ensureConversationByConversationId(conversationId);
  const messages = await Message.find({ conversationId: conversation.conversationId }).sort({
    createdAt: 1,
  });

  return {
    conversation: await serializeConversationForUser(conversation, { userId, role }),
    messages,
  };
};

const markConversationRead = async ({ conversationId, userId, role }) => {
  const { conversation } = await ensureConversationByConversationId(conversationId);
  const isLawyerViewer = role === "lawyer";
  const isClientViewer = role === "user";

  if (!isLawyerViewer && !isClientViewer) {
    const error = new Error("Invalid viewer role");
    error.statusCode = 400;
    throw error;
  }

  if (
    (isLawyerViewer && String(conversation.lawyerId) !== String(userId)) ||
    (isClientViewer && String(conversation.clientId) !== String(userId))
  ) {
    const error = new Error("Conversation does not belong to this user");
    error.statusCode = 403;
    throw error;
  }

  const unreadEntry = conversation.unreadCounts.find(
    (item) => String(item.participantId) === String(userId),
  );

  if (unreadEntry) {
    unreadEntry.count = 0;
    await conversation.save();
  }

  return {
    conversation: await serializeConversationForUser(conversation, { userId, role }),
  };
};

const saveConversationMessage = async ({
  conversationId,
  clientId,
  lawyerId,
  senderId,
  senderRole,
  senderName,
  text,
  clientMessageId,
}) => {
  const trimmedText = String(text || "").trim();

  if (!trimmedText) {
    const error = new Error("Message text is required");
    error.statusCode = 400;
    throw error;
  }

  let conversationPayload;

  if (conversationId) {
    conversationPayload = await ensureConversationByConversationId(conversationId);
  } else {
    conversationPayload = await ensureConversationForPair({
      clientId,
      lawyerId,
    });
  }

  const { conversation } = conversationPayload;
  const senderParticipant = conversation.participants.find(
    (participant) => String(participant.participantId) === String(senderId),
  );

  if (!senderParticipant) {
    const error = new Error("Sender is not part of this conversation");
    error.statusCode = 403;
    throw error;
  }

  const recipientParticipant = conversation.participants.find(
    (participant) => String(participant.participantId) !== String(senderId),
  );

  const message = await Message.create({
    conversationId: conversation.conversationId,
    senderId,
    senderRole,
    senderName,
    text: trimmedText,
    clientMessageId,
  });

  conversation.lastMessage = {
    messageId: message._id.toString(),
    text: trimmedText,
    senderId,
    senderRole,
    senderName,
    createdAt: message.createdAt,
    time: formatMessageTime(message.createdAt),
  };

  conversation.unreadCounts = conversation.unreadCounts.map((entry) => {
    if (String(entry.participantId) === String(senderId)) {
      return { ...entry.toObject(), count: 0 };
    }

    if (
      recipientParticipant &&
      String(entry.participantId) === String(recipientParticipant.participantId)
    ) {
      return {
        ...entry.toObject(),
        count: (entry.count || 0) + 1,
      };
    }

    return entry;
  });

  await conversation.save();

  return {
    message,
    conversation: await serializeConversationForUser(conversation, {
      userId: senderId,
      role: senderRole,
    }),
    recipientId: recipientParticipant?.participantId || null,
  };
};

const saveMessageReaction = async ({ messageId, userId, role, emoji }) => {
  const normalizedEmoji = String(emoji || "").trim();

  if (!messageId || !userId || !role) {
    const error = new Error("messageId, userId, and role are required");
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_MESSAGE_REACTIONS.includes(normalizedEmoji)) {
    const error = new Error("Unsupported reaction");
    error.statusCode = 400;
    throw error;
  }

  const message = await Message.findById(messageId);

  if (!message) {
    const error = new Error("Message not found");
    error.statusCode = 404;
    throw error;
  }

  const { conversation } = await ensureConversationByConversationId(message.conversationId);
  const isLawyerViewer = role === "lawyer";
  const isClientViewer = role === "user";

  if (!isLawyerViewer && !isClientViewer) {
    const error = new Error("Invalid viewer role");
    error.statusCode = 400;
    throw error;
  }

  if (
    (isLawyerViewer && String(conversation.lawyerId) !== String(userId)) ||
    (isClientViewer && String(conversation.clientId) !== String(userId))
  ) {
    const error = new Error("Message does not belong to this user");
    error.statusCode = 403;
    throw error;
  }

  const currentReactions = Array.isArray(message.reactions) ? [...message.reactions] : [];
  const existingIndex = currentReactions.findIndex(
    (reaction) => String(reaction.userId) === String(userId),
  );
  const existingReaction = existingIndex >= 0 ? currentReactions[existingIndex] : null;

  if (existingReaction && existingReaction.emoji === normalizedEmoji) {
    currentReactions.splice(existingIndex, 1);
    message.reactions = currentReactions;
  } else {
    const nextReactions = currentReactions.filter(
      (reaction) => String(reaction.userId) !== String(userId),
    );

    nextReactions.push({
      userId,
      role,
      emoji: normalizedEmoji,
      reactedAt: new Date(),
    });

    message.reactions = nextReactions;
  }

  await message.save();

  return {
    conversation,
    message,
  };
};

module.exports = {
  buildConversationId,
  ensureConversationByConversationId,
  ensureConversationForPair,
  getConversationsForUser,
  getConversationMessages,
  markConversationRead,
  saveConversationMessage,
  saveMessageReaction,
  serializeConversationForUser,
};
