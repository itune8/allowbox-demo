'use client';

import { useContext } from 'react';

// This will be implemented in the apps/web with proper context
// For now, we define the interface
export interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// This is a placeholder that will be properly implemented in apps/web
export function useAuth(): AuthContextType {
  // In the actual implementation, this will use React Context
  // For now, return a mock structure
  return {
    user: null,
    loading: false,
    login: async () => {},
    logout: async () => {},
    refreshUser: async () => {},
  };
}
