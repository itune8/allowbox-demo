'use client';

import { useState, useEffect, useMemo } from 'react';
import { leaveRequestService } from '../../../../lib/services/leave-request.service';
import { SchoolStatCard, FormModal, ConfirmModal, useToast } from '../../../../components/school';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  CalendarCheck,
  Eye,
} from 'lucide-react';

// ── Mock data ──
interface MockLeave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  contact: string;
}

const MOCK_LEAVES: MockLeave[] = [
  { id: 'l1', type: 'Sick Leave', startDate: '2025-03-15', endDate: '2025-03-16', days: 2, reason: 'Doctor appointment and recovery', status: 'pending', appliedOn: '2025-03-10', contact: '9876543210' },
  { id: 'l2', type: 'Casual Leave', startDate: '2025-03-20', endDate: '2025-03-20', days: 1, reason: 'Personal family function', status: 'pending', appliedOn: '2025-03-08', contact: '9876543210' },
  { id: 'l3', type: 'Earned Leave', startDate: '2025-02-10', endDate: '2025-02-14', days: 5, reason: 'Vacation travel with family', status: 'approved', appliedOn: '2025-01-25', contact: '9876543210' },
  { id: 'l4', type: 'Sick Leave', startDate: '2025-01-22', endDate: '2025-01-22', days: 1, reason: 'Fever and cold', status: 'approved', appliedOn: '2025-01-21', contact: '9876543210' },
  { id: 'l5', type: 'Casual Leave', startDate: '2025-01-05', endDate: '2025-01-06', days: 2, reason: 'Personal work', status: 'approved', appliedOn: '2025-01-02', contact: '9876543210' },
  { id: 'l6', type: 'Earned Leave', startDate: '2024-12-23', endDate: '2024-12-31', days: 7, reason: 'Year-end vacation', status: 'approved', appliedOn: '2024-12-10', contact: '9876543210' },
  { id: 'l7', type: 'Casual Leave', startDate: '2024-11-15', endDate: '2024-11-15', days: 1, reason: 'Government office work', status: 'approved', appliedOn: '2024-11-12', contact: '9876543210' },
  { id: 'l8', type: 'Sick Leave', startDate: '2024-10-20', endDate: '2024-10-21', days: 2, reason: 'Dental procedure', status: 'rejected', appliedOn: '2024-10-18', contact: '9876543210' },
];

const typeColors: Record<string, string> = {
  'Sick Leave': 'bg-red-100 text-red-700',
  'Casual Leave': 'bg-blue-100 text-blue-700',
  'Earned Leave': 'bg-green-100 text-green-700',
  'Maternity Leave': 'bg-purple-100 text-purple-700',
  'Unpaid Leave': 'bg-slate-100 text-slate-700',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function TeacherLeaveRequestsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<MockLeave[]>(MOCK_LEAVES);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<MockLeave | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: '',
    contact: '',
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => ({
    total: leaves.length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  }), [leaves]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return leaves;
    return leaves.filter((l) => l.status === statusFilter);
  }, [leaves, statusFilter]);

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.startDate || !formData.reason.trim()) return;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate || formData.startDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
    const newLeave: MockLeave = {
      id: `l${Date.now()}`,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      days,
      reason: formData.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0]!,
      contact: formData.contact,
    };
    setLeaves((prev) => [newLeave, ...prev]);
    setFormData({ type: 'Sick Leave', startDate: '', endDate: '', reason: '', contact: '' });
    setShowForm(false);
    showToast('success', 'Leave request submitted');
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6 text-[#824ef2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leave Requests</h1>
            <p className="text-sm text-slate-500">Apply for leave and track your requests</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="blue" label="Total Requests" value={stats.total} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="amber" label="Pending" value={stats.pending} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Approved" value={stats.approved} />
        <SchoolStatCard icon={<XCircle className="w-5 h-5" />} color="red" label="Rejected" value={stats.rejected} />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'approved', label: 'Approved' }, { key: 'rejected', label: 'Rejected' }].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === f.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Leave List */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-5 font-medium text-slate-500">Type</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Date Range</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Days</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Applied On</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((leave) => (
                <tr key={leave.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[leave.type] || 'bg-slate-100 text-slate-700'}`}>
                      {leave.type}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-700">
                    {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {leave.startDate !== leave.endDate && (
                      <> — {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                    )}
                  </td>
                  <td className="py-3 px-5 text-slate-600">{leave.days} {leave.days === 1 ? 'day' : 'days'}</td>
                  <td className="py-3 px-5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[leave.status]}`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-500">
                    {new Date(leave.appliedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-5">
                    <button
                      onClick={() => { setSelectedLeave(leave); setShowDetailModal(true); }}
                      className="p-1.5 text-slate-400 hover:text-[#824ef2] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      <FormModal open={showForm} onClose={() => setShowForm(false)} title="Apply for Leave" size="md" footer={
        <>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" form="leave-form" className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">Submit Request</button>
        </>
      }>
        <form id="leave-form" onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave Type</label>
            <select className={`${inputClass} cursor-pointer`} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              {['Sick Leave', 'Casual Leave', 'Earned Leave', 'Unpaid Leave'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
              <input type="date" className={inputClass} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason <span className="text-red-500">*</span></label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required placeholder="Reason for leave..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact During Leave</label>
            <input type="text" className={inputClass} value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} placeholder="Phone number" />
          </div>
        </form>
      </FormModal>

      {/* Detail Modal */}
      <FormModal open={showDetailModal && !!selectedLeave} onClose={() => { setShowDetailModal(false); setSelectedLeave(null); }} title="Leave Request Details" size="md" footer={
        <button onClick={() => { setShowDetailModal(false); setSelectedLeave(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
      }>
        {selectedLeave && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[selectedLeave.type]}`}>{selectedLeave.type}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[selectedLeave.status]}`}>{selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Date Range</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(selectedLeave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {selectedLeave.startDate !== selectedLeave.endDate && ` — ${new Date(selectedLeave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className="text-sm font-semibold text-slate-900">{selectedLeave.days} {selectedLeave.days === 1 ? 'day' : 'days'}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Reason</h4>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-700">{selectedLeave.reason}</p>
              </div>
            </div>
            {selectedLeave.contact && (
              <div className="text-sm text-slate-500">Contact: {selectedLeave.contact}</div>
            )}
            <div className="text-xs text-slate-400">Applied on {new Date(selectedLeave.appliedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
        )}
      </FormModal>
    </section>
  );
}
