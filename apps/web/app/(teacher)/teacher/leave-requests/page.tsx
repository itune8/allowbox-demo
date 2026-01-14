'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, gradients } from '@/components/ui';
import {
  leaveRequestService,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  CreateLeaveRequestDto,
  LeaveStats,
} from '../../../../lib/services/leave-request.service';
import { Calendar, CheckCircle2, Clock, AlertCircle, Leaf } from 'lucide-react';

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
    [LeaveStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
    [LeaveStatus.APPROVED]: 'bg-green-100 text-green-700',
    [LeaveStatus.REJECTED]: 'bg-red-100 text-red-700',
    [LeaveStatus.CANCELLED]: 'bg-gray-100 text-gray-700',
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading leave requests...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Leave Requests
              <Icon3D gradient={gradients.emerald} size="sm">
                <Leaf className="w-3.5 h-3.5" />
              </Icon3D>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Apply for leave and track requests
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowForm(true)} className="text-xs sm:text-sm">
              + <span className="hidden sm:inline">Apply for </span>Leave
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100" hover={false}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              Leave Summary (This Year)
              <Icon3D gradient={gradients.emerald} size="sm">
                <Calendar className="w-3.5 h-3.5" />
              </Icon3D>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0 }}
                className="text-center p-2 sm:p-3 bg-white/60 backdrop-blur rounded-lg border border-emerald-100 hover:border-emerald-300 transition-all"
              >
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  {stats.totalDays}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </motion.div>
              {Object.entries(stats.byType).map(([type, days], index) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index + 1) * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="text-center p-2 sm:p-3 bg-white/60 backdrop-blur rounded-lg border border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
                >
                  <div className="text-lg sm:text-xl font-bold text-gray-900">{days}</div>
                  <div className="text-xs text-gray-600 truncate">
                    {leaveTypeLabels[type as LeaveType]?.split(' ')[0] || type}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Leave Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-0 bg-white/90" hover={false}>
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              My Leave Requests
            </h3>
          </div>
          {leaveRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center text-gray-500"
            >
              <div className="text-4xl mb-3">📅</div>
              <p>No leave requests yet.</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {leaveRequests.map((request, index) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(236, 252, 245, 0.5)' }}
                    className="p-4 cursor-pointer transition-all group"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {leaveTypeLabels[request.leaveType]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${statusColors[request.status]}`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(request.startDate).toLocaleDateString()} -{' '}
                          {new Date(request.endDate).toLocaleDateString()}
                          <span className="ml-2">({request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''})</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {request.reason}
                        </div>
                      </div>
                      {request.status === LeaveStatus.PENDING && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                        </motion.div>
                      )}
                    </div>
                    {request.approverComment && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-gray-600 bg-emerald-50 rounded p-2 border border-emerald-100"
                      >
                        <span className="font-medium">Admin:</span> {request.approverComment}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            >
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Apply for Leave
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Leave Type *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
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
                  <label className="block text-sm text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
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
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
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
                <label className="block text-sm text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Contact During Leave
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedRequest(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {leaveTypeLabels[selectedRequest.leaveType]}
              </h3>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedRequest.status]}`}>
                {selectedRequest.status}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 text-gray-600">
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
                <span className="font-medium text-gray-900">Reason:</span>
                <p className="text-gray-600 mt-1">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.contactDuringLeave && (
                <div>
                  <span className="font-medium text-gray-900">Contact:</span>
                  <p className="text-gray-600">{selectedRequest.contactDuringLeave}</p>
                </div>
              )}

              {selectedRequest.approvedBy && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-gray-600">
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
                    <div className="mt-2 bg-gray-50 rounded p-2">
                      {selectedRequest.approverComment}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
