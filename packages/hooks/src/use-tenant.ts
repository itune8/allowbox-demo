'use client';

import { useAuth } from './use-auth';
import type { Tenant } from '@repo/types';

export interface UseTenantReturn {
  tenant: Partial<Tenant> | null;
  tenantId: string | null;
  loading: boolean;
}

export function useTenant(): UseTenantReturn {
  const { user, loading } = useAuth();

  return {
    tenant: user
      ? {
          id: user.tenantId,
          theme: user.tenantTheme,
        }
      : null,
    tenantId: user?.tenantId ?? null,
    loading,
  };
}
