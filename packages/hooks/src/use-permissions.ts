'use client';

import { useAuth } from './use-auth';

export interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  permissions: string[];
  roles: string[];
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) ?? false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles?.includes(role) ?? false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.every((permission) => hasPermission(permission));
  };

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions ?? [],
    roles: user?.roles ?? [],
  };
}
