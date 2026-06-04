import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getToken,
  getUser,
  setSession,
  updateUser as persistUser,
  clearSession,
} from '../lib/auth';

// Reactive auth state. Components read auth via useAuth() and re-render on
// login/logout — fixing the current bug where the Header only updates on reload.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getUser());

  const login = useCallback((newToken, newUser) => {
    setSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const updateUser = useCallback((newUser) => {
    persistUser(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = { token, user, isAuthenticated: !!token, login, updateUser, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
