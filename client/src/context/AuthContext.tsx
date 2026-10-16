import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  role: Role | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dd_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('dd_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('dd_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        localStorage.removeItem('dd_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('dd_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.setItem('dd_token', '');
    localStorage.removeItem('dd_token');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        role: user ? user.role : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
