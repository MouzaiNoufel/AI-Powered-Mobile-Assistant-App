import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context';
import Avatar from '../common/Avatar';

const MessageBubble = memo(({
  message,
  isUser,
  showAvatar = true,
  onLongPress,
}) => {
  const { theme } = useTheme();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      {showAvatar && !isUser && (
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.aiAvatar,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
        </View>
      )}

      <TouchableOpacity
        onLongPress={handleCopy}
        delayLongPress={500}
        activeOpacity={0.9}
        style={[
          styles.bubble,
          isUser
            ? {
                backgroundColor: theme.colors.userBubble,
                borderBottomRightRadius: 4,
              }
            : {
                backgroundColor: theme.colors.aiBubble,
                borderBottomLeftRadius: 4,
              },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isUser
                ? theme.colors.userBubbleText
                : theme.colors.aiBubbleText,
            },
          ]}
          selectable
        >
          {message.content}
        </Text>

        <View style={styles.footer}>
          <Text
            style={[
              styles.timestamp,
              {
                color: isUser
                  ? 'rgba(255,255,255,0.7)'
                  : theme.colors.textMuted,
              },
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>

      {showAvatar && isUser && <View style={styles.avatarPlaceholder} />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 36,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
  },
});

export default MessageBubble;
