const { User } = require('../models');
const { 
  generateAccessToken, 
  generateRefreshToken,
  catchAsync,
  AppError,
} = require('../middleware');
const { analyticsService, notificationService } = require('../services');
const logger = require('../utils/logger');

// Register new user
const register = catchAsync(async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400, 'EMAIL_EXISTS'));
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Track registration
  await analyticsService.trackRegistration(user._id, {
    platform: req.body.platform,
  });

  // Send welcome notification
  // await notificationService.sendToUser(user, notificationService.templates.welcomeMessage(firstName));

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

// Login user
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', 401, 'ACCOUNT_DEACTIVATED'));
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token and update last login
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  
  // Clean up old refresh tokens (keep last 5)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Track login
  await analyticsService.trackLogin(user._id, {
    platform: req.body.platform,
  });

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        preferences: user.preferences,
        subscription: user.subscription,
        usage: {
          dailyAiRequests: user.usage.dailyAiRequests,
          monthlyAiRequests: user.usage.monthlyAiRequests,
          limits: user.getUsageLimits(),
        },
        lastLoginAt: user.lastLoginAt,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

// Logout user
const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken && req.user) {
    // Remove the refresh token
    req.user.refreshTokens = req.user.refreshTokens.filter(t => t.token !== refreshToken);
    await req.user.save({ validateBeforeSave: false });
  }

  // Track logout
  if (req.user) {
    await analyticsService.trackLogout(req.user._id);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Refresh access token
const refreshToken = catchAsync(async (req, res, next) => {
  const user = req.user;
  const oldRefreshToken = req.refreshToken;

  // Generate new tokens
  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  // Remove old refresh token and add new one
  user.refreshTokens = user.refreshTokens.filter(t => t.token !== oldRefreshToken);
  user.refreshTokens.push({
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    },
  });
});

// Get current user
const getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  // Check and reset usage if needed
  user.checkAndResetUsage();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        preferences: user.preferences,
        subscription: user.subscription,
        usage: {
          dailyAiRequests: user.usage.dailyAiRequests,
          monthlyAiRequests: user.usage.monthlyAiRequests,
          totalAiRequests: user.usage.totalAiRequests,
          limits: user.getUsageLimits(),
          canMakeRequest: user.canMakeAiRequest(),
        },
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    },
  });
});

// Update profile
const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['firstName', 'lastName', 'avatar', 'preferences'];
  const updates = {};

  // Only allow updating specific fields
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'preferences') {
        // Merge preferences instead of replacing
        updates.preferences = {
          ...req.user.preferences.toObject(),
          ...req.body.preferences,
        };
      } else {
        updates[field] = req.body[field];
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  // Track update
  await analyticsService.trackSettingsUpdate(user._id, Object.keys(updates));

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    },
  });
});

// Change password
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD'));
  }

  user.password = newPassword;
  await user.save();

  // Generate new tokens (invalidate old sessions)
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens = [{
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }];
  await user.save({ validateBeforeSave: false });

  logger.info(`Password changed for user: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: {
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

// Register device token for push notifications
const registerDeviceToken = catchAsync(async (req, res, next) => {
  const { token, platform } = req.body;
  const user = req.user;

  // Check if token already exists
  const existingToken = user.deviceTokens.find(d => d.token === token);
  if (!existingToken) {
    user.deviceTokens.push({ token, platform });
    
    // Keep only last 5 device tokens
    if (user.deviceTokens.length > 5) {
      user.deviceTokens = user.deviceTokens.slice(-5);
    }
    
    await user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    success: true,
    message: 'Device token registered successfully',
  });
});

// Remove device token
const removeDeviceToken = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  const user = req.user;

  user.deviceTokens = user.deviceTokens.filter(d => d.token !== token);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Device token removed successfully',
  });
});

// Delete account
const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(password))) {
    return next(new AppError('Password is incorrect', 400, 'INVALID_PASSWORD'));
  }

  // Soft delete - deactivate account
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  user.refreshTokens = [];
  user.deviceTokens = [];
  await user.save({ validateBeforeSave: false });

  logger.info(`Account deleted: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  registerDeviceToken,
  removeDeviceToken,
  deleteAccount,
};
