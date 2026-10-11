import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User, AuthResponse } from '../types';
import { setSession, endSession, getToken, isDemoMode, normalizeAuth } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (authData: AuthResponse) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readStoredUser(): User | null {
  const token = getToken();
  if (!token) return null;
  const savedUser = sessionStorage.getItem('sem_user');
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser) as User;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener('sem:session-expired', expire);
    return () => window.removeEventListener('sem:session-expired', expire);
  }, []);

  const isAuthenticated = useMemo(() => {
    if (user && getToken()) return true;
    return isDemoMode() && !!user;
  }, [user]);

  const persistUser = (next: User | null) => {
    setUser(next);
    if (next) sessionStorage.setItem('sem_user', JSON.stringify(next));
    else sessionStorage.removeItem('sem_user');
  };

  const login = useCallback((authData: AuthResponse) => {
    setSession(authData);
    persistUser(normalizeAuth(authData).user);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      sessionStorage.setItem('sem_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    endSession();
    persistUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, updateUser, logout }),
    [user, isAuthenticated, login, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
