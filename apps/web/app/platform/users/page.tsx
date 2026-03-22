'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  UserPlus,
  Building2,
  BarChart3,
  Headphones,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { userService } from '../../../lib/services/user.service';
import {
  PlatformStatCard,
  UserDetailsModal,
  SchoolsOnboardedModal,
  AddTeamMemberModal,
} from '../../../components/platform';

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

// Generate consistent mock data per user
function getMockStats(userId: string, role: string) {
  // Simple hash to get consistent random numbers per user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  if (role === 'sales') {
    return {
      schoolsOnboarded: (seed % 20) + 5,
      engagementScore: (seed % 20) + 75,
      cashPayments: (seed % 10) + 2,
      onlinePayments: (seed % 12) + 3,
    };
  }
  if (role === 'support') {
    return {
      assignedTickets: (seed % 30) + 10,
      resolved: (seed % 25) + 8,
      avgResponseTime: ((seed % 40) / 10 + 1).toFixed(1),
      resolutionRate: (seed % 15) + 80,
    };
  }
  return {};
}

const roleColors: Record<string, { badge: string; text: string }> = {
  super_admin: { badge: 'bg-purple-50 text-purple-700 border border-purple-200', text: 'text-purple-600' },
  sales: { badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', text: 'text-emerald-600' },
  finance: { badge: 'bg-amber-50 text-amber-700 border border-amber-200', text: 'text-amber-600' },
  support: { badge: 'bg-orange-50 text-orange-700 border border-orange-200', text: 'text-orange-600' },
};

function getRoleBadgeClass(role: string) {
  return roleColors[role]?.badge || 'bg-slate-100 text-slate-600 border border-slate-200';
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    super_admin: 'Admin',
    sales: 'Sales',
    finance: 'Finance',
    support: 'Support',
  };
  return labels[role] || role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
}

