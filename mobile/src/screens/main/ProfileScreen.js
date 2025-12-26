import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useAuth } from '../../context';
import { Avatar, SettingsItem, Button } from '../../components';

const ProfileScreen = ({ navigation }) => {
  const { theme, themeMode, setTheme, isDark } = useTheme();
  const { user, logout, isLoading } = useAuth();

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

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      default: return 'System';
    }
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Theme',
      'Select your preferred theme',
      [
        { text: 'Light', onPress: () => setTheme('light') },
        { text: 'Dark', onPress: () => setTheme('dark') },
        { text: 'System', onPress: () => setTheme('system') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const usageInfo = user?.usage;
  const limits = usageInfo?.limits || { daily: 10, monthly: 100 };

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
          Profile
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.colors.surface },
            theme.shadows.md,
          ]}
        >
          <Avatar
            name={user?.fullName}
            source={user?.avatar}
            size={80}
          />
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.fullName || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {user?.email}
          </Text>

          {/* Subscription Badge */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  user?.role === 'premium' || user?.role === 'admin'
                    ? theme.colors.primaryLight + '30'
                    : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    user?.role === 'premium' || user?.role === 'admin'
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {user?.role === 'admin'
                ? 'Admin'
                : user?.role === 'premium'
                ? 'Premium'
                : 'Free Plan'}
            </Text>
          </View>
        </View>

        {/* Usage Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Usage Statistics
          </Text>
          
          <View
            style={[
              styles.statsCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {usageInfo?.dailyAiRequests || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Today
              </Text>
              <Text style={[styles.statLimit, { color: theme.colors.textMuted }]}>
                / {limits.daily}
              </Text>
            </View>

            <View
              style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
            />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {usageInfo?.monthlyAiRequests || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                This Month
              </Text>
              <Text style={[styles.statLimit, { color: theme.colors.textMuted }]}>
                / {limits.monthly}
              </Text>
            </View>

            <View
              style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
            />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {usageInfo?.totalAiRequests || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                All Time
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Settings
          </Text>

          <SettingsItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => navigation.navigate('EditProfile')}
          />

          <SettingsItem
            icon="color-palette-outline"
            title="Appearance"
            subtitle="Change app theme"
            type="value"
            value={getThemeLabel()}
            onPress={handleThemeChange}
          />

          <SettingsItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => {}}
          />

          <SettingsItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        {/* More */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            More
          </Text>

          <SettingsItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help using the app"
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
            title="About"
            subtitle="Version 1.0.0"
            type="none"
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <SettingsItem
            icon="log-out-outline"
            title="Logout"
            danger
            onPress={handleLogout}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            AI Assistant v1.0.0
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
  content: {
    padding: 16,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  statsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statLimit: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
});

export default ProfileScreen;
