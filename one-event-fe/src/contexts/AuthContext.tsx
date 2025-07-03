'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';
import type { User, LoginRequest, RegisterRequest } from '../types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      console.log('=== AuthContext: Initializing authentication ===');
      console.log('apiClient.isAuthenticated():', apiClient.isAuthenticated());
      
      if (apiClient.isAuthenticated()) {
        try {
          console.log('Token found, attempting to get user profile...');
          const userData = await apiClient.getProfile();
          console.log('User profile loaded:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          console.log('Token might be invalid, removing it...');
          // Token might be invalid, remove it
          await apiClient.logout();
        }
      } else {
        console.log('No token found, user not authenticated');
      }
      setLoading(false);
      console.log('=== AuthContext: Initialization complete ===');
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      console.log('=== AuthContext: Login attempt ===');
      console.log('Login data:', { email: data.email, password: '[HIDDEN]' });
      
      const response = await apiClient.login(data);
      console.log('Login response:', response);
      
      setUser(response.user);
      console.log('User set in AuthContext:', response.user);
      console.log('=== AuthContext: Login successful ===');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      await apiClient.register(data);
      // After registration, user needs to login
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('=== AuthContext: Logout ===');
      await apiClient.logout();
      setUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if logout fails
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
