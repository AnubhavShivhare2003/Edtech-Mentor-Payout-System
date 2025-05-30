import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  receipts: [],
  selectedReceipt: null,
  isLoading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    status: null,
    mentor: null
  },
  summary: {
    totalPending: 0,
    totalPaid: 0,
    totalAmount: 0
  }
};

const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    setReceipts: (state, action) => {
      state.receipts = action.payload;
      state.error = null;
    },
    setSelectedReceipt: (state, action) => {
      state.selectedReceipt = action.payload;
    },
    addReceipt: (state, action) => {
      state.receipts.push(action.payload);
    },
    updateReceipt: (state, action) => {
      const index = state.receipts.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.receipts[index] = action.payload;
      }
      if (state.selectedReceipt?.id === action.payload.id) {
        state.selectedReceipt = action.payload;
      }
    },
    deleteReceipt: (state, action) => {
      state.receipts = state.receipts.filter(r => r.id !== action.payload);
      if (state.selectedReceipt?.id === action.payload) {
        state.selectedReceipt = null;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
    }
  }
});

export const {
  setReceipts,
  setSelectedReceipt,
  addReceipt,
  updateReceipt,
  deleteReceipt,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  setSummary
} = payoutSlice.actions;

export default payoutSlice.reducer; 