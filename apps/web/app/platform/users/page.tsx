'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, X, Shield, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { userService } from '../../../lib/services/user.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../components/ui';

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

  // Form state
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showPermissionsPanel, setShowPermissionsPanel] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [formData, setFormData] = useState<CreateUserForm>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

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
      setError(null);
      // Get platform staff users (super_admin, sales, support, finance)
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
    if (!formData.firstName || !formData.email || !formData.password) {
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
        phone: formData.phone || undefined,
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
      super_admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Super Admin' },
      sales: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sales' },
      support: { bg: 'bg-green-100', text: 'text-green-700', label: 'Support' },
      finance: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Finance' },
      tenant_admin: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'School Admin' },
    };
    const badge = badges[role] || { bg: 'bg-gray-100', text: 'text-gray-700', label: role };
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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-gray-200 border-t-violet-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-violet-500 to-purple-500">
            <Users className="w-8 h-8" />
          </Icon3D>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Users & Roles
            </h2>
            <p className="text-gray-600 mt-1">
              Manage internal staff and their permissions
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setShowAddPanel(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="bg-red-50 border-red-200">
              <div className="p-4 text-red-700 flex items-center justify-between">
                <span>{error}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setError(null)}
                  className="underline"
                >
                  Dismiss
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <AnimatedStatCard
          title="Total Users"
          value={stats.total.toString()}
          icon={<Users className="w-5 h-5 text-white" />}
          gradient="from-violet-500 to-purple-500"
        />
        <AnimatedStatCard
          title="Sales Team"
          value={stats.sales.toString()}
          icon={<Users className="w-5 h-5 text-white" />}
          gradient="from-blue-500 to-cyan-500"
        />
        <AnimatedStatCard
          title="Support Team"
          value={stats.support.toString()}
          icon={<Users className="w-5 h-5 text-white" />}
          gradient="from-green-500 to-emerald-500"
        />
        <AnimatedStatCard
          title="Finance Team"
          value={stats.finance.toString()}
          icon={<Users className="w-5 h-5 text-white" />}
          gradient="from-orange-500 to-red-500"
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="bg-white">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by role
              </label>
              <motion.select
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="roleFilter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="finance">Finance</option>
              </motion.select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <Users className="w-16 h-16 text-gray-300 mb-3" />
                        No users found
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user._id || user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.6)', scale: 1.005 }}
                        className="transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatLastLogin(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100/30 text-gray-700'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPermissionsPanel(true);
                              }}
                              className="text-violet-600 hover:text-violet-900 font-medium flex items-center gap-1"
                            >
                              <Shield className="w-4 h-4" />
                              Permissions
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleToggleActive(user)}
                              className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.2, color: '#ef4444' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteUser(user)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Add User Slide-in Panel */}
      <AnimatePresence>
        {showAddPanel && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowAddPanel(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl border-l border-gray-200"
            >
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <motion.select
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  >
                    <option value="support">Support</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="super_admin">Super Admin</option>
                  </motion.select>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-4 mt-4"
                >
                  <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-600" />
                    Role Permissions
                  </p>
                  <ul className="space-y-1">
                    {getRolePermissions(formData.role).map((permission, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {permission}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button type="button" variant="outline" onClick={() => setShowAddPanel(false)}>
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create User'}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permissions Slide-in Panel */}
      <AnimatePresence>
        {showPermissionsPanel && selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => { setShowPermissionsPanel(false); setSelectedUser(null); }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl border-l border-gray-200"
            >
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold text-gray-900">
                  Permissions: {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowPermissionsPanel(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Current Role</p>
                  {getRoleBadge(selectedUser.role)}
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">User Details</p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Joined:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm ${selectedUser.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </motion.div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-600" />
                    Granted Permissions
                  </p>
                  <ul className="space-y-2">
                    {getRolePermissions(selectedUser.role).map((permission, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {permission}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-200">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowPermissionsPanel(false);
                        setSelectedUser(null);
                      }}
                    >
                      Close
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
