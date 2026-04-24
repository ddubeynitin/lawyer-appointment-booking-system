const express = require("express");
const {
  ensureConversation,
  listConversations,
  fetchConversationMessages,
  markConversationAsRead,
  clearConversation,
  removeConversation,
} = require("../controllers/message.controller");

const router = express.Router();

router.post("/conversations/ensure", ensureConversation);
router.get("/conversations", listConversations);
router.get("/:conversationId", fetchConversationMessages);
router.patch("/:conversationId/read", markConversationAsRead);
router.patch("/:conversationId/clear", clearConversation);
router.delete("/:conversationId", removeConversation);

module.exports = router;
