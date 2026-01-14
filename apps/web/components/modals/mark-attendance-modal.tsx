'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { attendanceService, type AttendanceStatus } from '@/lib/services/attendance.service';
import { userService, type User as UserType } from '@/lib/services/user.service';
import { Portal } from '../portal';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  X,
  Loader2,
  Search,
  MessageSquare,
  User,
  Hash,
} from 'lucide-react';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  section?: string;
  onSuccess?: () => void;
}

interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  status: AttendanceStatus;
  remarks?: string;
}

// 3D Icon wrapper component
const Icon3D = ({ children, gradient, size = 'md' }: { children: React.ReactNode; gradient: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 5 }}
      className={`relative ${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
      style={{ boxShadow: `0 8px 24px -4px rgba(99, 102, 241, 0.3)` }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
      <div className="relative text-white">{children}</div>
    </motion.div>
  );
};

// Enhanced Input component
const FormInput = ({
  icon: IconComponent,
  label,
  required,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  delay?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
          hover:border-gray-300 transition-all duration-200
          placeholder:text-gray-400`}
      />
    </div>
  </motion.div>
);

// Status Button Component
const StatusButton = ({
  status,
  currentStatus,
  onClick,
  icon: IconComponent,
  label,
  colorClass,
}: {
  status: AttendanceStatus;
  currentStatus: AttendanceStatus;
  onClick: () => void;
  icon: any;
  label: string;
  colorClass: string;
}) => {
  const isActive = currentStatus === status;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? `${colorClass} text-white shadow-lg`
          : `bg-gray-100 text-gray-600 hover:bg-gray-200`
      }`}
    >
      <IconComponent className="w-4 h-4" />
      {label}
    </motion.button>
  );
};

// Summary Card Component
const SummaryCard = ({
  icon: IconComponent,
  label,
  count,
  colorClass,
  delay,
}: {
  icon: any;
  label: string;
  count: number;
  colorClass: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 300 }}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm`}
  >
    <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
      <IconComponent className="w-4 h-4 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{count}</p>
    </div>
  </motion.div>
);

