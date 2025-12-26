const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new AppError(errorMessages.join('. '), 400, 'VALIDATION_ERROR'));
  }
  next();
};

// User registration validation
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  validate,
];

// User login validation
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// AI message validation
const aiMessageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message is required and must be less than 10,000 characters'),
  body('conversationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('personality')
    .optional()
    .isIn(['professional', 'friendly', 'concise', 'detailed'])
    .withMessage('Invalid personality type'),
  validate,
];

// Profile update validation
const profileUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Invalid theme'),
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Invalid language code'),
  body('preferences.aiPersonality')
    .optional()
    .isIn(['professional', 'friendly', 'concise', 'detailed'])
    .withMessage('Invalid AI personality'),
  validate,
];

// Password change validation
const passwordChangeValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
  validate,
];

// Conversation ID validation
const conversationIdValidation = [
  param('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  validate,
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate,
];

// Device token validation
const deviceTokenValidation = [
  body('token')
    .notEmpty()
    .withMessage('Device token is required'),
  body('platform')
    .isIn(['ios', 'android', 'web'])
    .withMessage('Platform must be ios, android, or web'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  aiMessageValidation,
  profileUpdateValidation,
  passwordChangeValidation,
  conversationIdValidation,
  paginationValidation,
  deviceTokenValidation,
};
