import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [usage, setUsage] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const abortControllerRef = useRef(null);

  // Fetch conversations
  const fetchConversations = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.ai.getConversations({
        page: params.page || 1,
        limit: params.limit || 20,
        ...params,
      });

      const { conversations: convs, pagination: pag } = response.data.data;

      if (params.page === 1 || !params.page) {
        setConversations(convs);
      } else {
        setConversations(prev => [...prev, ...convs]);
      }

      setPagination(pag);
      return convs;
    } catch (err) {
      setError(err.message || 'Failed to fetch conversations');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single conversation with messages
  const fetchConversation = useCallback(async (conversationId) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.ai.getConversation(conversationId);
      const { conversation } = response.data.data;

      setCurrentConversation(conversation);
      setMessages(conversation.messages || []);

      return conversation;
    } catch (err) {
      setError(err.message || 'Failed to fetch conversation');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send message to AI
  const sendMessage = useCallback(async (message, options = {}) => {
    try {
      setIsSending(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        _id: `temp_${Date.now()}`,
      };

      setMessages(prev => [...prev, userMessage]);

      // Send to API
      const response = await api.ai.sendMessage(
        message,
        currentConversation?.id || currentConversation?._id || options.conversationId,
        options.personality
      );

      const { message: aiMessage, conversation, usage: usageData } = response.data.data;

      // Update conversation
      if (!currentConversation && conversation) {
        setCurrentConversation(conversation);
      } else if (currentConversation) {
        setCurrentConversation(prev => ({
          ...prev,
          ...conversation,
        }));
      }

      // Add AI response
      const aiResponseMessage = {
        role: 'assistant',
        content: aiMessage.content,
        timestamp: aiMessage.timestamp,
        _id: `ai_${Date.now()}`,
      };

      setMessages(prev => [...prev, aiResponseMessage]);

      // Update usage
      setUsage(usageData);

      // Refresh user to get updated usage
      await refreshUser();

      return {
        success: true,
        message: aiResponseMessage,
        conversation,
        usage: usageData,
      };
    } catch (err) {
      setError(err.message || 'Failed to send message');
      
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(m => !m._id.startsWith('temp_')));
      
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setIsSending(false);
    }
  }, [currentConversation, refreshUser]);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await api.ai.deleteConversation(conversationId);
      
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        startNewConversation();
      }
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [currentConversation, startNewConversation]);

  // Update conversation
  const updateConversation = useCallback(async (conversationId, data) => {
    try {
      const response = await api.ai.updateConversation(conversationId, data);
      const { conversation } = response.data.data;
      
      setConversations(prev => 
        prev.map(c => c._id === conversationId ? { ...c, ...conversation } : c)
      );
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => ({ ...prev, ...conversation }));
      }
      
      return { success: true, conversation };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [currentConversation]);

  // Clear all conversations
  const clearAllConversations = useCallback(async () => {
    try {
      await api.ai.clearAllConversations();
      setConversations([]);
      startNewConversation();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [startNewConversation]);

  // Fetch AI status
  const fetchAiStatus = useCallback(async () => {
    try {
      const response = await api.ai.getStatus();
      setAiStatus(response.data.data.status);
      return response.data.data.status;
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
      return null;
    }
  }, []);

  // Fetch usage stats
  const fetchUsage = useCallback(async () => {
    try {
      const response = await api.ai.getUsage();
      setUsage(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Failed to fetch usage:', err);
      return null;
    }
  }, []);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSending(false);
  }, []);

  const value = {
    // State
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    error,
    usage,
    aiStatus,
    pagination,
    
    // Actions
    fetchConversations,
    fetchConversation,
    sendMessage,
    startNewConversation,
    deleteConversation,
    updateConversation,
    clearAllConversations,
    fetchAiStatus,
    fetchUsage,
    cancelRequest,
    clearError: () => setError(null),
    setCurrentConversation,
    setMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
