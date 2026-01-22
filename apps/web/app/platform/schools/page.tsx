'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, X, Eye, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@repo/ui/button';
import { CreateSchoolModal } from '../../../components/modals/create-school-modal';
import { useAuth } from '../../../contexts/auth-context';
import { hasPermission } from '../../../lib/permissions';
import { schoolService, type School } from '../../../lib/services/superadmin/school.service';
import { GlassCard, AnimatedStatCard, Icon3D, SlideSheet, SheetSection, SheetDetailRow } from '../../../components/ui';

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
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      trial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trial' },
      suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspended' },
      cancelled: { bg: 'bg-gray-100/30', text: 'text-gray-700', label: 'Cancelled' },
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
      free: { bg: 'bg-gray-100/30', text: 'text-gray-700' },
      basic: { bg: 'bg-primary-100', text: 'text-primary-dark' },
      premium: { bg: 'bg-purple-100', text: 'text-purple-700' },
      enterprise: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    };
    const badge = badges[plan] || badges.free;
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${badge?.bg} ${badge?.text}`}>
        {plan.toUpperCase()}
      </span>
    );
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalSchools = schools.length;
    const activeSchools = schools.filter(s => s.subscriptionStatus === 'active').length;
    const totalStudents = schools.reduce((sum, s) => sum + (s.studentCount || 0), 0);
    const totalMRR = schools.reduce((sum, s) => sum + (s.mrr || 0), 0);

    return { totalSchools, activeSchools, totalStudents, totalMRR };
  }, [schools]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <section className="space-y-6">
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <GlassCard className="bg-green-50 border-green-200">
              <div className="text-green-800 px-4 py-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {banner}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="bg-red-50 border-red-200">
              <div className="text-red-800 px-4 py-3">{error}</div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Icon3D bgColor="bg-sky-500">
          <Building2 className="w-8 h-8" />
        </Icon3D>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Schools {!loading && `(${schools.length})`}
          </h2>
          <p className="text-gray-600 mt-1">Manage educational institutions</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <AnimatedStatCard
          title="Total Schools"
          value={stats.totalSchools.toString()}
          icon={<Building2 className="w-5 h-5 text-white" />}
          iconBgColor="bg-sky-500"
        />
        <AnimatedStatCard
          title="Active Schools"
          value={stats.activeSchools.toString()}
          icon={<Building2 className="w-5 h-5 text-white" />}
          iconBgColor="bg-green-500"
        />
        <AnimatedStatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          icon={<Building2 className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />
        <AnimatedStatCard
          title="Monthly Revenue"
          value={`$${stats.totalMRR.toLocaleString()}`}
          icon={<Building2 className="w-5 h-5 text-white" />}
          iconBgColor="bg-orange-500"
        />
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2">
              <motion.select
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 border border-gray-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white text-gray-900"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </motion.select>

              <motion.select
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="h-10 border border-gray-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white text-gray-900"
              >
                <option value="">All Plans</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </motion.select>

              <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    placeholder="Search schools..."
                    className="h-10 w-64 border border-gray-200 rounded-lg pl-9 pr-9 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white text-gray-900"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setSearchInput('');
                        setSearchQuery('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm" type="submit">
                    Search
                  </Button>
                </motion.div>
              </form>
            </div>

            {canCreateSchools && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" onClick={() => {
                  setEditingSchool(null);
                  setShowCreateModal(true);
                }}>
                  + Add School
                </Button>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* Schools Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">School Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Tenant ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold">Students</th>
                  <th className="px-4 py-3 text-left font-semibold">MRR</th>
                  <th className="px-4 py-3 text-left font-semibold">Admin</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"
                        />
                        <div className="text-gray-500">Loading schools...</div>
                      </div>
                    </td>
                  </tr>
                ) : filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-gray-500 space-y-3"
                      >
                        <Building2 className="w-16 h-16 text-gray-300" />
                        <div>{schools.length === 0 ? 'No schools added yet.' : 'No schools found.'}</div>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredSchools.map((school, index) => (
                      <motion.tr
                        key={school._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.6)', scale: 1.005 }}
                        className="border-t cursor-pointer transition-all duration-200 ease-in-out"
                        onClick={() => setSelectedSchool(school)}
                      >
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {school.schoolName}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                          {school.tenantId}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(school.subscriptionStatus)}
                        </td>
                        <td className="px-4 py-3">
                          {getPlanBadge(school.subscriptionPlan)}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {school.studentCount || 0}
                        </td>
                        <td className="px-4 py-3 text-gray-800 font-mono">
                          ${school.mrr?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {school.adminId ? `${school.adminId.firstName} ${school.adminId.lastName}` : 'Not assigned'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-3 text-gray-400">
                            <motion.button
                              whileHover={{ scale: 1.2, color: '#3b82f6' }}
                              whileTap={{ scale: 0.9 }}
                              title="View Details"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSchool(school);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            {canEditSchools && (
                              <motion.button
                                whileHover={{ scale: 1.2, color: '#3b82f6' }}
                                whileTap={{ scale: 0.9 }}
                                title="Edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSchool(school);
                                  setShowCreateModal(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </motion.button>
                            )}
                            {canDeleteSchools && (
                              <motion.button
                                whileHover={{ scale: 1.2, color: '#ef4444' }}
                                whileTap={{ scale: 0.9 }}
                                title="Delete"
                                onClick={(e) => handleDeleteSchool(school, e)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            )}
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

      {/* School Details SlideSheet */}
      <SlideSheet
        isOpen={selectedSchool !== null}
        onClose={() => setSelectedSchool(null)}
        title={selectedSchool ? selectedSchool.schoolName : ''}
        subtitle="School Details"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={() => setSelectedSchool(null)}>
                Close
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => {
                if (selectedSchool) {
                  setEditingSchool(selectedSchool);
                  setShowCreateModal(true);
                  setSelectedSchool(null);
                }
              }}>
                Edit School
              </Button>
            </motion.div>
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
                <div className="py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedSchool.subscriptionStatus)}</div>
                </div>
                <div className="py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Plan</span>
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
                <p className="text-sm text-gray-900">{selectedSchool.notes}</p>
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
    </section>
  );
}
