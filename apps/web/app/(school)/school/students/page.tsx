'use client';

import { useState, useMemo, useEffect } from 'react';
import { userService, type User } from '../../../../lib/services/user.service';
import { classService, type Class } from '../../../../lib/services/class.service';
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast, Pagination } from '../../../../components/school';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Edit,
  Link2,
  Lock,
  Unlock,
  GraduationCap,
  X,
  Loader2,
  Download,
  BookOpen,
  Save,
  ArrowLeft,
  Ban,
} from 'lucide-react';

const classCardColors = [
  { iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  { iconBg: 'bg-pink-100', iconText: 'text-pink-600' },
  { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  { iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  { iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  { iconBg: 'bg-rose-100', iconText: 'text-rose-600' },
  { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
  { iconBg: 'bg-red-100', iconText: 'text-red-600' },
];

const sectionColors = [
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
];

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  phoneNumber: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  studentId: string;
  classId: string;
  section: string;
  rollNumber: string;
}

const initialFormData: StudentFormData = {
  firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '', bloodGroup: '',
  address: '', phoneNumber: '', parentName: '', parentEmail: '', parentPhone: '', studentId: '', classId: '', section: '', rollNumber: '',
};

export default function StudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentQuery, setStudentQuery] = useState('');

  // Navigation state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [viewingClassStudents, setViewingClassStudents] = useState(false); // true when viewing table for a class

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState<User | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState<User | null>(null);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; color?: 'red' | 'green' | 'purple' }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Form state
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => { fetchStudents(); fetchClasses(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await userService.getUsers();
      setStudents(allUsers.filter(u => u.role === 'student'));
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

  // Class data for cards
  const classCardsData = useMemo(() => {
    return classes.map(cls => {
      const classStudents = students.filter(s => {
        const sid = typeof s.classId === 'string' ? s.classId : (s.classId as any)?._id || (s.classId as any)?.id;
        return sid === cls._id;
      });
      const sections = cls.sections || ['A'];
      return {
        id: cls._id || '',
        name: cls.name || `Class ${cls.grade}`,
        sections: typeof sections[0] === 'string' ? sections as string[] : (sections as any[]).map((s: any) => s.name || s),
        studentCount: classStudents.length,
        cls,
      };
    });
  }, [classes, students]);

  const selectedClassData = useMemo(() => {
    return classCardsData.find(c => c.id === selectedClassId) || null;
  }, [classCardsData, selectedClassId]);

  const filteredStudents = useMemo(() => {
    let result = students;

    if (selectedClassId && !showAllStudents) {
      result = result.filter(s => {
        const sid = typeof s.classId === 'string' ? s.classId : (s.classId as any)?._id || (s.classId as any)?.id;
        return sid === selectedClassId;
      });
      if (selectedSection) {
        result = result.filter(s => s.section === selectedSection);
      }
    }

    const q = studentQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const studentId = s.studentId || '';
        return fullName.includes(q) || studentId.toLowerCase().includes(q);
      });
    }
    return result;
  }, [students, studentQuery, selectedClassId, selectedSection, showAllStudents]);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredStudents.slice(start, start + perPage);
  }, [filteredStudents, page]);

  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => !s.isBlocked).length;
    const blocked = students.filter(s => s.isBlocked).length;
    const withClass = students.filter(s => s.classId).length;
    return { total, active, blocked, withClass };
  }, [students]);

  const showTable = showAllStudents || viewingClassStudents;

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  const openFormModal = (student?: User) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        firstName: student.firstName || '', lastName: student.lastName || '', email: student.email || '',
        dateOfBirth: student.dateOfBirth ? (typeof student.dateOfBirth === 'string' ? student.dateOfBirth : new Date(student.dateOfBirth).toISOString().split('T')[0]) || '' : '',
        gender: student.gender || '', bloodGroup: student.bloodGroup || '', address: student.address || '',
        phoneNumber: student.phoneNumber || '', parentName: (student as any).parentName || '', parentEmail: student.parentEmail || '', parentPhone: student.parentPhone || '',
        studentId: student.studentId || '',
        classId: typeof student.classId === 'string' ? student.classId : (student.classId as any)?.id || (student.classId as any)?._id || '',
        section: student.section || '', rollNumber: (student as any).rollNumber || '',
      });
    } else {
      setEditingStudent(null);
      setFormData(initialFormData);
    }
    setShowFormModal(true);
    setShowDetailsModal(null);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingStudent(null);
    setFormData(initialFormData);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingStudent) {
        // Build payload, stripping empty strings to avoid validation errors
        const payload: Record<string, any> = {};
        if (formData.firstName) payload.firstName = formData.firstName;
        if (formData.lastName) payload.lastName = formData.lastName;
        if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
        if (formData.gender) payload.gender = formData.gender;
        if (formData.bloodGroup) payload.bloodGroup = formData.bloodGroup;
        if (formData.address) payload.address = formData.address;
        if (formData.phoneNumber) payload.phoneNumber = formData.phoneNumber;
        if (formData.parentName) payload.parentName = formData.parentName;
        if (formData.parentEmail) payload.parentEmail = formData.parentEmail;
        if (formData.parentPhone) payload.parentPhone = formData.parentPhone;
        if (formData.studentId) payload.studentId = formData.studentId;
        if (formData.classId) payload.classId = formData.classId;
        if (formData.section) payload.section = formData.section;
        await userService.updateUser(editingStudent.id, payload);
        showToast('success', 'Student updated successfully');
      } else {
        const createPayload: Record<string, any> = {
          email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.com`,
          password: 'student123', firstName: formData.firstName, lastName: formData.lastName, role: 'student',
        };
        if (formData.dateOfBirth) createPayload.dateOfBirth = formData.dateOfBirth;
        if (formData.gender) createPayload.gender = formData.gender;
        if (formData.bloodGroup) createPayload.bloodGroup = formData.bloodGroup;
        if (formData.address) createPayload.address = formData.address;
        if (formData.phoneNumber) createPayload.phoneNumber = formData.phoneNumber;
        if (formData.parentName) createPayload.parentName = formData.parentName;
        if (formData.parentEmail) createPayload.parentEmail = formData.parentEmail;
        if (formData.parentPhone) createPayload.parentPhone = formData.parentPhone;
        if (formData.studentId) createPayload.studentId = formData.studentId;
        if (formData.classId) createPayload.classId = formData.classId;
        if (formData.section) createPayload.section = formData.section;
        await userService.createUser(createPayload);
        showToast('success', 'Student created successfully');
      }
      closeFormModal();
      await fetchStudents();
    } catch (err) {
      console.error('Failed to save student:', err);
      showToast('error', 'Failed to save student. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    setConfirmModal({
      open: true,
      title: 'Delete Student',
      message: `Are you sure you want to delete ${studentName}? This action cannot be undone.`,
      color: 'red',
      onConfirm: async () => {
        try {
          await userService.deleteUser(studentId);
          setStudents(prev => prev.filter(s => s.id !== studentId));
          showToast('success', 'Student deleted successfully');
          setShowDetailsModal(null);
        } catch (err) {
          console.error('Failed to delete student:', err);
          showToast('error', 'Failed to delete student');
        }
        setConfirmModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleBlockUser = (student: User) => {
    setConfirmModal({
      open: true,
      title: 'Block Student',
      message: `Are you sure you want to block ${student.firstName} ${student.lastName}?`,
      color: 'red',
      onConfirm: async () => {
        try {
          await userService.blockUser(student.id);
          showToast('success', 'Student blocked successfully');
          await fetchStudents();
        } catch (err: any) {
          showToast('error', err.response?.data?.message || 'Failed to block student');
        }
        setConfirmModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleUnblockUser = async (student: User) => {
    try {
      await userService.unblockUser(student.id);
      showToast('success', 'Student unblocked successfully');
      await fetchStudents();
    } catch (err: any) {
      showToast('error', 'Failed to unblock student');
    }
  };

  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLinkModal || !linkEmail.trim()) return;
    setLinkLoading(true);
    try {
      await userService.linkParent(showLinkModal.id || (showLinkModal as any)._id || '', linkEmail.trim());
      showToast('success', 'Parent linked successfully');
      setShowLinkModal(null);
      setLinkEmail('');
      await fetchStudents();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to link parent');
    } finally {
      setLinkLoading(false);
    }
  };

  const inputClass = "w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<Users className="w-5 h-5" />} color="purple" label="Total Students" value={stats.total} />
        <SchoolStatCard icon={<GraduationCap className="w-5 h-5" />} color="green" label="Active" value={stats.active} />
        <SchoolStatCard icon={<Lock className="w-5 h-5" />} color="red" label="Blocked" value={stats.blocked} />
        <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="blue" label="Enrolled in Class" value={stats.withClass} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search students..."
            className="w-full h-10 pl-9 pr-9 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setStudentQuery(studentSearch); setPage(1); }}}
          />
          {studentSearch && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => { setStudentSearch(''); setStudentQuery(''); }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openFormModal()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Class Card Navigation or Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
        </div>
      ) : !showTable ? (
        /* Level 1 & 2: Class/Section Cards */
        selectedClassData ? (
          <div>
            <button
              onClick={() => { setSelectedClassId(null); setSelectedSection(null); setViewingClassStudents(false); }}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#824ef2] mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Classes</span>
            </button>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{selectedClassData.name}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div
                onClick={() => { setSelectedSection(null); setViewingClassStudents(true); setPage(1); }}
                className="rounded-xl border-2 border-[#824ef2] bg-[#824ef2]/5 p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-[#824ef2]/10">
                    <Users className="w-5 h-5 text-[#824ef2]" />
                  </div>
                  <span className="text-xl font-bold text-[#824ef2]">{selectedClassData.studentCount}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">All Students</p>
                <p className="text-xs text-slate-500">All sections</p>
              </div>
              {selectedClassData.sections.map((section, idx) => {
                const color = sectionColors[idx % sectionColors.length];
                const sectionStudents = students.filter(s => {
                  const sid = typeof s.classId === 'string' ? s.classId : (s.classId as any)?._id || (s.classId as any)?.id;
                  return sid === selectedClassId && s.section === section;
                }).length;
                return (
                  <div
                    key={section}
                    onClick={() => { setSelectedSection(section); setViewingClassStudents(true); setPage(1); }}
                    className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-[#824ef2]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-xl ${color?.bg || 'bg-slate-100'} flex items-center justify-center`}>
                        <span className={`text-lg font-bold ${color?.text || 'text-slate-700'}`}>{section}</span>
                      </div>
                      <span className="text-xl font-bold text-slate-700">{sectionStudents}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Section {section}</p>
                    <p className="text-xs text-slate-500">{selectedClassData.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              onClick={() => { setShowAllStudents(true); setSelectedClassId(null); setSelectedSection(null); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-[#824ef2]/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-[#824ef2]/10">
                  <Users className="w-5 h-5 text-[#824ef2]" />
                </div>
                <span className="text-xl font-bold text-slate-700">{stats.total}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">All Students</p>
              <p className="text-xs text-slate-500">View all students</p>
            </div>
            {classCardsData.map((cls, idx) => {
              const color = classCardColors[idx % classCardColors.length];
              return (
                <div
                  key={cls.id}
                  onClick={() => { setSelectedClassId(cls.id); setShowAllStudents(false); setPage(1); }}
                  className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-[#824ef2]/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${color?.iconBg || 'bg-slate-100'}`}>
                      <GraduationCap className={`w-5 h-5 ${color?.iconText || 'text-slate-600'}`} />
                    </div>
                    <span className="text-xl font-bold text-slate-700">{cls.studentCount}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
                  <p className="text-xs text-slate-500">{cls.sections.length} sections</p>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Level 3: Students Table */
        <div>
          <button
            onClick={() => {
              if (showAllStudents) {
                // Was viewing "All Students" → go back to class cards
                setShowAllStudents(false);
                setSelectedClassId(null);
                setSelectedSection(null);
                setViewingClassStudents(false);
              } else if (selectedSection) {
                // Was viewing a specific section → go back to section picker for the class
                setSelectedSection(null);
                setViewingClassStudents(false);
              } else {
                // Was viewing all students in a class (no section) → go back to section picker
                setViewingClassStudents(false);
              }
              setPage(1);
            }}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#824ef2] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">
              {showAllStudents ? 'Back to Classes' : selectedSection ? `Back to ${selectedClassData?.name || 'Sections'}` : selectedClassData ? `Back to ${selectedClassData.name}` : 'Back to Classes'}
            </span>
          </button>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Student ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Class</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Roll No</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Parent</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <GraduationCap className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium">No students found</p>
                          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setShowDetailsModal(student)} className="text-slate-900 font-medium hover:underline text-sm">
                            {student.studentId || '—'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-[#824ef2] text-xs font-semibold">
                              {getInitials(student.firstName, student.lastName)}
                            </div>
                            <span className="font-medium text-slate-900">{student.firstName} {student.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {student.classId ? `${(student.classId as any)?.name || (student.classId as any)?.grade || '—'}${student.section ? ` - ${student.section}` : ''}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{(student as any).rollNumber || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {student.parentEmail ? (
                            <span className="text-blue-600 text-sm">{student.parentEmail}</span>
                          ) : (
                            <span className="text-slate-400 text-sm">Not linked</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <SchoolStatusBadge value={student.isBlocked ? 'blocked' : 'active'} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button title="View" onClick={() => setShowDetailsModal(student)} className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button title="Edit" onClick={() => openFormModal(student)} className="p-1.5 rounded-lg hover:bg-purple-50 text-[#824ef2] transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button title="Link Parent" onClick={() => setShowLinkModal(student)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                              <Link2 className="w-4 h-4" />
                            </button>
                            {student.isBlocked ? (
                              <button title="Unblock" onClick={() => handleUnblockUser(student)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                                <Unlock className="w-4 h-4" />
                              </button>
                            ) : (
                              <button title="Block" onClick={() => handleBlockUser(student)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                                <Ban className="w-4 h-4" />
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
            {filteredStudents.length > 0 && (
              <div className="border-t border-slate-200 px-4">
                <Pagination total={filteredStudents.length} page={page} perPage={perPage} onPageChange={setPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      <FormModal
        open={!!showDetailsModal}
        title="Student Details"
        onClose={() => setShowDetailsModal(null)}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowDetailsModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Close
            </button>
            <button onClick={() => { if (showDetailsModal) openFormModal(showDetailsModal); }} className="px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4]">
              Edit Details
            </button>
          </>
        }
      >
        {showDetailsModal && (
          <div className="space-y-6">
            {/* Header: Avatar + Name + ID/Class/Roll + Status */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-[#824ef2] text-2xl font-bold flex-shrink-0">
                {getInitials(showDetailsModal.firstName, showDetailsModal.lastName)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-xl font-bold text-slate-900">{showDetailsModal.firstName} {showDetailsModal.lastName}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {showDetailsModal.studentId || '—'}
                  {showDetailsModal.classId && (
                    <>
                      {' '}&middot;{' '}
                      {(showDetailsModal.classId as any)?.name || (showDetailsModal.classId as any)?.grade || '—'}
                      {showDetailsModal.section ? ` - ${showDetailsModal.section}` : ''}
                    </>
                  )}
                  {(showDetailsModal as any).rollNumber && (
                    <>
                      {' '}&middot; Roll: {(showDetailsModal as any).rollNumber}
                    </>
                  )}
                </p>
              </div>
              <SchoolStatusBadge value={showDetailsModal.isBlocked ? 'blocked' : 'active'} />
            </div>

            {/* Two-column: Student Info + Parent Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Student Information</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Date of Birth', value: showDetailsModal.dateOfBirth ? new Date(showDetailsModal.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                    { label: 'Gender', value: showDetailsModal.gender || '—' },
                    { label: 'Blood Group', value: showDetailsModal.bloodGroup || '—' },
                    { label: 'Address', value: showDetailsModal.address || '—' },
                    { label: 'Email', value: showDetailsModal.email || '—' },
                    { label: 'Phone', value: showDetailsModal.phoneNumber || '—' },
                  ].map(row => (
                    <div key={row.label}>
                      <p className="text-xs text-slate-400">{row.label}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Parent Information</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Parent Name', value: (showDetailsModal as any).parentName || '—' },
                    { label: 'Parent Email', value: showDetailsModal.parentEmail || '—' },
                    { label: 'Parent Phone', value: showDetailsModal.parentPhone || '—' },
                  ].map(row => (
                    <div key={row.label}>
                      <p className="text-xs text-slate-400">{row.label}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </FormModal>

      {/* Add/Edit Student Modal */}
      <FormModal
        open={showFormModal}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        onClose={closeFormModal}
        size="lg"
        footer={
          <>
            <button onClick={closeFormModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleFormSubmit} disabled={formLoading} className="px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] disabled:opacity-50 inline-flex items-center gap-2">
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingStudent ? 'Update Student' : 'Create Student'}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#824ef2] mb-4">Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="Enter first name" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Enter last name" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className={inputClass}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className={inputClass}>
                  <option value="">Select class</option>
                  {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.name} (Class {cls.grade})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <select value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className={inputClass}>
                  <option value="">Select section</option>
                  {formData.classId && classes.find(c => c._id === formData.classId)?.sections?.map((s: any) => {
                    const name = typeof s === 'string' ? s : s.name;
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} className={inputClass}>
                  <option value="">Select blood group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                <input type="text" value={formData.rollNumber} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} placeholder="Enter roll number" className={inputClass} />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} placeholder="Enter address" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] resize-none" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#824ef2] mb-4">Parent Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Name</label>
                <input type="text" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} placeholder="Enter parent name" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Email</label>
                  <input type="email" value={formData.parentEmail} onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} placeholder="parent@example.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Phone</label>
                  <input type="tel" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} placeholder="Phone number" className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormModal>

      {/* Link Parent Modal */}
      <FormModal
        open={!!showLinkModal}
        title="Link Parent Account"
        onClose={() => { setShowLinkModal(null); setLinkEmail(''); }}
        size="sm"
        footer={
          <>
            <button onClick={() => { setShowLinkModal(null); setLinkEmail(''); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleLinkParent} disabled={linkLoading || !linkEmail.trim()} className="px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] disabled:opacity-50 inline-flex items-center gap-2">
              {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Link Parent
            </button>
          </>
        }
      >
        <form onSubmit={handleLinkParent} className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              Enter the parent&apos;s email address to link their account to {showLinkModal?.firstName} {showLinkModal?.lastName}.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parent Email <span className="text-red-500">*</span></label>
            <input type="email" required value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} placeholder="parent@example.com" className={inputClass} />
          </div>
        </form>
      </FormModal>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Confirm"
        confirmColor={confirmModal.color || 'red'}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
