import axios from 'axios';

const API_URL = 'https://edtech-mentor-payout-system.onrender.com/api';

export const payoutService = {
  // Calculate payout
  calculatePayout: async (data) => {
    const response = await axios.post(`${API_URL}/payouts/calculate`, data);
    return response.data;
  },

  // Generate receipt
  generateReceipt: async (data) => {
    const response = await axios.post(`${API_URL}/payouts/receipts/generate`, data);
    return response.data;
  },

  // Get receipt history
  getReceiptHistory: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/payouts/receipts`, { params: filters });
    return response.data;
  },

  // Get audit logs for a receipt
  getAuditLogs: async (receiptId) => {
    const response = await axios.get(`${API_URL}/payouts/receipts/${receiptId}/audit`);
    return response.data;
  }
}; 