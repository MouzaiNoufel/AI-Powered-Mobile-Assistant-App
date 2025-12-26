const auth = require('./auth');
const { errorHandler, notFound, catchAsync, AppError } = require('./errorHandler');
const { apiLimiter, authLimiter, aiLimiter, createUserLimiter } = require('./rateLimiter');
const validators = require('./validators');

module.exports = {
  ...auth,
  errorHandler,
  notFound,
  catchAsync,
  AppError,
  apiLimiter,
  authLimiter,
  aiLimiter,
  createUserLimiter,
  validators,
};
