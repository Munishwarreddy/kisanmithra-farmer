const express = require("express");
const {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
} = require("../controllers/messageController");
const { verifyToken } = require("../utils/authMiddleware");

const router = express.Router();

// POST /api/messages - Send message
router.post("/", verifyToken, sendMessage);

// GET /api/messages/conversations - Get conversations
router.get("/conversations", verifyToken, getConversations);

// GET /api/messages/:conversationId - Get messages in a conversation
router.get("/:conversationId", verifyToken, getMessages);

// PUT /api/messages/:id/read - Mark message as read
router.put("/:id/read", verifyToken, markAsRead);

module.exports = router;
