import axios from 'axios';

const api = axios.create({
  baseURL: 'https://edtech-mentor-payout-system.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`, config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log detailed error information
    console.error('API Error:', {
      url: originalRequest.url,
      method: originalRequest.method,
      data: originalRequest.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      error: error.message
    });

    // Handle server not running
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error: Server might not be running');
      return Promise.reject({
        message: 'Unable to connect to server. Please try again later.',
      });
    }

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh-token', { refreshToken });
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // Handle specific error status codes
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject({
        message: 'An unexpected error occurred. Please try again later.',
      });
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const mentorAPI = {
  getSessions: () => api.get('/sessions'),
  getPayouts: () => api.get('/payouts'),
};

export default api; 