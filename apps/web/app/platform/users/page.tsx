'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';

type UserRole = 'super_admin' | 'sales' | 'support' | 'finance';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  onboardedSchools?: number;
  assignedTickets?: number;
  isActive: boolean;
}

// Mock data
const generateMockUsers = (): StaffUser[] => {
  return [
    {
      id: '1',
      name: 'Super Admin',
      email: 'admin@allowbox.app',
      role: 'super_admin',
      createdAt: '2024-01-15',
      lastLogin: new Date().toISOString(),
      onboardedSchools: 0,
      assignedTickets: 0,
      isActive: true,
    },
    {
      id: '2',
      name: 'Jane Sales',
      email: 'jane.sales@allowbox.app',
      role: 'sales',
      createdAt: '2024-02-01',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      onboardedSchools: 15,
      assignedTickets: 0,
      isActive: true,
    },
    {
      id: '3',
      name: 'John Support',
      email: 'john.support@allowbox.app',
      role: 'support',
      createdAt: '2024-02-15',
      lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      onboardedSchools: 0,
      assignedTickets: 12,
      isActive: true,
    },
    {
      id: '4',
      name: 'Sarah Finance',
      email: 'sarah.finance@allowbox.app',
      role: 'finance',
      createdAt: '2024-03-01',
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      onboardedSchools: 0,
      assignedTickets: 0,
      isActive: true,
    },
  ];
};

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);

  // Page protection: Only super_admin can access Users & Roles
  const canAccessUsers = hasPermission(currentUser?.roles, 'canAccessUsers');

  useEffect(() => {
    if (!canAccessUsers) {
      router.push('/platform/dashboard');
    }
  }, [canAccessUsers, router]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = filterRole === 'all'
    ? users
    : users.filter(u => u.role === filterRole);

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      super_admin: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Super Admin' },
      sales: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Sales' },
      support: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Support' },
      finance: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'Finance' },
    };
    const badge = badges[role];
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getRolePermissions = (role: UserRole): string[] => {
    switch (role) {
      case 'super_admin':
        return ['Full system access', 'Manage all users', 'Manage all schools', 'View all reports', 'Manage billing'];
      case 'sales':
        return ['Add new schools', 'View school list', 'Update school subscriptions', 'View sales reports'];
      case 'support':
        return ['View support tickets', 'Respond to tickets', 'View school details', 'Access school admin dashboard'];
      case 'finance':
        return ['View billing data', 'Process payments', 'Generate financial reports', 'Manage subscriptions'];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Users & Roles
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage internal staff and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sales Team</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {users.filter(u => u.role === 'sales').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Support Team</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {users.filter(u => u.role === 'support').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Finance Team</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {users.filter(u => u.role === 'finance').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <label htmlFor="roleFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by role:
          </label>
          <select
            id="roleFilter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="finance">Finance</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {user.role === 'sales' && (
                      <span>{user.onboardedSchools} schools onboarded</span>
                    )}
                    {user.role === 'support' && (
                      <span>{user.assignedTickets} active tickets</span>
                    )}
                    {(user.role === 'super_admin' || user.role === 'finance') && (
                      <span>—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      user.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPermissionsModal(true);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium mr-4"
                    >
                      Permissions
                    </button>
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Add user form coming soon...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Permissions: {selectedUser.name}
              </h3>
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                {getRoleBadge(selectedUser.role)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The following permissions are granted to this role:
              </p>
              <ul className="space-y-2">
                {getRolePermissions(selectedUser.role).map((permission, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
