'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, LoginPayload, RegisterPayload } from '@/types/auth';
import { AuthService } from '@/services/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'luminarail_token';
const USER_KEY = 'luminarail_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUserJson = localStorage.getItem(USER_KEY);

        if (storedUserJson) {
          try {
            setUser(JSON.parse(storedUserJson));
          } catch {
            localStorage.removeItem(USER_KEY);
          }
        }

        if (storedToken) {
          setToken(storedToken);
          const response = await AuthService.getCurrentUser(storedToken);
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem(USER_KEY, JSON.stringify(response.data));
          } else {
            // Token invalid or expired
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(payload);
      if (response.success && response.data) {
        const { user: userData, token: jwtToken } = response.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem(TOKEN_KEY, jwtToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        return true;
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.register(payload);
      if (response.success && response.data) {
        const { user: userData, token: jwtToken } = response.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem(TOKEN_KEY, jwtToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        return true;
      } else {
        setError(response.message || 'Registration failed. Please check your details.');
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (token) {
        await AuthService.logout(token);
      }
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
