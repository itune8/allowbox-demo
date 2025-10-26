'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Portal } from '../../../components/portal';
import { CreateSchoolModal } from '../../../components/modals/create-school-modal';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';

export default function SchoolsPage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [banner, setBanner] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  // Check permissions
  const canCreateSchools = hasPermission(user?.roles, 'canCreateSchools');
  const canEditSchools = hasPermission(user?.roles, 'canEditSchools');
  const canDeleteSchools = hasPermission(user?.roles, 'canDeleteSchools');

  useEffect(() => {
    fetchSchools();
  }, [statusFilter, planFilter, searchQuery]);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (planFilter) filters.plan = planFilter;
      if (searchQuery) filters.search = searchQuery;

      const data = await schoolService.getSchools(filters);
      setSchools(data);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
      setError('Failed to load schools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = useMemo(() => schools, [schools]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleDeleteSchool = async (school: School, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${school.schoolName}?`)) return;

    try {
      await schoolService.deleteSchool(school._id);
      setBanner(`School deleted successfully`);
      setTimeout(() => setBanner(null), 3000);
      await fetchSchools();
    } catch (err: any) {
      console.error('Failed to delete school:', err);
      alert(err.response?.data?.message || 'Failed to delete school. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Active' },
      trial: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Trial' },
      suspended: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Suspended' },
      cancelled: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: 'Cancelled' },
    };
    const badge = badges[status] || badges.trial;
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      free: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300' },
      basic: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
      premium: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
      enterprise: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
    };
    const badge = badges[plan] || badges.free;
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge?.bg} ${badge?.text}`}>
        {plan.toUpperCase()}
      </span>
    );
  };

  return (
    <section className="animate-slide-in-right">
      {banner && (
        <div className="mb-4 animate-fade-in">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {banner}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Schools {!loading && `(${schools.length})`}
        </h2>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-10 border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <form onSubmit={handleSearch} className="relative flex items-center gap-2">
            <input
              placeholder="Search schools..."
              className="h-10 w-64 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-9 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <span className="absolute left-3 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            {searchInput && (
              <button
                type="button"
                className="absolute right-2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                }}
              >
                ×
              </button>
            )}
            <Button size="sm" type="submit">
              Search
            </Button>
          </form>

          {canCreateSchools && (
            <Button size="sm" onClick={() => {
              setEditingSchool(null);
              setShowCreateModal(true);
            }}>
              + Add School
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fadeIn">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">School Name</th>
              <th className="px-4 py-3 text-left">Tenant ID</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Students</th>
              <th className="px-4 py-3 text-left">MRR</th>
              <th className="px-4 py-3 text-left">Admin</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    <div className="text-gray-500">Loading schools...</div>
                  </div>
                </td>
              </tr>
            ) : filteredSchools.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10">
                  <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                    <div className="text-5xl">🏫</div>
                    <div>{schools.length === 0 ? 'No schools added yet.' : 'No schools found.'}</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSchools.map((school) => (
                <tr
                  key={school._id}
                  className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-all duration-200 ease-in-out"
                  onClick={() => setSelectedSchool(school)}
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                    {school.schoolName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                    {school.tenantId}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(school.subscriptionStatus)}
                  </td>
                  <td className="px-4 py-3">
                    {getPlanBadge(school.subscriptionPlan)}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {school.studentCount || 0}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-mono">
                    ${school.mrr?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                    {school.adminId ? `${school.adminId.firstName} ${school.adminId.lastName}` : 'Not assigned'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-3 text-gray-400">
                      <button
                        title="View Details"
                        className="hover:text-indigo-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchool(school);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      {canEditSchools && (
                        <button
                          title="Edit"
                          className="hover:text-indigo-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSchool(school);
                            setShowCreateModal(true);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}
                      {canDeleteSchools && (
                        <button
                          title="Delete"
                          className="hover:text-red-500"
                          onClick={(e) => handleDeleteSchool(school, e)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* School Details Modal */}
      {selectedSchool && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedSchool(null)}>
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl p-6 animate-zoom-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">School Details</h3>
              <button
                onClick={() => setSelectedSchool(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">School Name</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedSchool.schoolName}</p>
                </div>
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Tenant ID</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1 font-mono text-xs">{selectedSchool.tenantId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedSchool.subscriptionStatus)}</div>
                </div>
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Plan</span>
                  <div className="mt-1">{getPlanBadge(selectedSchool.subscriptionPlan)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Students</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedSchool.studentCount || 0}</p>
                </div>
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Teachers</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedSchool.teacherCount || 0}</p>
                </div>
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Staff</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedSchool.staffCount || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">MRR</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">${selectedSchool.mrr?.toFixed(2) || '0.00'}/month</p>
                </div>
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">ARR</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">${selectedSchool.arr?.toFixed(2) || '0.00'}/year</p>
                </div>
              </div>

              <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Contact Email</span>
                <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedSchool.contactEmail}</p>
              </div>

              {selectedSchool.contactPhone && (
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Contact Phone</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedSchool.contactPhone}</p>
                </div>
              )}

              {selectedSchool.address && (
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Address</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {selectedSchool.address}
                    {selectedSchool.city && `, ${selectedSchool.city}`}
                    {selectedSchool.state && `, ${selectedSchool.state}`}
                    {selectedSchool.postalCode && ` ${selectedSchool.postalCode}`}
                  </p>
                </div>
              )}

              {selectedSchool.adminId && (
                <div className="py-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Admin</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {selectedSchool.adminId.firstName} {selectedSchool.adminId.lastName}
                    <span className="text-gray-500 text-xs ml-2">({selectedSchool.adminId.email})</span>
                  </p>
                </div>
              )}

              {selectedSchool.notes && (
                <div className="py-2">
                  <span className="text-gray-600 dark:text-gray-400">Notes</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mt-1">{selectedSchool.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedSchool(null)}>
                Close
              </Button>
              <Button onClick={() => {
                setEditingSchool(selectedSchool);
                setShowCreateModal(true);
                setSelectedSchool(null);
              }}>
                Edit School
              </Button>
            </div>
          </div>
          </div>
        </Portal>
      )}

      {/* Create/Edit School Modal */}
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
    </section>
  );
}
