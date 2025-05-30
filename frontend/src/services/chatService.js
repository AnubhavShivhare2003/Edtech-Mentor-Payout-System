import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL, ENDPOINTS } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Initialize socket connection
let socket = null;

const initializeSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  return socket;
};

const chatService = {
  // Initialize socket connection
  initialize: () => {
    return initializeSocket();
  },

  // Get chat history
  getChatHistory: async (userId) => {
    try {
      const response = await api.get(`${ENDPOINTS.CHAT.BASE}/messages`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all conversations
  getConversations: async () => {
    try {
      const response = await api.get(`${ENDPOINTS.CHAT.BASE}/conversations`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get messages for a conversation
  getMessages: async (conversationId) => {
    try {
      const response = await api.get(`${ENDPOINTS.CHAT.BASE}/messages`, {
        params: { conversationId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send message
  sendMessage: async (message) => {
    try {
      const socket = initializeSocket();
      if (!socket) throw new Error('Socket not initialized');
      
      socket.emit('message', message);
      const response = await api.post(`${ENDPOINTS.CHAT.BASE}/messages`, message);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send message from admin to mentor
  sendAdminMessage: async (mentorId, message) => {
    try {
      const socket = initializeSocket();
      if (!socket) throw new Error('Socket not initialized');
      
      socket.emit('admin:message', { mentorId, message });
      const response = await api.post(`${ENDPOINTS.CHAT.BASE}/messages`, {
        text: message,
        recipientId: mentorId,
        type: 'admin'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send message from mentor to admin
  sendMentorMessage: async (message) => {
    try {
      const socket = initializeSocket();
      if (!socket) throw new Error('Socket not initialized');
      
      socket.emit('mentor:message', { message });
      const response = await api.post(`${ENDPOINTS.CHAT.BASE}/messages`, {
        text: message,
        type: 'mentor'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload attachment
  uploadAttachment: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`${ENDPOINTS.CHAT.BASE}/messages/attachment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    try {
      const response = await api.post(`${ENDPOINTS.CHAT.BASE}/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark multiple messages as read
  markAsRead: async (messageIds) => {
    try {
      const response = await api.post(`${ENDPOINTS.CHAT.BASE}/messages/read`, { messageIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`${ENDPOINTS.CHAT.BASE}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user status
  getUserStatus: async (userId) => {
    try {
      const response = await api.get(`${ENDPOINTS.CHAT.BASE}/status`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send typing status
  sendTypingStatus: async (to) => {
    try {
      const socket = initializeSocket();
      if (!socket) throw new Error('Socket not initialized');
      
      socket.emit('typing', { to });
      const response = await api.post(`${ENDPOINTS.CHAT.BASE}/status/typing`, { to });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unread message count for mentor
  getMentorUnreadCount: async () => {
    try {
      const response = await api.get(`${ENDPOINTS.CHAT.BASE}/messages/unread/mentor`);
      return response.data.count;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unread message count for admin
  getAdminUnreadCount: async () => {
    try {
      const response = await api.get(`${ENDPOINTS.CHAT.BASE}/messages/unread/admin`);
      return response.data.count;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Socket event subscriptions
  subscribeToNewMessage: (callback) => {
    const socket = initializeSocket();
    if (!socket) throw new Error('Socket not initialized');
    
    socket.on('new:message', callback);
    return () => {
      socket.off('new:message', callback);
    };
  },

  // Admin-specific message subscription
  subscribeToAdminMessages: (callback) => {
    const socket = initializeSocket();
    if (!socket) throw new Error('Socket not initialized');
    
    socket.on('admin:message', callback);
    return () => {
      socket.off('admin:message', callback);
    };
  },

  // Mentor-specific message subscription
  subscribeToMentorMessages: (callback) => {
    const socket = initializeSocket();
    if (!socket) throw new Error('Socket not initialized');
    
    socket.on('mentor:message', callback);
    return () => {
      socket.off('mentor:message', callback);
    };
  },

  subscribeToTypingStatus: (callback) => {
    const socket = initializeSocket();
    if (!socket) throw new Error('Socket not initialized');
    
    socket.on('typing', callback);
    return () => {
      socket.off('typing', callback);
    };
  },

  subscribeToUserStatus: (callback) => {
    const socket = initializeSocket();
    if (!socket) throw new Error('Socket not initialized');
    
    socket.on('user:status', callback);
    return () => {
      socket.off('user:status', callback);
    };
  },

  // Disconnect socket
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
};

export { chatService }; 