import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  leftIcon,
  rightIcon,
  onRightIconPress,
  editable = true,
  style,
  inputStyle,
  containerStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.inputBorder;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: getBorderColor(),
            borderRadius: theme.borderRadius.lg,
          },
          multiline && { minHeight: numberOfLines * 40 },
          !editable && { opacity: 0.6 },
          style,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            {typeof leftIcon === 'string' ? (
              <Ionicons 
                name={leftIcon} 
                size={20} 
                color={theme.colors.textMuted} 
              />
            ) : (
              leftIcon
            )}
          </View>
        )}

        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inputPlaceholder}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: theme.colors.inputText,
              fontSize: theme.fontSize.md,
            },
            multiline && { textAlignVertical: 'top', paddingTop: 12 },
            inputStyle,
          ]}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {typeof rightIcon === 'string' ? (
              <Ionicons 
                name={rightIcon} 
                size={20} 
                color={theme.colors.textMuted} 
              />
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
      </View>

      {(error || helper) && (
        <Text
          style={[
            styles.helperText,
            { color: error ? theme.colors.error : theme.colors.textMuted },
          ]}
        >
          {error || helper}
        </Text>
      )}

      {maxLength && (
        <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  charCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default Input;
