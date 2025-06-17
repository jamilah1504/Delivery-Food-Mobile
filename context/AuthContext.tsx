import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      const { user, token } = response.data.data;
      setUser(user);
      setToken(token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    } catch (e) {
      console.error('Login error', e.response.data);
      throw new Error(e.response.data.message || 'Failed to login');
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await apiClient.post('/register', { name, email, password });
      const { user, token } = response.data.data;
      setUser(user);
      setToken(token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
    } catch (e) {
      console.error('Register error', e.response.data);
      throw new Error(e.response.data.message || 'Failed to register');
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        await apiClient.post('/logout'); // Endpoint logout butuh token
        setUser(null);
        setToken(null);
        delete apiClient.defaults.headers.common['Authorization'];
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    } catch (e) {
        console.error('Logout error', e.response.data);
    } finally {
        setIsLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let userToken = await AsyncStorage.getItem('userToken');
      let userData = await AsyncStorage.getItem('userData');
      if (userToken) {
        setToken(userToken);
        setUser(JSON.parse(userData));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      }
    } catch (e) {
      console.log('isLoggedIn error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, register, user, token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};