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
  (config) => {
    // You could add authorization headers here if needed
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
    
    const originalRequest = error.config;

    // If the error is a network error or the server is not responding
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('Network error detected, retrying request...');
      
      // Only retry once
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          return await axiosInstance(originalRequest);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          return Promise.reject(retryError);
        }
      }
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('Unauthorized request detected');
      // You could dispatch a logout action or redirect here
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
