import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/api';
import type { User } from '@/api/types';

interface AuthContextType {
  user: User | null;
  guestId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await authApi.me();
      if (response.data.authenticated && response.data.user) {
        setUser(response.data.user);
        setGuestId(null);
      } else {
        setUser(null);
        setGuestId(response.data.guestId || null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = () => {
    window.location.href = authApi.loginUrl();
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      await fetchUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    guestId,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

