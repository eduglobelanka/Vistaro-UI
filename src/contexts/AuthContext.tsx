import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/auth.service';
import type { LoginRequest, RegisterRequest, UserSummary } from '../types/auth';

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and verify session on load
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (accessToken) {
        try {
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // Fetch fresh user data to verify and update roles
          const freshUser = await authService.me();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Session verification failed, logging out:', err);
          handleLogoutCleanup();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Event listeners for cross-request auth management
    const handleLogoutEvent = () => {
      handleLogoutCleanup();
    };

    const handleRefreshEvent = (e: Event) => {
      const customEvent = e as CustomEvent<UserSummary>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
      }
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    window.addEventListener('auth:refresh', handleRefreshEvent as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
      window.removeEventListener('auth:refresh', handleRefreshEvent as EventListener);
    };
  }, []);

  const handleLogoutCleanup = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (data: LoginRequest) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(data);
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.register(data);
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Registration failed.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    setLoading(true);
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authService.revokeRefreshToken(refreshToken);
      } catch (err) {
        console.warn('Revoke refresh token failed on backend:', err);
      }
    }
    handleLogoutCleanup();
    setLoading(false);
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        clearError,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
