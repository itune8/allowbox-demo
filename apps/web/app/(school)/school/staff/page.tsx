'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { userService, type User } from '../../../../lib/services/user.service';
import { CreateUserModal, type UserFormData } from '../../../../components/modals/create-user-modal';
import { AssignTeacherModal } from '../../../../components/modals/assign-teacher-modal';
import { GlassCard, AnimatedStatCard } from '../../../../components/ui';
import {
  UserPlus,
  Users,
  Trash2,
  Plus,
  X,
  GraduationCap,
  Shield,
  Calculator,
  Filter,
} from 'lucide-react';

// 3D Icon wrapper component
const Icon3D = ({ children, gradient, size = 'md' }: { children: React.ReactNode; gradient: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
      style={{ boxShadow: `0 4px 14px 0 rgba(99, 102, 241, 0.3)` }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
      <div className="relative text-white">{children}</div>
    </motion.div>
  );
};

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showStaffModal, setShowStaffModal] = useState<User | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [assignTeacher, setAssignTeacher] = useState<User | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await userService.getUsers();
      const staffList = allUsers.filter(
        u => u.role === 'teacher' || u.role === 'tenant_admin' || u.role === 'accountant'
      );
      setStaff(staffList);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      setError('Failed to load staff. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    if (!roleFilter) return staff;
    return staff.filter(s => {
      if (roleFilter === 'teacher') return s.role === 'teacher';
      if (roleFilter === 'tenant_admin') return s.role === 'tenant_admin';
      if (roleFilter === 'accountant') return s.role === 'accountant';
      return true;
    });
  }, [staff, roleFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = staff.length;
    const teachers = staff.filter(s => s.role === 'teacher').length;
    const admins = staff.filter(s => s.role === 'tenant_admin').length;
    const accountants = staff.filter(s => s.role === 'accountant').length;
    return { total, teachers, admins, accountants };
  }, [staff]);

  const handleCreateStaff = async (userData: UserFormData) => {
    try {
      await userService.createUser(userData);
      setBanner('Staff member created successfully!');
      setTimeout(() => setBanner(null), 3000);
      setIsStaffModalOpen(false);
      await fetchStaff();
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  };

  const handleDeleteStaff = async (staffId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await userService.deleteUser(staffId);
      setStaff(prev => prev.filter(s => s.id !== staffId));
      setBanner('Staff member deleted successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to delete staff:', err);
      alert('Failed to delete staff member. Please try again.');
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'teacher': return 'Teacher';
      case 'tenant_admin': return 'Admin';
      case 'accountant': return 'Accountant';
      default: return role;
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'teacher': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tenant_admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'accountant': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'teacher': return 'from-blue-500 to-cyan-500';
      case 'tenant_admin': return 'from-purple-500 to-violet-500';
      case 'accountant': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-strong rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">{banner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-emerald-500 to-teal-500" size="lg">
            <UserPlus className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff & Teachers</h1>
            <p className="text-sm text-gray-500">Manage your school staff members</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => setIsStaffModalOpen(true)} className="shadow-lg shadow-indigo-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Staff"
          value={stats.total}
          icon={<Users className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-500"
          delay={0}
        />
        <AnimatedStatCard
          title="Teachers"
          value={stats.teachers}
          icon={<GraduationCap className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Admins"
          value={stats.admins}
          icon={<Shield className="w-5 h-5" />}
          gradient="from-purple-500 to-violet-500"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Accountants"
          value={stats.accountants}
          icon={<Calculator className="w-5 h-5" />}
          gradient="from-green-500 to-emerald-500"
          delay={0.3}
        />
      </div>

      {/* Filter */}
      <GlassCard hover={false} className="p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Filter by role:</span>
          <div className="flex gap-2">
            {[
              { value: '', label: 'All' },
              { value: 'teacher', label: 'Teachers' },
              { value: 'tenant_admin', label: 'Admins' },
              { value: 'accountant', label: 'Accountants' },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRoleFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  roleFilter === option.value
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Staff List */}
      <GlassCard hover={false} className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-gray-500">Loading staff...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Users className="w-16 h-16 mx-auto text-gray-300" />
            </motion.div>
            <p>{staff.length === 0 ? 'No staff members added yet' : 'No staff found with selected filter'}</p>
            <Button onClick={() => setIsStaffModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredStaff.map((member, index) => (
              <motion.li
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                className="p-4 flex items-center justify-between cursor-pointer group transition-all"
                onClick={() => setShowStaffModal(member)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleGradient(member.role)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {member.firstName?.charAt(0) || 'U'}
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold group-hover:text-indigo-600 transition-colors">
                      {member.firstName} {member.lastName}
                    </span>
                    {member.email && (
                      <span className="text-sm text-gray-500">{member.email}</span>
                    )}
                    {member.employeeId && (
                      <span className="text-xs text-gray-400 font-mono">{member.employeeId}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getRoleBadgeStyles(member.role)}`}>
                    {getRoleDisplay(member.role)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {member.role === 'teacher' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Assign Classes & Subjects"
                        className="p-2 rounded-lg hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignTeacher(member);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete"
                      className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                      onClick={(e) => handleDeleteStaff(member.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </GlassCard>

      {/* Staff details modal */}
      <AnimatePresence>
        {showStaffModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowStaffModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <button
                onClick={() => setShowStaffModal(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRoleGradient(showStaffModal.role)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {showStaffModal.firstName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {showStaffModal.firstName} {showStaffModal.lastName}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold mt-1 border ${getRoleBadgeStyles(showStaffModal.role)}`}>
                    {getRoleDisplay(showStaffModal.role)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: 'Employee ID', value: showStaffModal.employeeId || 'N/A' },
                  { label: 'Email', value: showStaffModal.email },
                  { label: 'Phone', value: showStaffModal.phoneNumber || 'N/A' },
                  { label: 'Qualification', value: showStaffModal.qualification || 'N/A' },
                  { label: 'Joining Date', value: showStaffModal.joiningDate ? new Date(showStaffModal.joiningDate).toLocaleDateString() : 'N/A' },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </motion.div>
                ))}

                {showStaffModal.role === 'teacher' && showStaffModal.subjects && showStaffModal.subjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="pt-3"
                  >
                    <span className="text-gray-500 text-sm">Assigned Subjects</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {showStaffModal.subjects.map((subject: any) => (
                        <span
                          key={subject._id || subject}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100"
                        >
                          {subject.name || subject}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {showStaffModal.role === 'teacher' && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStaffModal(null);
                      setAssignTeacher(showStaffModal);
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Classes & Subjects
                  </Button>
                </div>
              )}

              <div className="mt-4 text-right">
                <Button variant="outline" onClick={() => setShowStaffModal(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create staff modal */}
      <CreateUserModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleCreateStaff}
      />

      {/* Assign teacher modal */}
      {assignTeacher && (
        <AssignTeacherModal
          isOpen={true}
          onClose={() => setAssignTeacher(null)}
          teacher={assignTeacher}
          onSuccess={() => {
            setBanner('Teacher assignments saved successfully!');
            setTimeout(() => setBanner(null), 3000);
            setAssignTeacher(null);
            fetchStaff();
          }}
        />
      )}
    </motion.section>
  );
}
