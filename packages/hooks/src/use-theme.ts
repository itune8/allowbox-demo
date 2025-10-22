'use client';

import { useEffect } from 'react';
import { useAuth } from './use-auth';
import { DEFAULT_THEME } from '@repo/config';
import type { TenantTheme } from '@repo/types';

export interface UseThemeReturn {
  theme: TenantTheme;
  applyTheme: (theme: TenantTheme) => void;
}

export function useTheme(): UseThemeReturn {
  const { user } = useAuth();
  const theme = user?.tenantTheme ?? DEFAULT_THEME;

  const applyTheme = (themeToApply: TenantTheme) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeToApply.primaryColor);
    root.style.setProperty('--color-accent', themeToApply.accentColor);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return {
    theme,
    applyTheme,
  };
}
