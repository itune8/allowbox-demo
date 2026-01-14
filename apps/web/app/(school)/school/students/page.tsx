'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { userService, type User } from '../../../../lib/services/user.service';
import { CreateStudentModal, type StudentFormData } from '../../../../components/modals/create-student-modal';
import { LinkParentModal } from '../../../../components/modals/link-parent-modal';
import { Portal } from '../../../../components/portal';
import { GlassCard, AnimatedStatCard } from '../../../../components/ui';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Link2,
  Lock,
  Unlock,
  GraduationCap,
  X,
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

export default function StudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState<User | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [linkParentModalOpen, setLinkParentModalOpen] = useState(false);
  const [studentToLink, setStudentToLink] = useState<User | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await userService.getUsers();
      const studentList = allUsers.filter(u => u.role === 'student');
      setStudents(studentList);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const className = s.classId?.toString() || '';
      const section = s.section || '';
      const studentId = s.studentId || '';
      return (
        fullName.includes(q) ||
        className.includes(q) ||
        section.includes(q) ||
        studentId.toLowerCase().includes(q)
      );
    });
  }, [students, studentQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => !s.isBlocked).length;
    const blocked = students.filter(s => s.isBlocked).length;
    const withClass = students.filter(s => s.classId).length;
    return { total, active, blocked, withClass };
  }, [students]);

  const handleCreateStudent = async (studentData: StudentFormData) => {
    try {
      if (editingStudent) {
        await userService.updateUser(editingStudent.id, {
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender,
          bloodGroup: studentData.bloodGroup,
          address: studentData.address,
          phoneNumber: studentData.phoneNumber,
          parentEmail: studentData.parentEmail,
          parentPhone: studentData.parentPhone,
          studentId: studentData.studentId,
          classId: studentData.classId,
          section: studentData.section,
        });
        setBanner('Student updated successfully!');
      } else {
        await userService.createUser({
          email: studentData.email || `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}@school.com`,
          password: 'student123',
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          role: 'student',
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender,
          bloodGroup: studentData.bloodGroup,
          address: studentData.address,
          phoneNumber: studentData.phoneNumber,
          parentEmail: studentData.parentEmail,
          parentPhone: studentData.parentPhone,
          studentId: studentData.studentId,
          classId: studentData.classId,
          section: studentData.section,
        });
        setBanner('Student created successfully!');
      }
      setTimeout(() => setBanner(null), 3000);
      setIsStudentModalOpen(false);
      setEditingStudent(null);
      await fetchStudents();
    } catch (error) {
      console.error('Failed to save student:', error);
      throw error;
    }
  };

  const handleEditStudent = (student: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await userService.deleteUser(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setBanner('Student deleted successfully');
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Failed to delete student. Please try again.');
    }
  };

  const getAge = (dateOfBirth?: Date | string) => {
    if (!dateOfBirth) return 'N/A';
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleLinkParent = (student: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentToLink(student);
    setLinkParentModalOpen(true);
  };

  const handleLinkSuccess = async () => {
    setBanner('Parent linked successfully!');
    setTimeout(() => setBanner(null), 3000);
    await fetchStudents();
  };

  const handleBlockUser = async (student: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to block ${student.firstName} ${student.lastName}?`)) return;

    try {
      await userService.blockUser(student.id);
      setBanner(`Student blocked successfully`);
      setTimeout(() => setBanner(null), 3000);
      await fetchStudents();
    } catch (err: any) {
      console.error('Failed to block student:', err);
      alert(err.response?.data?.message || 'Failed to block student.');
    }
  };

  const handleUnblockUser = async (student: User, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await userService.unblockUser(student.id);
      setBanner(`Student unblocked successfully`);
      setTimeout(() => setBanner(null), 3000);
      await fetchStudents();
    } catch (err: any) {
      console.error('Failed to unblock student:', err);
      alert('Failed to unblock student.');
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
          <Icon3D gradient="from-blue-500 to-cyan-500" size="lg">
            <Users className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-500">Manage your student records</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => setIsStudentModalOpen(true)} className="shadow-lg shadow-indigo-500/25">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Students"
          value={stats.total}
          icon={<Users className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-500"
          delay={0}
        />
        <AnimatedStatCard
          title="Active"
          value={stats.active}
          icon={<GraduationCap className="w-5 h-5" />}
          gradient="from-emerald-500 to-teal-500"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Blocked"
          value={stats.blocked}
          icon={<Lock className="w-5 h-5" />}
          gradient="from-red-500 to-rose-500"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Enrolled"
          value={stats.withClass}
          icon={<GraduationCap className="w-5 h-5" />}
          gradient="from-violet-500 to-purple-500"
          delay={0.3}
        />
      </div>

      {/* Search */}
      <GlassCard hover={false} className="p-4">
        <form
          className="flex flex-col md:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setStudentQuery(studentSearch);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Search by name, ID, class or section..."
              className="w-full h-11 pl-10 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 bg-white/80 backdrop-blur-sm transition-all"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            {studentSearch && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => {
                  setStudentSearch('');
                  setStudentQuery('');
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="outline">
              Search
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Students Table */}
      <GlassCard hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm hidden md:table">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
              <tr>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Student ID</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Class/Section</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Age</th>
                <th className="px-4 py-4 text-left font-semibold text-gray-700">Contact</th>
                <th className="px-4 py-4 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full"
                    />
                    <p className="mt-4 text-gray-500">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-6xl"
                      >
                        <GraduationCap className="w-16 h-16 text-gray-300" />
                      </motion.div>
                      <p>{students.length === 0 ? 'No students added yet.' : 'No students found.'}</p>
                      <Button onClick={() => setIsStudentModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Student
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                    className="cursor-pointer group transition-all"
                    onClick={() => setShowStudentModal(student)}
                  >
                    <td className="px-4 py-4 text-gray-600 font-mono text-xs">
                      {student.studentId || 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-indigo-500/20">
                          {student.firstName?.charAt(0)}
                        </div>
                        <span className="text-gray-900 font-medium group-hover:text-indigo-600 transition-colors">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {student.classId ? (
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                          Class {(student.classId as any)?.grade || 'N/A'}
                          {student.section && ` - ${student.section}`}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {getAge(student.dateOfBirth)}
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-xs">
                      {student.email || student.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {student.isBlocked ? (
                          <>
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg font-medium mr-2">
                              Blocked
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Unblock User"
                              className="p-2 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 transition-all"
                              onClick={(e) => handleUnblockUser(student, e)}
                            >
                              <Unlock className="w-4 h-4" />
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Block User"
                            className="p-2 rounded-lg hover:bg-orange-100 text-gray-400 hover:text-orange-600 transition-all"
                            onClick={(e) => handleBlockUser(student, e)}
                          >
                            <Lock className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="View Details"
                          className="p-2 rounded-lg hover:bg-indigo-100 text-gray-400 hover:text-indigo-600 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStudentModal(student);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Link Parent"
                          className="p-2 rounded-lg hover:bg-green-100 text-gray-400 hover:text-green-600 transition-all"
                          onClick={(e) => handleLinkParent(student, e)}
                        >
                          <Link2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit"
                          className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-all"
                          onClick={(e) => handleEditStudent(student, e)}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete"
                          className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                          onClick={(e) => handleDeleteStudent(student.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full"
                />
                <p className="mt-4 text-gray-500">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 space-y-4 py-12">
                <GraduationCap className="w-16 h-16 text-gray-300" />
                <p>{students.length === 0 ? 'No students added yet.' : 'No students found.'}</p>
                <Button onClick={() => setIsStudentModalOpen(true)}>Add Student</Button>
              </div>
            ) : (
              filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="glass rounded-xl p-4 cursor-pointer"
                  onClick={() => setShowStudentModal(student)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg">
                        {student.firstName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{student.studentId}</div>
                      </div>
                    </div>
                    {student.isBlocked && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg">
                        Blocked
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700">
                    {student.classId ? (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                        Class {(student.classId as any)?.grade || 'N/A'}
                        {student.section && ` - ${student.section}`}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Not assigned</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Age: {getAge(student.dateOfBirth)}</div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </GlassCard>

      {/* Student details modal */}
      <AnimatePresence>
        {showStudentModal && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto pt-20 pb-20"
              onClick={() => setShowStudentModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative glass-strong rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/30">
                    {showStudentModal.firstName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {showStudentModal.firstName} {showStudentModal.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">{showStudentModal.studentId || 'No ID'}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Email', value: showStudentModal.email || 'N/A' },
                    { label: 'Class/Section', value: showStudentModal.classId ? `Class ${(showStudentModal.classId as any)?.grade || 'N/A'} ${showStudentModal.section ? `- ${showStudentModal.section}` : ''}` : 'Not assigned' },
                    { label: 'Age', value: getAge(showStudentModal.dateOfBirth) },
                    { label: 'Gender', value: showStudentModal.gender || 'N/A' },
                    { label: 'Blood Group', value: showStudentModal.bloodGroup || 'N/A' },
                    { label: 'Address', value: showStudentModal.address || 'N/A' },
                    { label: 'Parent Email', value: showStudentModal.parentEmail || 'N/A' },
                    { label: 'Parent Phone', value: showStudentModal.parentPhone || 'N/A' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900 text-right max-w-[60%] capitalize">
                        {item.value}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStudentToLink(showStudentModal);
                      setLinkParentModalOpen(true);
                    }}
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Link Parent
                  </Button>
                  <Button variant="outline" onClick={() => setShowStudentModal(null)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Create/Edit student modal */}
      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleCreateStudent}
        initialData={editingStudent ? {
          firstName: editingStudent.firstName,
          lastName: editingStudent.lastName,
          email: editingStudent.email,
          dateOfBirth: editingStudent.dateOfBirth ? (typeof editingStudent.dateOfBirth === 'string' ? editingStudent.dateOfBirth : (new Date(editingStudent.dateOfBirth).toISOString().split('T')[0] ?? '')) : '',
          gender: editingStudent.gender,
          bloodGroup: editingStudent.bloodGroup,
          address: editingStudent.address,
          phoneNumber: editingStudent.phoneNumber,
          parentEmail: editingStudent.parentEmail,
          parentPhone: editingStudent.parentPhone,
          studentId: editingStudent.studentId,
          classId: typeof editingStudent.classId === 'string' ? editingStudent.classId : editingStudent.classId?.id,
          section: editingStudent.section,
        } : undefined}
      />

      {/* Link parent modal */}
      {studentToLink && (
        <LinkParentModal
          isOpen={linkParentModalOpen}
          onClose={() => {
            setLinkParentModalOpen(false);
            setStudentToLink(null);
          }}
          studentId={studentToLink.id || studentToLink._id || ''}
          studentName={`${studentToLink.firstName} ${studentToLink.lastName}`}
          onSuccess={handleLinkSuccess}
        />
      )}
    </motion.section>
  );
}