export function MarkAttendanceModal({ isOpen, onClose, classId, section, onSuccess }: MarkAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] ?? '');
  const [period, setPeriod] = useState<number | undefined>(undefined);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && classId) {
      fetchStudents();
    }
  }, [isOpen, classId, section]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    setError('');
    try {
      const allUsers = await userService.getUsers();
      // Filter students by class and section
      const classStudents = allUsers.filter(
        user => user.role === 'student' && user.classId === classId && (!section || user.section === section)
      );

      setStudents(
        classStudents.map(student => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentIdNumber: student.studentId || '',
          status: 'present' as AttendanceStatus,
          remarks: '',
        }))
      );
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents(prev =>
      prev.map(s => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudents(prev =>
      prev.map(s => (s.studentId === studentId ? { ...s, remarks } : s))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await attendanceService.bulkMarkAttendance({
        classId,
        section,
        date: date + (period ? `|${period}` : ''),
        period,
        attendanceRecords: students.map(s => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks,
        })),
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const statusCounts = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    excused: students.filter(s => s.status === 'excused').length,
  };

  const filteredStudents = students.filter(
    s =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9999] overflow-y-auto pt-10 pb-10"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-5 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    >
                      <ClipboardCheck className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white"
                      >
                        Mark Attendance
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-sm"
                      >
                        {section ? `Section ${section}` : 'All Sections'}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl"
                    >
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="w-3 h-3 text-red-600" />
                        </span>
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Section: Date and Period */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                      <Calendar className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Date & Period</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                    <FormInput
                      icon={Calendar}
                      label="Date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      delay={0.1}
                    />
                    <FormInput
                      icon={Clock}
                      label="Period (Optional)"
                      type="number"
                      value={period || ''}
                      onChange={(e) => setPeriod(e.target.value ? parseInt(e.target.value) : undefined)}
                      min={1}
                      max={10}
                      placeholder="Leave empty for full day"
                      delay={0.15}
                    />
                  </div>
                </motion.div>

                {/* Section: Quick Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-purple-500 to-pink-500" size="sm">
                      <Users className="w-4 h-4" />
                    </Icon3D>
                    <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="pl-10 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600 mr-2 flex items-center">Mark all as:</span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMarkAll('present')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Present
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMarkAll('absent')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Absent
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMarkAll('late')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Late
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMarkAll('excused')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                    >
                      <Shield className="w-4 h-4" />
                      Excused
                    </motion.button>
                  </div>
                </motion.div>

                {/* Summary Cards */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <SummaryCard
                      icon={Users}
                      label="Total"
                      count={students.length}
                      colorClass="bg-gradient-to-br from-gray-500 to-slate-600"
                      delay={0.1}
                    />
                    <SummaryCard
                      icon={CheckCircle2}
                      label="Present"
                      count={statusCounts.present}
                      colorClass="bg-gradient-to-br from-emerald-500 to-green-600"
                      delay={0.15}
                    />
                    <SummaryCard
                      icon={XCircle}
                      label="Absent"
                      count={statusCounts.absent}
                      colorClass="bg-gradient-to-br from-red-500 to-rose-600"
                      delay={0.2}
                    />
                    <SummaryCard
                      icon={AlertCircle}
                      label="Late"
                      count={statusCounts.late}
                      colorClass="bg-gradient-to-br from-amber-500 to-yellow-600"
                      delay={0.25}
                    />
                    <SummaryCard
                      icon={Shield}
                      label="Excused"
                      count={statusCounts.excused}
                      colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
                      delay={0.3}
                    />
                  </div>
                </motion.div>

                {/* Search Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mb-4"
                >
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search students by name or ID..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                        hover:border-gray-300 transition-all duration-200
                        placeholder:text-gray-400"
                    />
                  </div>
                </motion.div>

                {/* Students List */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {loadingStudents ? (
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 mx-auto mb-4"
                      >
                        <Loader2 className="w-12 h-12 text-indigo-500" />
                      </motion.div>
                      <p className="text-gray-500">Loading students...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200"
                    >
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No students found in this class/section</p>
                    </motion.div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Student
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Status
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Remarks
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <AnimatePresence>
                            {filteredStudents.map((student, index) => (
                              <motion.tr
                                key={student.studentId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.03 }}
                                className="hover:bg-gray-50/80 transition-colors"
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-indigo-500/20">
                                      {student.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                                      <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Hash className="w-3 h-3" />
                                        {student.studentIdNumber || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    <StatusButton
                                      status="present"
                                      currentStatus={student.status}
                                      onClick={() => handleStatusChange(student.studentId, 'present')}
                                      icon={CheckCircle2}
                                      label="Present"
                                      colorClass="bg-gradient-to-r from-emerald-500 to-green-500"
                                    />
                                    <StatusButton
                                      status="absent"
                                      currentStatus={student.status}
                                      onClick={() => handleStatusChange(student.studentId, 'absent')}
                                      icon={XCircle}
                                      label="Absent"
                                      colorClass="bg-gradient-to-r from-red-500 to-rose-500"
                                    />
                                    <StatusButton
                                      status="late"
                                      currentStatus={student.status}
                                      onClick={() => handleStatusChange(student.studentId, 'late')}
                                      icon={AlertCircle}
                                      label="Late"
                                      colorClass="bg-gradient-to-r from-amber-500 to-yellow-500"
                                    />
                                    <StatusButton
                                      status="excused"
                                      currentStatus={student.status}
                                      onClick={() => handleStatusChange(student.studentId, 'excused')}
                                      icon={Shield}
                                      label="Excused"
                                      colorClass="bg-gradient-to-r from-blue-500 to-indigo-500"
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="relative group">
                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </div>
                                    <input
                                      type="text"
                                      value={student.remarks || ''}
                                      onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                                      placeholder="Optional remarks"
                                      className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white/80 backdrop-blur-sm
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                                        hover:border-gray-300 transition-all duration-200
                                        placeholder:text-gray-400"
                                    />
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      onClick={onClose}
                      variant="outline"
                      disabled={loading}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={loading || students.length === 0}
                      className="px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4" />
                          Mark Attendance ({students.length})
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
