import axios from 'axios';
import config from '../config';
import { secureStorage } from '../utils/storage';

// Create axios instance
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeouts.apiRequest,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  async (requestConfig) => {
    // Add auth token to requests
    const token = await secureStorage.getItem(config.storageKeys.accessToken);
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.debug) {
      console.log(`[API] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }
    
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (config.debug) {
      console.log(`[API] Response:`, response.status);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureStorage.getItem(config.storageKeys.refreshToken);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${config.apiUrl}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

        await secureStorage.setItem(config.storageKeys.accessToken, accessToken);
        await secureStorage.setItem(config.storageKeys.refreshToken, newRefreshToken);

        apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear tokens and redirect to login
        await secureStorage.removeItem(config.storageKeys.accessToken);
        await secureStorage.removeItem(config.storageKeys.refreshToken);
        await secureStorage.removeItem(config.storageKeys.user);
        
        // This will be handled by the auth context
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Format error response
    const errorResponse = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      errorCode: error.response?.data?.errorCode || 'UNKNOWN_ERROR',
      data: error.response?.data,
    };

    if (config.debug) {
      console.error('[API] Error:', errorResponse);
    }

    return Promise.reject(errorResponse);
  }
);

// API methods
const api = {
  // Auth
  auth: {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
    refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { refreshToken }),
    getMe: () => apiClient.get('/auth/me'),
    updateProfile: (data) => apiClient.patch('/auth/profile', data),
    changePassword: (data) => apiClient.patch('/auth/change-password', data),
    registerDeviceToken: (token, platform) => 
      apiClient.post('/auth/device-token', { token, platform }),
    removeDeviceToken: (token) => 
      apiClient.delete('/auth/device-token', { data: { token } }),
    deleteAccount: (password) => 
      apiClient.delete('/auth/account', { data: { password } }),
  },

  // AI
  ai: {
    sendMessage: (message, conversationId = null, personality = null) => {
      const body = { message };
      if (conversationId) body.conversationId = conversationId;
      if (personality) body.personality = personality;
      return apiClient.post('/ai/chat', body);
    },
    getStatus: () => apiClient.get('/ai/status'),
    getUsage: () => apiClient.get('/ai/usage'),
    getConversations: (params = {}) => 
      apiClient.get('/ai/conversations', { params }),
    getConversation: (conversationId) => 
      apiClient.get(`/ai/conversations/${conversationId}`),
    updateConversation: (conversationId, data) => 
      apiClient.patch(`/ai/conversations/${conversationId}`, data),
    deleteConversation: (conversationId) => 
      apiClient.delete(`/ai/conversations/${conversationId}`),
    archiveConversation: (conversationId) => 
      apiClient.post(`/ai/conversations/${conversationId}/archive`),
    clearAllConversations: () => 
      apiClient.delete('/ai/conversations'),
  },

  // Generic methods
  get: (url, params) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url, data) => apiClient.delete(url, { data }),
};

export default api;
