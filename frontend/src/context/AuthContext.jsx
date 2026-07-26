import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('postpulse_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
    } catch (err) {
      console.error('Session check failed:', err);
      localStorage.removeItem('postpulse_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('postpulse_token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email, name, password) => {
    const res = await authAPI.register({ email, name, password });
    localStorage.setItem('postpulse_token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('postpulse_token');
    setUser(null);
  };

  // Demo user login for zero-friction evaluation
  const loginAsDemo = async () => {
    try {
      return await login('developer@postpulse.ai', 'demo1234');
    } catch {
      return await register('developer@postpulse.ai', 'Senior Developer', 'demo1234');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
