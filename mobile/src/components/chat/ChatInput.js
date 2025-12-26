import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context';

const ChatInput = ({
  onSend,
  onFocus,
  onBlur,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 10000,
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  const canSend = message.trim().length > 0 && !disabled;

  const handleSend = async () => {
    if (!canSend) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const trimmedMessage = message.trim();
    setMessage('');
    
    onSend?.(trimmedMessage);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: isFocused ? theme.colors.primary : theme.colors.inputBorder,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inputPlaceholder}
          multiline
          maxLength={maxLength}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            { color: theme.colors.inputText },
          ]}
        />

        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            style={[
              styles.sendButton,
              {
                backgroundColor: canSend
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color="#FFFFFF"
              style={styles.sendIcon}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    marginLeft: 2,
  },
});

export default ChatInput;
