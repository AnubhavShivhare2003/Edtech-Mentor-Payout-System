import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessions: [],
  selectedSession: null,
  isLoading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    status: null,
    sessionType: null
  }
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSessions: (state, action) => {
      state.sessions = action.payload;
      state.error = null;
    },
    setSelectedSession: (state, action) => {
      state.selectedSession = action.payload;
    },
    addSession: (state, action) => {
      state.sessions.push(action.payload);
    },
    updateSession: (state, action) => {
      const index = state.sessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
      if (state.selectedSession?.id === action.payload.id) {
        state.selectedSession = action.payload;
      }
    },
    deleteSession: (state, action) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      if (state.selectedSession?.id === action.payload) {
        state.selectedSession = null;
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
    }
  }
});

export const {
  setSessions,
  setSelectedSession,
  addSession,
  updateSession,
  deleteSession,
  setLoading,
  setError,
  setFilters,
  clearFilters
} = sessionSlice.actions;

export default sessionSlice.reducer; 