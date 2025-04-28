import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    console.log('[authSlice.js/loginUser] Attempting login with credentials:', {
      email: credentials.email,
      hasPassword: !!credentials.password,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { user, token } = response.data;
      
      console.log('[authSlice.js/loginUser] Login successful:', {
        userId: user._id,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });

      localStorage.setItem('token', token);
      return { user, token };
    } catch (error) {
      console.error('[authSlice.js/loginUser] Login failed:', {
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    console.log('[authSlice.js/registerUser] Attempting registration:', {
      email: userData.email,
      hasName: !!userData.name,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('[authSlice.js/registerUser] Registration successful:', {
        userId: response.data._id,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('[authSlice.js/registerUser] Registration failed:', {
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Async thunk for checking authentication status
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    console.log('[authSlice.js/checkAuth] Checking authentication status');
    
    try {
      const token = localStorage.getItem('token');
      console.log('[authSlice.js/checkAuth] Token status:', {
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });

      if (!token) {
        console.log('[authSlice.js/checkAuth] No token found');
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[authSlice.js/checkAuth] Auth check successful:', {
        userId: response.data._id,
        timestamp: new Date().toISOString()
      });

      return { user: response.data, token };
    } catch (error) {
      console.error('[authSlice.js/checkAuth] Auth check failed:', {
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Authentication failed');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      console.log('[authSlice.js/logout] Logging out user:', {
        userId: state.user?._id,
        timestamp: new Date().toISOString()
      });
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      console.log('[authSlice.js/clearError] Clearing error state');
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        console.log('[authSlice.js/loginUser] Pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('[authSlice.js/loginUser] Fulfilled:', {
          userId: action.payload.user._id,
          timestamp: new Date().toISOString()
        });
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.error('[authSlice.js/loginUser] Rejected:', {
          error: action.payload,
          timestamp: new Date().toISOString()
        });
        state.loading = false;
        state.error = action.payload;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        console.log('[authSlice.js/registerUser] Pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        console.log('[authSlice.js/registerUser] Fulfilled');
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.error('[authSlice.js/registerUser] Rejected:', {
          error: action.payload,
          timestamp: new Date().toISOString()
        });
        state.loading = false;
        state.error = action.payload;
      })
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        console.log('[authSlice.js/checkAuth] Pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log('[authSlice.js/checkAuth] Fulfilled:', {
          userId: action.payload.user._id,
          timestamp: new Date().toISOString()
        });
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        console.error('[authSlice.js/checkAuth] Rejected:', {
          error: action.payload,
          timestamp: new Date().toISOString()
        });
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 