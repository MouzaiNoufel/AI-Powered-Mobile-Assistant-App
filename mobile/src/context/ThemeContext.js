import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../config/theme';
import { storage } from '../utils/storage';
import config from '../config';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await storage.getItem(config.storageKeys.theme);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = useCallback(async (mode) => {
    if (['light', 'dark', 'system'].includes(mode)) {
      setThemeMode(mode);
      await storage.setItem(config.storageKeys.theme, mode);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const newMode = themeMode === 'light' ? 'dark' : 
                    themeMode === 'dark' ? 'system' : 'light';
    await setTheme(newMode);
  }, [themeMode, setTheme]);

  // Determine actual theme based on mode
  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  const value = {
    theme,
    isDark,
    themeMode,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
