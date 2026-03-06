'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Search,
  X,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { CreateSchoolModal } from '../../../components/modals/create-school-modal';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import {
  PlatformStatCard,
  StatusBadge,
  SchoolViewModal,
} from '../../../components/platform';

const ITEMS_PER_PAGE = 6;

type TabKey = 'all' | 'active' | 'inactive' | 'pending' | 'overdue' | 'blocked';

const STATUS_TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All Schools' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'pending', label: 'Pending' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'blocked', label: 'Blocked' },
];

export default function SchoolsPage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [banner, setBanner] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canCreateSchools = hasPermission(user?.roles, 'canCreateSchools');

  useEffect(() => {
    fetchSchools();
  }, [searchQuery]);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      const data = await schoolService.getSchools(filters);
      setSchools(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
      setError('Failed to load schools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  // Filter schools by active tab
  const filteredSchools = useMemo(() => {
    let filtered = schools;
    switch (activeTab) {
      case 'active':
        filtered = schools.filter(s => s.subscriptionStatus === 'active' && s.isActive);
        break;
      case 'inactive':
        filtered = schools.filter(s => s.subscriptionStatus === 'cancelled' || (!s.isActive && s.subscriptionStatus !== 'trial' && s.subscriptionStatus !== 'suspended'));
        break;
      case 'pending':
        filtered = schools.filter(s => s.subscriptionStatus === 'trial');
        break;
      case 'overdue':
        filtered = schools.filter(s => s.outstandingBalance > 0);
        break;
      case 'blocked':
        filtered = schools.filter(s => s.subscriptionStatus === 'suspended');
        break;
    }
    return filtered;
  }, [schools, activeTab]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    all: schools.length,
    active: schools.filter(s => s.subscriptionStatus === 'active' && s.isActive).length,
    inactive: schools.filter(s => s.subscriptionStatus === 'cancelled' || (!s.isActive && s.subscriptionStatus !== 'trial' && s.subscriptionStatus !== 'suspended')).length,
    pending: schools.filter(s => s.subscriptionStatus === 'trial').length,
    overdue: schools.filter(s => s.outstandingBalance > 0).length,
    blocked: schools.filter(s => s.subscriptionStatus === 'suspended').length,
  }), [schools]);

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => ({
    totalSchools: schools.length,
    activeSchools: schools.filter(s => s.subscriptionStatus === 'active').length,
    pendingSchools: schools.filter(s => s.subscriptionStatus === 'trial' || !s.isActive).length,
    overdueSchools: schools.filter(s => s.outstandingBalance > 0).length,
  }), [schools]);

  // Modal actions
  const handleActivate = async (school: School) => {
    setActionLoading(true);
    try {
      await schoolService.updateSchool(school._id, {
        subscriptionStatus: 'active',
        isActive: true,
      });
      setBanner(`${school.schoolName} has been activated.`);
      setTimeout(() => setBanner(null), 3000);
      setSelectedSchool(null);
      await fetchSchools();
    } catch {
      alert('Failed to activate school.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (school: School) => {
    if (!confirm(`Are you sure you want to reject "${school.schoolName}"?`)) return;
    setActionLoading(true);
    try {
      await schoolService.updateSchool(school._id, {
        subscriptionStatus: 'suspended',
        isActive: false,
      });
      setBanner(`${school.schoolName} has been rejected.`);
      setTimeout(() => setBanner(null), 3000);
      setSelectedSchool(null);
      await fetchSchools();
    } catch {
      alert('Failed to reject school.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async (school: School) => {
    if (!confirm(`Are you sure you want to block "${school.schoolName}"?`)) return;
    setActionLoading(true);
    try {
      await schoolService.updateSchool(school._id, {
        subscriptionStatus: 'suspended',
        isActive: false,
      });
      setBanner(`${school.schoolName} has been blocked.`);
      setTimeout(() => setBanner(null), 3000);
      setSelectedSchool(null);
      await fetchSchools();
    } catch {
      alert('Failed to block school.');
    } finally {
      setActionLoading(false);
    }
  };

  const getLocation = (school: School) => {
    const parts = [school.city, school.state || school.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  const getPlanPrice = (plan: string) => {
    const prices: Record<string, string> = {
      premium: '$299/month',
      enterprise: '$499/month',
      standard: '$149/month',
      basic: '$99/month',
      free: 'Free',
    };
    return prices[plan] || '$149/month';
  };

  const getRevenue = (school: School) => {
    if (school.mrr > 0) return `$${school.mrr.toLocaleString()}`;
    if (school.totalRevenue > 0) return `$${school.totalRevenue.toLocaleString()}`;
    return '$0';
  };

  const getSchoolInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Schools Management</h1>
        <p className="text-slate-500 mt-1">View, manage, and monitor all registered schools</p>
      </div>

      {/* Success Banner */}
      {banner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {banner}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlatformStatCard
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
          label="Total Schools"
          value={stats.totalSchools}
        />
        <PlatformStatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
          label="Active Schools"
          value={stats.activeSchools}
        />
        <PlatformStatCard
          icon={<Clock className="w-5 h-5" />}
          color="orange"
          label="Pending Schools"
          value={stats.pendingSchools}
        />
        <PlatformStatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          label="Overdue Schools"
          value={stats.overdueSchools}
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Tabs + Search + Add Button */}
        <div className="px-5 pt-5 pb-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  style={activeTab === tab.key ? { backgroundColor: '#824ef2' } : undefined}
                >
                  {tab.label}{tabCounts[tab.key] > 0 ? ` (${tabCounts[tab.key]})` : ''}
                </button>
              ))}
            </div>

            {/* Search + Add */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search schools..."
                  className="h-10 w-52 border border-slate-200 rounded-lg pl-10 pr-10 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
              {canCreateSchools && (
                <button
                  onClick={() => {
                    setEditingSchool(null);
                    setShowCreateModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap"
                  style={{ backgroundColor: '#824ef2' }}
                >
                  <Plus className="w-4 h-4" />
                  Add School
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">School Name</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">Location</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">Users/Students</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">Revenue</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-500 uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#824ef2] border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-500">Loading schools...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedSchools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <span className="text-slate-500">
                      {schools.length === 0 ? 'No schools added yet.' : 'No schools found for this filter.'}
                    </span>
                  </td>
                </tr>
              ) : (
                paginatedSchools.map((school, index) => {
                  const totalUsers = (school.teacherCount || 0) + (school.staffCount || 0);
                  const students = school.studentCount || 0;
                  return (
                    <tr
                      key={school._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#824ef2' }}>
                            {getSchoolInitials(school.schoolName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{school.schoolName}</p>
                            <p className="text-xs text-slate-400 font-mono">
                              ID: SCH-{String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(3, '0')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {getLocation(school)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col items-start">
                          <StatusBadge value={school.subscriptionPlan} type="plan" />
                          {school.subscriptionPlan !== 'free' && (
                            <p className="text-xs text-slate-400 mt-0.5">{getPlanPrice(school.subscriptionPlan)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-900 font-medium">{totalUsers + students}</p>
                        <p className="text-xs text-slate-400">{students > 0 ? `${students} Students` : 'Students'}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {getRevenue(school)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge value={school.subscriptionStatus} type="status" showDot />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedSchool(school)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                          style={{ backgroundColor: '#824ef2' }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSchools.length > ITEMS_PER_PAGE && (
          <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm" style={{ color: '#824ef2' }}>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSchools.length)} of{' '}
              {filteredSchools.length} schools
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  style={currentPage === page ? { backgroundColor: '#824ef2' } : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* School View Modal (popup) */}
      <SchoolViewModal
        isOpen={selectedSchool !== null}
        onClose={() => setSelectedSchool(null)}
        school={selectedSchool}
        onActivate={handleActivate}
        onReject={handleReject}
        onBlock={handleBlock}
        actionLoading={actionLoading}
      />

      {/* Create/Edit School Modal (popup) */}
      <CreateSchoolModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSchool(null);
        }}
        onSuccess={() => {
          setBanner(editingSchool ? 'School updated successfully' : 'School created successfully');
          setTimeout(() => setBanner(null), 3000);
          fetchSchools();
        }}
        editingSchool={editingSchool}
      />
    </div>
  );
}
