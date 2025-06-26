import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '@/lib/axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      const response = await axiosInstance.get('/api/auth/me');

      
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
      console.error('Auth check failed:', error);
      setUser(null);
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

      const formattedUser = {
        ...userData,
        photo: userData.photo || "https://via.placeholder.com/32"
      };
      setUser(formattedUser);
      
      // Trigger an auth check to ensure we have the latest user state
      await checkAuth();
      
      return formattedUser;

    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUserRole = async (newRole) => {
    try {

      const response = await axiosInstance.put('/api/auth/role', { role: newRole });

      if (response.data && response.data.user) {
        setUser(prev => ({
          ...prev,
          role: response.data.user.role
        }));
        
        // Refresh user data to ensure consistency
        await checkAuth();
        return response.data.user;
      }
    } catch (error) {
      console.error('Role update failed:', error);
      throw error;
    }
  };

  const updateUser = (userData) => {
    try {
      console.log('Updating user data:', userData);
      const formattedUser = {
        ...userData,
        photo: userData.photo || userData.profilePicture || "https://via.placeholder.com/32"
      };
      setUser(prev => ({
        ...prev,
        ...formattedUser
      }));
      return formattedUser;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
