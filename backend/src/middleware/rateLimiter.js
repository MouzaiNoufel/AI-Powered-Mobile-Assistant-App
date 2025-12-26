const rateLimit = require('express-rate-limit');
const config = require('../config');
const AppError = require('../utils/AppError');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new AppError(options.message.message, 429, 'RATE_LIMIT_EXCEEDED'));
  },
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// AI request rate limiter
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    message: 'Too many AI requests, please slow down.',
    errorCode: 'AI_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limiter for user-based limits
const createUserLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 10,
    keyGenerator = (req) => req.user?.id || req.ip,
    message = 'Too many requests',
  } = options;

  return rateLimit({
    windowMs,
    max,
    keyGenerator,
    message: {
      success: false,
      message,
      errorCode: 'USER_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
  createUserLimiter,
};
