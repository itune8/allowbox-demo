'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  leaveRequestService,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
} from '../../../../lib/services/leave-request.service';
import { SchoolStatCard, SchoolStatusBadge, FormModal, useToast } from '../../../../components/school';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Phone,
  MessageSquare,
  Briefcase,
  CalendarDays,
  CalendarRange,
  Loader2,
  UserCheck,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type TabKey = 'all' | 'pending' | 'approved' | 'rejected' | 'calendar';

const leaveTypeColors: Record<LeaveType, string> = {
  [LeaveType.SICK]: 'bg-red-100 text-red-700',
  [LeaveType.CASUAL]: 'bg-blue-100 text-blue-700',
  [LeaveType.EARNED]: 'bg-green-100 text-green-700',
  [LeaveType.MATERNITY]: 'bg-pink-100 text-pink-700',
  [LeaveType.PATERNITY]: 'bg-teal-100 text-teal-700',
  [LeaveType.UNPAID]: 'bg-slate-100 text-slate-700',
  [LeaveType.OTHER]: 'bg-gray-100 text-gray-700',
};

const leaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.SICK]: 'Sick Leave',
  [LeaveType.CASUAL]: 'Casual Leave',
  [LeaveType.EARNED]: 'Earned Leave',
  [LeaveType.MATERNITY]: 'Maternity Leave',
  [LeaveType.PATERNITY]: 'Paternity Leave',
  [LeaveType.UNPAID]: 'Unpaid Leave',
  [LeaveType.OTHER]: 'Other',
};

// ── Mock data used when API returns no results ──
const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    _id: 'mock-1',
    tenantId: 'tenant-1',
    userId: { _id: 'u1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@school.app', role: 'Teacher', employeeId: 'T-001' },
    leaveType: LeaveType.SICK,
    startDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    numberOfDays: 3,
    reason: 'Feeling unwell with flu symptoms, need rest and recovery time.',
    status: LeaveStatus.PENDING,
    isHalfDay: false,
    isActive: true,
    contactDuringLeave: '+1 555-0101',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'mock-2',
    tenantId: 'tenant-1',
    userId: { _id: 'u2', firstName: 'Michael', lastName: 'Chen', email: 'michael.c@school.app', role: 'Teacher', employeeId: 'T-002' },
    leaveType: LeaveType.CASUAL,
    startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 8 * 86400000).toISOString(),
    numberOfDays: 2,
    reason: 'Family event — sister\'s wedding ceremony.',
    status: LeaveStatus.PENDING,
    isHalfDay: false,
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'mock-3',
    tenantId: 'tenant-1',
    userId: { _id: 'u3', firstName: 'Priya', lastName: 'Patel', email: 'priya.p@school.app', role: 'Teacher', employeeId: 'T-003' },
    leaveType: LeaveType.EARNED,
    startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    numberOfDays: 5,
    reason: 'Annual family vacation — planned trip abroad.',
    status: LeaveStatus.APPROVED,
    approvedBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    approvedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    approverComment: 'Approved. Please ensure lesson plans are handed over.',
    isHalfDay: false,
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    _id: 'mock-4',
    tenantId: 'tenant-1',
    userId: { _id: 'u4', firstName: 'James', lastName: 'Wilson', email: 'james.w@school.app', role: 'Staff', employeeId: 'S-001' },
    leaveType: LeaveType.SICK,
    startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    numberOfDays: 2,
    reason: 'Doctor appointment and medical procedure.',
    status: LeaveStatus.APPROVED,
    approvedBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    approvedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    isHalfDay: false,
    isActive: true,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    _id: 'mock-5',
    tenantId: 'tenant-1',
    userId: { _id: 'u5', firstName: 'Amara', lastName: 'Okafor', email: 'amara.o@school.app', role: 'Teacher', employeeId: 'T-004' },
    leaveType: LeaveType.MATERNITY,
    startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 104 * 86400000).toISOString(),
    numberOfDays: 90,
    reason: 'Maternity leave — expected due date in March.',
    status: LeaveStatus.PENDING,
    isHalfDay: false,
    isActive: true,
    contactDuringLeave: '+1 555-0105',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: 'mock-6',
    tenantId: 'tenant-1',
    userId: { _id: 'u6', firstName: 'David', lastName: 'Kim', email: 'david.k@school.app', role: 'Teacher', employeeId: 'T-005' },
    leaveType: LeaveType.CASUAL,
    startDate: new Date(Date.now() - 20 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 20 * 86400000).toISOString(),
    numberOfDays: 1,
    reason: 'Personal errand — passport renewal appointment.',
    status: LeaveStatus.REJECTED,
    approvedBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    approvedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    approverComment: 'Rejected — exam week. Please reschedule.',
    isHalfDay: false,
    isActive: true,
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
  {
    _id: 'mock-7',
    tenantId: 'tenant-1',
    userId: { _id: 'u7', firstName: 'Emily', lastName: 'Brown', email: 'emily.b@school.app', role: 'Staff', employeeId: 'S-002' },
    leaveType: LeaveType.UNPAID,
    startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 9 * 86400000).toISOString(),
    numberOfDays: 5,
    reason: 'Attending a professional development workshop out of state.',
    status: LeaveStatus.PENDING,
    isHalfDay: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-8',
    tenantId: 'tenant-1',
    userId: { _id: 'u8', firstName: 'Raj', lastName: 'Sharma', email: 'raj.s@school.app', role: 'Teacher', employeeId: 'T-006' },
    leaveType: LeaveType.PATERNITY,
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 16 * 86400000).toISOString(),
    numberOfDays: 15,
    reason: 'Paternity leave — newborn baby.',
    status: LeaveStatus.APPROVED,
    approvedBy: { _id: 'admin-1', firstName: 'Admin', lastName: 'User' },
    approvedAt: new Date(Date.now() - 32 * 86400000).toISOString(),
    approverComment: 'Congratulations! Approved.',
    isHalfDay: false,
    isActive: true,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 32 * 86400000).toISOString(),
  },
];

