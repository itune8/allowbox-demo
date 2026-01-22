'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  leaveRequestService,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
} from '../../../../lib/services/leave-request.service';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
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
} from 'lucide-react';

export default function LeaveManagementPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | ''>('');
  const [approveComment, setApproveComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  async function loadData() {
    try {
      setLoading(true);
      const [allData, pendingData] = await Promise.all([
        leaveRequestService.getAll(filterStatus ? { status: filterStatus } : undefined),
        leaveRequestService.getPendingRequests(),
      ]);
      setLeaveRequests(allData);
      setPendingRequests(pendingData);
    } catch (err) {
      setError('Failed to load leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string, status: LeaveStatus.APPROVED | LeaveStatus.REJECTED) {
    try {
      setProcessing(true);
      await leaveRequestService.approve(id, { status, comment: approveComment });
      await loadData();
      setSelectedRequest(null);
      setShowDetailsSheet(false);
      setApproveComment('');
    } catch (err) {
      console.error(err);
      setError('Failed to process leave request');
    } finally {
      setProcessing(false);
    }
  }

  function handleOpenDetails(request: LeaveRequest) {
    setSelectedRequest(request);
    setShowDetailsSheet(true);
  }

  function handleCloseDetails() {
    setShowDetailsSheet(false);
    setSelectedRequest(null);
    setApproveComment('');
  }

  const statusColors: Record<LeaveStatus, string> = {
    [LeaveStatus.PENDING]: 'bg-amber-100 text-amber-700',
    [LeaveStatus.APPROVED]: 'bg-emerald-100 text-emerald-700',
    [LeaveStatus.REJECTED]: 'bg-red-100 text-red-700',
    [LeaveStatus.CANCELLED]: 'bg-slate-100 text-slate-700',
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

  const stats = {
    total: leaveRequests.length,
    pending: pendingRequests.length,
    approved: leaveRequests.filter((r) => r.status === LeaveStatus.APPROVED).length,
    rejected: leaveRequests.filter((r) => r.status === LeaveStatus.REJECTED).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
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
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
            <p className="text-sm text-slate-500">Review and approve staff leave requests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Approved</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.approved}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.rejected}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0" />
              Pending Approval ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleOpenDetails(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {request.userId?.firstName?.charAt(0)}
                        </div>
                        <span>
                          {request.userId?.firstName} {request.userId?.lastName}
                        </span>
                        <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-200 rounded-full">
                          {request.userId?.role}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-2 flex items-center gap-2 flex-wrap">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{leaveTypeLabels[request.leaveType]}</span>
                        <span className="text-slate-400">|</span>
                        <span>
                          {new Date(request.startDate).toLocaleDateString()} -{' '}
                          {new Date(request.endDate).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 bg-primary text-white rounded text-xs font-medium">
                          {request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1 line-clamp-1">{request.reason}</div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(request._id, LeaveStatus.APPROVED);
                        }}
                        disabled={processing}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(request);
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-600 font-medium">Filter:</span>
          <select
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LeaveStatus | '')}
          >
            <option value="">All Requests</option>
            <option value={LeaveStatus.PENDING}>Pending</option>
            <option value={LeaveStatus.APPROVED}>Approved</option>
            <option value={LeaveStatus.REJECTED}>Rejected</option>
            <option value={LeaveStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* All Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900">All Leave Requests</h3>
        </div>
        {leaveRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">No leave requests found.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full hidden md:table">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Staff Member
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Leave Type
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Dates
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Days
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleOpenDetails(request)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
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
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {leaveTypeLabels[request.leaveType]}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                        {request.numberOfDays}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(request);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {leaveRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleOpenDetails(request)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {request.userId?.firstName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {request.userId?.firstName} {request.userId?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{leaveTypeLabels[request.leaveType]}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusColors[request.status]}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(request.startDate).toLocaleDateString()} -{' '}
                    {new Date(request.endDate).toLocaleDateString()}
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

      {/* Detail Sheet */}
      <SlideSheet
        isOpen={showDetailsSheet}
        onClose={handleCloseDetails}
        title="Leave Request Details"
        subtitle={selectedRequest ? `${selectedRequest.userId?.firstName} ${selectedRequest.userId?.lastName}` : ''}
        size="lg"
        footer={
          selectedRequest ? (
            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={handleCloseDetails}
                className="px-6"
              >
                Close
              </Button>
              {selectedRequest.status === LeaveStatus.PENDING && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="px-6 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => handleApprove(selectedRequest._id, LeaveStatus.REJECTED)}
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest._id, LeaveStatus.APPROVED)}
                    disabled={processing}
                    className="px-6 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedRequest && (
          <>
            {/* Status Badge */}
            <div className="mb-6">
              <span
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                  selectedRequest.status === LeaveStatus.PENDING
                    ? 'bg-amber-100 text-amber-800'
                    : selectedRequest.status === LeaveStatus.APPROVED
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedRequest.status === LeaveStatus.REJECTED
                    ? 'bg-red-100 text-red-800'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {selectedRequest.status}
              </span>
            </div>

            {/* Staff Information Section */}
            <SheetSection title="Staff Information" icon={<User className="w-4 h-4" />}>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
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
            </SheetSection>

            {/* Leave Details Section */}
            <SheetSection title="Leave Details" icon={<CalendarDays className="w-4 h-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SheetDetailRow
                  label="Leave Type"
                  value={leaveTypeLabels[selectedRequest.leaveType]}
                  icon={<FileText className="w-4 h-4" />}
                />
                <SheetDetailRow
                  label="Duration"
                  value={`${selectedRequest.numberOfDays} day${selectedRequest.numberOfDays !== 1 ? 's' : ''}${
                    selectedRequest.isHalfDay
                      ? ` (${selectedRequest.halfDayType?.replace('_', ' ')})`
                      : ''
                  }`}
                  icon={<Clock className="w-4 h-4" />}
                />
                <SheetDetailRow
                  label="Start Date"
                  value={new Date(selectedRequest.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <SheetDetailRow
                  label="End Date"
                  value={new Date(selectedRequest.endDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                  icon={<CalendarRange className="w-4 h-4" />}
                />
                <div className="md:col-span-2">
                  <SheetDetailRow
                    label="Applied On"
                    value={new Date(selectedRequest.createdAt).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    icon={<Clock className="w-4 h-4" />}
                  />
                </div>
              </div>
            </SheetSection>

            {/* Reason Section */}
            <SheetSection title="Reason for Leave" icon={<MessageSquare className="w-4 h-4" />}>
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 min-h-[80px]">
                  {selectedRequest.reason}
                </div>
              </div>
            </SheetSection>

            {/* Contact During Leave Section */}
            {selectedRequest.contactDuringLeave && (
              <SheetSection title="Contact During Leave" icon={<Phone className="w-4 h-4" />}>
                <SheetDetailRow
                  label="Contact Number"
                  value={selectedRequest.contactDuringLeave}
                  icon={<Phone className="w-4 h-4" />}
                />
              </SheetSection>
            )}

            {/* Approval Comment Section (for pending requests) */}
            {selectedRequest.status === LeaveStatus.PENDING && (
              <SheetSection title="Add Comment" icon={<MessageSquare className="w-4 h-4" />}>
                <SheetField label="Comment (optional)">
                  <textarea
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-900
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                      hover:border-slate-300 transition-all resize-none
                      placeholder:text-slate-400"
                    rows={3}
                    value={approveComment}
                    onChange={(e) => setApproveComment(e.target.value)}
                    placeholder="Add a comment for the staff member..."
                  />
                </SheetField>
              </SheetSection>
            )}

            {/* Approval Info Section (for processed requests) */}
            {selectedRequest.approvedBy && (
              <SheetSection
                title={`${selectedRequest.status === LeaveStatus.APPROVED ? 'Approval' : 'Rejection'} Details`}
                icon={
                  selectedRequest.status === LeaveStatus.APPROVED ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )
                }
              >
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                        selectedRequest.status === LeaveStatus.APPROVED
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                      }`}
                    >
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
                      <p className="text-sm text-slate-700 bg-white rounded-lg p-3">
                        {selectedRequest.approverComment}
                      </p>
                    </div>
                  )}
                </div>
              </SheetSection>
            )}
          </>
        )}
      </SlideSheet>
    </section>
  );
}
