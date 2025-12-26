const { Conversation, User } = require('../models');
const { catchAsync, AppError } = require('../middleware');
const { aiService, analyticsService } = require('../services');
const logger = require('../utils/logger');

// Send message to AI
const sendMessage = catchAsync(async (req, res, next) => {
  const { message, conversationId, personality } = req.body;
  const user = req.user;

  // Check usage limits
  const usageStatus = user.canMakeAiRequest();
  if (!usageStatus.canMake) {
    return next(new AppError(
      `You've reached your ${usageStatus.dailyRemaining === 0 ? 'daily' : 'monthly'} AI request limit. ` +
      'Please upgrade to Premium for more requests.',
      429,
      'USAGE_LIMIT_EXCEEDED'
    ));
  }

  // Get or create conversation
  let conversation;
  if (conversationId) {
    conversation = await Conversation.findOne({
      _id: conversationId,
      user: user._id,
      status: 'active',
    });
    if (!conversation) {
      return next(new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND'));
    }
  } else {
    conversation = new Conversation({
      user: user._id,
      metadata: {
        personality: personality || user.preferences.aiPersonality,
      },
    });
    await analyticsService.trackConversationCreated(user._id, conversation._id);
  }

  // Add user message to conversation
  conversation.addMessage('user', message);

  // Track AI request
  await analyticsService.trackAiRequest(user._id, {
    conversationId: conversation._id,
    messageLength: message.length,
  });

  try {
    // Get AI response
    const aiResult = await aiService.generateResponse({
      message,
      conversationHistory: conversation.messages,
      personality: conversation.metadata.personality,
    });

    // Add AI response to conversation
    conversation.addMessage('assistant', aiResult.response, aiResult.tokens.total);
    await conversation.save();

    // Increment user usage
    user.incrementUsage();
    await user.save({ validateBeforeSave: false });

    // Track AI response
    await analyticsService.trackAiResponse(user._id, {
      conversationId: conversation._id,
      tokens: aiResult.tokens.total,
      processingTime: aiResult.processingTime,
    });

    logger.debug(`AI response generated for user ${user._id}`);

    res.status(200).json({
      success: true,
      data: {
        message: {
          role: 'assistant',
          content: aiResult.response,
          timestamp: new Date(),
        },
        conversation: {
          id: conversation._id,
          title: conversation.title,
          messageCount: conversation.messageCount,
        },
        usage: {
          tokens: aiResult.tokens,
          dailyRemaining: usageStatus.dailyRemaining - 1,
          monthlyRemaining: usageStatus.monthlyRemaining - 1,
          limits: usageStatus.limits,
        },
        metadata: {
          model: aiResult.model,
          processingTime: aiResult.processingTime,
          isMock: aiResult.isMock || false,
        },
      },
    });
  } catch (error) {
    // Track AI error
    await analyticsService.trackAiError(user._id, error);
    
    // Still save the user message even if AI fails
    await conversation.save();
    
    logger.error('AI generation failed:', error);
    return next(new AppError(error.message || 'Failed to generate AI response', 500, 'AI_ERROR'));
  }
});

// Get all conversations for user
const getConversations = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status, isStarred, category, search } = req.query;

  const result = await Conversation.getUserConversations(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
    status: status || 'active',
    isStarred: isStarred === 'true' ? true : isStarred === 'false' ? false : undefined,
    category,
    search,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

// Get single conversation with messages
const getConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    user: req.user._id,
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND'));
  }

  res.status(200).json({
    success: true,
    data: {
      conversation: {
        id: conversation._id,
        title: conversation.title,
        messages: conversation.messages,
        metadata: conversation.metadata,
        isStarred: conversation.isStarred,
        status: conversation.status,
        messageCount: conversation.messageCount,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    },
  });
});

// Update conversation (title, starred, category)
const updateConversation = catchAsync(async (req, res, next) => {
  const { title, isStarred, category } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (isStarred !== undefined) updates.isStarred = isStarred;
  if (category !== undefined) updates['metadata.category'] = category;

  const conversation = await Conversation.findOneAndUpdate(
    { _id: req.params.conversationId, user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!conversation) {
    return next(new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND'));
  }

  res.status(200).json({
    success: true,
    message: 'Conversation updated successfully',
    data: {
      conversation: conversation.getSummary(),
    },
  });
});

// Delete conversation (soft delete)
const deleteConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findOneAndUpdate(
    { _id: req.params.conversationId, user: req.user._id },
    { status: 'deleted' },
    { new: true }
  );

  if (!conversation) {
    return next(new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND'));
  }

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
  });
});

// Archive conversation
const archiveConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.findOneAndUpdate(
    { _id: req.params.conversationId, user: req.user._id },
    { status: 'archived' },
    { new: true }
  );

  if (!conversation) {
    return next(new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND'));
  }

  res.status(200).json({
    success: true,
    message: 'Conversation archived successfully',
    data: {
      conversation: conversation.getSummary(),
    },
  });
});

// Clear all conversations
const clearAllConversations = catchAsync(async (req, res, next) => {
  await Conversation.updateMany(
    { user: req.user._id, status: 'active' },
    { status: 'deleted' }
  );

  res.status(200).json({
    success: true,
    message: 'All conversations cleared successfully',
  });
});

// Get AI service status
const getAiStatus = catchAsync(async (req, res, next) => {
  const status = aiService.getStatus();

  res.status(200).json({
    success: true,
    data: {
      status,
    },
  });
});

// Get usage statistics
const getUsageStats = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { period = 'month' } = req.query;

  const stats = await analyticsService.getAiUsageStats(user._id, period);
  const usageStatus = user.canMakeAiRequest();

  res.status(200).json({
    success: true,
    data: {
      current: {
        dailyUsed: user.usage.dailyAiRequests,
        monthlyUsed: user.usage.monthlyAiRequests,
        totalUsed: user.usage.totalAiRequests,
        ...usageStatus,
      },
      history: stats,
    },
  });
});

module.exports = {
  sendMessage,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  archiveConversation,
  clearAllConversations,
  getAiStatus,
  getUsageStats,
};
