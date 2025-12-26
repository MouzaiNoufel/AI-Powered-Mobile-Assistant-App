require('dotenv').config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiVersion: process.env.API_VERSION || 'v1',

  // MongoDB
  mongodb: {
    uri: process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PROD 
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_assistant',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 2048,
  },

  // AI Usage Limits
  aiLimits: {
    daily: {
      free: parseInt(process.env.AI_DAILY_LIMIT_FREE, 10) || 10,
      premium: parseInt(process.env.AI_DAILY_LIMIT_PREMIUM, 10) || 100,
    },
    monthly: {
      free: parseInt(process.env.AI_MONTHLY_LIMIT_FREE, 10) || 100,
      premium: parseInt(process.env.AI_MONTHLY_LIMIT_PREMIUM, 10) || 3000,
    }
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Push Notifications
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY,
    projectId: process.env.FCM_PROJECT_ID,
  },

  // Analytics
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'default-encryption-key-32chars',
  },

  // Admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@aiassistant.com',
    password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  },

  // CORS Origins
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:19006', 'exp://localhost:19000'],
};

// Validate required configuration
const validateConfig = () => {
  const required = ['jwt.secret'];
  const missing = [];

  required.forEach(key => {
    const keys = key.split('.');
    let value = config;
    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        missing.push(key);
        break;
      }
    }
  });

  if (missing.length > 0 && config.env === 'production') {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
};

validateConfig();

module.exports = config;
