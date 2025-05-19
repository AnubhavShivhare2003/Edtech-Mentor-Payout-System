import axios from 'axios';

const API_URL = 'https://edtech-mentor-payout-system.onrender.com/api';

export const sessionService = {
  // Get all sessions
  getSessions: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/sessions`, { params: filters });
    return response.data;
  },

  // Get session by ID
  getSessionById: async (id) => {
    const response = await axios.get(`${API_URL}/sessions/${id}`);
    return response.data;
  },

  // Create new session
  createSession: async (sessionData) => {
    const formData = new FormData();
    Object.keys(sessionData).forEach(key => {
      if (key === 'attachments') {
        sessionData[key].forEach(file => {
          formData.append('attachments', file);
        });
      } else {
        formData.append(key, sessionData[key]);
      }
    });

    const response = await axios.post(`${API_URL}/sessions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update session
  updateSession: async (id, sessionData) => {
    const formData = new FormData();
    Object.keys(sessionData).forEach(key => {
      if (key === 'attachments') {
        sessionData[key].forEach(file => {
          formData.append('attachments', file);
        });
      } else {
        formData.append(key, sessionData[key]);
      }
    });

    const response = await axios.put(`${API_URL}/sessions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete session
  deleteSession: async (id) => {
    const response = await axios.delete(`${API_URL}/sessions/${id}`);
    return response.data;
  },

  // Approve session (admin only)
  approveSession: async (id) => {
    const response = await axios.put(`${API_URL}/sessions/${id}/approve`);
    return response.data;
  },

  // Reject session (admin only)
  rejectSession: async (id, rejectionReason) => {
    const response = await axios.put(`${API_URL}/sessions/${id}/reject`, { rejectionReason });
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (sessionId, attachmentId) => {
    const response = await axios.delete(`${API_URL}/sessions/${sessionId}/attachment/${attachmentId}`);
    return response.data;
  },

  // Get session stats (admin only)
  getSessionStats: async () => {
    const response = await axios.get(`${API_URL}/sessions/stats`);
    return response.data;
  }
}; 