import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useChat } from '../../context';
import {
  ConversationItem,
  EmptyState,
  LoadingIndicator,
} from '../../components';

const HistoryScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    conversations,
    currentConversation,
    isLoading,
    pagination,
    fetchConversations,
    fetchConversation,
    deleteConversation,
    clearAllConversations,
    startNewConversation,
  } = useChat();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations({ page: 1 });
    setRefreshing(false);
  }, [fetchConversations]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || pagination.page >= pagination.pages) return;
    fetchConversations({ page: pagination.page + 1 });
  }, [isLoading, pagination, fetchConversations]);

  const handleConversationPress = useCallback(async (conversation) => {
    await fetchConversation(conversation._id);
    navigation.navigate('Chat');
  }, [fetchConversation, navigation]);

  const handleConversationLongPress = useCallback((conversation) => {
    Alert.alert(
      'Conversation Options',
      conversation.title || 'New Conversation',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteConversation(conversation._id);
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  }, [deleteConversation]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Conversations',
      'Are you sure you want to delete all conversations? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const result = await clearAllConversations();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  }, [clearAllConversations]);

  const handleNewChat = useCallback(() => {
    startNewConversation();
    navigation.navigate('Chat');
  }, [startNewConversation, navigation]);

  const renderConversation = useCallback(({ item }) => (
    <ConversationItem
      conversation={item}
      onPress={handleConversationPress}
      onLongPress={handleConversationLongPress}
      isActive={currentConversation?.id === item._id || currentConversation?._id === item._id}
    />
  ), [currentConversation, handleConversationPress, handleConversationLongPress]);

  const renderEmpty = () => (
    <EmptyState
      icon="chatbubbles-outline"
      title="No Conversations Yet"
      message="Start a new conversation to see your chat history here"
      action={handleNewChat}
      actionLabel="Start New Chat"
    />
  );

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Recent Conversations
      </Text>
      {conversations.length > 0 && (
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={[styles.clearAll, { color: theme.colors.error }]}>
            Clear All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const ListFooter = () => {
    if (isLoading && conversations.length > 0) {
      return <LoadingIndicator size="small" />;
    }
    return <View style={styles.listFooter} />;
  };

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          History
        </Text>

        <TouchableOpacity
          onPress={handleNewChat}
          style={[
            styles.newChatButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.newChatText}>New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      {isLoading && conversations.length === 0 ? (
        <LoadingIndicator text="Loading conversations..." />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.emptyList,
          ]}
          ListHeaderComponent={conversations.length > 0 ? ListHeader : null}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={ListFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  newChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  listFooter: {
    height: 20,
  },
});

export default HistoryScreen;
