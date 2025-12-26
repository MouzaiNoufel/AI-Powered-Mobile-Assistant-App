import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, StyleSheet, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import {
  AuthProvider,
  ThemeProvider,
  ChatProvider,
  useTheme,
} from './src/context';
import { RootNavigator } from './src/navigation';

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if splash screen is already hidden
});

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native core',
]);

// Inner app component that uses theme context
const AppContent = ({ onLayoutRootView }) => {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      onLayout={onLayoutRootView}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      <RootNavigator />
    </View>
  );
};

// Main App component with providers
const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          ...Ionicons.font,
        });

        // Add any other initialization here
        // For example: load user preferences, check auth state, etc.

        // Artificial delay to show splash screen (remove in production)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Error loading app resources:', error);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide splash screen once the app is ready
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <AppContent onLayoutRootView={onLayoutRootView} />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
