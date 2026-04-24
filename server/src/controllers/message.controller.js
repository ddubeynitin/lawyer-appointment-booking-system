const {
  ensureConversationForPair,
  getConversationsForUser,
  getConversationMessages,
  clearConversationMessages,
  deleteConversation,
  markConversationRead,
  serializeConversationForUser,
} = require("../services/message.service");

const listConversations = async (req, res) => {
  try {
    const userId = req.query.userId || req.query.user_id;
    const role = req.query.role;

    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required" });
    }

    const conversations = await getConversationsForUser({ userId, role });
    return res.json({ conversations });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to load conversations",
    });
  }
};

const ensureConversation = async (req, res) => {
  try {
    const clientId = req.body.clientId || req.body.userId;
    const lawyerId = req.body.lawyerId;

    if (!clientId || !lawyerId) {
      return res.status(400).json({ message: "clientId and lawyerId are required" });
    }

    const { conversation } = await ensureConversationForPair({
      clientId,
      lawyerId,
    });

    return res.status(200).json({
      conversationId: conversation.conversationId,
      clientId: String(conversation.clientId),
      lawyerId: String(conversation.lawyerId),
      conversation: await serializeConversationForUser(conversation, {
        userId: clientId,
        role: "user",
      }),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to ensure conversation",
    });
  }
};

const fetchConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.query.userId || req.query.user_id;
    const role = req.query.role;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation id is required" });
    }

    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required" });
    }

    const payload = await getConversationMessages({ conversationId, userId, role });
    return res.json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to load conversation messages",
    });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.body.userId || req.query.userId;

    if (!conversationId || !userId) {
      return res.status(400).json({ message: "conversationId and userId are required" });
    }

    const role = req.body.role || req.query.role;

    if (!role) {
      return res.status(400).json({ message: "role is required" });
    }

    const payload = await markConversationRead({ conversationId, userId, role });
    return res.json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to mark conversation as read",
    });
  }
};

const clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.body.userId || req.query.userId;
    const role = req.body.role || req.query.role;

    if (!conversationId || !userId || !role) {
      return res.status(400).json({ message: "conversationId, userId, and role are required" });
    }

    const payload = await clearConversationMessages({ conversationId, userId, role });
    return res.json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to clear conversation",
    });
  }
};

const removeConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.body.userId || req.query.userId;
    const role = req.body.role || req.query.role;

    if (!conversationId || !userId || !role) {
      return res.status(400).json({ message: "conversationId, userId, and role are required" });
    }

    const payload = await deleteConversation({ conversationId, userId, role });
    return res.json(payload);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Failed to delete conversation",
    });
  }
};

module.exports = {
  ensureConversation,
  listConversations,
  fetchConversationMessages,
  markConversationAsRead,
  clearConversation,
  removeConversation,
};