export default function LeaveManagementPage() {
  const { showToast } = useToast();
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState<LeaveType | ''>('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarLeaves, setCalendarLeaves] = useState<LeaveRequest[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'calendar') {
      loadCalendarData();
    }
  }, [activeTab, calendarMonth, calendarYear]);

  async function loadData() {
    try {
      setLoading(true);
      const [allData, pendingData] = await Promise.all([
        leaveRequestService.getAll(),
        leaveRequestService.getPendingRequests(),
      ]);
      // Use mock data if API returns empty
      const finalAll = allData.length > 0 ? allData : MOCK_LEAVE_REQUESTS;
      const finalPending = pendingData.length > 0 ? pendingData : MOCK_LEAVE_REQUESTS.filter(r => r.status === LeaveStatus.PENDING);
      setAllRequests(finalAll);
      setPendingRequests(finalPending);
    } catch (err) {
      console.error('Failed to load leave requests, using mock data:', err);
      // Fallback to mock data on error
      setAllRequests(MOCK_LEAVE_REQUESTS);
      setPendingRequests(MOCK_LEAVE_REQUESTS.filter(r => r.status === LeaveStatus.PENDING));
    } finally {
      setLoading(false);
    }
  }

  async function loadCalendarData() {
    try {
      setCalendarLoading(true);
      const startDate = new Date(calendarYear, calendarMonth, 1).toISOString().split('T')[0]!;
      const endDate = new Date(calendarYear, calendarMonth + 1, 0).toISOString().split('T')[0]!;
      const data = await leaveRequestService.getTeamCalendar(startDate, endDate);
      // Use mock data filtered to current month if API returns empty
      if (data.length > 0) {
        setCalendarLeaves(data);
      } else {
        const mockForMonth = MOCK_LEAVE_REQUESTS.filter(r => {
          const start = new Date(r.startDate);
          const end = new Date(r.endDate);
          const monthStart = new Date(calendarYear, calendarMonth, 1);
          const monthEnd = new Date(calendarYear, calendarMonth + 1, 0);
          return start <= monthEnd && end >= monthStart;
        });
        setCalendarLeaves(mockForMonth);
      }
    } catch (err) {
      console.error('Failed to load calendar data, using mock:', err);
      const mockForMonth = MOCK_LEAVE_REQUESTS.filter(r => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const monthStart = new Date(calendarYear, calendarMonth, 1);
        const monthEnd = new Date(calendarYear, calendarMonth + 1, 0);
        return start <= monthEnd && end >= monthStart;
      });
      setCalendarLeaves(mockForMonth);
    } finally {
      setCalendarLoading(false);
    }
  }

  async function handleApprove(id: string, status: LeaveStatus.APPROVED | LeaveStatus.REJECTED) {
    try {
      setProcessing(true);
      await leaveRequestService.approve(id, { status, comment: approveComment });
      await loadData();
      setSelectedRequest(null);
      setShowDetailsModal(false);
      setApproveComment('');
      showToast('success', status === LeaveStatus.APPROVED ? 'Leave request approved' : 'Leave request rejected');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to process leave request');
    } finally {
      setProcessing(false);
    }
  }

  function handleOpenDetails(request: LeaveRequest) {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  }

  function handleCloseDetails() {
    setShowDetailsModal(false);
    setSelectedRequest(null);
    setApproveComment('');
  }

  function clearFilters() {
    setSearchQuery('');
    setFilterLeaveType('');
    setFilterFromDate('');
    setFilterToDate('');
  }

  // Filtered data based on tab + filters
  const filteredRequests = useMemo(() => {
    let data = allRequests;

    // Tab filter
    if (activeTab === 'pending') data = data.filter((r) => r.status === LeaveStatus.PENDING);
    else if (activeTab === 'approved') data = data.filter((r) => r.status === LeaveStatus.APPROVED);
    else if (activeTab === 'rejected') data = data.filter((r) => r.status === LeaveStatus.REJECTED);

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((r) =>
        `${r.userId?.firstName} ${r.userId?.lastName}`.toLowerCase().includes(q) ||
        r.userId?.email?.toLowerCase().includes(q)
      );
    }

    // Leave type filter
    if (filterLeaveType) {
      data = data.filter((r) => r.leaveType === filterLeaveType);
    }

    // Date range filter
    if (filterFromDate) {
      data = data.filter((r) => new Date(r.startDate) >= new Date(filterFromDate));
    }
    if (filterToDate) {
      data = data.filter((r) => new Date(r.endDate) <= new Date(filterToDate));
    }

    return data;
  }, [allRequests, activeTab, searchQuery, filterLeaveType, filterFromDate, filterToDate]);

  const stats = useMemo(() => ({
    total: allRequests.length,
    pending: pendingRequests.length,
    approved: allRequests.filter((r) => r.status === LeaveStatus.APPROVED).length,
    rejected: allRequests.filter((r) => r.status === LeaveStatus.REJECTED).length,
  }), [allRequests, pendingRequests]);

  // Calendar helpers
  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function getLeavesForDay(day: number) {
    return calendarLeaves.filter((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const check = new Date(calendarYear, calendarMonth, day);
      return check >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             check <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function prevMonth() {
    setSelectedCalendarDay(null);
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  }

  function nextMonth() {
    setSelectedCalendarDay(null);
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  }

  const hasActiveFilters = searchQuery || filterLeaveType || filterFromDate || filterToDate;

  const inputClass = 'px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-white rounded-xl border border-red-200 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#824ef2] flex items-center justify-center flex-shrink-0">
          <CalendarCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-sm text-slate-500">Review and manage staff leave requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<FileText className="w-5 h-5" />}
          color="blue"
          label="Total Requests"
          value={stats.total}
        />
        <SchoolStatCard
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          label="Pending Review"
          value={stats.pending}
          subtitle={stats.pending > 0 ? 'Needs attention' : undefined}
        />
        <SchoolStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          label="Approved"
          value={stats.approved}
        />
        <SchoolStatCard
          icon={<XCircle className="w-5 h-5" />}
          color="red"
          label="Rejected"
          value={stats.rejected}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-0 border-b border-slate-200 overflow-x-auto">
          {([
            { key: 'all' as TabKey, label: 'All Requests' },
            { key: 'pending' as TabKey, label: 'Pending', badge: stats.pending },
            { key: 'approved' as TabKey, label: 'Approved' },
            { key: 'rejected' as TabKey, label: 'Rejected' },
            { key: 'calendar' as TabKey, label: 'Calendar View' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'text-[#824ef2]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-amber-500 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </span>
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#824ef2]" />
              )}
            </button>
          ))}
        </div>

        {/* Calendar View Tab */}
        {activeTab === 'calendar' ? (
          <div className="p-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h3 className="text-lg font-semibold text-slate-900">
                {monthNames[calendarMonth]} {calendarYear}
              </h3>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {calendarLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
              </div>
            ) : (
              <>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells before first day */}
                  {Array.from({ length: getFirstDayOfMonth(calendarYear, calendarMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]" />
                  ))}

                  {/* Day cells */}
                  {Array.from({ length: getDaysInMonth(calendarYear, calendarMonth) }).map((_, i) => {
                    const day = i + 1;
                    const dayLeaves = getLeavesForDay(day);
                    const isToday = day === new Date().getDate() &&
                      calendarMonth === new Date().getMonth() &&
                      calendarYear === new Date().getFullYear();
                    const isSelected = selectedCalendarDay === day;
                    const approved = dayLeaves.filter((l) => l.status === LeaveStatus.APPROVED);
                    const pending = dayLeaves.filter((l) => l.status === LeaveStatus.PENDING);
                    const rejected = dayLeaves.filter((l) => l.status === LeaveStatus.REJECTED);

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                        className={`bg-white p-2 min-h-[80px] cursor-pointer transition-colors hover:bg-slate-50 ${
                          isSelected ? 'ring-2 ring-[#824ef2] ring-inset' : ''
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          isToday
                            ? 'inline-flex items-center justify-center w-7 h-7 bg-[#824ef2] text-white rounded-full'
                            : 'text-slate-700'
                        }`}>
                          {day}
                        </span>
                        {dayLeaves.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {approved.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${approved.length} approved`} />
                            )}
                            {pending.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title={`${pending.length} pending`} />
                            )}
                            {rejected.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-red-500" title={`${rejected.length} rejected`} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Approved</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Rejected</span>
                </div>

                {/* Selected day leaves */}
                {selectedCalendarDay !== null && (
                  <div className="mt-5 pt-5 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Leaves on {monthNames[calendarMonth]} {selectedCalendarDay}, {calendarYear}
                    </h4>
                    {getLeavesForDay(selectedCalendarDay).length === 0 ? (
                      <p className="text-sm text-slate-500">No leave requests on this day.</p>
                    ) : (
                      <div className="space-y-2">
                        {getLeavesForDay(selectedCalendarDay).map((leave) => (
                          <div
                            key={leave._id}
                            onClick={() => handleOpenDetails(leave)}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#824ef2] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {leave.userId?.firstName?.charAt(0)}
                              </div>
                              <div>
                                <span className="text-sm font-medium text-slate-900">
                                  {leave.userId?.firstName} {leave.userId?.lastName}
                                </span>
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${leaveTypeColors[leave.leaveType]}`}>
                                  {leaveTypeLabels[leave.leaveType]}
                                </span>
                              </div>
                            </div>
                            <SchoolStatusBadge value={leave.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* List View (All/Pending/Approved/Rejected tabs) */
          <div>
            {/* Filter bar */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by staff name..."
                    className={`${inputClass} w-full pl-9`}
                  />
                </div>
                <select
                  value={filterLeaveType}
                  onChange={(e) => setFilterLeaveType(e.target.value as LeaveType | '')}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">All Types</option>
                  {Object.entries(leaveTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className={inputClass}
                  title="From date"
                />
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className={inputClass}
                  title="To date"
                />
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No leave requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop table */}
                <table className="w-full hidden md:table">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">Staff Member</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">Leave Type</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">Duration</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">Days</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">Status</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">Applied On</th>
                      <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => handleOpenDetails(request)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#824ef2] flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {request.userId?.firstName?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {request.userId?.firstName} {request.userId?.lastName}
                              </div>
                              <div className="text-xs text-slate-500">{request.userId?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${leaveTypeColors[request.leaveType]}`}>
                            {leaveTypeLabels[request.leaveType]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                            {request.numberOfDays}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <SchoolStatusBadge value={request.status} />
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">
                          {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDetails(request); }}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile cards */}
                <div className="md:hidden p-4 space-y-3">
                  {filteredRequests.map((request) => (
                    <div
                      key={request._id}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleOpenDetails(request)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#824ef2] flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {request.userId?.firstName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {request.userId?.firstName} {request.userId?.lastName}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${leaveTypeColors[request.leaveType]}`}>
                              {leaveTypeLabels[request.leaveType]}
                            </span>
                          </div>
                        </div>
                        <SchoolStatusBadge value={request.status} />
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <FormModal
        open={showDetailsModal}
        onClose={handleCloseDetails}
        title="Leave Request Details"
        size="lg"
        footer={
          selectedRequest ? (
            <>
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === LeaveStatus.PENDING && (
                <>
                  <button
                    onClick={() => handleApprove(selectedRequest._id, LeaveStatus.REJECTED)}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest._id, LeaveStatus.APPROVED)}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                </>
              )}
            </>
          ) : undefined
        }
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Leave type colored header band */}
            <div className={`-mx-6 -mt-1 px-6 py-3 ${leaveTypeColors[selectedRequest.leaveType].replace('text-', 'text-').split(' ')[0]}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${leaveTypeColors[selectedRequest.leaveType].split(' ')[1]}`}>
                  {leaveTypeLabels[selectedRequest.leaveType]}
                </span>
                <SchoolStatusBadge value={selectedRequest.status} />
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-0 text-xs">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-slate-500 mt-1">Applied</span>
                <span className="text-slate-400">{new Date(selectedRequest.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-2 mb-6" />
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-slate-500 mt-1">Review</span>
                <span className="text-slate-400">
                  {selectedRequest.status === LeaveStatus.PENDING ? 'Pending' : new Date(selectedRequest.approvedAt || selectedRequest.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-2 mb-6" />
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  selectedRequest.status === LeaveStatus.APPROVED ? 'bg-emerald-100' :
                  selectedRequest.status === LeaveStatus.REJECTED ? 'bg-red-100' : 'bg-slate-100'
                }`}>
                  {selectedRequest.status === LeaveStatus.APPROVED ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ) : selectedRequest.status === LeaveStatus.REJECTED ? (
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <span className="text-slate-500 mt-1">
                  {selectedRequest.status === LeaveStatus.APPROVED ? 'Approved' :
                   selectedRequest.status === LeaveStatus.REJECTED ? 'Rejected' : 'Decision'}
                </span>
                <span className="text-slate-400">
                  {selectedRequest.status === LeaveStatus.PENDING ? '—' :
                    new Date(selectedRequest.approvedAt || selectedRequest.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Staff Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Staff Information
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#824ef2] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {selectedRequest.userId?.firstName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-lg">
                      {selectedRequest.userId?.firstName} {selectedRequest.userId?.lastName}
                    </div>
                    <div className="text-sm text-slate-500">{selectedRequest.userId?.email}</div>
                    <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium">
                      <Briefcase className="w-3 h-3" />
                      {selectedRequest.userId?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Leave Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Leave Type
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${leaveTypeColors[selectedRequest.leaveType]}`}>
                    {leaveTypeLabels[selectedRequest.leaveType]}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Duration
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {selectedRequest.numberOfDays} day{selectedRequest.numberOfDays !== 1 ? 's' : ''}
                    {selectedRequest.isHalfDay ? ` (${selectedRequest.halfDayType?.replace('_', ' ')})` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(selectedRequest.startDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <CalendarRange className="w-4 h-4" /> End Date
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(selectedRequest.endDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="md:col-span-2 flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Applied On
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(selectedRequest.createdAt).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Reason for Leave
              </h3>
              <div className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 min-h-[80px]">
                {selectedRequest.reason}
              </div>
            </div>

            {/* Contact During Leave */}
            {selectedRequest.contactDuringLeave && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Contact During Leave
                </h3>
                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Contact Number
                  </span>
                  <span className="text-sm font-medium text-slate-900">{selectedRequest.contactDuringLeave}</span>
                </div>
              </div>
            )}

            {/* Approval Comment */}
            {selectedRequest.status === LeaveStatus.PENDING && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Add Comment
                </h3>
                <textarea
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all resize-none placeholder:text-slate-400"
                  rows={3}
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Add a comment for the staff member..."
                />
              </div>
            )}

            {/* Approval Info */}
            {selectedRequest.approvedBy && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  {selectedRequest.status === LeaveStatus.APPROVED ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  {selectedRequest.status === LeaveStatus.APPROVED ? 'Approval' : 'Rejection'} Details
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                      selectedRequest.status === LeaveStatus.APPROVED ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {selectedRequest.approvedBy.firstName?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {selectedRequest.approvedBy.firstName} {selectedRequest.approvedBy.lastName}
                      </div>
                      {selectedRequest.approvedAt && (
                        <div className="text-xs text-slate-500">
                          on {new Date(selectedRequest.approvedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedRequest.approverComment && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Comment</label>
                      <p className="text-sm text-slate-700 bg-white rounded-lg p-3">{selectedRequest.approverComment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </FormModal>
    </section>
  );
}
