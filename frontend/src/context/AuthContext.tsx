import React, { createContext, useContext, useState } from 'react';
import type { User, AuthResponse } from '../types';
import { setSession, clearSession, getToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('sem_user');
    if (savedUser && getToken()) {
      try { return JSON.parse(savedUser); } catch (e) { return null; }
    }
    return { id: 1, name: 'Pruthviraj', email: 'pruthviraj@smartexpense.com', role: 'ADMIN' };
  });

  const isAuthenticated = !!user && !!getToken();

  const login = (authData: AuthResponse) => {
    setSession(authData);
    const u: User = {
      id: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    };
    setUser(u);
    sessionStorage.setItem('sem_user', JSON.stringify(u));
  };

  const logout = () => {
    clearSession();
    sessionStorage.removeItem('sem_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
