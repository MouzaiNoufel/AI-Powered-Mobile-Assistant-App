import React, { memo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { useTheme } from '../../context';
import Avatar from '../common/Avatar';

const MessageBubble = memo(({
  message,
  isUser,
  showAvatar = true,
  onLongPress,
}) => {
  const { theme } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showActions) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showActions]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(message.content, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: message.content,
        title: 'AI Assistant Response',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handlePress = () => {
    if (!isUser) {
      setShowActions(!showActions);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLongPress = async () => {
    await handleCopy();
    onLongPress?.();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const ActionButton = ({ icon, onPress, active, activeColor }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.actionButton,
        { backgroundColor: active ? activeColor + '20' : theme.colors.surface },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={active ? activeColor : theme.colors.textMuted}
      />
    </TouchableOpacity>
  );

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

      <View style={styles.bubbleWrapper}>
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
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
            {copied && !isUser && (
              <View style={styles.copiedBadge}>
                <Ionicons name="checkmark" size={10} color={theme.colors.success} />
                <Text style={[styles.copiedText, { color: theme.colors.success }]}>
                  Copied
                </Text>
              </View>
            )}
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

        {/* Action buttons for AI messages */}
        {!isUser && showActions && (
          <Animated.View
            style={[
              styles.actionsContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ActionButton
              icon={isSpeaking ? 'stop-circle' : 'volume-high'}
              onPress={handleSpeak}
              active={isSpeaking}
              activeColor={theme.colors.primary}
            />
            <ActionButton
              icon="copy-outline"
              onPress={handleCopy}
              active={copied}
              activeColor={theme.colors.success}
            />
            <ActionButton
              icon="share-outline"
              onPress={handleShare}
              active={false}
              activeColor={theme.colors.primary}
            />
          </Animated.View>
        )}
      </View>

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
  bubbleWrapper: {
    maxWidth: '80%',
  },
  bubble: {
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
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  timestamp: {
    fontSize: 11,
  },
  copiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  copiedText: {
    fontSize: 10,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MessageBubble;
