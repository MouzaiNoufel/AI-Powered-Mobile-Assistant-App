import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Secure storage for sensitive data (tokens, etc.)
export const secureStorage = {
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      // Fallback to AsyncStorage on web or if SecureStore fails
      try {
        await AsyncStorage.setItem(key, value);
        return true;
      } catch (fallbackError) {
        console.error('AsyncStorage fallback setItem error:', fallbackError);
        return false;
      }
    }
  },

  async getItem(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      // Fallback to AsyncStorage
      try {
        return await AsyncStorage.getItem(key);
      } catch (fallbackError) {
        console.error('AsyncStorage fallback getItem error:', fallbackError);
        return null;
      }
    }
  },

  async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
      try {
        await AsyncStorage.removeItem(key);
        return true;
      } catch (fallbackError) {
        console.error('AsyncStorage fallback removeItem error:', fallbackError);
        return false;
      }
    }
  },

  async clear() {
    // Note: SecureStore doesn't have a clear method, need to remove items individually
    const keys = ['access_token', 'refresh_token', 'user_data'];
    try {
      await Promise.all(keys.map(key => this.removeItem(key)));
      return true;
    } catch (error) {
      console.error('SecureStore clear error:', error);
      return false;
    }
  },
};

// Regular storage for non-sensitive data (preferences, cache, etc.)
export const storage = {
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  },

  async getItem(key, parse = true) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      if (parse) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  },

  async multiGet(keys) {
    try {
      const result = await AsyncStorage.multiGet(keys);
      return result.reduce((acc, [key, value]) => {
        try {
          acc[key] = JSON.parse(value);
        } catch {
          acc[key] = value;
        }
        return acc;
      }, {});
    } catch (error) {
      console.error('Storage multiGet error:', error);
      return {};
    }
  },

  async multiSet(keyValuePairs) {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Storage multiSet error:', error);
      return false;
    }
  },
};

export default { secureStorage, storage };
