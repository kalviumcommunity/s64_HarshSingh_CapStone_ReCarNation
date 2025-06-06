// apiService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Adjust this to your backend URL

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Important for cookies
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    if (!data.user) {
      throw new Error('No user data received');
    }

    // Log the received user data
    console.log('Login response:', data);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // To include cookies in the request
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }
    
    return data;
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
};

export const logout = async () => {
  // Implement logout functionality if needed
  // This might involve clearing cookies or tokens on the server
};