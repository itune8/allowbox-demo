'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Shield, Trash2, UserPlus, Check } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { userService } from '../../../lib/services/user.service';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '../../../components/ui';

type UserRole = 'super_admin' | 'sales' | 'support' | 'finance' | 'tenant_admin' | 'teacher' | 'parent' | 'student';

interface StaffUser {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  roles?: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  phone?: string;
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
}

const defaultFormData: CreateUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'support',
  phone: '',
};

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showPermissionsPanel, setShowPermissionsPanel] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState<CreateUserForm>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

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
      setError(null);
      const response = await userService.getPlatformUsers();
      setUsers(response as StaffUser[]);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await userService.createPlatformUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phone || undefined,
      });
      await loadUsers();
      setShowAddPanel(false);
      setFormData(defaultFormData);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: StaffUser) => {
    try {
      await userService.updateUser(user._id, { isActive: !user.isActive });
      await loadUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: StaffUser) => {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) return;
    try {
      await userService.deleteUser(user._id);
      await loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole || u.roles?.includes(filterRole);
    const matchesSearch = searchQuery === '' ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: UserRole) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      super_admin: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Super Admin' },
      sales: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Sales' },
      support: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Support' },
      finance: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Finance' },
      tenant_admin: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'School Admin' },
    };
    const badge = badges[role] || { bg: 'bg-slate-100', text: 'text-slate-600', label: role };
    return (
      <span className={`text-xs px-2 py-1 rounded-md font-medium ${badge.bg} ${badge.text}`}>
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
      default:
        return ['Standard access'];
    }
  };

  const stats = {
    total: users.length,
    sales: users.filter(u => u.role === 'sales' || u.roles?.includes('sales')).length,
    support: users.filter(u => u.role === 'support' || u.roles?.includes('support')).length,
    finance: users.filter(u => u.role === 'finance' || u.roles?.includes('finance')).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClassName = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-sm underline hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users & Roles</h1>
          <p className="text-slate-500 mt-1">Manage internal staff and their permissions</p>
        </div>
        <Button onClick={() => setShowAddPanel(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Sales Team</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.sales}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Support Team</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.support}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Finance Team</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.finance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full h-10 pl-10 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="roleFilter" className="block text-sm font-medium text-slate-700 mb-2">
              Filter by role
            </label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
              <option value="finance">Finance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Joined</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Last Login</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Users className="w-12 h-12 text-slate-300" />
                      <span>No users found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatLastLogin(user.lastLogin)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPermissionsPanel(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Permissions
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User SlideSheet */}
      <SlideSheet
        isOpen={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        title="Add New User"
        subtitle="Create a new platform staff member"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddPanel(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-6">
          <SheetSection>
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="First Name" required>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={inputClassName}
                  required
                />
              </SheetField>
              <SheetField label="Last Name" required>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={inputClassName}
                  required
                />
              </SheetField>
            </div>

            <SheetField label="Email" required>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClassName}
                required
              />
            </SheetField>

            <SheetField label="Password" required>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputClassName}
                required
                minLength={8}
              />
            </SheetField>

            <SheetField label="Phone">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClassName}
              />
            </SheetField>

            <SheetField label="Role" required>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className={inputClassName}
              >
                <option value="support">Support</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </SheetField>
          </SheetSection>

          <SheetSection title="Role Permissions">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Permissions for {formData.role.replace('_', ' ')}
              </p>
              <ul className="space-y-2">
                {getRolePermissions(formData.role).map((permission, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Permissions SlideSheet */}
      <SlideSheet
        isOpen={showPermissionsPanel && selectedUser !== null}
        onClose={() => {
          setShowPermissionsPanel(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
        subtitle="User permissions"
        size="md"
        footer={
          <Button variant="outline" className="w-full" onClick={() => {
            setShowPermissionsPanel(false);
            setSelectedUser(null);
          }}>
            Close
          </Button>
        }
      >
        {selectedUser && (
          <>
            <SheetSection title="User Details">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <SheetDetailRow label="Email" value={selectedUser.email} />
                <SheetDetailRow label="Role" value={getRoleBadge(selectedUser.role)} />
                <SheetDetailRow label="Joined" value={formatDate(selectedUser.createdAt)} />
                <SheetDetailRow
                  label="Status"
                  value={
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      selectedUser.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  }
                />
              </div>
            </SheetSection>

            <SheetSection title="Granted Permissions">
              <ul className="space-y-2">
                {getRolePermissions(selectedUser.role).map((permission, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {permission}
                  </li>
                ))}
              </ul>
            </SheetSection>
          </>
        )}
      </SlideSheet>
    </div>
  );
}