function getRoleTitle(role: string) {
  const titles: Record<string, string> = {
    super_admin: 'Admin',
    sales: 'Sales Manager',
    finance: 'Finance Manager',
    support: 'Support Lead',
  };
  return titles[role] || role;
}

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSchoolsModal, setShowSchoolsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 3-dot menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const canAccessUsers = hasPermission(currentUser?.roles, 'canAccessUsers');

  useEffect(() => {
    if (!canAccessUsers) {
      router.push('/platform/dashboard');
    }
  }, [canAccessUsers, router]);

  useEffect(() => {
    loadUsers();
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [openMenuId]);

  const mockSalesUser: StaffUser = {
    _id: 'mock-sales-001',
    id: 'mock-sales-001',
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@allowbox.app',
    role: 'sales',
    createdAt: '2025-11-10T08:00:00.000Z',
    lastLogin: '2026-03-17T14:30:00.000Z',
    isActive: true,
    phone: '+91 98765 43210',
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getPlatformUsers();
      setUsers([...response as StaffUser[], mockSalesUser]);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    role: string;
  }) => {
    try {
      setSubmitting(true);
      await userService.createPlatformUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        phoneNumber: data.phone || undefined,
      });
      await loadUsers();
      setShowAddModal(false);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create user');
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

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = filterRole === 'all' || u.role === filterRole || u.roles?.includes(filterRole);
      const matchesSearch = searchQuery === '' ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, filterRole, searchQuery]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'super_admin' || u.roles?.includes('super_admin')).length,
    sales: users.filter(u => u.role === 'sales' || u.roles?.includes('sales')).length,
    support: users.filter(u => u.role === 'support' || u.roles?.includes('support')).length,
    finance: users.filter(u => u.role === 'finance' || u.roles?.includes('finance')).length,
  }), [users]);

  const filterTabs = [
    { key: 'all', label: 'All', count: users.length },
    { key: 'super_admin', label: 'Admin', count: stats.admins },
    { key: 'sales', label: 'Sales', count: stats.sales },
    { key: 'finance', label: 'Finance', count: stats.finance },
    { key: 'support', label: 'Support', count: stats.support },
  ];

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getPermissions = (role: string): string[] => {
    switch (role) {
      case 'super_admin':
        return ['Full Access'];
      case 'sales':
        return ['Create', 'Read', 'Update'];
      case 'finance':
        return ['Create', 'Read', 'Update'];
      case 'support':
        return ['Read', 'Update'];
      default:
        return ['Read'];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-sm underline hover:no-underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500 mt-1">Manage internal team members and their roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: '#824ef2' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
        >
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<Users className="w-5 h-5" />}
          color="purple"
          label="Total Team"
          value={stats.total}
        />
        <PlatformStatCard
          icon={<Users className="w-5 h-5" />}
          color="blue"
          label="Admin"
          value={stats.admins}
        />
        <PlatformStatCard
          icon={<Users className="w-5 h-5" />}
          color="green"
          label="Sales"
          value={stats.sales}
        />
        <PlatformStatCard
          icon={<Users className="w-5 h-5" />}
          color="amber"
          label="Finance & Support"
          value={stats.finance + stats.support}
        />
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterRole(tab.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                filterRole === tab.key
                  ? 'text-white border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              style={filterRole === tab.key ? { backgroundColor: '#824ef2' } : undefined}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members..."
            className="w-64 h-9 pl-9 pr-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
          />
        </div>
      </div>

      {/* User Card Grid */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12">
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
            <Users className="w-12 h-12 text-slate-300" />
            <span>No team members found</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const mockStats = getMockStats(user._id || user.id || '', user.role);
            const isSales = user.role === 'sales';
            const isSupport = user.role === 'support';
            const isAdmin = user.role === 'super_admin';
            const isFinance = user.role === 'finance';
            const permissions = getPermissions(user.role);

            return (
              <div
                key={user._id || user.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow relative"
              >
                {/* Top: Avatar + Name + Email + 3-dot menu */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === (user._id || user.id) ? null : (user._id || user.id || null));
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                    {openMenuId === (user._id || user.id) && (
                      <div className="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                        {!isFinance && (
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleToggleActive(user);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          {user.isActive ? (
                            <><Clock className="w-3.5 h-3.5" /> Deactivate</>
                          ) : (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Activate</>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleDeleteUser(user);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Badge */}
                <div className="mb-4">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                {/* Role-Specific Content */}
                {(isAdmin || isFinance) && (
                  <>
                    {/* Status + Joined */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Status</span>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span className={`font-medium ${user.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Joined</span>
                        <span className="text-slate-700 font-medium">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500 mb-2">Permissions</p>
                      <div className="flex flex-wrap gap-1.5">
                        {permissions.map(p => (
                          <span
                            key={p}
                            className={`text-xs font-medium px-2 py-1 rounded border ${
                              p === 'Full Access'
                                ? 'border-purple-200 text-purple-700 bg-purple-50'
                                : 'border-slate-200 text-slate-600 bg-white'
                            }`}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {isSales && (
                  <>
                    {/* Sales Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Schools Onboarded</span>
                        <span className="font-bold text-slate-900">{(mockStats as any).schoolsOnboarded}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Engagement Score</span>
                        <span className="font-bold text-emerald-600">{(mockStats as any).engagementScore}%</span>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-2">Payment Methods</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-slate-500">Cash</p>
                          <p className="text-lg font-bold text-slate-900">{(mockStats as any).cashPayments}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-slate-500">Online</p>
                          <p className="text-lg font-bold text-slate-900">{(mockStats as any).onlinePayments}</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance bar */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500">Performance</span>
                        <span className="text-xs font-semibold text-emerald-600">{(mockStats as any).engagementScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(mockStats as any).engagementScore}%`,
                            backgroundColor: '#824ef2',
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {isSupport && (
                  <>
                    {/* Support Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Assigned Tickets</span>
                        <span className="font-bold text-slate-900">{(mockStats as any).assignedTickets}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Resolved</span>
                        <span className="font-bold text-emerald-600">{(mockStats as any).resolved}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Avg Response Time</span>
                        <span className="font-bold text-slate-900">{(mockStats as any).avgResponseTime}h</span>
                      </div>
                    </div>

                    {/* Resolution Rate bar */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-slate-500">Resolution Rate</span>
                        <span className="text-xs font-semibold text-emerald-600">{(mockStats as any).resolutionRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(mockStats as any).resolutionRate}%`,
                            backgroundColor: '#824ef2',
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* View Details link for Sales & Support */}
                {(isSales || isSupport) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetailsModal(true);
                      }}
                      className="text-sm font-medium transition-colors"
                      style={{ color: '#824ef2' }}
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateUser}
        submitting={submitting}
      />

      {/* User Details / Performance Modal */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onViewSchools={() => {
          setShowDetailsModal(false);
          setShowSchoolsModal(true);
        }}
      />

      {/* Schools Onboarded Modal */}
      <SchoolsOnboardedModal
        isOpen={showSchoolsModal}
        onClose={() => {
          setShowSchoolsModal(false);
          setSelectedUser(null);
        }}
        userName={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
      />
    </div>
  );
}
