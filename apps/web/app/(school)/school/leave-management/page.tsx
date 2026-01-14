'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  leaveRequestService,
  LeaveRequest,
  LeaveType,
  LeaveStatus,
} from '../../../../lib/services/leave-request.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import { Portal } from '../../../../components/portal';
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

  const stats = {
    total: leaveRequests.length,
    pending: pendingRequests.length,
    approved: leaveRequests.filter((r) => r.status === LeaveStatus.APPROVED).length,
    rejected: leaveRequests.filter((r) => r.status === LeaveStatus.REJECTED).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-red-800 font-medium flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-green-500 to-emerald-500" size="lg">
            <CalendarCheck className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-sm text-gray-500">Review and approve staff leave requests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Requests"
          value={stats.total}
          icon={<FileText className="w-5 h-5" />}
          gradient="from-blue-500 to-cyan-500"
          delay={0}
        />
        <AnimatedStatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
          gradient="from-yellow-500 to-amber-500"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCircle className="w-5 h-5" />}
          gradient="from-green-500 to-emerald-500"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle className="w-5 h-5" />}
          gradient="from-red-500 to-rose-500"
          delay={0.3}
        />
      </div>

      {/* Pending Requests Section */}
      <AnimatePresence>
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard hover={false} className="bg-gradient-to-br from-yellow-50/80 to-amber-50/50 border-yellow-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-yellow-500 rounded-full"
                  />
                  Pending Approval ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 cursor-pointer shadow-sm hover:shadow-md transition-all"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-yellow-500/20">
                              {request.userId?.firstName?.charAt(0)}
                            </div>
                            <span>
                              {request.userId?.firstName} {request.userId?.lastName}
                            </span>
                            <span className="text-xs font-normal text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                              {request.userId?.role}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{leaveTypeLabels[request.leaveType]}</span>
                            <span className="text-gray-400">|</span>
                            <span>
                              {new Date(request.startDate).toLocaleDateString()} -{' '}
                              {new Date(request.endDate).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                              {request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">{request.reason}</div>
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(request._id, LeaveStatus.APPROVED);
                              }}
                              disabled={processing}
                              className="shadow-lg shadow-indigo-500/20"
                            >
                              Approve
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <GlassCard hover={false} className="p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 font-medium">Filter:</span>
          <select
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white/80 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
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
      </GlassCard>

      {/* All Requests Table */}
      <GlassCard hover={false} className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/80">
          <h3 className="font-semibold text-gray-900">All Leave Requests</h3>
        </div>
        {leaveRequests.length === 0 ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No leave requests found.</p>
            </motion.div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full hidden md:table">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                <tr>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Staff Member
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Leave Type
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Dates
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Days
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaveRequests.map((request, index) => (
                  <motion.tr
                    key={request._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                    className="cursor-pointer group transition-all"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-green-500/20">
                          {request.userId?.firstName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                            {request.userId?.firstName} {request.userId?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{request.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {leaveTypeLabels[request.leaveType]}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                        {request.numberOfDays}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block"
                      >
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
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {leaveRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="glass rounded-xl p-4 cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold shadow-lg">
                        {request.userId?.firstName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {request.userId?.firstName} {request.userId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{leaveTypeLabels[request.leaveType]}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusColors[request.status]}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(request.startDate).toLocaleDateString()} -{' '}
                    {new Date(request.endDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {request.numberOfDays} day{request.numberOfDays !== 1 ? 's' : ''}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Enhanced Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto pt-10 pb-10"
              onClick={() => {
                setSelectedRequest(null);
                setApproveComment('');
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gradient Header with 3D Icon */}
                <div className="sticky top-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-5 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                      >
                        <CalendarCheck className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <motion.h2
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-xl font-bold text-white"
                        >
                          Leave Request Details
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-white/80 text-sm"
                        >
                          Review and manage staff leave request
                        </motion.p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                          selectedRequest.status === LeaveStatus.PENDING
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedRequest.status === LeaveStatus.APPROVED
                            ? 'bg-green-100 text-green-800'
                            : selectedRequest.status === LeaveStatus.REJECTED
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedRequest.status}
                      </motion.span>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedRequest(null);
                          setApproveComment('');
                        }}
                        className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Section: Staff Information */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                        <User className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Staff Information</h3>
                    </div>
                    <div className="pl-10 bg-gradient-to-br from-gray-50/80 to-blue-50/30 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-green-500/30">
                          {selectedRequest.userId?.firstName?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">
                            {selectedRequest.userId?.firstName} {selectedRequest.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{selectedRequest.userId?.email}</div>
                          <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                            <Briefcase className="w-3 h-3" />
                            {selectedRequest.userId?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Section: Leave Details */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-violet-500 to-purple-500" size="sm">
                        <CalendarDays className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Leave Details</h3>
                    </div>
                    <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Leave Type */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="group"
                      >
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Leave Type</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900 font-medium">
                            {leaveTypeLabels[selectedRequest.leaveType]}
                          </div>
                        </div>
                      </motion.div>

                      {/* Duration */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="group"
                      >
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Duration</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900 font-medium">
                            {selectedRequest.numberOfDays} day{selectedRequest.numberOfDays !== 1 ? 's' : ''}
                            {selectedRequest.isHalfDay && (
                              <span className="text-indigo-600 ml-1">
                                ({selectedRequest.halfDayType?.replace('_', ' ')})
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      {/* Start Date */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="group"
                      >
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Start Date</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900 font-medium">
                            {new Date(selectedRequest.startDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </motion.div>

                      {/* End Date */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="group"
                      >
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">End Date</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <CalendarRange className="w-4 h-4" />
                          </div>
                          <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900 font-medium">
                            {new Date(selectedRequest.endDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </motion.div>

                      {/* Applied On */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        className="group md:col-span-2"
                      >
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Applied On</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900 font-medium">
                            {new Date(selectedRequest.createdAt).toLocaleString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Section: Reason */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Reason for Leave</h3>
                    </div>
                    <div className="pl-10">
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gradient-to-br from-white/80 to-amber-50/30 backdrop-blur-sm text-gray-700 min-h-[80px]">
                          {selectedRequest.reason}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Section: Contact During Leave */}
                  {selectedRequest.contactDuringLeave && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-cyan-500 to-teal-500" size="sm">
                          <Phone className="w-4 h-4" />
                        </Icon3D>
                        <h3 className="font-semibold text-gray-900">Contact During Leave</h3>
                      </div>
                      <div className="pl-10">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900 font-medium">
                            {selectedRequest.contactDuringLeave}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Section: Approval Comment (for pending requests) */}
                  {selectedRequest.status === LeaveStatus.PENDING && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D gradient="from-indigo-500 to-purple-500" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Icon3D>
                        <h3 className="font-semibold text-gray-900">Add Comment</h3>
                        <span className="text-xs text-gray-400">(optional)</span>
                      </div>
                      <div className="pl-10">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                        >
                          <div className="relative group">
                            <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <textarea
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm text-gray-900
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                                hover:border-gray-300 transition-all duration-200 resize-none
                                placeholder:text-gray-400"
                              rows={3}
                              value={approveComment}
                              onChange={(e) => setApproveComment(e.target.value)}
                              placeholder="Add a comment for the staff member..."
                            />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Section: Approval Info (for processed requests) */}
                  {selectedRequest.approvedBy && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Icon3D
                          gradient={
                            selectedRequest.status === LeaveStatus.APPROVED
                              ? 'from-green-500 to-emerald-500'
                              : 'from-red-500 to-rose-500'
                          }
                          size="sm"
                        >
                          {selectedRequest.status === LeaveStatus.APPROVED ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </Icon3D>
                        <h3 className="font-semibold text-gray-900">
                          {selectedRequest.status === LeaveStatus.APPROVED ? 'Approval' : 'Rejection'} Details
                        </h3>
                      </div>
                      <div className="pl-10 bg-gradient-to-br from-gray-50/80 to-emerald-50/30 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                              selectedRequest.status === LeaveStatus.APPROVED
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30'
                                : 'bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/30'
                            }`}
                          >
                            {selectedRequest.approvedBy.firstName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {selectedRequest.approvedBy.firstName} {selectedRequest.approvedBy.lastName}
                            </div>
                            {selectedRequest.approvedAt && (
                              <div className="text-xs text-gray-500">
                                on {new Date(selectedRequest.approvedAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedRequest.approverComment && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Comment</label>
                            <p className="text-sm text-gray-700 bg-white/60 rounded-lg p-3">
                              {selectedRequest.approverComment}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/80 px-6 py-4 border-t border-gray-100"
                >
                  <div className="flex justify-between gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(null);
                          setApproveComment('');
                        }}
                        className="px-6"
                      >
                        Close
                      </Button>
                    </motion.div>
                    {selectedRequest.status === LeaveStatus.PENDING && (
                      <div className="flex gap-3">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={() => handleApprove(selectedRequest._id, LeaveStatus.APPROVED)}
                            disabled={processing}
                            className="px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25"
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
                        </motion.div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
