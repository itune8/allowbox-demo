import type { User, AuthResponse } from '@repo/types';
import { ROLES } from '@repo/config';

export const mockUsers: Record<string, User> = {
  'admin@allowbox.app': {
    id: '1',
    email: 'admin@allowbox.app',
    tenantId: 'platform',
    firstName: 'Super',
    lastName: 'Admin',
    roles: [ROLES.SUPER_ADMIN],
    permissions: ['*'],
    tenantTheme: {
      primaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
      logoUrl: '/logo.png',
    },
  },
  'school@example.com': {
    id: '2',
    email: 'school@example.com',
    tenantId: 'school-1',
    firstName: 'School',
    lastName: 'Admin',
    roles: [ROLES.TENANT_ADMIN],
    permissions: ['manage_students', 'manage_staff', 'manage_classes', 'view_invoices'],
    tenantTheme: {
      primaryColor: '#10b981',
      accentColor: '#06b6d4',
      logoUrl: '/school-logo.png',
    },
  },
  'teacher@example.com': {
    id: '3',
    email: 'teacher@example.com',
    tenantId: 'school-1',
    firstName: 'Jane',
    lastName: 'Teacher',
    roles: [ROLES.TEACHER],
    permissions: ['view_students', 'manage_attendance', 'manage_homework'],
    tenantTheme: {
      primaryColor: '#10b981',
      accentColor: '#06b6d4',
      logoUrl: '/school-logo.png',
    },
  },
  'parent@example.com': {
    id: '4',
    email: 'parent@example.com',
    tenantId: 'school-1',
    firstName: 'John',
    lastName: 'Parent',
    roles: [ROLES.PARENT],
    permissions: ['view_children', 'view_fees', 'make_payments'],
    tenantTheme: {
      primaryColor: '#10b981',
      accentColor: '#06b6d4',
      logoUrl: '/school-logo.png',
    },
  },
};

export function getMockAuthResponse(email: string, password: string): AuthResponse | null {
  // Mock authentication - accepts any password for valid mock users
  // Valid mock emails: admin@allowbox.app, school@example.com, teacher@example.com, parent@example.com
  // Password can be anything (e.g., "password", "test", "123456", etc.)

  const user = mockUsers[email];
  if (!user) {
    console.error(`Mock login failed: Email "${email}" not found in mock users.`);
    return null;
  }

  // Accept any non-empty password for mock mode
  if (!password || password.trim().length === 0) {
    console.error('Mock login failed: Password is required.');
    return null;
  }

  return { user };
}
