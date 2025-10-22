'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials } from '@repo/types';
import { API_ENDPOINTS, env } from '@repo/config';
import { apiClient } from '../lib/api-client';
import { getMockAuthResponse } from '../lib/mock-data';
import { authService, type AuthResponse as BackendAuthResponse } from '../lib/services/auth.service';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (env.useApiMocks) {
        // Mock mode: prefer sessionStorage; fall back to localStorage only if "remember" is set
        if (typeof window !== 'undefined') {
          const sessionUser = sessionStorage.getItem('mockUser');
          if (sessionUser) {
            setUser(JSON.parse(sessionUser));
          } else {
            const remembered = localStorage.getItem('mockRemember') === 'true';
            const localUser = localStorage.getItem('mockUser');
            if (remembered && localUser) {
              setUser(JSON.parse(localUser));
            } else {
              // Clean up stray local user if not remembered
              localStorage.removeItem('mockUser');
              localStorage.removeItem('mockRemember');
              setUser(null);
            }
          }
        }
      } else {
        // Check if user has access token
        const token = authService.getAccessToken();
        if (token) {
          const response = await authService.getCurrentUser();
          // Map backend response to frontend User type
          const backendUser = response.user;
          const mappedUser: User = {
            id: backendUser.id,
            email: backendUser.email,
            firstName: backendUser.firstName,
            lastName: backendUser.lastName,
            tenantId: backendUser.tenantId || '',
            roles: [backendUser.role], // Convert single role to array
            permissions: backendUser.permissions || [],
            tenantTheme: {
              primaryColor: '#3b82f6',
              accentColor: '#8b5cf6',
              logoUrl: '/logo.png',
            },
          };
          setUser(mappedUser);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      // If token is invalid or expired, clear user
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, remember?: boolean) => {
    if (env.useApiMocks) {
      const mockResponse = getMockAuthResponse(email, password);
      if (!mockResponse) {
        throw new Error('Invalid credentials');
      }
      // Persist based on remember flag: sessionStorage by default, localStorage if remembered
      if (typeof window !== 'undefined') {
        if (remember) {
          localStorage.setItem('mockUser', JSON.stringify(mockResponse.user));
          localStorage.setItem('mockRemember', 'true');
          sessionStorage.removeItem('mockUser');
        } else {
          sessionStorage.setItem('mockUser', JSON.stringify(mockResponse.user));
          localStorage.removeItem('mockUser');
          localStorage.removeItem('mockRemember');
        }
      }
      setUser(mockResponse.user);
      setLoading(false);
      return;
    }
    const response = await authService.login({ email, password });
    // Map backend response to frontend User type
    const backendUser = response.user;
    const mappedUser: User = {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.firstName,
      lastName: backendUser.lastName,
      tenantId: backendUser.tenantId || '',
      roles: [backendUser.role], // Convert single role to array
      permissions: backendUser.permissions || [],
      tenantTheme: {
        primaryColor: '#3b82f6',
        accentColor: '#8b5cf6',
        logoUrl: '/logo.png',
      },
    };
    setUser(mappedUser);
  };

  const signup = async (email: string, password: string, name?: string) => {
    if (env.useApiMocks) {
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        tenantId: 'platform',
        roles: ['super_admin'],
        permissions: [],
        firstName: name || 'User',
        tenantTheme: {
          primaryColor: '#3b82f6',
          accentColor: '#8b5cf6',
          logoUrl: '/logo.png',
        },
      };
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }
    const response = await apiClient.post<BackendAuthResponse>(API_ENDPOINTS.SIGNUP, { email, password, name });
    // Map backend response to frontend User type
    const backendUser = response.data.user;
    const mappedUser: User = {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.firstName || name || 'User',
      lastName: backendUser.lastName || '',
      tenantId: backendUser.tenantId || '',
      roles: [backendUser.role],
      permissions: [],
      tenantTheme: {
        primaryColor: '#3b82f6',
        accentColor: '#8b5cf6',
        logoUrl: '/logo.png',
      },
    };
    setUser(mappedUser);
  };

  const logout = async () => {
    if (env.useApiMocks) {
      // Clear both storages for mock logout
      localStorage.removeItem('mockUser');
      localStorage.removeItem('mockRemember');
      sessionStorage.removeItem('mockUser');
      setUser(null);
      return;
    }
    await authService.logout();
    setUser(null);
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
