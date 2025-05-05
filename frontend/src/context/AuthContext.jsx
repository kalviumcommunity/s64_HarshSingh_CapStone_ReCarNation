import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/me', {
          withCredentials: true
        });
        
        if (response.data && response.data.user) {
          const userData = {
            ...response.data.user,
            photo: response.data.user.photo || "https://via.placeholder.com/32"
          };
          setUser(userData);
        } else {
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

    checkAuth();
  }, []);

  const login = async (userData) => {
    try {
      if (userData && userData.profileObj) {
        const formattedUser = {
          _id: userData.profileObj.googleId,
          firstName: userData.profileObj.givenName,
          lastName: userData.profileObj.familyName,
          email: userData.profileObj.email,
          photo: userData.profileObj.imageUrl || "https://via.placeholder.com/32"
        };
        setUser(formattedUser);
      } else {
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

  const updateUserRole = async (newRole) => {
    try {
      const response = await axios.put('http://localhost:3000/api/auth/role', 
        { role: newRole },
        { withCredentials: true }
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
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true
      });
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