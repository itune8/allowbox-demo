'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@repo/ui/button';
import { userService, type User } from '../../../../lib/services/user.service';
import { classService, type Class } from '../../../../lib/services/class.service';
import { subjectService, type Subject } from '../../../../lib/services/subject.service';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '../../../../components/ui/slide-sheet';
import {
  UserPlus,
  Users,
  Trash2,
  Plus,
  X,
  GraduationCap,
  Shield,
  Calculator,
  Loader2,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Briefcase,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Layers,
  Check,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

// Types
export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  phoneNumber?: string;
  employeeId?: string;
  joiningDate?: string;
  qualification?: string;
}

interface TeacherAssignment {
  classId: string;
  sections: string[];
  subjectIds: string[];
}

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
  variant?: 'default' | 'blue' | 'purple' | 'green';
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-emerald-100 text-emerald-600',
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

// Role Badge
function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    teacher: 'bg-blue-50 text-blue-700 border-blue-200',
    tenant_admin: 'bg-purple-50 text-purple-700 border-purple-200',
    accountant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const labels: Record<string, string> = {
    teacher: 'Teacher',
    tenant_admin: 'Admin',
    accountant: 'Accountant',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[role] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {labels[role] || role}
    </span>
  );
}

export default function StaffPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showStaffModal, setShowStaffModal] = useState<User | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [assignTeacher, setAssignTeacher] = useState<User | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state for create/edit staff
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'teacher',
    phoneNumber: '',
    employeeId: '',
    joiningDate: '',
    qualification: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Assign teacher state
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<TeacherAssignment>({
    classId: '',
    sections: [],
    subjectIds: [],
  });
  const [assignError, setAssignError] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (assignTeacher) {
      fetchClassesAndSubjects();
    }
  }, [assignTeacher]);

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

  const fetchClassesAndSubjects = async () => {
    setLoadingData(true);
    try {
      const [fetchedClasses, fetchedSubjects] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
      ]);
      setClasses(fetchedClasses);
      setSubjects(fetchedSubjects);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setAssignError('Failed to load classes and subjects');
    } finally {
      setLoadingData(false);
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

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 4000);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await userService.createUser(formData);
      showBanner('success', 'Staff member created successfully');
      setIsStaffModalOpen(false);
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'teacher',
        phoneNumber: '',
        employeeId: '',
        joiningDate: '',
        qualification: '',
      });
      await fetchStaff();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;

    try {
      await userService.deleteUser(staffId);
      setStaff(prev => prev.filter(s => s.id !== staffId));
      showBanner('success', 'Staff member deleted successfully');
    } catch (err) {
      console.error('Failed to delete staff:', err);
      showBanner('error', 'Failed to delete staff member. Please try again.');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Assign teacher handlers
  const handleAddAssignment = () => {
    if (!currentAssignment.classId || currentAssignment.sections.length === 0 || currentAssignment.subjectIds.length === 0) {
      setAssignError('Please select class, at least one section, and at least one subject');
      return;
    }

    // Check for duplicate
    const isDuplicate = assignments.some(
      a => a.classId === currentAssignment.classId &&
           a.sections.some(s => currentAssignment.sections.includes(s))
    );

    if (isDuplicate) {
      setAssignError('This class and section combination is already assigned');
      return;
    }

    setAssignments([...assignments, { ...currentAssignment }]);
    setCurrentAssignment({
      classId: '',
      sections: [],
      subjectIds: [],
    });
    setAssignError('');
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleSectionToggle = (section: string) => {
    setCurrentAssignment(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section],
    }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    setCurrentAssignment(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }));
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError('');
    setAssignLoading(true);

    try {
      if (!assignTeacher) return;

      // Collect all unique subject IDs from all assignments
      const allSubjectIds = Array.from(
        new Set(assignments.flatMap(a => a.subjectIds))
      );

      // Update teacher with assigned subjects
      await userService.updateUser(assignTeacher.id, {
        subjects: allSubjectIds,
      });

      showBanner('success', 'Teacher assignments saved successfully');
      setAssignTeacher(null);
      setAssignments([]);
      setCurrentAssignment({ classId: '', sections: [], subjectIds: [] });
      await fetchStaff();
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Failed to assign teacher');
    } finally {
      setAssignLoading(false);
    }
  };

  const selectedClass = classes.find(c => c._id === currentAssignment.classId);
  const getClassName = (classId: string) => classes.find(c => c._id === classId)?.name || 'Unknown';
  const getSubjectName = (subjectId: string) => subjects.find(s => s._id === subjectId)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${
          banner.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {banner.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="text-sm font-medium">{banner.message}</span>
          <button
            onClick={() => setBanner(null)}
            className="ml-auto p-1 hover:bg-white/50 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Staff & Teachers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your school staff members</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Staff" value={stats.total} icon={Users} />
        <StatCard title="Teachers" value={stats.teachers} icon={GraduationCap} variant="blue" />
        <StatCard title="Admins" value={stats.admins} icon={Shield} variant="purple" />
        <StatCard title="Accountants" value={stats.accountants} icon={Calculator} variant="green" />
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-600">Filter by role:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'All' },
              { value: 'teacher', label: 'Teachers' },
              { value: 'tenant_admin', label: 'Admins' },
              { value: 'accountant', label: 'Accountants' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setRoleFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  roleFilter === option.value
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm hidden md:table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Staff Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Qualification</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="mt-3 text-sm text-slate-500">Loading staff...</p>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Briefcase className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">{staff.length === 0 ? 'No staff members added yet' : 'No staff found with selected filter'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {staff.length === 0 ? 'Add your first staff member to get started' : 'Try selecting a different filter'}
                      </p>
                      {staff.length === 0 && (
                        <button
                          onClick={() => setIsStaffModalOpen(true)}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Staff
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setShowStaffModal(member)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                          {getInitials(member.firstName, member.lastName)}
                        </div>
                        <div>
                          <span className="font-medium text-slate-900">
                            {member.firstName} {member.lastName}
                          </span>
                          {member.email && (
                            <p className="text-xs text-slate-500">{member.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                      {member.employeeId || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {member.phoneNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {member.qualification || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          title="View"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStaffModal(member);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {member.role === 'teacher' && (
                          <button
                            title="Assign Classes"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignTeacher(member);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                          onClick={(e) => handleDeleteStaff(member.id, e)}
                        >
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
              <p className="mt-3 text-sm text-slate-500">Loading staff...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-500 py-16 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium">{staff.length === 0 ? 'No staff members added yet' : 'No staff found'}</p>
              {staff.length === 0 && (
                <button
                  onClick={() => setIsStaffModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Staff
                </button>
              )}
            </div>
          ) : (
            filteredStaff.map((member) => (
              <div
                key={member.id}
                className="p-4 hover:bg-slate-50 cursor-pointer"
                onClick={() => setShowStaffModal(member)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                      {getInitials(member.firstName, member.lastName)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={member.role} />
                </div>
                {member.employeeId && (
                  <div className="mt-2 text-xs text-slate-500 font-mono">
                    ID: {member.employeeId}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Table Footer */}
        {filteredStaff.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
        )}
      </div>

      {/* Staff Details SlideSheet */}
      <SlideSheet
        isOpen={!!showStaffModal}
        onClose={() => setShowStaffModal(null)}
        title="Staff Details"
        size="md"
        footer={
          <div className="flex gap-3">
            {showStaffModal?.role === 'teacher' && (
              <button
                onClick={() => {
                  setAssignTeacher(showStaffModal);
                  setShowStaffModal(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Assign Classes
              </button>
            )}
            <button
              onClick={() => setShowStaffModal(null)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Close
            </button>
          </div>
        }
      >
        {showStaffModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-medium">
                {getInitials(showStaffModal.firstName, showStaffModal.lastName)}
              </div>
              <div>
                <h4 className="text-xl font-semibold text-slate-900">
                  {showStaffModal.firstName} {showStaffModal.lastName}
                </h4>
                <RoleBadge role={showStaffModal.role} />
              </div>
            </div>

            <div className="space-y-1">
              <SheetDetailRow label="Employee ID" value={showStaffModal.employeeId} />
              <SheetDetailRow label="Email" value={showStaffModal.email} />
              <SheetDetailRow label="Phone" value={showStaffModal.phoneNumber} />
              <SheetDetailRow label="Qualification" value={showStaffModal.qualification} />
              <SheetDetailRow
                label="Joining Date"
                value={showStaffModal.joiningDate ? new Date(showStaffModal.joiningDate).toLocaleDateString() : '—'}
              />
            </div>

            {showStaffModal.role === 'teacher' && showStaffModal.subjects && showStaffModal.subjects.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-700 mb-2">Assigned Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {showStaffModal.subjects.map((subject: any) => (
                    <span
                      key={subject._id || subject}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium"
                    >
                      {subject.name || subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SlideSheet>

      {/* Create Staff SlideSheet */}
      <SlideSheet
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setFormError('');
        }}
        title="Add New Staff Member"
        subtitle="Fill in the staff details below"
        size="lg"
      >
        <form onSubmit={handleCreateStaff} className="space-y-6">
          {/* Error message */}
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </p>
            </div>
          )}

          {/* Role Selection Section */}
          <SheetSection title="Role Selection" icon={<Shield className="w-4 h-4 text-slate-600" />}>
            <SheetField label="Role" required>
              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="teacher">Teacher</option>
                <option value="tenant_admin">School Admin</option>
                <option value="accountant">Accountant</option>
              </select>
            </SheetField>
          </SheetSection>

          {/* Personal Information Section */}
          <SheetSection title="Personal Information" icon={<UserIcon className="w-4 h-4 text-slate-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SheetField label="First Name" required>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
              <SheetField label="Last Name" required>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
              <SheetField label="Phone Number">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Account Credentials Section */}
          <SheetSection title="Account Credentials" icon={<Mail className="w-4 h-4 text-slate-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SheetField label="Email" required>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </SheetField>
              <SheetField label="Password" required>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
              </SheetField>
            </div>
          </SheetSection>

          {/* Employment Details Section (for teachers/admins) */}
          {(formData.role === 'teacher' || formData.role === 'tenant_admin') && (
            <SheetSection title="Employment Details" icon={<Briefcase className="w-4 h-4 text-slate-600" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SheetField label="Employee ID">
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleFormChange}
                    placeholder="Auto-generated if empty"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </SheetField>
                <SheetField label="Joining Date">
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </SheetField>
                <div className="md:col-span-2">
                  <SheetField label="Qualification">
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleFormChange}
                      placeholder="e.g., M.Ed, B.Sc, etc."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </SheetField>
                </div>
              </div>
            </SheetSection>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              onClick={() => setIsStaffModalOpen(false)}
              variant="outline"
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
            >
              {formLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create User
                </span>
              )}
            </Button>
          </div>
        </form>
      </SlideSheet>

      {/* Assign Teacher SlideSheet */}
      <SlideSheet
        isOpen={!!assignTeacher}
        onClose={() => {
          setAssignTeacher(null);
          setAssignments([]);
          setCurrentAssignment({ classId: '', sections: [], subjectIds: [] });
          setAssignError('');
        }}
        title="Assign Classes & Subjects"
        subtitle={assignTeacher ? `${assignTeacher.firstName} ${assignTeacher.lastName}` : ''}
        size="xl"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-6">
          {/* Error message */}
          {assignError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {assignError}
              </p>
            </div>
          )}

          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="mt-4 text-slate-500 text-sm">Loading classes and subjects...</p>
            </div>
          ) : (
            <>
              {/* Current Assignments Section */}
              {assignments.length > 0 && (
                <SheetSection
                  title={`Current Assignments (${assignments.length})`}
                  icon={<Check className="w-4 h-4 text-slate-600" />}
                >
                  <div className="space-y-3">
                    {assignments.map((assignment, index) => (
                      <div
                        key={`${assignment.classId}-${assignment.sections.join(',')}`}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 group hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="font-semibold text-slate-900">{getClassName(assignment.classId)}</span>
                            </div>
                            <div className="ml-10 space-y-1.5">
                              <div className="flex items-center gap-2 text-sm">
                                <Layers className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-600">Sections:</span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {assignment.sections.map(section => (
                                    <span key={section} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                      {section}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <BookOpen className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-600">Subjects:</span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {assignment.subjectIds.map(id => (
                                    <span key={id} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                      {getSubjectName(id)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAssignment(index)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SheetSection>
              )}

              {/* Add New Assignment Section */}
              <SheetSection
                title="Add New Assignment"
                icon={<Plus className="w-4 h-4 text-slate-600" />}
              >
                <div className="space-y-4">
                  {/* Select Class */}
                  <SheetField label="Select Class" required>
                    <select
                      value={currentAssignment.classId}
                      onChange={(e) => {
                        setCurrentAssignment({
                          classId: e.target.value,
                          sections: [],
                          subjectIds: currentAssignment.subjectIds,
                        });
                      }}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Choose a class...</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} (Grade {cls.grade})
                        </option>
                      ))}
                    </select>
                  </SheetField>

                  {/* Select Sections */}
                  {selectedClass && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Select Sections <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedClass.sections.map((section) => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => handleSectionToggle(section)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              currentAssignment.sections.includes(section)
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {currentAssignment.sections.includes(section) && (
                              <Check className="w-3.5 h-3.5 inline mr-1" />
                            )}
                            Section {section}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Subjects */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Subjects <span className="text-red-500">*</span>
                    </label>
                    {subjects.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                          No subjects available. Please create subjects first.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                        {subjects.map((subject) => (
                          <label
                            key={subject._id}
                            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all ${
                              currentAssignment.subjectIds.includes(subject._id)
                                ? 'bg-primary/10 border border-primary/30'
                                : 'bg-white hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                              currentAssignment.subjectIds.includes(subject._id)
                                ? 'bg-primary'
                                : 'border-2 border-slate-300 bg-white'
                            }`}>
                              {currentAssignment.subjectIds.includes(subject._id) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={currentAssignment.subjectIds.includes(subject._id)}
                              onChange={() => handleSubjectToggle(subject._id)}
                              className="sr-only"
                            />
                            <span className={`text-sm font-medium ${
                              currentAssignment.subjectIds.includes(subject._id)
                                ? 'text-primary'
                                : 'text-slate-700'
                            }`}>
                              {subject.name} <span className="text-slate-400">({subject.code})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Assignment Button */}
                  <button
                    type="button"
                    onClick={handleAddAssignment}
                    disabled={!currentAssignment.classId || currentAssignment.sections.length === 0 || currentAssignment.subjectIds.length === 0}
                    className="w-full py-3 px-4 rounded-lg text-sm font-medium border-2 border-dashed border-primary/30 text-primary
                      hover:bg-primary/5 hover:border-primary/50 transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30
                      flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add This Assignment
                  </button>
                </div>
              </SheetSection>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => {
                    setAssignTeacher(null);
                    setAssignments([]);
                    setCurrentAssignment({ classId: '', sections: [], subjectIds: [] });
                  }}
                  variant="outline"
                  disabled={assignLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={assignLoading || assignments.length === 0}
                >
                  {assignLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Save Assignments ({assignments.length})
                    </span>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </SlideSheet>
    </div>
  );
}
