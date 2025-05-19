import axios from 'axios';
import { API_URL, ENDPOINTS } from '../config';

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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    return Promise.reject(error.response?.data?.message || error.message);
  }
);

const mentorService = {
  // Get all mentors
  getAllMentors: async () => {
    try {
      const response = await api.get(ENDPOINTS.USERS.MENTORS);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      throw error;
    }
  },

  // Get mentor by ID
  getMentorById: async (mentorId) => {
    try {
      const response = await api.get(`${ENDPOINTS.USERS.MENTORS}/${mentorId}`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor:', error);
      throw error;
    }
  },

  // Get mentor stats
  getMentorStats: async (mentorId) => {
    try {
      const response = await api.get(`${ENDPOINTS.USERS.MENTORS}/${mentorId}/stats`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor stats:', error);
      throw error;
    }
  },

  // Get mentor sessions
  getMentorSessions: async (mentorId, filters = {}) => {
    try {
      const response = await api.get(`${ENDPOINTS.USERS.MENTORS}/${mentorId}/sessions`, { params: filters });
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor sessions:', error);
      throw error;
    }
  },

  // Get mentor payouts
  getMentorPayouts: async (mentorId, filters = {}) => {
    try {
      const response = await api.get(`${ENDPOINTS.USERS.MENTORS}/${mentorId}/payouts`, { params: filters });
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor payouts:', error);
      throw error;
    }
  },

  // Update mentor profile
  updateMentorProfile: async (mentorId, data) => {
    try {
      const response = await api.put(`${ENDPOINTS.USERS.MENTORS}/${mentorId}`, data);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update mentor profile:', error);
      throw error;
    }
  },

  // Get mentor credentials
  getMentorCredentials: async (mentorId) => {
    try {
      const response = await api.get(`${ENDPOINTS.USERS.MENTORS}/${mentorId}/credentials`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor credentials:', error);
      throw error;
    }
  },

  // Get mentor students
  getMentorStudents: async (mentorId) => {
    try {
      const response = await api.get(`${ENDPOINTS.USERS.MENTORS}/${mentorId}/students`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch mentor students:', error);
      throw error;
    }
  }
};

export { mentorService }; 