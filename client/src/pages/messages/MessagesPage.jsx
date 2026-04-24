import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCheck,
  Circle,
  List,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Trash2,
  Video,
} from "lucide-react";
import { FaGavel } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";
import { createMessageSocket } from "../../utils/messageSocket";

const DEFAULT_USER_AVATAR = "/assets/images/user.png";
const DEFAULT_LAWYER_AVATAR = "/assets/images/profile.png";
const REACTION_OPTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "🙏", label: "Thanks" },
];

const formatClock = (value = new Date()) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const sameId = (first, second) => String(first || "") === String(second || "");

const getAvatarForConversation = (conversation) =>
  conversation.avatar ||
  (conversation.counterpartRole === "lawyer"
    ? DEFAULT_LAWYER_AVATAR
    : DEFAULT_USER_AVATAR);

const getRoleBadge = (conversation) =>
  conversation.counterpartRole === "lawyer"
    ? {
        label: "Lawyer",
        className: "border-blue-200 bg-blue-50 text-blue-700",
      }
    : {
        label: "Client",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

const normalizeConversation = (conversation, online = false) => ({
  conversationId: conversation.conversationId,
  counterpartId: conversation.counterpartId,
  counterpartName: conversation.counterpartName,
  counterpartRole: conversation.counterpartRole,
  avatar: getAvatarForConversation(conversation),
  title: conversation.title || (conversation.counterpartRole === "lawyer" ? "Lawyer" : "Client"),
  subtitle:
    conversation.subtitle ||
    (conversation.caseCategory ? `${conversation.caseCategory} consultation` : "Conversation"),
  lastMessageTime: conversation.lastMessage?.time || "",
  unreadCount: Number(conversation.unreadCount || 0),
  online: Boolean(online),
  updatedAt: conversation.updatedAt,
  createdAt: conversation.createdAt,
});

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

const normalizeMessage = (message, currentUserId) => ({
  id: message.id || message._id,
  clientMessageId: message.clientMessageId || null,
  sender: sameId(message.senderId, currentUserId) ? "me" : "them",
  senderId: message.senderId,
  senderName: message.senderName,
  senderRole: message.senderRole,
  text: message.text,
  time:
    message.time ||
    formatClock(message.createdAt || new Date()),
  createdAt: message.createdAt,
  reactions: Array.isArray(message.reactions)
    ? message.reactions.map((reaction) => ({
        userId: reaction.userId,
        role: reaction.role,
        emoji: reaction.emoji,
        reactedAt: reaction.reactedAt,
      }))
    : [],
});

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = user?.id || user?._id;
  const role = user?.role;
  const isLawyer = role === "lawyer";
  const dashboardPath = isLawyer
    ? "/lawyer/lawyer-dashboard"
    : "/client/client-dashboard";
  const conversationIdFromQuery = searchParams.get("conversationId");

  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [activeConversationId, setActiveConversationId] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [pageError, setPageError] = useState("");
  const [draft, setDraft] = useState("");
  const [openReactionMenuForMessageId, setOpenReactionMenuForMessageId] = useState("");
  const [openConversationMenuForId, setOpenConversationMenuForId] = useState("");
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isMobileConversationListOpen, setIsMobileConversationListOpen] = useState(true);
  const [presenceByUserId, setPresenceByUserId] = useState({});
  const socketRef = useRef(null);
  const joinedConversationRef = useRef("");
  const activeConversationRef = useRef("");
  const presenceByUserIdRef = useRef({});
  const messageEndRef = useRef(null);
  const reactionLongPressTimerRef = useRef(null);
  const reactionLongPressTriggeredRef = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    presenceByUserIdRef.current = presenceByUserId;
  }, [presenceByUserId]);

  useEffect(() => {
    if (activeConversationId) {
      setIsMobileConversationListOpen(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleMediaChange = (event) => {
      if (event.matches) {
        setIsMobileConversationListOpen(true);
      }
    };

    handleMediaChange(mediaQuery);
    mediaQuery.addEventListener?.("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener?.("change", handleMediaChange);
    };
  }, []);

  const fetchConversations = async ({ preferredConversationId = null } = {}) => {
    if (!userId || !role) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    try {
      setLoadingConversations(true);
      setPageError("");

      const response = await axios.get(`${API_URL}/messages/conversations`, {
        params: {
          userId,
          role,
        },
      });

      const nextConversations = Array.isArray(response.data?.conversations)
        ? dedupeConversationsByCounterpart(
            response.data.conversations.map((conversation) =>
              normalizeConversation(
                conversation,
                presenceByUserIdRef.current[String(conversation.counterpartId)] || false,
              ),
            ),
          )
        : [];

      setConversations(nextConversations);
      setActiveConversationId((current) => {
        if (preferredConversationId) {
          const preferredConversation = nextConversations.find(
            (conversation) => conversation.conversationId === preferredConversationId,
          );

          if (preferredConversation?.conversationId) {
            return preferredConversation.conversationId;
          }
        }

        if (current && nextConversations.some((conversation) => conversation.conversationId === current)) {
          return current;
        }

        return nextConversations[0]?.conversationId || "";
      });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setConversations([]);
      setPageError("Unable to load messages right now.");
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessagesForConversation = async (conversationId) => {
    if (!conversationId || !userId || !role) {
      return;
    }

    if (messagesByConversation[conversationId]) {
      return;
    }

    try {
      setLoadingMessages(true);
      setPageError("");

      const response = await axios.get(
        `${API_URL}/messages/${encodeURIComponent(conversationId)}`,
        {
          params: {
            userId,
            role,
          },
        },
      );

      const nextMessages = Array.isArray(response.data?.messages)
        ? response.data.messages.map((message) => normalizeMessage(message, userId))
        : [];

      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: nextMessages,
      }));

      if (response.data?.conversation) {
        const normalizedConversation = normalizeConversation(
          response.data.conversation,
          presenceByUserIdRef.current[String(response.data.conversation.counterpartId)] || false,
        );
        setConversations((current) =>
          current.map((conversation) =>
            conversation.conversationId === normalizedConversation.conversationId
              ? normalizedConversation
              : conversation,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: [],
      }));
      setPageError("Unable to load this conversation.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    const initializeInbox = async () => {
      if (!userId || !role) {
        setConversations([]);
        setLoadingConversations(false);
        return;
      }

      await fetchConversations({
        preferredConversationId: conversationIdFromQuery || null,
      });
    };

    initializeInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationIdFromQuery, role, userId]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    fetchMessagesForConversation(activeConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, userId, role]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversationId, messagesByConversation]);

  useEffect(() => () => clearReactionLongPressTimer(), []);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        event.target.closest?.("[data-reaction-picker-root='true']") ||
        event.target.closest?.("[data-menu-root='true']")
      ) {
        return;
      }

      setOpenReactionMenuForMessageId("");
      setOpenConversationMenuForId("");
      setIsHeaderMenuOpen(false);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (!userId || !role) {
      return undefined;
    }

    const socket = createMessageSocket();
    socketRef.current = socket;
    let isMounted = true;

    const handleConnect = () => {
      socket.emit("identify", {
        userId,
        role,
        name: user?.name || "User",
      });

      if (activeConversationRef.current) {
        socket.emit("join_conversation", {
          conversationId: activeConversationRef.current,
        });

        socket.emit("mark_read", {
          conversationId: activeConversationRef.current,
          userId,
          role,
        });

        joinedConversationRef.current = activeConversationRef.current;
      }
    };

    const handlePresenceUpdate = (payload) => {
      if (!payload?.userId) {
        return;
      }

      setPresenceByUserId((current) => ({
        ...current,
        [String(payload.userId)]: Boolean(payload.online),
      }));

      setConversations((current) =>
        current.map((conversation) =>
          sameId(conversation.counterpartId, payload.userId)
            ? { ...conversation, online: Boolean(payload.online) }
            : conversation,
        ),
      );
    };

    const handleConversationMessage = (payload) => {
      if (!payload?.message) {
        return;
      }

      const normalizedMessage = normalizeMessage(payload.message, userId);

      setMessagesByConversation((current) => {
        const conversationMessages = current[payload.conversationId] || [];
        const alreadyExists = conversationMessages.some(
          (message) =>
            sameId(message.id, normalizedMessage.id) ||
            (normalizedMessage.clientMessageId &&
              sameId(message.clientMessageId, normalizedMessage.clientMessageId)),
        );

        if (alreadyExists) {
          return current;
        }

        return {
          ...current,
          [payload.conversationId]: [...conversationMessages, normalizedMessage],
        };
      });

      setConversations((current) =>
        sortConversationsByRecentActivity(
          current.map((conversation) =>
            conversation.conversationId === payload.conversationId
              ? {
                  ...conversation,
                  unreadCount:
                    conversation.conversationId === activeConversationRef.current
                      ? 0
                      : Number(conversation.unreadCount || 0) + 1,
                  updatedAt: new Date().toISOString(),
                }
              : conversation,
          ),
        ),
      );
    };

    const handleConversationRead = (payload) => {
      if (!payload?.conversationId) {
        return;
      }

      setConversations((current) =>
        sortConversationsByRecentActivity(
          current.map((conversation) =>
            conversation.conversationId === payload.conversationId
              ? {
                  ...conversation,
                  unreadCount: 0,
                  updatedAt: new Date().toISOString(),
                }
              : conversation,
          ),
        ),
      );
    };

    const handleMessageReaction = (payload) => {
      const messageId = payload?.message?.id;
      const conversationId = payload?.conversationId;
      const reactions = Array.isArray(payload?.message?.reactions)
        ? payload.message.reactions
        : [];

      if (!messageId || !conversationId) {
        return;
      }

      setMessagesByConversation((current) => {
        const conversationMessages = current[conversationId] || [];
        const nextMessages = conversationMessages.map((message) =>
          sameId(message.id, messageId)
            ? {
                ...message,
                reactions: reactions.map((reaction) => ({
                  userId: reaction.userId,
                  role: reaction.role,
                  emoji: reaction.emoji,
                  reactedAt: reaction.reactedAt,
                })),
              }
            : message,
        );

        return {
          ...current,
          [conversationId]: nextMessages,
        };
      });
    };

    const handleSocketError = (payload) => {
      const message = payload?.message || "Unable to connect to chat.";
      if (isMounted) {
        setPageError(message);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("presence_update", handlePresenceUpdate);
    socket.on("conversation_message", handleConversationMessage);
    socket.on("conversation_read", handleConversationRead);
    socket.on("message_reaction", handleMessageReaction);
    socket.on("error", handleSocketError);

    socket.connect();

    return () => {
      isMounted = false;

      if (joinedConversationRef.current) {
        socket.emit("leave_conversation", {
          conversationId: joinedConversationRef.current,
        });
      }

      socket.off("connect", handleConnect);
      socket.off("presence_update", handlePresenceUpdate);
      socket.off("conversation_message", handleConversationMessage);
      socket.off("conversation_read", handleConversationRead);
      socket.off("message_reaction", handleMessageReaction);
      socket.off("error", handleSocketError);
      socket.close();
      socketRef.current = null;
      joinedConversationRef.current = "";
    };
  }, [role, user?.name, userId]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !socket.connected || !activeConversationId) {
      return;
    }

    const previousConversationId = joinedConversationRef.current;

    if (previousConversationId && previousConversationId !== activeConversationId) {
      socket.emit("leave_conversation", {
        conversationId: previousConversationId,
      });
    }

    socket.emit("join_conversation", {
      conversationId: activeConversationId,
    });

    socket.emit("mark_read", {
      conversationId: activeConversationId,
      userId,
      role,
    });

    joinedConversationRef.current = activeConversationId;
  }, [activeConversationId, userId]);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const searchableText = [
        conversation.counterpartName,
        conversation.title,
        conversation.subtitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [conversations, searchTerm]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.conversationId === activeConversationId),
    [activeConversationId, conversations],
  );

  const activeMessages = messagesByConversation[activeConversationId] || [];

  const sortConversationsByRecentActivity = (items = []) =>
    [...items].sort(
      (first, second) =>
        new Date(second.updatedAt || second.createdAt || 0) -
        new Date(first.updatedAt || first.createdAt || 0),
    );

  const summarizeReactions = (reactions = []) => {
    const ownReaction = reactions.find((reaction) => sameId(reaction.userId, userId)) || null;
    const grouped = new Map();

    reactions.forEach((reaction) => {
      const emoji = reaction?.emoji;
      if (!emoji) {
        return;
      }

      grouped.set(emoji, (grouped.get(emoji) || 0) + 1);
    });

    const ownEmoji = ownReaction?.emoji || "";
    const ownReactionCount = ownEmoji ? grouped.get(ownEmoji) || 1 : 0;
    if (ownEmoji) {
      grouped.delete(ownEmoji);
    }

    return {
      ownReaction: ownEmoji
        ? {
            emoji: ownEmoji,
            count: ownReactionCount,
          }
        : null,
      otherReactions: Array.from(grouped.entries()).map(([emoji, count]) => ({
        emoji,
        count,
      })),
    };
  };

  const handleSelectConversation = (conversationId) => {
    setOpenConversationMenuForId("");
    setIsHeaderMenuOpen(false);
    setActiveConversationId(conversationId);
    setDraft("");
    setIsMobileConversationListOpen(false);

    setConversations((current) =>
      sortConversationsByRecentActivity(
        current.map((conversation) =>
          conversation.conversationId === conversationId
            ? { ...conversation, unreadCount: 0, updatedAt: new Date().toISOString() }
            : conversation,
        ),
      ),
    );
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmedDraft = draft.trim();
    if (!trimmedDraft || !activeConversationId) {
      return;
    }

    const socket = socketRef.current;
    const tempClientMessageId = `local-${Date.now()}`;
    const optimisticMessage = {
      id: tempClientMessageId,
      clientMessageId: tempClientMessageId,
      sender: "me",
      senderId: userId,
      senderName: user?.name || "You",
      senderRole: role,
      text: trimmedDraft,
      time: formatClock(),
      createdAt: new Date().toISOString(),
    };

    setMessagesByConversation((current) => ({
      ...current,
      [activeConversationId]: [
        ...(current[activeConversationId] || []),
        optimisticMessage,
      ],
    }));

    setConversations((current) =>
      sortConversationsByRecentActivity(
        current.map((conversation) =>
          conversation.conversationId === activeConversationId
            ? {
                ...conversation,
                unreadCount: 0,
                updatedAt: new Date().toISOString(),
              }
            : conversation,
        ),
      ),
    );
    setDraft("");

    if (socket?.connected) {
      socket.emit("send_message", {
        conversationId: activeConversationId,
        senderId: userId,
        senderName: user?.name || "You",
        senderRole: role,
        text: trimmedDraft,
        clientMessageId: tempClientMessageId,
      });
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId || !userId || !role) {
      return;
    }

    if (!window.confirm("Delete this conversation?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/messages/${encodeURIComponent(conversationId)}`, {
        data: { userId, role },
      });

      setConversations((current) =>
        current.filter((conversation) => conversation.conversationId !== conversationId),
      );
      setMessagesByConversation((current) => {
        const next = { ...current };
        delete next[conversationId];
        return next;
      });
      setOpenConversationMenuForId("");

      if (activeConversationId === conversationId) {
        const nextConversation = conversations.find(
          (conversation) => conversation.conversationId !== conversationId,
        );
        setActiveConversationId(nextConversation?.conversationId || "");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      setPageError(error?.response?.data?.message || "Unable to delete conversation");
    }
  };

  const handleClearChat = async (conversationId) => {
    if (!conversationId || !userId || !role) {
      return;
    }

    if (!window.confirm("Clear this chat?")) {
      return;
    }

    try {
      await axios.patch(`${API_URL}/messages/${encodeURIComponent(conversationId)}/clear`, {
        userId,
        role,
      });

      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: [],
      }));
      setConversations((current) =>
        current.map((conversation) =>
          conversation.conversationId === conversationId
            ? {
                ...conversation,
                unreadCount: 0,
                lastMessageTime: "",
                updatedAt: new Date().toISOString(),
              }
            : conversation,
        ),
      );
      setIsHeaderMenuOpen(false);
    } catch (error) {
      console.error("Failed to clear chat:", error);
      setPageError(error?.response?.data?.message || "Unable to clear chat");
    }
  };

  const handleReactToMessage = (messageId, emoji) => {
    if (!messageId || !activeConversationId) {
      return;
    }

    const socket = socketRef.current;

    setMessagesByConversation((current) => {
      const conversationMessages = current[activeConversationId] || [];
      const nextMessages = conversationMessages.map((message) => {
        if (!sameId(message.id, messageId)) {
          return message;
        }

        const currentReactions = Array.isArray(message.reactions) ? message.reactions : [];
        const myReactionIndex = currentReactions.findIndex((reaction) =>
          sameId(reaction.userId, userId),
        );
        const myExistingReaction =
          myReactionIndex >= 0 ? currentReactions[myReactionIndex] : null;

        if (myExistingReaction && myExistingReaction.emoji === emoji) {
          return {
            ...message,
            reactions: currentReactions.filter((reaction) => !sameId(reaction.userId, userId)),
          };
        }

        return {
          ...message,
          reactions: [
            ...currentReactions.filter((reaction) => !sameId(reaction.userId, userId)),
            {
              userId,
              role,
              emoji,
              reactedAt: new Date().toISOString(),
            },
          ],
        };
      });

      return {
        ...current,
        [activeConversationId]: nextMessages,
      };
    });

    if (socket?.connected) {
      socket.emit("react_message", {
        messageId,
        userId,
        role,
        emoji,
      });
    }
  };

  const toggleReactionMenu = (messageId) => {
    setOpenReactionMenuForMessageId((current) => (current === messageId ? "" : messageId));
  };

  const clearReactionLongPressTimer = () => {
    if (reactionLongPressTimerRef.current) {
      window.clearTimeout(reactionLongPressTimerRef.current);
      reactionLongPressTimerRef.current = null;
    }
  };

  const handleReactionButtonPointerDown = (messageId, event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") {
      return;
    }

    clearReactionLongPressTimer();
    reactionLongPressTriggeredRef.current = false;

    reactionLongPressTimerRef.current = window.setTimeout(() => {
      reactionLongPressTriggeredRef.current = true;
      toggleReactionMenu(messageId);
    }, 450);
  };

  const handleReactionButtonPointerUp = () => {
    clearReactionLongPressTimer();
  };

  const handleReactionButtonClick = (messageId) => {
    if (reactionLongPressTriggeredRef.current) {
      reactionLongPressTriggeredRef.current = false;
      return;
    }

    toggleReactionMenu(messageId);
  };

  const handleToggleConversationList = () => {
    setIsMobileConversationListOpen((current) => !current);
    setOpenReactionMenuForMessageId("");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-slate-100 via-blue-50 to-slate-200 font-barlow text-slate-800 ">
      <div className="fixed inset-0 pointer-events-none opacity-50">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-slate-300/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <FaGavel className="text-xl text-blue-700" />
            <span className="text-xl font-bold text-slate-800">
              Justif<span className="text-blue-500">Ai</span>
            </span>
          </Link>

          <div className="hidden text-center md:block">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
              Secure messages
            </p>
            <h1 className="mt-1 text-lg font-semibold text-slate-800">
              Conversation Inbox
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(dashboardPath)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </button>

            {user ? (
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-blue-600 ring-2 ring-blue-400">
                  {user.profileImage?.url || user.profilePicture ? (
                    <img
                      src={user.profileImage?.url || user.profilePicture}
                      alt={user.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold uppercase">
                      {user.name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {user.name || "Your account"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isLawyer ? "Lawyer inbox" : "Client inbox"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden ">
        <div className="h-full min-h-0 overflow-hidden">
          {pageError ? (
            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {pageError}
              </div>
            </div>
          ) : null}
          <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[400px_minmax(0,1fr)]">
            <aside
              className={`${
                isMobileConversationListOpen ? "flex" : "hidden md:flex"
              } min-h-0 flex-col overflow-hidden border-r border-blue-500/30 bg-white/80`}
            >
              <div className="border-b border-slate-200/80 p-3.5">
                <div className="flex items-center gap-2">
                  {/* <button
                    type="button"
                    onClick={handleToggleConversationList}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 md:hidden"
                    aria-label="Open conversations"
                  >
                    <List size={18} />
                  </button> */}

                  <label className="relative block flex-1">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search conversations"
                      className="w-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 shadow-md shadow-blue-300 outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                  </label>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {loadingConversations ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => {
                    const isActive = conversation.conversationId === activeConversationId;
                    const isMenuOpen = openConversationMenuForId === conversation.conversationId;

                    return (
                      <div
                        key={conversation.conversationId}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectConversation(conversation.conversationId)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelectConversation(conversation.conversationId);
                          }
                        }}
                        className={`relative mb-2 flex w-full items-start gap-3 border p-2 text-left transition ${
                          isActive
                            ? "border-blue-200 bg-blue-100 shadow-md"
                            : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-blue-600 ring-1 ring-slate-200">
                          <img
                            src={getAvatarForConversation(conversation)}
                            alt={conversation.counterpartName}
                            className="h-full w-full object-cover"
                          />
                          {conversation.online ? (
                            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1 pr-8">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="truncate font-semibold text-slate-900">
                                {conversation.counterpartName}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getRoleBadge(conversation).className}`}
                                >
                                  {getRoleBadge(conversation).label}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">
                              {conversation.lastMessageTime || ""}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="h-5" />
                            {conversation.unreadCount > 0 ? (
                              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-semibold text-white">
                                {conversation.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="absolute right-2 top-2" data-menu-root="true">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenConversationMenuForId((current) =>
                                current === conversation.conversationId
                                  ? ""
                                  : conversation.conversationId,
                              );
                              setIsHeaderMenuOpen(false);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Conversation options"
                          >
                            <MoreVertical size={16} />
                          </button>

                          <div
                            aria-hidden={!isMenuOpen}
                            className={`absolute right-0 top-9 z-20 w-40 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl transition ${
                              isMenuOpen
                                ? "pointer-events-auto translate-y-0 opacity-100"
                                : "pointer-events-none -translate-y-1 opacity-0"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteConversation(conversation.conversationId);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                              <Trash2 size={14} />
                              Delete conversation
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-sm font-semibold text-slate-800">
                      No conversations found
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Messages will appear after you open a lawyer profile and tap Message.
                    </p>
                  </div>
                )}
              </div>
            </aside>

            <section
              className={`${
                isMobileConversationListOpen ? "hidden md:flex" : "flex"
              } min-h-0 min-w-0 flex-col overflow-hidden bg-white/85`}
            >
              {activeConversation ? (
                <>
                  <div className="flex h-18 items-center justify-between gap-4 border-b border-slate-200/80 px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleToggleConversationList}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-600 md:hidden"
                        aria-label="Back to conversations"
                      >
                        <List size={18} />
                      </button>

                      <div className="relative lg:h-14 lg:w-14 h-12 w-12 p-1 lg:p-0 rounded-lg overflow-hidden lg:rounded-2xl lg:bg-blue-100 lg:ring-1 ring-slate-200">
                        <img
                          src={getAvatarForConversation(activeConversation)}
                          alt={activeConversation.counterpartName}
                          className="h-full w-full object-cover"
                        />
                        {activeConversation.online ? (
                          <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                        ) : null}
                      </div>

                      <div className="lg:flex flex-wrap items-center justify-center gap-3">
                        <p className="lg:border-r border-slate-300 pr-4 text-lg font-semibold text-slate-900">
                          {activeConversation.counterpartName} 
                        </p>
                        {/* <span
                          className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getRoleBadge(activeConversation).className}`}
                        >
                          {getRoleBadge(activeConversation).label}
                        </span> */}
                       {user && user.role == "user" && (
                         <p className="lg:border-r border-slate-300 pr-4 text-sm text-blue-500">
                           {activeConversation.subtitle}
                         </p>
                       )}
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <Circle
                            size={8}
                            className={
                              activeConversation.online
                                ? "fill-emerald-500 text-emerald-500"
                                : "text-slate-300"
                            }
                          />
                          {activeConversation.online ? "Online now" : "Last seen recently"}
                        </div>
                      </div>
                    </div>

                    <div className="relative" data-menu-root="true">
                      <button
                        type="button"
                        onClick={() => setIsHeaderMenuOpen((current) => !current)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                        aria-label="More options"
                      >
                        <MoreVertical size={17} />
                      </button>

                      <div
                        aria-hidden={!isHeaderMenuOpen}
                        className={`absolute right-0 top-12 z-30 w-40 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl transition ${
                          isHeaderMenuOpen
                            ? "pointer-events-auto translate-y-0 opacity-100"
                            : "pointer-events-none -translate-y-1 opacity-0"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleClearChat(activeConversationId)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
                        >
                          <Trash2 size={14} />
                          Clear chat
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto bg-linear-to-br from-blue-500/50 to-blue-500/20 bg-cover bg-center px-3 py-4 sm:px-6 sm:py-6">
                    {loadingMessages && activeMessages.length === 0 ? (
                      <div className="mx-auto flex h-full max-w-4xl items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white/80 p-8 text-sm text-slate-500">
                        Loading messages...
                      </div>
                    ) : (
                      <div className="mx-auto flex max-w-4xl flex-col gap-3 pb-2">
                        <div className="mx-auto mb-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
                          Today
                        </div>

                        {activeMessages.map((message) => {
                          const isMine = message.sender === "me";
                          const reactionSummary = summarizeReactions(message.reactions);
                          const isReactionMenuOpen = openReactionMenuForMessageId === message.id;

                          return (
                            <div
                              key={message.id}
                              data-reaction-picker-root="true"
                              className={`group relative flex ${isMine ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`relative max-w-[92%] rounded-3xl px-3 py-3 shadow-sm sm:max-w-[70%] sm:rounded-[28px] sm:px-4 ${
                                  isMine
                                    ? "rounded-br-md bg-blue-600 text-white"
                                    : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                                }`}
                              >
                                <p className="text-sm leading-6">{message.text}</p>
                                {reactionSummary.ownReaction || reactionSummary.otherReactions.length > 0 ? (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {reactionSummary.ownReaction ? (
                                      <span
                                        key={`${message.id}-own-reaction`}
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                          isMine
                                            ? "bg-white/15 text-white"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        <span>{reactionSummary.ownReaction.emoji}</span>
                                        <span>You</span>
                                      </span>
                                    ) : null}

                                    {reactionSummary.otherReactions.map((reaction) => (
                                      <span
                                        key={`${message.id}-${reaction.emoji}`}
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                          isMine
                                            ? "bg-white/15 text-white"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        <span>{reaction.emoji}</span>
                                        <span>{reaction.count}</span>
                                      </span>
                                    ))}
                                  </div>
                                ) : null}

                                <div
                                  className={`mt-2 flex items-center justify-between gap-2 text-[11px] ${
                                    isMine ? "text-blue-100" : "text-slate-400"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleReactionButtonClick(message.id)}
                                    onPointerDown={(event) =>
                                      handleReactionButtonPointerDown(message.id, event)
                                    }
                                    onPointerUp={handleReactionButtonPointerUp}
                                    onPointerCancel={handleReactionButtonPointerUp}
                                    onPointerLeave={handleReactionButtonPointerUp}
                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${
                                      isMine
                                        ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
                                    }`}
                                    aria-label="React to message"
                                  >
                                    <Smile size={14} />
                                  </button>

                                  <span className="inline-flex items-center gap-1">
                                    <span>{message.time}</span>
                                    {isMine ? <CheckCheck size={13} /> : null}
                                  </span>
                                </div>

                                <div
                                  aria-hidden={!isReactionMenuOpen}
                                  className={`absolute bottom-full z-20 mb-2 flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-lg transition-all duration-150 ease-out ${
                                    isMine ? "right-0" : "left-0"
                                  } ${
                                    isReactionMenuOpen
                                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                                      : "pointer-events-none translate-y-1 scale-95 opacity-0"
                                  }`}
                                >
                                  {REACTION_OPTIONS.map((reaction) => (
                                    <button
                                      key={reaction.emoji}
                                      type="button"
                                      onClick={() => {
                                        handleReactToMessage(message.id, reaction.emoji);
                                        setOpenReactionMenuForMessageId("");
                                      }}
                                      className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-slate-100 hover:scale-110"
                                      aria-label={reaction.label}
                                    >
                                      {reaction.emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div ref={messageEndRef} />
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-slate-200/80 p-3 lg:mb-0 mb-10 sm:p-3"
                  >
                    <div className="flex w-full items-end gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-sm sm:w-full sm:rounded-[28px] sm:px-4">
                      {/* <button
                        type="button"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 transition hover:text-blue-600"
                        aria-label="Attach file"
                      >
                        <Paperclip size={18} />
                      </button> */}

                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSendMessage(event);
                          }
                        }}
                        rows={1}
                        placeholder={`Message ${activeConversation.counterpartName}...`}
                        className="min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="submit"
                        disabled={!draft.trim() || !activeConversationId}
                        className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={16} />
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-10 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Send size={20} />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      Select a conversation
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Choose a chat from the list to start reviewing messages.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
