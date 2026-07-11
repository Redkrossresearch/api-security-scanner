const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");
const {
  getAvailableModels,
  getConversations,
  createConversation,
  updateConversation,
  duplicateConversation,
  deleteConversation,
  archiveConversation,
  getConversationMessages,
  handleChatRequest,
  saveAssistantMessage,
  getMemories,
  createMemory,
  deleteMemory,
  getTrainings,
  createTraining,
  deleteTraining,
} = require("./copilot.controller");

// Public model registry (no auth needed)
router.get("/models", authenticate, getAvailableModels);

// Conversation CRUD
router.get("/conversations", authenticate, getConversations);
router.post("/conversations", authenticate, createConversation);
router.put("/conversations/:id", authenticate, updateConversation);
router.delete("/conversations/:id", authenticate, deleteConversation);
router.post("/conversations/:id/duplicate", authenticate, duplicateConversation);
router.put("/conversations/:id/archive", authenticate, archiveConversation);

// Messages
router.get("/conversations/:id/messages", authenticate, getConversationMessages);
router.post("/conversations/:id/messages", authenticate, handleChatRequest);
router.post("/conversations/:id/messages/save", authenticate, saveAssistantMessage);


// Context memories CRUD
router.get("/memories", authenticate, getMemories);
router.post("/memories", authenticate, createMemory);
router.delete("/memories/:id", authenticate, deleteMemory);

// Few-shot training CRUD
router.get("/trainings", authenticate, getTrainings);
router.post("/trainings", authenticate, createTraining);
router.delete("/trainings/:id", authenticate, deleteTraining);

module.exports = router;
