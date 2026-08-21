import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message, User } from '@/types';

interface ChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Record<string, { messages: Message[]; hasMore: boolean; lastMessageId?: string }>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  searchResults: User[];
  isSearching: boolean;
  showSearch: boolean;
  showNewConversation: boolean;
  newConvType: 'direct' | 'group';
  selectedUserId: string;
  groupName: string;
  isCreating: boolean;
  isConnected: boolean;
}

const initialState: ChatState = {
  conversations: [],
  selectedConversation: null,
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,
  searchResults: [],
  isSearching: false,
  showSearch: false,
  showNewConversation: false,
  newConvType: 'direct',
  selectedUserId: '',
  groupName: '',
  isCreating: false,
  isConnected: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    setSelectedConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.selectedConversation = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[]; hasMore: boolean; lastMessageId?: string }>) => {
      const { conversationId, messages, hasMore, lastMessageId } = action.payload;
      state.messages[conversationId] = { messages, hasMore, lastMessageId };
    },
    appendMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[]; lastMessageId?: string }>) => {
      const { conversationId, messages, lastMessageId } = action.payload;
      const existing = state.messages[conversationId] || { messages: [], hasMore: false };
      state.messages[conversationId] = {
        messages: [...existing.messages, ...messages],
        hasMore: existing.hasMore,
        lastMessageId: lastMessageId || existing.lastMessageId,
      };
    },
    setLoadingConversations: (state, action: PayloadAction<boolean>) => {
      state.isLoadingConversations = action.payload;
    },
    setLoadingMessages: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMessages = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSearchResults: (state, action: PayloadAction<User[]>) => {
      state.searchResults = action.payload;
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    setShowSearch: (state, action: PayloadAction<boolean>) => {
      state.showSearch = action.payload;
    },
    setShowNewConversation: (state, action: PayloadAction<boolean>) => {
      state.showNewConversation = action.payload;
    },
    setNewConvType: (state, action: PayloadAction<'direct' | 'group'>) => {
      state.newConvType = action.payload;
    },
    setSelectedUserId: (state, action: PayloadAction<string>) => {
      state.selectedUserId = action.payload;
    },
    setGroupName: (state, action: PayloadAction<string>) => {
      state.groupName = action.payload;
    },
    setIsCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    resetChat: (state) => {
      state.conversations = [];
      state.selectedConversation = null;
      state.messages = {};
      state.error = null;
      state.searchResults = [];
      state.showSearch = false;
      state.showNewConversation = false;
      state.selectedUserId = '';
      state.groupName = '';
      state.isCreating = false;
    },
  },
});

export const {
  setConversations,
  setSelectedConversation,
  setMessages,
  appendMessages,
  setLoadingConversations,
  setLoadingMessages,
  setError,
  clearError,
  setSearchResults,
  setSearching,
  setShowSearch,
  setShowNewConversation,
  setNewConvType,
  setSelectedUserId,
  setGroupName,
  setIsCreating,
  setConnected,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
