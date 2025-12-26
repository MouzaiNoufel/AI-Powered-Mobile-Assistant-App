import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context';

const SettingsItem = ({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onPress,
  type = 'arrow', // 'arrow', 'switch', 'value', 'none'
  switchValue,
  onSwitchChange,
  danger = false,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();

  const textColor = danger ? theme.colors.error : theme.colors.text;
  const iconBgColor = iconColor 
    ? `${iconColor}20` 
    : danger 
      ? theme.colors.errorLight 
      : theme.colors.surfaceVariant;
  const finalIconColor = iconColor || (danger ? theme.colors.error : theme.colors.primary);

  const renderRight = () => {
    switch (type) {
      case 'switch':
        return (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.colors.primaryLight,
            }}
            thumbColor={switchValue ? theme.colors.primary : theme.colors.textMuted}
            disabled={disabled}
          />
        );
      case 'value':
        return (
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {value}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textMuted}
            />
          </View>
        );
      case 'arrow':
        return (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        );
      default:
        return null;
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconBgColor },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={finalIconColor}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {renderRight()}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
  },
});

export default SettingsItem;
