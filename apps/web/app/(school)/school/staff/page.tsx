'use client';

import { useState, useEffect, useMemo } from 'react';
import { userService, type User } from '../../../../lib/services/user.service';
import { classService, type Class } from '../../../../lib/services/class.service';
import { subjectService, type Subject } from '../../../../lib/services/subject.service';
import { leaveRequestService, type LeaveRequest, LeaveStatus } from '../../../../lib/services/leave-request.service';
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast, Pagination } from '../../../../components/school';
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
  AlertCircle,
  Briefcase,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Layers,
  Check,
  UserCheck,
  CalendarX,
  CalendarCheck,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface UserFormData {
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

type TabKey = 'teachers' | 'leave-requests' | 'attendance';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'teachers', label: 'All Teachers' },
  { key: 'leave-requests', label: 'Leave Requests' },
  { key: 'attendance', label: 'Attendance Report' },
];

const PER_PAGE = 10;

export default function StaffPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('teachers');
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [showStaffModal, setShowStaffModal] = useState<User | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [assignTeacher, setAssignTeacher] = useState<User | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    color: 'red' | 'green' | 'purple';
  }>({ open: false, title: '', message: '', onConfirm: () => {}, color: 'red' });

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    email: '', firstName: '', lastName: '', password: '',
    role: 'teacher', phoneNumber: '', employeeId: '', joiningDate: '', qualification: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Assign teacher state
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<TeacherAssignment>({
    classId: '', sections: [], subjectIds: [],
  });
  const [assignError, setAssignError] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Leave requests state
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leaveFilter, setLeaveFilter] = useState<string>('all');

  useEffect(() => { fetchStaff(); }, []);

  useEffect(() => {
    if (activeTab === 'leave-requests' && leaveRequests.length === 0) {
      fetchLeaveRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    if (assignTeacher) fetchClassesAndSubjects();
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

  const fetchLeaveRequests = async () => {
    setLoadingLeaves(true);
    try {
      const data = await leaveRequestService.getAll();
      setLeaveRequests(data);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      showToast('error', 'Failed to load leave requests');
    } finally {
      setLoadingLeaves(false);
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
    let list = staff;
    if (roleFilter) {
      list = list.filter(s => s.role === roleFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.employeeId?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [staff, roleFilter, searchQuery]);

  const paginatedStaff = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredStaff.slice(start, start + PER_PAGE);
  }, [filteredStaff, page]);

  const stats = useMemo(() => {
    const total = staff.length;
    const teachers = staff.filter(s => s.role === 'teacher').length;
    const admins = staff.filter(s => s.role === 'tenant_admin').length;
    const onLeave = leaveRequests.filter(
      lr => lr.status === LeaveStatus.APPROVED &&
        new Date(lr.startDate) <= new Date() &&
        new Date(lr.endDate) >= new Date()
    ).length;
    return { total, teachers, admins, onLeave };
  }, [staff, leaveRequests]);

  const filteredLeaveRequests = useMemo(() => {
    if (leaveFilter === 'all') return leaveRequests;
    return leaveRequests.filter(lr => lr.status === leaveFilter);
  }, [leaveRequests, leaveFilter]);

  const leaveStats = useMemo(() => {
    const pending = leaveRequests.filter(lr => lr.status === LeaveStatus.PENDING).length;
    const approved = leaveRequests.filter(lr => lr.status === LeaveStatus.APPROVED).length;
    const rejected = leaveRequests.filter(lr => lr.status === LeaveStatus.REJECTED).length;
    return { pending, approved, rejected };
  }, [leaveRequests]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await userService.createUser(formData);
      showToast('success', 'Staff member created successfully');
      setIsStaffModalOpen(false);
      setFormData({
        email: '', firstName: '', lastName: '', password: '',
        role: 'teacher', phoneNumber: '', employeeId: '', joiningDate: '', qualification: '',
      });
      await fetchStaff();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    setConfirmModal({
      open: true,
      title: 'Delete Staff Member',
      message: `Are you sure you want to delete ${staffName}? This action cannot be undone.`,
      color: 'red',
      onConfirm: async () => {
        try {
          await userService.deleteUser(staffId);
          setStaff(prev => prev.filter(s => s.id !== staffId));
          showToast('success', 'Staff member deleted successfully');
        } catch (err) {
          console.error('Failed to delete staff:', err);
          showToast('error', 'Failed to delete staff member');
        }
        setConfirmModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await leaveRequestService.approve(leaveId, { status: LeaveStatus.APPROVED });
      setLeaveRequests(prev => prev.map(lr =>
        (lr._id === leaveId) ? { ...lr, status: LeaveStatus.APPROVED } : lr
      ));
      showToast('success', 'Leave request approved');
    } catch (err) {
      showToast('error', 'Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await leaveRequestService.approve(leaveId, { status: LeaveStatus.REJECTED });
      setLeaveRequests(prev => prev.map(lr =>
        (lr._id === leaveId) ? { ...lr, status: LeaveStatus.REJECTED } : lr
      ));
      showToast('success', 'Leave request rejected');
    } catch (err) {
      showToast('error', 'Failed to reject leave request');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  // Assign teacher handlers
  const handleAddAssignment = () => {
    if (!currentAssignment.classId || currentAssignment.sections.length === 0 || currentAssignment.subjectIds.length === 0) {
      setAssignError('Please select class, at least one section, and at least one subject');
      return;
    }
    const isDuplicate = assignments.some(
      a => a.classId === currentAssignment.classId &&
           a.sections.some(s => currentAssignment.sections.includes(s))
    );
    if (isDuplicate) {
      setAssignError('This class and section combination is already assigned');
      return;
    }
    setAssignments([...assignments, { ...currentAssignment }]);
    setCurrentAssignment({ classId: '', sections: [], subjectIds: [] });
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
      const allSubjectIds = Array.from(new Set(assignments.flatMap(a => a.subjectIds)));
      await userService.updateUser(assignTeacher.id, { subjects: allSubjectIds });
      showToast('success', 'Teacher assignments saved successfully');
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

  const inputClasses = 'w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]';

  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<Users className="w-5 h-5" />}
          color="purple"
          label="Total Teachers"
          value={stats.total}
        />
        <SchoolStatCard
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
          label="Class Teachers"
          value={stats.teachers}
        />
        <SchoolStatCard
          icon={<Shield className="w-5 h-5" />}
          color="green"
          label="Admins"
          value={stats.admins}
        />
        <SchoolStatCard
          icon={<CalendarX className="w-5 h-5" />}
          color="orange"
          label="On Leave Today"
          value={stats.onLeave}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#824ef2]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.key === 'leave-requests' && leaveStats.pending > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center">
                    {leaveStats.pending}
                  </span>
                )}
              </span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#824ef2] rounded-t" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search staff..."
                  className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex gap-1.5">
                {[
                  { value: '', label: 'All' },
                  { value: 'teacher', label: 'Teachers' },
                  { value: 'tenant_admin', label: 'Admins' },
                  { value: 'accountant', label: 'Accountants' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setRoleFilter(option.value); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      roleFilter === option.value
                        ? 'bg-[#824ef2] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setIsStaffModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#824ef2' }}
              >
                <Plus className="w-4 h-4" />
                Add Staff
              </button>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Teacher</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Employee ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin mx-auto" />
                        <p className="mt-3 text-sm text-slate-500">Loading staff...</p>
                      </td>
                    </tr>
                  ) : paginatedStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium">
                            {staff.length === 0 ? 'No staff members added yet' : 'No staff found'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {staff.length === 0 ? 'Add your first staff member to get started' : 'Try adjusting your search or filters'}
                          </p>
                          {staff.length === 0 && (
                            <button
                              onClick={() => setIsStaffModalOpen(true)}
                              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg"
                              style={{ backgroundColor: '#824ef2' }}
                            >
                              <Plus className="w-4 h-4" />
                              Add Staff
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStaff.map(member => (
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
                          <SchoolStatusBadge
                            value={member.role === 'teacher' ? 'class_teacher' : member.role === 'tenant_admin' ? 'approved' : 'active'}
                            showDot={false}
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {member.qualification || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <SchoolStatusBadge value={member.isActive !== false ? 'active' : 'inactive'} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              title="View Details"
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-[#824ef2] transition-colors"
                              onClick={() => setShowStaffModal(member)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {member.role === 'teacher' && (
                              <button
                                title="Assign Classes"
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                onClick={() => setAssignTeacher(member)}
                              >
                                <CalendarCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              onClick={() => handleDeleteStaff(member.id, `${member.firstName} ${member.lastName}`)}
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
            {filteredStaff.length > PER_PAGE && (
              <div className="border-t border-slate-200 px-4">
                <Pagination
                  total={filteredStaff.length}
                  page={page}
                  perPage={PER_PAGE}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'leave-requests' && (
        <div className="space-y-4">
          {/* Leave Stats Mini Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{leaveStats.pending}</p>
              <p className="text-sm text-amber-600 font-medium">Pending</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{leaveStats.approved}</p>
              <p className="text-sm text-emerald-600 font-medium">Approved</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{leaveStats.rejected}</p>
              <p className="text-sm text-red-600 font-medium">Rejected</p>
            </div>
          </div>

          {/* Leave Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: LeaveStatus.PENDING, label: 'Pending' },
              { value: LeaveStatus.APPROVED, label: 'Approved' },
              { value: LeaveStatus.REJECTED, label: 'Rejected' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setLeaveFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  leaveFilter === opt.value
                    ? 'bg-[#824ef2] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Leave Requests List */}
          <div className="space-y-3">
            {loadingLeaves ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
                <p className="mt-3 text-sm text-slate-500">Loading leave requests...</p>
              </div>
            ) : filteredLeaveRequests.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No leave requests found</p>
                <p className="text-xs text-slate-400 mt-1">Leave requests from staff will appear here</p>
              </div>
            ) : (
              filteredLeaveRequests.map(lr => (
                <div key={lr._id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                        {getInitials(lr.userId?.firstName || '', lr.userId?.lastName || '')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {lr.userId?.firstName} {lr.userId?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {lr.userId?.employeeId && `ID: ${lr.userId.employeeId} · `}
                          {lr.userId?.role === 'teacher' ? 'Teacher' : lr.userId?.role === 'tenant_admin' ? 'Admin' : lr.userId?.role}
                        </p>
                      </div>
                    </div>
                    <SchoolStatusBadge value={lr.status.toLowerCase()} />
                  </div>
                  <div className="mt-3 ml-13 pl-[52px]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-medium">Type:</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {lr.leaveType.replace(/_/g, ' ')}
                        </span>
                      </span>
                      <span>
                        <span className="font-medium">Duration:</span>{' '}
                        {lr.numberOfDays} day{lr.numberOfDays !== 1 ? 's' : ''}
                        {lr.isHalfDay && ' (Half Day)'}
                      </span>
                      <span>
                        <span className="font-medium">Dates:</span>{' '}
                        {new Date(lr.startDate).toLocaleDateString()} - {new Date(lr.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {lr.reason && (
                      <p className="text-sm text-slate-500 mt-1">
                        <span className="font-medium text-slate-600">Reason:</span> {lr.reason}
                      </p>
                    )}
                    {lr.status === LeaveStatus.PENDING && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleApproveLeave(lr._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(lr._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-[#824ef2]" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Staff Attendance Report</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              View detailed attendance reports for all staff members. Track present, absent, and late records.
            </p>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{stats.total - stats.onLeave}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Present Today</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{stats.onLeave}</p>
                <p className="text-xs text-amber-600 font-medium mt-1">On Leave</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">0</p>
                <p className="text-xs text-red-600 font-medium mt-1">Absent</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {stats.total > 0 ? Math.round(((stats.total - stats.onLeave) / stats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">Attendance Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Details Modal */}
      <FormModal
        open={!!showStaffModal}
        title="Staff Details"
        onClose={() => setShowStaffModal(null)}
        size="lg"
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
              className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#824ef2' }}
            >
              Close
            </button>
          </div>
        }
      >
        {showStaffModal && (
          <div className="space-y-6">
            {/* Header: Avatar + Name + Role + Status + Employee ID */}
            <div className="flex items-start gap-4 pb-5 border-b border-slate-200">
              <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center text-[#824ef2] text-2xl font-bold flex-shrink-0">
                {getInitials(showStaffModal.firstName, showStaffModal.lastName)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {showStaffModal.firstName} {showStaffModal.lastName}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {showStaffModal.role === 'teacher' ? 'Class Teacher' : showStaffModal.role === 'tenant_admin' ? 'School Admin' : 'Accountant'}
                  {showStaffModal.qualification ? ` - ${showStaffModal.qualification}` : ''}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <SchoolStatusBadge value={showStaffModal.isActive !== false ? 'active' : 'inactive'} />
                  {showStaffModal.employeeId && (
                    <span className="text-xs text-slate-500">Employee ID: {showStaffModal.employeeId}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Two-column: Personal Information + Professional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4">Personal Information</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Email', value: showStaffModal.email || '—' },
                    { label: 'Phone', value: showStaffModal.phoneNumber || '—' },
                    { label: 'Date of Birth', value: showStaffModal.dateOfBirth ? new Date(showStaffModal.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                    { label: 'Gender', value: showStaffModal.gender || '—' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-slate-500">{item.label}:</span>
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4">Professional Details</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Qualification', value: showStaffModal.qualification || '—' },
                    { label: 'Subject', value: showStaffModal.subjects && showStaffModal.subjects.length > 0 ? showStaffModal.subjects.map((s: any) => s.name || s).join(', ') : '—' },
                    { label: 'Joining Date', value: showStaffModal.joiningDate ? new Date(showStaffModal.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-slate-500">{item.label}:</span>
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assigned Subjects as pills */}
            {showStaffModal.role === 'teacher' && showStaffModal.subjects && showStaffModal.subjects.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Assigned Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {showStaffModal.subjects.map((subject: any) => (
                    <span
                      key={subject._id || subject}
                      className="px-3 py-1.5 bg-purple-50 text-[#824ef2] rounded-lg text-sm font-medium border border-purple-100"
                    >
                      {subject.name || subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance Summary */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900">Attendance Summary</h4>
                <div className="flex items-center gap-2">
                  <input type="date" defaultValue="2024-01-01" className="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]" />
                  <span className="text-xs text-slate-400">to</span>
                  <input type="date" defaultValue="2024-12-31" className="px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]" />
                  <button className="px-3 py-1 text-xs font-medium text-white rounded-lg" style={{ backgroundColor: '#824ef2' }}>
                    Filter
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">186</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Present Days</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">12</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">Leave Days</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">2</p>
                  <p className="text-xs text-red-600 font-medium mt-1">Absent Days</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#824ef2]">93%</p>
                  <p className="text-xs text-[#824ef2] font-medium mt-1">Attendance Rate</p>
                </div>
              </div>
            </div>

            {/* This Month Overview */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-3">This Month Overview</h4>
              <div className="grid grid-cols-7 gap-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-[10px] font-semibold text-slate-400 uppercase pb-1">{day}</div>
                ))}
                {/* Empty cells for offset (month starts on Wednesday) */}
                {[0, 1].map(i => (
                  <div key={`empty-${i}`} />
                ))}
                {/* Days of the month with attendance status */}
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1;
                  const isWeekend = ((i + 2) % 7 === 5) || ((i + 2) % 7 === 6); // Sat, Sun
                  const isAbsent = day === 8;
                  const isLeave = day === 15 || day === 16;
                  const isToday = day === 24;
                  const isFuture = day > 24;

                  let bgColor = 'bg-emerald-100 text-emerald-700'; // Present
                  if (isFuture) bgColor = 'bg-slate-50 text-slate-300';
                  else if (isWeekend) bgColor = 'bg-slate-100 text-slate-400';
                  else if (isAbsent) bgColor = 'bg-red-100 text-red-700';
                  else if (isLeave) bgColor = 'bg-amber-100 text-amber-700';

                  return (
                    <div
                      key={day}
                      className={`h-8 rounded-md flex items-center justify-center text-xs font-semibold ${bgColor} ${isToday ? 'ring-2 ring-[#824ef2] ring-offset-1' : ''}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
                  <span className="text-[10px] text-slate-500">Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
                  <span className="text-[10px] text-slate-500">Leave</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
                  <span className="text-[10px] text-slate-500">Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
                  <span className="text-[10px] text-slate-500">Weekend</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </FormModal>

      {/* Create Staff Modal */}
      <FormModal
        open={isStaffModalOpen}
        title="Add New Staff Member"
        onClose={() => { setIsStaffModalOpen(false); setFormError(''); }}
        size="lg"
      >
        <form onSubmit={handleCreateStaff} className="space-y-6">
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </p>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              Role Selection
            </h5>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                required
                className={inputClasses}
              >
                <option value="teacher">Teacher</option>
                <option value="tenant_admin">School Admin</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-500" />
              Personal Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="firstName" value={formData.firstName}
                  onChange={handleFormChange} required className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="lastName" value={formData.lastName}
                  onChange={handleFormChange} required className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="tel" name="phoneNumber" value={formData.phoneNumber}
                  onChange={handleFormChange} className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div>
            <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              Account Credentials
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleFormChange} required className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password" name="password" value={formData.password}
                  onChange={handleFormChange} required minLength={8} className={inputClasses}
                />
                <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          {(formData.role === 'teacher' || formData.role === 'tenant_admin') && (
            <div>
              <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-500" />
                Employment Details
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee ID</label>
                  <input
                    type="text" name="employeeId" value={formData.employeeId}
                    onChange={handleFormChange} placeholder="Auto-generated if empty" className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Joining Date</label>
                  <input
                    type="date" name="joiningDate" value={formData.joiningDate}
                    onChange={handleFormChange} className={inputClasses}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualification</label>
                  <input
                    type="text" name="qualification" value={formData.qualification}
                    onChange={handleFormChange} placeholder="e.g., M.Ed, B.Sc, etc." className={inputClasses}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStaffModalOpen(false)}
              disabled={formLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#824ef2' }}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Assign Teacher Modal */}
      <FormModal
        open={!!assignTeacher}
        title="Assign Classes & Subjects"
        onClose={() => {
          setAssignTeacher(null);
          setAssignments([]);
          setCurrentAssignment({ classId: '', sections: [], subjectIds: [] });
          setAssignError('');
        }}
        size="xl"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-6">
          {assignTeacher && (
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#824ef2] text-sm font-bold">
                {getInitials(assignTeacher.firstName, assignTeacher.lastName)}
              </div>
              <div>
                <p className="font-medium text-slate-900">{assignTeacher.firstName} {assignTeacher.lastName}</p>
                <p className="text-xs text-slate-500">Teacher</p>
              </div>
            </div>
          )}

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
              <Loader2 className="w-12 h-12 text-[#824ef2] animate-spin" />
              <p className="mt-4 text-slate-500 text-sm">Loading classes and subjects...</p>
            </div>
          ) : (
            <>
              {/* Current Assignments */}
              {assignments.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-500" />
                    Current Assignments ({assignments.length})
                  </h5>
                  <div className="space-y-3">
                    {assignments.map((assignment, index) => (
                      <div
                        key={`${assignment.classId}-${assignment.sections.join(',')}`}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 group hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#824ef2] text-sm font-bold">
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
                </div>
              )}

              {/* Add New Assignment */}
              <div>
                <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-slate-500" />
                  Add New Assignment
                </h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentAssignment.classId}
                      onChange={(e) => {
                        setCurrentAssignment({
                          classId: e.target.value,
                          sections: [],
                          subjectIds: currentAssignment.subjectIds,
                        });
                      }}
                      className={inputClasses}
                    >
                      <option value="">Choose a class...</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} (Grade {cls.grade})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedClass && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Select Sections <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedClass.sections.map(section => (
                          <button
                            key={section}
                            type="button"
                            onClick={() => handleSectionToggle(section)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              currentAssignment.sections.includes(section)
                                ? 'bg-[#824ef2] text-white'
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Subjects <span className="text-red-500">*</span>
                    </label>
                    {subjects.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No subjects available. Please create subjects first.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                        {subjects.map(subject => (
                          <label
                            key={subject._id}
                            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all ${
                              currentAssignment.subjectIds.includes(subject._id)
                                ? 'bg-purple-50 border border-purple-200'
                                : 'bg-white hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                              currentAssignment.subjectIds.includes(subject._id)
                                ? 'bg-[#824ef2]'
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
                                ? 'text-[#824ef2]'
                                : 'text-slate-700'
                            }`}>
                              {subject.name} <span className="text-slate-400">({subject.code})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAssignment}
                    disabled={!currentAssignment.classId || currentAssignment.sections.length === 0 || currentAssignment.subjectIds.length === 0}
                    className="w-full py-3 px-4 rounded-lg text-sm font-medium border-2 border-dashed border-[#824ef2]/30 text-[#824ef2]
                      hover:bg-purple-50 hover:border-[#824ef2]/50 transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-[#824ef2]/30
                      flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add This Assignment
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAssignTeacher(null);
                    setAssignments([]);
                    setCurrentAssignment({ classId: '', sections: [], subjectIds: [] });
                  }}
                  disabled={assignLoading}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || assignments.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#824ef2' }}
                >
                  {assignLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Save Assignments ({assignments.length})
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </FormModal>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Delete"
        confirmColor={confirmModal.color}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}
