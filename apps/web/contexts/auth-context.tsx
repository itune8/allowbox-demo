'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginCredentials } from '@repo/types';
import { API_ENDPOINTS } from '@repo/config';
import { apiClient } from '../lib/api-client';
import { authService, type AuthResponse as BackendAuthResponse } from '../lib/services/auth.service';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (email: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Clean up old mock data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockUser');
      localStorage.removeItem('mockRemember');
      sessionStorage.removeItem('mockUser');
      // Also clear the data-store mock data
      localStorage.removeItem('allowbox:store');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      console.log('🔄 Refreshing user...');

      // Demo mode: load from localStorage without API
      const token = authService.getAccessToken();
      if (token?.startsWith('demo-token-')) {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          setUser({
            id: u.id, email: u.email,
            firstName: u.firstName, lastName: u.lastName,
            tenantId: u.tenantId || '',
            roles: [u.role], permissions: u.permissions || [],
          });
        }
        setLoading(false);
        return;
      }

      // First, try to get stored user data for instant load
      const storedUser = authService.getStoredUser();
      console.log('🔑 Access token:', token ? 'Found' : 'Not found');
      console.log('💾 Stored user:', storedUser ? 'Found' : 'Not found');

      if (token && storedUser) {
        // Map stored backend user to frontend User type
        const mappedUser: User = {
          id: storedUser.id,
          email: storedUser.email,
          firstName: storedUser.firstName,
          lastName: storedUser.lastName,
          tenantId: storedUser.tenantId || '',
          roles: [storedUser.role], // Convert single role to array
          permissions: storedUser.permissions || [],
        };

        console.log('👤 User loaded from storage:', mappedUser);
        setUser(mappedUser);
        setLoading(false);

        // Optionally verify token with backend in background
        try {
          const response = await authService.getCurrentUser();
          const backendUser = response.user;
          const updatedUser: User = {
            id: backendUser.id,
            email: backendUser.email,
            firstName: backendUser.firstName,
            lastName: backendUser.lastName,
            tenantId: backendUser.tenantId || '',
            roles: [backendUser.role],
            permissions: backendUser.permissions || [],
          };

          // Update if data changed
          if (JSON.stringify(updatedUser) !== JSON.stringify(mappedUser)) {
            console.log('✅ User data updated from server:', updatedUser);
            setUser(updatedUser);
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(backendUser));
          }
        } catch (verifyError) {
          console.error('⚠️ Token verification failed:', verifyError);

          // In mobile app, don't logout immediately - trust the injected tokens
          const isMobileApp = localStorage.getItem('isMobileApp') === 'true';
          if (isMobileApp) {
            console.log('📱 Mobile app detected, keeping user session');
            // Keep the user logged in with stored data
          } else {
            // Token is invalid, clear everything
            await authService.logout();
            setUser(null);
          }
        }
      } else if (token && !storedUser) {
        // We have token but no stored user, fetch from API
        const response = await authService.getCurrentUser();
        console.log('✅ Current user response:', response);

        const backendUser = response.user;
        const mappedUser: User = {
          id: backendUser.id,
          email: backendUser.email,
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          tenantId: backendUser.tenantId || '',
          roles: [backendUser.role],
          permissions: backendUser.permissions || [],
        };

        console.log('👤 User refreshed from API:', mappedUser);
        setUser(mappedUser);
        // Store for next time
        localStorage.setItem('user', JSON.stringify(backendUser));
      } else {
        console.log('❌ No token found, user set to null');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      // If token is invalid or expired, clear user
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const DEMO_USERS: Record<string, User> = {
    'admin@allowbox.app': {
      id: 'demo-super-admin', email: 'admin@allowbox.app',
      firstName: 'Super', lastName: 'Admin', tenantId: '',
      roles: ['super_admin'],
      permissions: ['canManageSchools', 'canManageUsers', 'canViewAnalytics', 'canAccessUsers'],
    },
    'school@example.com': {
      id: 'demo-school-admin', email: 'school@example.com',
      firstName: 'Sahil', lastName: 'Admin', tenantId: 'demo-tenant-001',
      roles: ['tenant_admin'],
      permissions: ['canManageStudents', 'canManageTeachers', 'canManageClasses', 'canManageFees'],
    },
    'teacher@example.com': {
      id: 'demo-teacher', email: 'teacher@example.com',
      firstName: 'Teacher', lastName: 'Yes', tenantId: 'demo-tenant-001',
      roles: ['teacher'],
      permissions: ['canViewStudents', 'canManageAttendance', 'canManageHomework'],
    },
    'parent@example.com': {
      id: 'demo-parent', email: 'parent@example.com',
      firstName: 'Parent', lastName: 'User', tenantId: 'demo-tenant-001',
      roles: ['parent'],
      permissions: ['canViewChild', 'canViewFees', 'canViewAttendance'],
    },
  };

  const login = async (email: string, password: string, remember?: boolean) => {
    console.log('🔐 Login attempt:', { email });

    // Demo mode: bypass API
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser) {
      console.log('🎭 Demo login:', email);
      localStorage.setItem('accessToken', 'demo-token-' + demoUser.roles[0]);
      localStorage.setItem('refreshToken', 'demo-refresh-token');
      localStorage.setItem('user', JSON.stringify({
        id: demoUser.id, email: demoUser.email,
        firstName: demoUser.firstName, lastName: demoUser.lastName,
        tenantId: demoUser.tenantId, role: demoUser.roles[0],
        permissions: demoUser.permissions,
      }));
      setUser(demoUser);
      return;
    }

    // Real API login
    const response = await authService.login({ email, password });
    console.log('✅ Login response received:', response);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockRemember');
    localStorage.removeItem('allowbox:store')

    const backendUser = response.user;
    const mappedUser: User = {
      id: backendUser.id, email: backendUser.email,
      firstName: backendUser.firstName, lastName: backendUser.lastName,
      tenantId: backendUser.tenantId || '',
      roles: [backendUser.role],
      permissions: backendUser.permissions || [],
    };
    setUser(mappedUser);
  };

  const signup = async (email: string, password: string, name?: string) => {
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
      permissions: backendUser.permissions || [],
    };
    setUser(mappedUser);
  };

  const logout = async () => {
    const token = authService.getAccessToken();
    if (token?.startsWith('demo-token-')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } else {
      await authService.logout();
    }
    setUser(null);
  };

  const switchRole = (email: string) => {
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (!demoUser) {
      console.warn('[switchRole] unknown demo email:', email);
      return;
    }
    // Atomic swap: overwrite localStorage and user state in one pass,
    // never passing through null — prevents UI flicker in the demo mode bar.
    localStorage.setItem('accessToken', 'demo-token-' + demoUser.roles[0]);
    localStorage.setItem('refreshToken', 'demo-refresh-token');
    localStorage.setItem('user', JSON.stringify({
      id: demoUser.id, email: demoUser.email,
      firstName: demoUser.firstName, lastName: demoUser.lastName,
      tenantId: demoUser.tenantId, role: demoUser.roles[0],
      permissions: demoUser.permissions,
    }));
    setUser(demoUser);
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, switchRole, refreshUser }}>
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
