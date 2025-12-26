import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context';

const QUICK_PROMPTS = [
  {
    id: 1,
    icon: 'bulb-outline',
    title: 'Explain a concept',
    prompt: 'Explain this concept in simple terms: ',
    color: '#FFB800',
  },
  {
    id: 2,
    icon: 'code-slash-outline',
    title: 'Write code',
    prompt: 'Write code to ',
    color: '#00D4AA',
  },
  {
    id: 3,
    icon: 'create-outline',
    title: 'Help me write',
    prompt: 'Help me write ',
    color: '#FF6B6B',
  },
  {
    id: 4,
    icon: 'language-outline',
    title: 'Translate text',
    prompt: 'Translate the following to ',
    color: '#7C4DFF',
  },
  {
    id: 5,
    icon: 'search-outline',
    title: 'Research topic',
    prompt: 'Research and summarize: ',
    color: '#00B4D8',
  },
  {
    id: 6,
    icon: 'sparkles-outline',
    title: 'Creative ideas',
    prompt: 'Give me creative ideas for ',
    color: '#FF9500',
  },
];

const PromptChip = memo(({ prompt, onPress, theme }) => {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(prompt);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.chip,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: prompt.color + '20' }]}>
        <Ionicons name={prompt.icon} size={16} color={prompt.color} />
      </View>
      <Text style={[styles.chipText, { color: theme.colors.text }]}>
        {prompt.title}
      </Text>
    </TouchableOpacity>
  );
});

const QuickPrompts = ({ onSelectPrompt, visible = true }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
        Quick prompts
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_PROMPTS.map((prompt) => (
          <PromptChip
            key={prompt.id}
            prompt={prompt}
            onPress={(p) => onSelectPrompt(p.prompt)}
            theme={theme}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default memo(QuickPrompts);
