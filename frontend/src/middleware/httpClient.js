import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    // You can add common headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized responses
      if (error.response.status === 401) {
        store.dispatch(logout());
      }
      
      // Extract error message from response
      const message = error.response.data?.message || 'An error occurred';
      error.message = message;
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;