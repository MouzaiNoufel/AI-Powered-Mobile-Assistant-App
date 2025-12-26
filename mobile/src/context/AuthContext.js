import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import config from '../config';
import { secureStorage, storage } from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      const token = await secureStorage.getItem(config.storageKeys.accessToken);
      const storedUser = await secureStorage.getItem(config.storageKeys.user);
      
      if (token && storedUser) {
        try {
          // Verify token by fetching current user
          const response = await api.auth.getMe();
          const userData = response.data.data.user;
          
          setUser(userData);
          setIsAuthenticated(true);
          await secureStorage.setItem(config.storageKeys.user, JSON.stringify(userData));
        } catch (err) {
          // Token invalid, clear storage
          await clearAuth();
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = async () => {
    await secureStorage.removeItem(config.storageKeys.accessToken);
    await secureStorage.removeItem(config.storageKeys.refreshToken);
    await secureStorage.removeItem(config.storageKeys.user);
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await api.auth.register({
        email,
        password,
        firstName,
        lastName,
      });

      const { user: userData, tokens } = response.data.data;

      await secureStorage.setItem(config.storageKeys.accessToken, tokens.accessToken);
      await secureStorage.setItem(config.storageKeys.refreshToken, tokens.refreshToken);
      await secureStorage.setItem(config.storageKeys.user, JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await api.auth.login({ email, password });
      const { user: userData, tokens } = response.data.data;

      await secureStorage.setItem(config.storageKeys.accessToken, tokens.accessToken);
      await secureStorage.setItem(config.storageKeys.refreshToken, tokens.refreshToken);
      await secureStorage.setItem(config.storageKeys.user, JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const refreshToken = await secureStorage.getItem(config.storageKeys.refreshToken);
      
      if (refreshToken) {
        try {
          await api.auth.logout(refreshToken);
        } catch (err) {
          // Ignore logout API errors
          console.log('Logout API error (ignored):', err);
        }
      }

      await clearAuth();
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      await clearAuth();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setError(null);
      
      const response = await api.auth.updateProfile(data);
      const updatedUser = { ...user, ...response.data.data.user };
      
      setUser(updatedUser);
      await secureStorage.setItem(config.storageKeys.user, JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      setError(null);

      const response = await api.auth.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      const { tokens } = response.data.data;

      await secureStorage.setItem(config.storageKeys.accessToken, tokens.accessToken);
      await secureStorage.setItem(config.storageKeys.refreshToken, tokens.refreshToken);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.auth.getMe();
      const userData = response.data.data.user;
      
      setUser(userData);
      await secureStorage.setItem(config.storageKeys.user, JSON.stringify(userData));
      
      return userData;
    } catch (err) {
      console.error('Refresh user error:', err);
      return null;
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
