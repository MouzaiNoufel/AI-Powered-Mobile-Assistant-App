const express = require('express');
const router = express.Router();
const { aiController } = require('../controllers');
const { 
  protect, 
  aiLimiter,
  validators 
} = require('../middleware');

// All AI routes require authentication
router.use(protect);

// AI Chat
router.post(
  '/chat',
  aiLimiter,
  validators.aiMessageValidation,
  aiController.sendMessage
);

// AI Status
router.get('/status', aiController.getAiStatus);

// Usage Statistics
router.get('/usage', aiController.getUsageStats);

// Conversations
router.get(
  '/conversations',
  validators.paginationValidation,
  aiController.getConversations
);

router.get(
  '/conversations/:conversationId',
  validators.conversationIdValidation,
  aiController.getConversation
);

router.patch(
  '/conversations/:conversationId',
  validators.conversationIdValidation,
  aiController.updateConversation
);

router.delete(
  '/conversations/:conversationId',
  validators.conversationIdValidation,
  aiController.deleteConversation
);

router.post(
  '/conversations/:conversationId/archive',
  validators.conversationIdValidation,
  aiController.archiveConversation
);

router.delete('/conversations', aiController.clearAllConversations);

module.exports = router;
