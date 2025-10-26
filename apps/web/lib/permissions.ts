/**
 * Platform Role Permissions
 * Defines what each role can access and perform
 */

export type PlatformRole = 'super_admin' | 'sales' | 'support' | 'finance';

export interface RolePermissions {
  canAccessDashboard: boolean;
  canAccessSchools: boolean;
  canCreateSchools: boolean;
  canEditSchools: boolean;
  canDeleteSchools: boolean;
  canAccessUsers: boolean;
  canAccessFinance: boolean;
  canAccessReports: boolean;
  canAccessSupport: boolean;
  canAccessSettings: boolean;
  canViewAllSchools: boolean;
  canManageStaff: boolean;
}

/**
 * Get permissions for a given role
 */
export function getRolePermissions(role: PlatformRole): RolePermissions {
  switch (role) {
    case 'super_admin':
      return {
        canAccessDashboard: true,
        canAccessSchools: true,
        canCreateSchools: true,
        canEditSchools: true,
        canDeleteSchools: true,
        canAccessUsers: true,
        canAccessFinance: true,
        canAccessReports: true,
        canAccessSupport: true,
        canAccessSettings: true,
        canViewAllSchools: true,
        canManageStaff: true,
      };

    case 'sales':
      return {
        canAccessDashboard: true,
        canAccessSchools: true,
        canCreateSchools: true, // Sales can add schools
        canEditSchools: false,
        canDeleteSchools: false,
        canAccessUsers: false,
        canAccessFinance: false,
        canAccessReports: true, // Can view sales reports
        canAccessSupport: false,
        canAccessSettings: false,
        canViewAllSchools: true,
        canManageStaff: false,
      };

    case 'support':
      return {
        canAccessDashboard: true,
        canAccessSchools: true, // Can view schools to help with tickets
        canCreateSchools: false,
        canEditSchools: false,
        canDeleteSchools: false,
        canAccessUsers: false,
        canAccessFinance: false,
        canAccessReports: false,
        canAccessSupport: true, // Can handle support tickets
        canAccessSettings: false,
        canViewAllSchools: true,
        canManageStaff: false,
      };

    case 'finance':
      return {
        canAccessDashboard: true,
        canAccessSchools: true, // Can view schools for billing
        canCreateSchools: false,
        canEditSchools: false,
        canDeleteSchools: false,
        canAccessUsers: false,
        canAccessFinance: true, // Can access billing
        canAccessReports: true, // Can view financial reports
        canAccessSupport: false,
        canAccessSettings: false,
        canViewAllSchools: true,
        canManageStaff: false,
      };

    default:
      // No permissions
      return {
        canAccessDashboard: false,
        canAccessSchools: false,
        canCreateSchools: false,
        canEditSchools: false,
        canDeleteSchools: false,
        canAccessUsers: false,
        canAccessFinance: false,
        canAccessReports: false,
        canAccessSupport: false,
        canAccessSettings: false,
        canViewAllSchools: false,
        canManageStaff: false,
      };
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  userRoles: string[] | undefined,
  permission: keyof RolePermissions
): boolean {
  if (!userRoles || userRoles.length === 0) return false;

  const platformRoles: PlatformRole[] = ['super_admin', 'sales', 'support', 'finance'];
  const userPlatformRole = userRoles.find(role => platformRoles.includes(role as PlatformRole)) as PlatformRole;

  if (!userPlatformRole) return false;

  const permissions = getRolePermissions(userPlatformRole);
  return permissions[permission];
}

/**
 * Get user's display role name
 */
export function getRoleDisplayName(role: PlatformRole): string {
  const names: Record<PlatformRole, string> = {
    super_admin: 'Super Admin',
    sales: 'Sales',
    support: 'Support',
    finance: 'Finance',
  };
  return names[role] || role;
}
