'use client';

import { useState, useMemo, useEffect } from 'react';
import { userService, type User } from '../../../../lib/services/user.service';
import { classService, type Class } from '../../../../lib/services/class.service';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '../../../../components/ui/slide-sheet';
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
  Loader2,
  Download,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Droplet,
  BookOpen,
  Save,
} from 'lucide-react';

// Professional Stat Card
function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-600',
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Professional Status Badge
function StatusBadge({ status }: { status: 'active' | 'blocked' | 'pending' }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blocked: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const labels = {
    active: 'Active',
    blocked: 'Blocked',
    pending: 'Pending',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Student Form Data
interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  phoneNumber: string;
  parentEmail: string;
  parentPhone: string;
  studentId: string;
  classId: string;
  section: string;
}

const initialFormData: StudentFormData = {
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  address: '',
  phoneNumber: '',
  parentEmail: '',
  parentPhone: '',
  studentId: '',
  classId: '',
  section: '',
};

export default function StudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sheet states
  const [showDetailsSheet, setShowDetailsSheet] = useState<User | null>(null);
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [showLinkSheet, setShowLinkSheet] = useState<User | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
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

  const fetchClasses = async () => {
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const filteredStudents = useMemo(() => {
    let result = students;
    if (statusFilter === 'active') {
      result = result.filter(s => !s.isBlocked);
    } else if (statusFilter === 'blocked') {
      result = result.filter(s => s.isBlocked);
    }
    const q = studentQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const className = s.classId?.toString() || '';
        const section = s.section || '';
        const studentId = s.studentId || '';
        return fullName.includes(q) || className.includes(q) || section.includes(q) || studentId.toLowerCase().includes(q);
      });
    }
    return result;
  }, [students, studentQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => !s.isBlocked).length;
    const blocked = students.filter(s => s.isBlocked).length;
    const withClass = students.filter(s => s.classId).length;
    return { total, active, blocked, withClass };
  }, [students]);

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 4000);
  };

  const getAge = (dateOfBirth?: Date | string) => {
    if (!dateOfBirth) return '—';
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Open form sheet for creating/editing
  const openFormSheet = (student?: User) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        dateOfBirth: student.dateOfBirth ? (typeof student.dateOfBirth === 'string' ? student.dateOfBirth : new Date(student.dateOfBirth).toISOString().split('T')[0] || '') : '',
        gender: student.gender || '',
        bloodGroup: student.bloodGroup || '',
        address: student.address || '',
        phoneNumber: student.phoneNumber || '',
        parentEmail: student.parentEmail || '',
        parentPhone: student.parentPhone || '',
        studentId: student.studentId || '',
        classId: typeof student.classId === 'string' ? student.classId : student.classId?.id || '',
        section: student.section || '',
      });
    } else {
      setEditingStudent(null);
      setFormData(initialFormData);
    }
    setShowFormSheet(true);
    setShowDetailsSheet(null);
  };

  const closeFormSheet = () => {
    setShowFormSheet(false);
    setEditingStudent(null);
    setFormData(initialFormData);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingStudent) {
        await userService.updateUser(editingStudent.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
          studentId: formData.studentId,
          classId: formData.classId,
          section: formData.section,
        });
        showBanner('success', 'Student updated successfully');
      } else {
        await userService.createUser({
          email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.com`,
          password: 'student123',
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'student',
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
          studentId: formData.studentId,
          classId: formData.classId,
          section: formData.section,
        });
        showBanner('success', 'Student created successfully');
      }
      closeFormSheet();
      await fetchStudents();
    } catch (err) {
      console.error('Failed to save student:', err);
      showBanner('error', 'Failed to save student. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    try {
      await userService.deleteUser(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      showBanner('success', 'Student deleted successfully');
      setShowDetailsSheet(null);
    } catch (err) {
      console.error('Failed to delete student:', err);
      showBanner('error', 'Failed to delete student. Please try again.');
    }
  };

  const handleBlockUser = async (student: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to block ${student.firstName} ${student.lastName}?`)) return;
    try {
      await userService.blockUser(student.id);
      showBanner('success', 'Student blocked successfully');
      await fetchStudents();
    } catch (err: any) {
      console.error('Failed to block student:', err);
      showBanner('error', err.response?.data?.message || 'Failed to block student');
    }
  };

  const handleUnblockUser = async (student: User, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await userService.unblockUser(student.id);
      showBanner('success', 'Student unblocked successfully');
      await fetchStudents();
    } catch (err: any) {
      console.error('Failed to unblock student:', err);
      showBanner('error', 'Failed to unblock student');
    }
  };

  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLinkSheet || !linkEmail.trim()) return;
    setLinkLoading(true);
    try {
      await userService.linkParent(showLinkSheet.id || showLinkSheet._id || '', linkEmail.trim());
      showBanner('success', 'Parent linked successfully');
      setShowLinkSheet(null);
      setLinkEmail('');
      await fetchStudents();
    } catch (err: any) {
      console.error('Failed to link parent:', err);
      showBanner('error', err.response?.data?.message || 'Failed to link parent');
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${
          banner.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {banner.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className="text-sm font-medium">{banner.message}</span>
          <button onClick={() => setBanner(null)} className="ml-auto p-1 hover:bg-white/50 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and view all student records</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openFormSheet()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.total} icon={Users} />
        <StatCard title="Active" value={stats.active} icon={GraduationCap} variant="success" />
        <StatCard title="Blocked" value={stats.blocked} icon={Lock} variant="danger" />
        <StatCard title="Enrolled" value={stats.withClass} icon={GraduationCap} variant="default" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search by name, ID, class or section..."
              className="w-full h-10 pl-9 pr-9 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setStudentQuery(studentSearch)}
            />
            {studentSearch && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => { setStudentSearch(''); setStudentQuery(''); }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <button
              onClick={() => setStudentQuery(studentSearch)}
              className="h-10 px-4 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm hidden md:table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Age</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="mt-3 text-sm text-slate-500">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">{students.length === 0 ? 'No students added yet' : 'No students found'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {students.length === 0 ? 'Add your first student to get started' : 'Try adjusting your search or filters'}
                      </p>
                      {students.length === 0 && (
                        <button onClick={() => openFormSheet()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
                          <UserPlus className="w-4 h-4" />
                          Add Student
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setShowDetailsSheet(student)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                          {getInitials(student.firstName, student.lastName)}
                        </div>
                        <span className="font-medium text-slate-900">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{student.studentId || '—'}</td>
                    <td className="px-4 py-3">
                      {student.classId ? (
                        <span className="text-slate-700">Class {(student.classId as any)?.grade || '—'}{student.section && ` • ${student.section}`}</span>
                      ) : (
                        <span className="text-slate-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{getAge(student.dateOfBirth)}</td>
                    <td className="px-4 py-3"><StatusBadge status={student.isBlocked ? 'blocked' : 'active'} /></td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{student.email || student.phoneNumber || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button title="View" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" onClick={(e) => { e.stopPropagation(); setShowDetailsSheet(student); }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button title="Link Parent" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" onClick={(e) => { e.stopPropagation(); setShowLinkSheet(student); }}>
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button title="Edit" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" onClick={(e) => { e.stopPropagation(); openFormSheet(student); }}>
                          <Edit className="w-4 h-4" />
                        </button>
                        {student.isBlocked ? (
                          <button title="Unblock" className="p-1.5 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition-colors" onClick={(e) => handleUnblockUser(student, e)}>
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button title="Block" className="p-1.5 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors" onClick={(e) => handleBlockUser(student, e)}>
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                        <button title="Delete" className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors" onClick={(e) => handleDeleteStudent(student.id, e)}>
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

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="mt-3 text-sm text-slate-500">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-500 py-16 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium">{students.length === 0 ? 'No students added yet' : 'No students found'}</p>
              {students.length === 0 && (
                <button onClick={() => openFormSheet()} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg">
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
              )}
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="p-4 hover:bg-slate-50 cursor-pointer" onClick={() => setShowDetailsSheet(student)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                      {getInitials(student.firstName, student.lastName)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-slate-500 font-mono">{student.studentId || 'No ID'}</p>
                    </div>
                  </div>
                  <StatusBadge status={student.isBlocked ? 'blocked' : 'active'} />
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span>{student.classId ? <>Class {(student.classId as any)?.grade || '—'}{student.section && ` • ${student.section}`}</> : 'Not assigned'}</span>
                  <span>Age: {getAge(student.dateOfBirth)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredStudents.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        )}
      </div>

      {/* Student Details Sheet */}
      <SlideSheet
        isOpen={!!showDetailsSheet}
        onClose={() => setShowDetailsSheet(null)}
        title="Student Details"
        subtitle={showDetailsSheet ? `${showDetailsSheet.firstName} ${showDetailsSheet.lastName}` : ''}
        size="md"
        footer={showDetailsSheet && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowLinkSheet(showDetailsSheet)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Link2 className="w-4 h-4" />
              Link Parent
            </button>
            <button
              onClick={() => openFormSheet(showDetailsSheet)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        )}
      >
        {showDetailsSheet && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xl font-medium">
                {getInitials(showDetailsSheet.firstName, showDetailsSheet.lastName)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  {showDetailsSheet.firstName} {showDetailsSheet.lastName}
                </h3>
                <p className="text-sm text-slate-500 font-mono">{showDetailsSheet.studentId || 'No ID'}</p>
              </div>
              <StatusBadge status={showDetailsSheet.isBlocked ? 'blocked' : 'active'} />
            </div>

            {/* Details */}
            <SheetSection title="Personal Information" icon={<UserIcon className="w-4 h-4 text-slate-500" />}>
              <SheetDetailRow label="Email" value={showDetailsSheet.email} />
              <SheetDetailRow label="Phone" value={showDetailsSheet.phoneNumber} />
              <SheetDetailRow label="Date of Birth" value={showDetailsSheet.dateOfBirth ? new Date(showDetailsSheet.dateOfBirth).toLocaleDateString() : '—'} />
              <SheetDetailRow label="Age" value={getAge(showDetailsSheet.dateOfBirth)} />
              <SheetDetailRow label="Gender" value={showDetailsSheet.gender} />
              <SheetDetailRow label="Blood Group" value={showDetailsSheet.bloodGroup} />
              <SheetDetailRow label="Address" value={showDetailsSheet.address} />
            </SheetSection>

            <SheetSection title="Academic Information" icon={<BookOpen className="w-4 h-4 text-slate-500" />}>
              <SheetDetailRow label="Class" value={showDetailsSheet.classId ? `Class ${(showDetailsSheet.classId as any)?.grade || '—'}` : 'Not assigned'} />
              <SheetDetailRow label="Section" value={showDetailsSheet.section} />
            </SheetSection>

            <SheetSection title="Parent/Guardian" icon={<Users className="w-4 h-4 text-slate-500" />}>
              <SheetDetailRow label="Parent Email" value={showDetailsSheet.parentEmail} />
              <SheetDetailRow label="Parent Phone" value={showDetailsSheet.parentPhone} />
            </SheetSection>
          </div>
        )}
      </SlideSheet>

      {/* Create/Edit Student Sheet */}
      <SlideSheet
        isOpen={showFormSheet}
        onClose={closeFormSheet}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        subtitle={editingStudent ? `Update ${editingStudent.firstName}'s information` : 'Fill in the student details'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button
              onClick={closeFormSheet}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              disabled={formLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingStudent ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <SheetSection title="Personal Information" icon={<UserIcon className="w-4 h-4 text-slate-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SheetField label="First Name" required>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
              <SheetField label="Last Name" required>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
            </div>
            {!editingStudent && (
              <SheetField label="Email">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Auto-generated if left empty"
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SheetField label="Date of Birth">
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
              <SheetField label="Gender">
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </SheetField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SheetField label="Blood Group">
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select Blood Group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </SheetField>
              <SheetField label="Phone Number">
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
            </div>
            <SheetField label="Address">
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </SheetField>
          </SheetSection>

          <SheetSection title="Academic Information" icon={<BookOpen className="w-4 h-4 text-slate-500" />}>
            <SheetField label="Student ID">
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </SheetField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SheetField label="Class">
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.name} (Grade {cls.grade})</option>)}
                </select>
              </SheetField>
              <SheetField label="Section">
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="e.g., A, B, C"
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
            </div>
          </SheetSection>

          <SheetSection title="Parent/Guardian Information" icon={<Users className="w-4 h-4 text-slate-500" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SheetField label="Parent Email">
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
              <SheetField label="Parent Phone">
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
            </div>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Link Parent Sheet */}
      <SlideSheet
        isOpen={!!showLinkSheet}
        onClose={() => { setShowLinkSheet(null); setLinkEmail(''); }}
        title="Link Parent Account"
        subtitle={showLinkSheet ? `Link a parent to ${showLinkSheet.firstName} ${showLinkSheet.lastName}` : ''}
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => { setShowLinkSheet(null); setLinkEmail(''); }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLinkParent}
              disabled={linkLoading || !linkEmail.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Link Parent
            </button>
          </div>
        }
      >
        <form onSubmit={handleLinkParent} className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              Enter the parent's email address. If they have an existing account, their account will be linked to this student.
              If not, they will receive an invitation to create an account.
            </p>
          </div>
          <SheetField label="Parent Email" required>
            <input
              type="email"
              required
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="parent@example.com"
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </SheetField>
        </form>
      </SlideSheet>
    </div>
  );
}
