import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useChat, useAuth } from '../../context';
import {
  MessageBubble,
  ChatInput,
  TypingIndicator,
  EmptyState,
} from '../../components';

const ChatScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    messages,
    currentConversation,
    isSending,
    error,
    sendMessage,
    startNewConversation,
    clearError,
  } = useChat();

  const flatListRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = useCallback(async (message) => {
    await sendMessage(message);
  }, [sendMessage]);

  const handleNewChat = useCallback(() => {
    startNewConversation();
  }, [startNewConversation]);

  const renderMessage = useCallback(({ item, index }) => {
    const isUser = item.role === 'user';
    const showAvatar = index === 0 || 
      messages[index - 1]?.role !== item.role;

    return (
      <MessageBubble
        message={item}
        isUser={isUser}
        showAvatar={showAvatar}
      />
    );
  }, [messages]);

  const renderEmptyChat = () => (
    <EmptyState
      icon="chatbubble-ellipses-outline"
      title="Start a Conversation"
      message="Send a message to begin chatting with your AI assistant"
    />
  );

  const ListHeaderComponent = () => {
    if (messages.length > 0) {
      return (
        <View style={styles.chatHeader}>
          <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
            {currentConversation?.title || 'New Conversation'}
          </Text>
        </View>
      );
    }
    return null;
  };

  const ListFooterComponent = () => (
    <View>
      {isSending && <TypingIndicator visible />}
      <View style={styles.listFooterSpacer} />
    </View>
  );

  // Get usage info
  const usageInfo = user?.usage?.canMakeRequest;
  const canSend = usageInfo?.canMake !== false;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { 
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.openDrawer?.() || navigation.navigate('History')}
          style={styles.headerButton}
        >
          <Ionicons
            name="menu"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <View style={styles.titleRow}>
            <View
              style={[
                styles.aiIndicator,
                { backgroundColor: theme.colors.success },
              ]}
            />
            <Text style={[styles.headerTitleText, { color: theme.colors.text }]}>
              AI Assistant
            </Text>
          </View>
          {usageInfo && (
            <Text style={[styles.usageText, { color: theme.colors.textMuted }]}>
              {usageInfo.dailyRemaining} requests left today
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleNewChat}
          style={styles.headerButton}
        >
          <Ionicons
            name="create-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Chat Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item._id || `msg_${index}`}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={renderEmptyChat}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />

        {/* Usage Limit Warning */}
        {!canSend && (
          <View
            style={[
              styles.limitWarning,
              { backgroundColor: theme.colors.warningLight },
            ]}
          >
            <Ionicons
              name="warning"
              size={20}
              color={theme.colors.warning}
            />
            <Text style={[styles.limitText, { color: theme.colors.text }]}>
              You've reached your daily limit. Upgrade for more!
            </Text>
          </View>
        )}

        {/* Error Banner */}
        {error && (
          <TouchableOpacity
            onPress={clearError}
            style={[
              styles.errorBanner,
              { backgroundColor: theme.colors.errorLight },
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.error}
            />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
            <Ionicons
              name="close"
              size={20}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        )}

        {/* Chat Input */}
        <ChatInput
          onSend={handleSend}
          disabled={isSending || !canSend}
          placeholder={
            !canSend
              ? 'Daily limit reached'
              : isSending
              ? 'Waiting for response...'
              : 'Ask me anything...'
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '600',
  },
  usageText: {
    fontSize: 12,
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingVertical: 16,
  },
  emptyList: {
    flex: 1,
  },
  chatHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  welcomeText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listFooterSpacer: {
    height: 8,
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    gap: 8,
  },
  limitText: {
    flex: 1,
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
});

export default ChatScreen;
