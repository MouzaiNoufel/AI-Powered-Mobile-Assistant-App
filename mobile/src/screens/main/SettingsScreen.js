import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../context';
import { SettingsItem, Button, LoadingIndicator } from '../../components';

const PERSONALITY_OPTIONS = [
  { id: 'professional', label: 'Professional', icon: '[P]', description: 'Formal and business-like' },
  { id: 'friendly', label: 'Friendly', icon: '[F]', description: 'Casual and warm' },
  { id: 'creative', label: 'Creative', icon: '[C]', description: 'Imaginative and expressive' },
  { id: 'technical', label: 'Technical', icon: '[T]', description: 'Detailed and precise' },
];

const SettingsScreen = ({ navigation }) => {
  const { theme, themeMode, setTheme, isDark } = useTheme();
  const { user, updateProfile, logout, isLoading } = useAuth();

  const [notifications, setNotifications] = useState(
    user?.preferences?.notifications ?? true
  );
  const [personality, setPersonality] = useState(
    user?.preferences?.aiPersonality || 'friendly'
  );
  const [isSaving, setIsSaving] = useState(false);

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      default: return 'System';
    }
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred appearance',
      [
        { text: 'Light', onPress: () => setTheme('light') },
        { text: 'Dark', onPress: () => setTheme('dark') },
        { text: 'System Default', onPress: () => setTheme('system') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePersonalityChange = () => {
    Alert.alert(
      'AI Personality',
      'Choose how the AI assistant communicates with you',
      [
        ...PERSONALITY_OPTIONS.map((opt) => ({
          text: `${opt.icon} ${opt.label}`,
          onPress: () => handlePersonalitySelect(opt.id),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePersonalitySelect = async (newPersonality) => {
    setPersonality(newPersonality);
    setIsSaving(true);

    try {
      await updateProfile({
        preferences: {
          ...user?.preferences,
          aiPersonality: newPersonality,
        },
      });
    } catch (error) {
      console.error('Failed to update personality:', error);
      setPersonality(user?.preferences?.aiPersonality || 'friendly');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationToggle = async (value) => {
    setNotifications(value);
    setIsSaving(true);

    try {
      await updateProfile({
        preferences: {
          ...user?.preferences,
          notifications: value,
        },
      });
    } catch (error) {
      console.error('Failed to update notifications:', error);
      setNotifications(!value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'I Understand', style: 'destructive', onPress: () => {} },
              ]
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const currentPersonality = PERSONALITY_OPTIONS.find((p) => p.id === personality);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      {isSaving && (
        <View style={[styles.savingBar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Appearance
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <SettingsItem
              icon="color-palette-outline"
              title="Theme"
              subtitle={`Current: ${getThemeLabel()}`}
              type="value"
              value={isDark ? 'Dark' : 'Light'}
              onPress={handleThemeChange}
              showBorder={false}
            />
          </View>
        </View>

        {/* AI Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            AI Assistant
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <SettingsItem
              icon="chatbubble-outline"
              title="AI Personality"
              subtitle={currentPersonality?.description}
              type="value"
              value={`${currentPersonality?.icon} ${currentPersonality?.label}`}
              onPress={handlePersonalityChange}
              showBorder={false}
            />
          </View>

          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
            Choose how the AI communicates. This affects the tone and style of responses.
          </Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Notifications
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <SettingsItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive updates and reminders"
              type="toggle"
              value={notifications}
              onToggle={handleNotificationToggle}
              showBorder={false}
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Privacy & Security
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <SettingsItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() => navigation.navigate('ChangePassword')}
            />

            <SettingsItem
              icon="cloud-download-outline"
              title="Export Data"
              subtitle="Download your conversations"
              onPress={() => Alert.alert('Export Data', 'Your data export will be prepared and sent to your email.')}
            />

            <SettingsItem
              icon="trash-outline"
              title="Clear Chat History"
              subtitle="Delete all conversations"
              onPress={() => {
                Alert.alert(
                  'Clear History',
                  'Are you sure you want to delete all your conversations?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear All', style: 'destructive', onPress: () => {} },
                  ]
                );
              }}
              showBorder={false}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            About
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <SettingsItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => {}}
            />

            <SettingsItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => {}}
            />

            <SettingsItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={() => {}}
            />

            <SettingsItem
              icon="information-circle-outline"
              title="App Version"
              type="value"
              value="1.0.0"
              showBorder={false}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Account
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <SettingsItem
              icon="log-out-outline"
              title="Logout"
              danger
              onPress={handleLogout}
            />

            <SettingsItem
              icon="person-remove-outline"
              title="Delete Account"
              subtitle="Permanently remove your account"
              danger
              onPress={handleDeleteAccount}
              showBorder={false}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            AI Assistant
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.colors.textMuted }]}>
            Made with love by Your Company
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  savingBar: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  savingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default SettingsScreen;
