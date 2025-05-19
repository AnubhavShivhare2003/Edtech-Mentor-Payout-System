// API Configuration
export const API_URL = 'https://edtech-mentor-payout-system.onrender.com';

// Socket Configuration
export const SOCKET_URL = 'https://edtech-mentor-payout-system.onrender.com';

// Other Configuration Constants
export const AUTH_TOKEN_KEY = 'token';
export const USER_ROLE_KEY = 'userRole';

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  MENTORS: {
    BASE: '/api/users/mentors',
    STATS: '/api/users/mentors/stats',
    SESSIONS: '/api/users/mentors/sessions',
    PAYOUTS: '/api/users/mentors/payouts'
  },
  CHAT: {
    BASE: '/api/chat',
    HISTORY: '/api/chat/history',
    UNREAD: '/api/chat/unread',
    MARK_READ: '/api/chat/read'
  },
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
    MENTORS: '/api/users/mentors'
  }
}; 