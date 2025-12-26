import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context';

const ConversationItem = ({
  conversation,
  onPress,
  onLongPress,
  isActive = false,
}) => {
  const { theme } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(conversation)}
      onLongPress={() => onLongPress?.(conversation)}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: isActive
            ? theme.colors.primaryLight + '20'
            : theme.colors.surface,
          borderColor: isActive
            ? theme.colors.primary
            : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Ionicons
          name="chatbubble-outline"
          size={20}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              { color: theme.colors.text },
              isActive && { color: theme.colors.primary },
            ]}
          >
            {conversation.title || 'New Conversation'}
          </Text>

          {conversation.isStarred && (
            <Ionicons
              name="star"
              size={14}
              color={theme.colors.warning}
              style={styles.starIcon}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text
            numberOfLines={1}
            style={[styles.preview, { color: theme.colors.textSecondary }]}
          >
            {conversation.lastMessagePreview || 'No messages yet'}
          </Text>
          
          <Text style={[styles.date, { color: theme.colors.textMuted }]}>
            {formatDate(conversation.lastMessageAt || conversation.createdAt)}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.colors.textMuted}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  starIcon: {
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  preview: {
    fontSize: 13,
    flex: 1,
  },
  date: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default ConversationItem;
