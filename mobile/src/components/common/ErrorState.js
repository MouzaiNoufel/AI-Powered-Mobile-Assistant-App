import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context';

const ErrorState = ({
  error,
  message,
  onRetry,
  retryLabel = 'Try Again',
  icon = 'alert-circle-outline',
  style,
}) => {
  const { theme } = useTheme();

  const displayMessage = message || error?.message || 'Something went wrong';

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.errorLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={48}
          color={theme.colors.error}
        />
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>
        Oops!
      </Text>

      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {displayMessage}
      </Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorState;
