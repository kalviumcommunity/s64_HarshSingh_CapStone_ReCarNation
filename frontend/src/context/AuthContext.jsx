import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '@/lib/axios';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('Checking auth status...');
      const response = await axiosInstance.get('/auth/me');
      
      if (response.data && response.data.user) {
        const userData = {
          ...response.data.user,
          photo: response.data.user.photo || "https://via.placeholder.com/32"
        };
        console.log('Setting user data:', userData);
        setUser(userData);
      } else {
        console.log('No user data found');
        setUser(null);
      }
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 404)) {
        setUser(null);
      } else {
        console.error('Auth check failed:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (userData) => {
    try {
      console.log('Login called with:', userData);
      if (userData.profileObj) {
        // Handle Google login data
        const formattedUser = {
          _id: userData.profileObj.googleId,
          firstName: userData.profileObj.givenName,
          lastName: userData.profileObj.familyName,
          email: userData.profileObj.email,
          photo: userData.profileObj.imageUrl || "https://via.placeholder.com/32"
        };
        setUser(formattedUser);
        return formattedUser;
      } else {
        // Handle regular login data
        const formattedUser = {
          ...userData,
          photo: userData.photo || "https://via.placeholder.com/32"
        };
        setUser(formattedUser);
        return formattedUser;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const updateUserRole = async (newRole) => {
    try {

      // Update to use axiosInstance without the API_BASE_URL prefix
      const response = await axiosInstance.put('/auth/role', 
        { role: newRole }
      );

      if (response.data && response.data.user) {
        setUser(prev => ({
          ...prev,
          role: response.data.user.role
        }));
        return response.data.user;
      }
    } catch (error) {
      console.error('Role update failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {

      // Update to use axiosInstance without the API_BASE_URL prefix
      await axiosInstance.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
