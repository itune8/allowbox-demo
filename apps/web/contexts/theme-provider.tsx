'use client';

import React, { useEffect } from 'react';
import { useAuth } from './auth-context';
import { DEFAULT_THEME } from '@repo/config';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const theme = user?.tenantTheme ?? DEFAULT_THEME;
    const root = document.documentElement;

    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);
  }, [user]);

  return <>{children}</>;
}
