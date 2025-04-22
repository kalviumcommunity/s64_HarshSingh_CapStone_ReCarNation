import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/me', {
          withCredentials: true
        });
        
        if (response.data && response.data.user) {
          // Ensure the user object has all required fields
          const userData = {
            ...response.data.user,
            photo: response.data.user.photo || "https://via.placeholder.com/32"
          };
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        // If it's a 401 or 404, the user is not authenticated
        if (error.response && (error.response.status === 401 || error.response.status === 404)) {
          setUser(null);
        } else {
          console.error('Auth check failed:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    try {
      // If userData is from Google auth, it will have a different structure
      if (userData && userData.profileObj) {
        // Handle Google auth response
        const { profileObj } = userData;
        const formattedUser = {
          _id: profileObj.googleId,
          firstName: profileObj.givenName,
          lastName: profileObj.familyName,
          email: profileObj.email,
          photo: profileObj.imageUrl || "https://via.placeholder.com/32"
        };
        setUser(formattedUser);
      } else {
        // Handle regular login
        const formattedUser = {
          ...userData,
          photo: userData.photo || "https://via.placeholder.com/32"
        };
        setUser(formattedUser);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 