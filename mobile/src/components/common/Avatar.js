import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context';

const Avatar = ({
  source,
  name,
  size = 40,
  style,
}) => {
  const { theme } = useTheme();

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (nameStr) => {
    const colors = [
      '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
      '#F59E0B', '#10B981', '#3B82F6', '#06B6D4',
    ];
    
    if (!nameStr) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const backgroundColor = getBackgroundColor(name);

  if (source) {
    return (
      <Animated.Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Animated.Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,
          },
        ]}
      >
        {initials}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Avatar;
