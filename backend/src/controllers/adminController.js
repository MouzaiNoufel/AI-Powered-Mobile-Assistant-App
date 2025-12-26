const { User, Conversation, Analytics } = require('../models');
const { catchAsync, AppError } = require('../middleware');
const { analyticsService } = require('../services');
const logger = require('../utils/logger');

// Get all users (with pagination)
const getUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;

  const query = {};
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .select('-refreshTokens -deviceTokens -password');

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// Get single user
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId)
    .select('-refreshTokens -deviceTokens -password');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  // Get user's conversation count
  const conversationCount = await Conversation.countDocuments({ 
    user: user._id, 
    status: 'active' 
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        conversationCount,
      },
    },
  });
});

// Update user (admin)
const updateUser = catchAsync(async (req, res, next) => {
  const allowedFields = ['role', 'isActive', 'subscription'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    updates,
    { new: true, runValidators: true }
  ).select('-refreshTokens -deviceTokens -password');

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  logger.info(`Admin updated user ${user.email}: ${JSON.stringify(updates)}`);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user },
  });
});

// Reset user usage limits
const resetUserUsage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
  }

  user.usage.dailyAiRequests = 0;
  user.usage.monthlyAiRequests = 0;
  user.usage.lastDailyReset = new Date();
  user.usage.lastMonthlyReset = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`Admin reset usage for user ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'User usage reset successfully',
  });
});

// Get dashboard analytics
const getDashboard = catchAsync(async (req, res, next) => {
  const dashboardData = await analyticsService.getDashboardData();

  // Get additional stats
  const [totalUsers, activeUsers, premiumUsers, totalConversations] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: { $in: ['premium', 'admin'] } }),
    Conversation.countDocuments({ status: 'active' }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        activeUsers,
        premiumUsers,
        totalConversations,
      },
      analytics: dashboardData,
    },
  });
});

// Get system health
const getSystemHealth = catchAsync(async (req, res, next) => {
  const { aiService } = require('../services');

  const health = {
    status: 'healthy',
    timestamp: new Date(),
    services: {
      database: 'connected',
      ai: aiService.getStatus(),
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    uptime: Math.round(process.uptime()),
  };

  res.status(200).json({
    success: true,
    data: { health },
  });
});

// Get recent activity
const getRecentActivity = catchAsync(async (req, res, next) => {
  const { limit = 50 } = req.query;

  const activity = await Analytics.find({})
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .populate('user', 'email firstName lastName')
    .lean();

  res.status(200).json({
    success: true,
    data: { activity },
  });
});

// Export analytics data
const exportAnalytics = catchAsync(async (req, res, next) => {
  const { startDate, endDate, eventTypes } = req.query;

  const query = {};
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  if (eventTypes) {
    query.eventType = { $in: eventTypes.split(',') };
  }

  const data = await Analytics.find(query)
    .sort({ timestamp: -1 })
    .limit(10000)
    .populate('user', 'email firstName lastName')
    .lean();

  res.status(200).json({
    success: true,
    data: {
      count: data.length,
      events: data,
      exportedAt: new Date(),
    },
  });
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  resetUserUsage,
  getDashboard,
  getSystemHealth,
  getRecentActivity,
  exportAnalytics,
};
