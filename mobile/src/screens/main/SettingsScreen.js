import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useAuth } from '../../context';
import { SettingsItem, Button, LoadingIndicator } from '../../components';
import api from '../../services/api';

const PERSONALITY_OPTIONS = [
  { id: 'professional', label: 'Professional', icon: '[P]', description: 'Formal and business-like' },
  { id: 'friendly', label: 'Friendly', icon: '[F]', description: 'Casual and warm' },
  { id: 'concise', label: 'Concise', icon: '[C]', description: 'Brief and to the point' },
  { id: 'detailed', label: 'Detailed', icon: '[D]', description: 'Thorough and comprehensive' },
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
            setShowDeleteModal(true);
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Please enter your password to confirm deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await api.auth.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      await logout();
      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete account. Please check your password.');
    } finally {
      setIsDeleting(false);
      setDeletePassword('');
    }
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

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={48} color={theme.colors.error} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Delete Account
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                Enter your password to confirm deletion. This action is irreversible.
              </Text>
            </View>

            <TextInput
              style={[
                styles.passwordInput,
                {
                  backgroundColor: theme.colors.inputBackground,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              editable={!isDeleting}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                disabled={isDeleting}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton, { backgroundColor: theme.colors.error }]}
                onPress={confirmDeleteAccount}
                disabled={isDeleting || !deletePassword}
              >
                {isDeleting ? (
                  <LoadingIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                    Delete Forever
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {},
  deleteButton: {},
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SettingsScreen;
