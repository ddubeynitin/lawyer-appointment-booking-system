const { Server } = require("socket.io");
const env = require("../config/env");
const {
  ensureConversationByConversationId,
  saveConversationMessage,
  markConversationRead,
  saveMessageReaction,
} = require("./message.service");

const MESSAGE_NAMESPACE = "/messages";

const createMessageRealtimeServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    path: "/socket.io",
  });

  const messageIo = io.of(MESSAGE_NAMESPACE);
  const presenceCounts = new Map();
  const logMessageSocket = (event, details = {}) => {
    console.log(`[messages] ${event}`, {
      ...details,
      timestamp: new Date().toISOString(),
    });
  };

  const broadcastPresence = (userId, online) => {
    if (!userId) {
      return;
    }

    messageIo.emit("presence_update", {
      userId,
      online,
    });
  };

  const emitPresenceSnapshot = (socket) => {
    socket.emit(
      "presence_snapshot",
      Array.from(presenceCounts.entries())
        .filter(([, count]) => count > 0)
        .map(([userId]) => String(userId)),
    );
  };

  const incrementPresence = (userId) => {
    if (!userId) {
      return;
    }

    const nextCount = (presenceCounts.get(userId) || 0) + 1;
    presenceCounts.set(userId, nextCount);

    if (nextCount === 1) {
      broadcastPresence(userId, true);
    }
  };

  const decrementPresence = (userId) => {
    if (!userId || !presenceCounts.has(userId)) {
      return;
    }

    const nextCount = Math.max((presenceCounts.get(userId) || 1) - 1, 0);

    if (nextCount === 0) {
      presenceCounts.delete(userId);
      broadcastPresence(userId, false);
      return;
    }

    presenceCounts.set(userId, nextCount);
  };

  messageIo.on("connection", (socket) => {
    socket.data.user = null;
    socket.data.joinedConversationId = "";

    logMessageSocket("connected", {
      socketId: socket.id,
      namespace: MESSAGE_NAMESPACE,
    });

    socket.emit("connected", {
      timestamp: new Date().toISOString(),
    });

    socket.on("identify", (payload = {}) => {
      const userId = payload.userId || payload.id || null;
      socket.data.user = {
        userId,
        role: payload.role || null,
        name: payload.name || null,
      };
      logMessageSocket("identified", {
        socketId: socket.id,
        userId,
        role: payload.role || null,
        name: payload.name || null,
      });
      incrementPresence(userId);
      emitPresenceSnapshot(socket);
    });

    socket.on("join_conversation", async (payload = {}) => {
      if (!payload.conversationId) {
        return;
      }

      try {
        await ensureConversationByConversationId(payload.conversationId);
      } catch (error) {
        // Conversation can still be created later via HTTP or send_message.
      }

      const roomName = `conversation:${payload.conversationId}`;
      socket.join(roomName);
      socket.data.joinedConversationId = payload.conversationId;

      logMessageSocket("joined_conversation", {
        socketId: socket.id,
        userId: socket.data.user?.userId || null,
        conversationId: payload.conversationId,
      });

      socket.emit("joined_conversation", {
        conversationId: payload.conversationId,
      });
    });

    socket.on("leave_conversation", (payload = {}) => {
      if (!payload.conversationId) {
        return;
      }

      socket.leave(`conversation:${payload.conversationId}`);

      if (socket.data.joinedConversationId === payload.conversationId) {
        socket.data.joinedConversationId = "";
      }

      logMessageSocket("left_conversation", {
        socketId: socket.id,
        userId: socket.data.user?.userId || null,
        conversationId: payload.conversationId,
      });
    });

    socket.on("mark_read", async (payload = {}) => {
      if (!payload.conversationId || !payload.userId) {
        return;
      }

      try {
        const updated = await markConversationRead({
          conversationId: payload.conversationId,
          userId: payload.userId,
          role: payload.role || socket.data.user?.role,
        });

        messageIo.to(`conversation:${payload.conversationId}`).emit("conversation_read", {
          conversationId: payload.conversationId,
          conversation: updated.conversation,
          userId: payload.userId,
        });
      } catch (error) {
        socket.emit("error", {
          message: error.message || "Unable to mark conversation as read",
        });
      }
    });

    socket.on("send_message", async (payload = {}) => {
      try {
        const senderId = payload.senderId || socket.data.user?.userId;
        const senderName = payload.senderName || socket.data.user?.name || "Unknown";
        const senderRole = payload.senderRole || socket.data.user?.role || "user";

        const result = await saveConversationMessage({
          conversationId: payload.conversationId,
          senderId,
          senderRole,
          senderName,
          text: payload.text,
          clientMessageId: payload.clientMessageId,
        });

        messageIo.to(`conversation:${result.conversation.conversationId}`).emit("conversation_message", {
          type: "conversation_message",
          conversationId: result.conversation.conversationId,
          conversation: result.conversation,
          message: {
            id: result.message._id.toString(),
            clientMessageId: result.message.clientMessageId,
            senderId: result.message.senderId,
            senderRole: result.message.senderRole,
            senderName: result.message.senderName,
            text: result.message.text,
            createdAt: result.message.createdAt,
            time: result.conversation.lastMessage?.time,
          },
        });

        logMessageSocket("message_sent", {
          socketId: socket.id,
          conversationId: result.conversation.conversationId,
          senderId,
          senderRole,
        });
      } catch (error) {
        socket.emit("error", {
          message: error.message || "Unable to send message",
        });

        logMessageSocket("message_error", {
          socketId: socket.id,
          conversationId: payload.conversationId || null,
          error: error.message || "Unable to send message",
        });
      }
    });

    socket.on("react_message", async (payload = {}) => {
      try {
        const userId = payload.userId || socket.data.user?.userId;
        const role = payload.role || socket.data.user?.role || "user";

        const result = await saveMessageReaction({
          messageId: payload.messageId,
          userId,
          role,
          emoji: payload.emoji,
        });

        messageIo.to(`conversation:${result.conversation.conversationId}`).emit("message_reaction", {
          type: "message_reaction",
          conversationId: result.conversation.conversationId,
          message: {
            id: result.message._id.toString(),
            conversationId: result.message.conversationId,
            reactions: result.message.reactions || [],
          },
        });

        logMessageSocket("message_reacted", {
          socketId: socket.id,
          conversationId: result.conversation.conversationId,
          messageId: payload.messageId || null,
          userId,
          emoji: payload.emoji || null,
        });
      } catch (error) {
        socket.emit("error", {
          message: error.message || "Unable to react to message",
        });

        logMessageSocket("reaction_error", {
          socketId: socket.id,
          messageId: payload.messageId || null,
          error: error.message || "Unable to react to message",
        });
      }
    });

    socket.on("disconnect", () => {
      logMessageSocket("disconnected", {
        socketId: socket.id,
        userId: socket.data.user?.userId || null,
        conversationId: socket.data.joinedConversationId || null,
      });

      if (socket.data.joinedConversationId) {
        socket.leave(`conversation:${socket.data.joinedConversationId}`);
      }

      if (socket.data.user?.userId) {
        decrementPresence(socket.data.user.userId);
      }
    });
  });

  return io;
};

module.exports = {
  createMessageRealtimeServer,
};
