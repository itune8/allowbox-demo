'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  leaveRequestService,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
} from '../../../../lib/services/leave-request.service';

export default function LeaveManagementPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
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
      setApproveComment('');
    } catch (err) {
      console.error(err);
      setError('Failed to process leave request');
    } finally {
      setProcessing(false);
    }
  }

  const statusColors: Record<LeaveStatus, string> = {
    [LeaveStatus.PENDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    [LeaveStatus.APPROVED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    [LeaveStatus.REJECTED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    [LeaveStatus.CANCELLED]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Review and approve staff leave requests
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            Pending Approval ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {request.userId?.firstName} {request.userId?.lastName}
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({request.userId?.role})
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {leaveTypeLabels[request.leaveType]} |{' '}
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                      <span className="ml-2">
                        ({request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-1">{request.reason}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(request._id, LeaveStatus.APPROVED);
                      }}
                      disabled={processing}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
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
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
        <select
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as LeaveStatus | '')}
        >
          <option value="">All</option>
          <option value={LeaveStatus.PENDING}>Pending</option>
          <option value={LeaveStatus.APPROVED}>Approved</option>
          <option value={LeaveStatus.REJECTED}>Rejected</option>
          <option value={LeaveStatus.CANCELLED}>Cancelled</option>
        </select>
      </div>

      {/* All Requests Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">All Leave Requests</h3>
        </div>
        {leaveRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <p>No leave requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Staff Member
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Leave Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dates
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Days
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {leaveRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {request.userId?.firstName} {request.userId?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{request.userId?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {leaveTypeLabels[request.leaveType]}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {request.numberOfDays}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(request);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => {
              setSelectedRequest(null);
              setApproveComment('');
            }}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg p-6 animate-zoom-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Leave Request Details
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedRequest.userId?.firstName} {selectedRequest.userId?.lastName}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedRequest.status]}`}>
                {selectedRequest.status}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
                <div>
                  <span className="font-medium">Leave Type:</span>{' '}
                  {leaveTypeLabels[selectedRequest.leaveType]}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {selectedRequest.userId?.role}
                </div>
                <div>
                  <span className="font-medium">Start Date:</span>{' '}
                  {new Date(selectedRequest.startDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">End Date:</span>{' '}
                  {new Date(selectedRequest.endDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {selectedRequest.numberOfDays} day
                  {selectedRequest.numberOfDays !== 1 ? 's' : ''}
                  {selectedRequest.isHalfDay && ` (${selectedRequest.halfDayType?.replace('_', ' ')})`}
                </div>
                <div>
                  <span className="font-medium">Applied:</span>{' '}
                  {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Reason:</span>
                <p className="text-gray-600 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-800 rounded p-2">
                  {selectedRequest.reason}
                </p>
              </div>

              {selectedRequest.contactDuringLeave && (
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Contact:</span>
                  <p className="text-gray-600 dark:text-gray-300">{selectedRequest.contactDuringLeave}</p>
                </div>
              )}

              {selectedRequest.status === LeaveStatus.PENDING && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment (optional)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    rows={2}
                    value={approveComment}
                    onChange={(e) => setApproveComment(e.target.value)}
                    placeholder="Add a comment for the staff member..."
                  />
                </div>
              )}

              {selectedRequest.approvedBy && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">
                      {selectedRequest.status === LeaveStatus.APPROVED ? 'Approved' : 'Rejected'} by:
                    </span>{' '}
                    {selectedRequest.approvedBy.firstName} {selectedRequest.approvedBy.lastName}
                  </div>
                  {selectedRequest.approvedAt && (
                    <div className="text-gray-500 text-xs mt-1">
                      on {new Date(selectedRequest.approvedAt).toLocaleString()}
                    </div>
                  )}
                  {selectedRequest.approverComment && (
                    <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded p-2">
                      {selectedRequest.approverComment}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setApproveComment('');
                }}
              >
                Close
              </Button>
              {selectedRequest.status === LeaveStatus.PENDING && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleApprove(selectedRequest._id, LeaveStatus.REJECTED)}
                    disabled={processing}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRequest._id, LeaveStatus.APPROVED)}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Approve'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
