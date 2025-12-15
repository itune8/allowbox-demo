'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  leaveRequestService,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  CreateLeaveRequestDto,
  LeaveStats,
} from '../../../../lib/services/leave-request.service';

export default function TeacherLeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateLeaveRequestDto>({
    leaveType: LeaveType.CASUAL,
    startDate: new Date().toISOString().split('T')[0] ?? '',
    endDate: new Date().toISOString().split('T')[0] ?? '',
    reason: '',
    contactDuringLeave: '',
    isHalfDay: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        leaveRequestService.getMyRequests(),
        leaveRequestService.getMyStats(),
      ]);
      setLeaveRequests(requestsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.reason.trim()) return;

    try {
      setSubmitting(true);
      await leaveRequestService.create(formData);
      await loadData();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await leaveRequestService.cancel(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setFormData({
      leaveType: LeaveType.CASUAL,
      startDate: new Date().toISOString().split('T')[0] ?? '',
      endDate: new Date().toISOString().split('T')[0] ?? '',
      reason: '',
      contactDuringLeave: '',
      isHalfDay: false,
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Requests</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Apply for leave and track requests
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="text-xs sm:text-sm">+ <span className="hidden sm:inline">Apply for </span>Leave</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Leave Stats */}
      {stats && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            Leave Summary (This Year)
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalDays}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
            </div>
            {Object.entries(stats.byType).map(([type, days]) => (
              <div key={type} className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{days}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {leaveTypeLabels[type as LeaveType]?.split(' ')[0] || type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Requests List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Leave Requests</h3>
        </div>
        {leaveRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📅</div>
            <p>No leave requests yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {leaveRequests.map((request) => (
              <div
                key={request._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {leaveTypeLabels[request.leaveType]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                      <span className="ml-2">({request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''})</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                      {request.reason}
                    </div>
                  </div>
                  {request.status === LeaveStatus.PENDING && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(request._id);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                {request.approverComment && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-2">
                    <span className="font-medium">Admin:</span> {request.approverComment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Apply for Leave
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Leave Type *
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveType })}
                  required
                >
                  {Object.entries(leaveTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.isHalfDay}
                    onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })}
                    className="rounded"
                  />
                  Half Day Leave
                </label>
                {formData.isHalfDay && (
                  <select
                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.halfDayType || 'FIRST_HALF'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        halfDayType: e.target.value as 'FIRST_HALF' | 'SECOND_HALF',
                      })
                    }
                  >
                    <option value="FIRST_HALF">First Half</option>
                    <option value="SECOND_HALF">Second Half</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Reason *
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Contact During Leave
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={formData.contactDuringLeave}
                  onChange={(e) => setFormData({ ...formData, contactDuringLeave: e.target.value })}
                  placeholder="Phone number or alternate contact"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setSelectedRequest(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-zoom-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {leaveTypeLabels[selectedRequest.leaveType]}
              </h3>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedRequest.status]}`}>
                {selectedRequest.status}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
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
                <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.contactDuringLeave && (
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Contact:</span>
                  <p className="text-gray-600 dark:text-gray-300">{selectedRequest.contactDuringLeave}</p>
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

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              {selectedRequest.status === LeaveStatus.PENDING && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCancel(selectedRequest._id);
                    setSelectedRequest(null);
                  }}
                  className="text-red-600"
                >
                  Cancel Request
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
