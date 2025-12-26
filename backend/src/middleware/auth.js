const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

// Protect routes - verify token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
      throw err;
    }

    // Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password. Please log in again.', 401));
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next(new AppError('Authentication failed', 401));
  }
};

// Restrict to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Token invalid but continue without user
        logger.debug('Optional auth - invalid token');
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Verify refresh token
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    if (decoded.type !== 'refresh') {
      return next(new AppError('Invalid token type', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401));
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    if (!tokenExists) {
      return next(new AppError('Refresh token has been revoked', 401));
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    logger.error('Refresh token verification error:', error);
    next(new AppError('Token verification failed', 401));
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  protect,
  restrictTo,
  optionalAuth,
  verifyRefreshToken,
};
