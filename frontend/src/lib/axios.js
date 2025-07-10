import axios from 'axios';

const isDevelopment = import.meta.env.MODE !== 'production';
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with configuration
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for development
  timeout: isDevelopment ? 10000 : 5000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // JWT token will be sent automatically via cookies
    // No need for manual token handling since we're using withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`[${response.config.method.toUpperCase()}] ${response.config.url}:`, response.data);
    return response;
  },
  async (error) => {
    // Log errors
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle 401 errors - redirect to login if needed
    if (error.response?.status === 401) {
      // You can add logout logic here if needed
      console.log('Authentication required');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
