'use client';

import { useState, useMemo, useEffect } from 'react';
import { Building2, Search, X, Eye, Edit2, Trash2, Plus, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { CreateSchoolModal } from '../../../components/modals/create-school-modal';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import { SlideSheet, SheetSection, SheetDetailRow } from '../../../components/ui';

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
      active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
      trial: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Trial' },
      suspended: { bg: 'bg-red-50', text: 'text-red-700', label: 'Suspended' },
      cancelled: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Cancelled' },
    };
    const badge = badges[status] || badges.trial;
    return (
      <span className={`text-xs px-2 py-1 rounded-md font-medium ${badge?.bg} ${badge?.text}`}>
        {badge?.label}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      free: { bg: 'bg-slate-100', text: 'text-slate-600' },
      basic: { bg: 'bg-blue-50', text: 'text-blue-700' },
      premium: { bg: 'bg-purple-50', text: 'text-purple-700' },
      enterprise: { bg: 'bg-amber-50', text: 'text-amber-700' },
    };
    const badge = badges[plan] || badges.free;
    return (
      <span className={`text-xs px-2 py-1 rounded-md font-medium ${badge?.bg} ${badge?.text}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  const stats = useMemo(() => {
    const totalSchools = schools.length;
    const activeSchools = schools.filter(s => s.subscriptionStatus === 'active').length;
    const totalStudents = schools.reduce((sum, s) => sum + (s.studentCount || 0), 0);
    const totalMRR = schools.reduce((sum, s) => sum + (s.mrr || 0), 0);

    return { totalSchools, activeSchools, totalStudents, totalMRR };
  }, [schools]);

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {banner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {banner}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Schools</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.totalSchools}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Schools</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.activeSchools}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Monthly Revenue</p>
              <p className="text-2xl font-semibold text-slate-900">${stats.totalMRR.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search schools..."
                  className="h-10 w-64 border border-slate-200 rounded-lg pl-10 pr-10 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      setSearchInput('');
                      setSearchQuery('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button size="sm" type="submit">Search</Button>
            </form>
          </div>

          {canCreateSchools && (
            <Button
              onClick={() => {
                setEditingSchool(null);
                setShowCreateModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add School
            </Button>
          )}
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">School Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Tenant ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Students</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">MRR</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Admin</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-500">Loading schools...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Building2 className="w-12 h-12 text-slate-300" />
                      <span>{schools.length === 0 ? 'No schools added yet.' : 'No schools found.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr
                    key={school._id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedSchool(school)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {school.schoolName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                      {school.tenantId}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(school.subscriptionStatus)}
                    </td>
                    <td className="px-4 py-3">
                      {getPlanBadge(school.subscriptionPlan)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {school.studentCount || 0}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-mono">
                      ${school.mrr?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {school.adminId ? `${school.adminId.firstName} ${school.adminId.lastName}` : 'Not assigned'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          title="View Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSchool(school);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEditSchools && (
                          <button
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSchool(school);
                              setShowCreateModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDeleteSchools && (
                          <button
                            title="Delete"
                            onClick={(e) => handleDeleteSchool(school, e)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* School Details SlideSheet */}
      <SlideSheet
        isOpen={selectedSchool !== null}
        onClose={() => setSelectedSchool(null)}
        title={selectedSchool ? selectedSchool.schoolName : ''}
        subtitle="School Details"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedSchool(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedSchool) {
                setEditingSchool(selectedSchool);
                setShowCreateModal(true);
                setSelectedSchool(null);
              }
            }}>
              Edit School
            </Button>
          </div>
        }
      >
        {selectedSchool && (
          <>
            <SheetSection title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <SheetDetailRow label="School Name" value={selectedSchool.schoolName} />
                <SheetDetailRow label="Tenant ID" value={selectedSchool.tenantId} valueClassName="font-mono text-xs" />
              </div>
            </SheetSection>

            <SheetSection title="Subscription">
              <div className="grid grid-cols-2 gap-4">
                <div className="py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedSchool.subscriptionStatus)}</div>
                </div>
                <div className="py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Plan</span>
                  <div className="mt-1">{getPlanBadge(selectedSchool.subscriptionPlan)}</div>
                </div>
              </div>
            </SheetSection>

            <SheetSection title="Statistics">
              <div className="grid grid-cols-3 gap-4">
                <SheetDetailRow label="Students" value={(selectedSchool.studentCount || 0).toString()} />
                <SheetDetailRow label="Teachers" value={(selectedSchool.teacherCount || 0).toString()} />
                <SheetDetailRow label="Staff" value={(selectedSchool.staffCount || 0).toString()} />
              </div>
            </SheetSection>

            <SheetSection title="Revenue">
              <div className="grid grid-cols-2 gap-4">
                <SheetDetailRow label="MRR" value={`$${selectedSchool.mrr?.toFixed(2) || '0.00'}/month`} />
                <SheetDetailRow label="ARR" value={`$${selectedSchool.arr?.toFixed(2) || '0.00'}/year`} />
              </div>
            </SheetSection>

            <SheetSection title="Contact Information">
              <SheetDetailRow label="Contact Email" value={selectedSchool.contactEmail} />
              {selectedSchool.contactPhone && (
                <SheetDetailRow label="Contact Phone" value={selectedSchool.contactPhone} />
              )}
              {selectedSchool.address && (
                <SheetDetailRow
                  label="Address"
                  value={`${selectedSchool.address}${selectedSchool.city ? `, ${selectedSchool.city}` : ''}${selectedSchool.state ? `, ${selectedSchool.state}` : ''}${selectedSchool.postalCode ? ` ${selectedSchool.postalCode}` : ''}`}
                />
              )}
            </SheetSection>

            {selectedSchool.adminId && (
              <SheetSection title="Administrator">
                <SheetDetailRow
                  label="Admin"
                  value={`${selectedSchool.adminId.firstName} ${selectedSchool.adminId.lastName} (${selectedSchool.adminId.email})`}
                />
              </SheetSection>
            )}

            {selectedSchool.notes && (
              <SheetSection title="Notes">
                <p className="text-sm text-slate-700">{selectedSchool.notes}</p>
              </SheetSection>
            )}
          </>
        )}
      </SlideSheet>

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
    </div>
  );
}
