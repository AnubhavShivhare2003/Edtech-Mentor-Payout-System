import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  typingUsers: {}
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.error = null;
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Update conversation's last message and unread count
      const conversation = state.conversations.find(c => 
        c.participant.id === action.payload.from || c.participant.id === action.payload.to
      );
      if (conversation) {
        conversation.lastMessage = action.payload;
        if (!action.payload.read) {
          conversation.unreadCount++;
        }
      }
    },
    markMessageAsRead: (state, action) => {
      const message = state.messages.find(m => m.id === action.payload);
      if (message) {
        message.read = true;
      }
      // Update conversation's unread count
      const conversation = state.conversations.find(c => c.participant.id === message?.from);
      if (conversation) {
        conversation.unreadCount = Math.max(0, conversation.unreadCount - 1);
      }
    },
    setTypingStatus: (state, action) => {
      const { userId, isTyping } = action.payload;
      state.typingUsers[userId] = isTyping;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.selectedConversation = null;
    }
  }
});

export const {
  setConversations,
  setSelectedConversation,
  setMessages,
  addMessage,
  markMessageAsRead,
  setTypingStatus,
  setLoading,
  setError,
  clearChat
} = chatSlice.actions;

export default chatSlice.reducer; 