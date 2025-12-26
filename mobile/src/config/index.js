// App configuration
const ENV = {
  development: {
    apiUrl: 'http://192.168.100.162:5000/api/v1',
    // For Android Emulator: 'http://10.0.2.2:5000/api/v1'
    // For iOS Simulator with local IP: 'http://192.168.x.x:5000/api/v1'
  },
  staging: {
    apiUrl: 'https://staging-api.aiassistant.com/api/v1',
  },
  production: {
    apiUrl: 'https://api.aiassistant.com/api/v1',
  },
};

const getEnvVars = (env = 'development') => {
  if (env === 'production' || env === 'prod') {
    return ENV.production;
  } else if (env === 'staging' || env === 'stage') {
    return ENV.staging;
  }
  return ENV.development;
};

// Get environment from Expo constants
const env = __DEV__ ? 'development' : 'production';

const config = {
  ...getEnvVars(env),
  
  // App info
  appName: 'AI Assistant',
  appVersion: '1.0.0',
  
  // Feature flags
  features: {
    analytics: true,
    pushNotifications: true,
    voiceInput: false,
    darkMode: true,
  },
  
  // AI Configuration
  ai: {
    maxMessageLength: 10000,
    personalities: ['professional', 'friendly', 'concise', 'detailed'],
    defaultPersonality: 'friendly',
  },
  
  // Storage keys
  storageKeys: {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    user: 'user_data',
    theme: 'app_theme',
    onboarding: 'onboarding_complete',
  },
  
  // Timeouts
  timeouts: {
    apiRequest: 30000, // 30 seconds
    tokenRefresh: 5000, // 5 seconds
  },
  
  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // Debug
  debug: __DEV__,
};

export default config;
