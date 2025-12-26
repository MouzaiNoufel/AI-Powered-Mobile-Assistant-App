import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context';

const LoadingIndicator = ({
  size = 'large',
  color,
  text,
  fullScreen = false,
  overlay = false,
  style,
}) => {
  const { theme } = useTheme();
  const indicatorColor = color || theme.colors.primary;

  if (fullScreen || overlay) {
    return (
      <View
        style={[
          styles.fullScreen,
          overlay && { backgroundColor: theme.colors.overlay },
          { backgroundColor: fullScreen ? theme.colors.background : undefined },
          style,
        ]}
      >
        <View
          style={[
            styles.loadingBox,
            { backgroundColor: theme.colors.surface },
            theme.shadows.lg,
          ]}
        >
          <ActivityIndicator size={size} color={indicatorColor} />
          {text && (
            <Text style={[styles.text, { color: theme.colors.text }]}>
              {text}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={indicatorColor} />
      {text && (
        <Text style={[styles.text, { color: theme.colors.text }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoadingIndicator;
