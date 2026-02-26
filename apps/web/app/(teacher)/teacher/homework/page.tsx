'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { SchoolStatCard, FormModal, ConfirmModal, useToast } from '../../../../components/school';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
} from 'lucide-react';

// ── Mock data ──
interface MockHomework {
  id: string;
  title: string;
  class: string;
  subject: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: 'active' | 'graded' | 'overdue' | 'draft';
  maxMarks: number;
  description: string;
}

interface MockSubmission {
  id: string;
  studentName: string;
  submittedDate: string;
  status: 'submitted' | 'late' | 'not_submitted';
  grade: string;
}

const MOCK_HOMEWORK: MockHomework[] = [
  { id: 'h1', title: 'Quadratic Equations Practice Set', class: 'Class 10-A', subject: 'Mathematics', dueDate: '2025-03-10', submissions: 28, totalStudents: 31, status: 'active', maxMarks: 20, description: 'Solve all questions from exercise 4.1 and 4.2. Show complete working.' },
  { id: 'h2', title: 'Newton Laws Worksheet', class: 'Class 8-A', subject: 'Physics', dueDate: '2025-03-08', submissions: 24, totalStudents: 26, status: 'active', maxMarks: 15, description: 'Complete the worksheet on Newton\'s three laws of motion.' },
  { id: 'h3', title: 'Trigonometry Problems', class: 'Class 10-B', subject: 'Mathematics', dueDate: '2025-03-05', submissions: 30, totalStudents: 30, status: 'graded', maxMarks: 25, description: 'Chapter 8 practice problems.' },
  { id: 'h4', title: 'Linear Equations Assignment', class: 'Class 9-B', subject: 'Mathematics', dueDate: '2025-03-03', submissions: 25, totalStudents: 28, status: 'graded', maxMarks: 20, description: 'Solve linear equations and graph them.' },
  { id: 'h5', title: 'Optics Chapter Questions', class: 'Class 10-A', subject: 'Physics', dueDate: '2025-02-28', submissions: 29, totalStudents: 31, status: 'graded', maxMarks: 30, description: 'Answer all questions from chapter on optics.' },
  { id: 'h6', title: 'Algebra Review Sheet', class: 'Class 7-C', subject: 'Mathematics', dueDate: '2025-02-25', submissions: 20, totalStudents: 24, status: 'graded', maxMarks: 15, description: 'Review exercises for algebra basics.' },
  { id: 'h7', title: 'Wave Motion Lab Report', class: 'Class 9-A', subject: 'Physics', dueDate: '2025-03-02', submissions: 18, totalStudents: 29, status: 'overdue', maxMarks: 20, description: 'Write lab report on wave motion experiment.' },
  { id: 'h8', title: 'Statistics Project', class: 'Class 10-A', subject: 'Mathematics', dueDate: '2025-03-01', submissions: 15, totalStudents: 31, status: 'overdue', maxMarks: 50, description: 'Collect data, analyze using statistical methods, present findings.' },
];

const MOCK_SUBMISSIONS: MockSubmission[] = [
  { id: 'sub1', studentName: 'Aarav Sharma', submittedDate: '2025-03-08', status: 'submitted', grade: '18/20' },
  { id: 'sub2', studentName: 'Priya Patel', submittedDate: '2025-03-09', status: 'submitted', grade: '20/20' },
  { id: 'sub3', studentName: 'Rohan Gupta', submittedDate: '2025-03-10', status: 'late', grade: '' },
  { id: 'sub4', studentName: 'Sneha Reddy', submittedDate: '2025-03-08', status: 'submitted', grade: '16/20' },
  { id: 'sub5', studentName: 'Arjun Singh', submittedDate: '', status: 'not_submitted', grade: '' },
  { id: 'sub6', studentName: 'Ananya Iyer', submittedDate: '2025-03-07', status: 'submitted', grade: '19/20' },
  { id: 'sub7', studentName: 'Vikram Joshi', submittedDate: '2025-03-11', status: 'late', grade: '' },
  { id: 'sub8', studentName: 'Meera Nair', submittedDate: '2025-03-08', status: 'submitted', grade: '17/20' },
];

const statusColors: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  graded: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  draft: 'bg-slate-100 text-slate-700',
};

const submissionStatusColors: Record<string, string> = {
  submitted: 'bg-green-100 text-green-700',
  late: 'bg-amber-100 text-amber-700',
  not_submitted: 'bg-red-100 text-red-700',
};

export default function TeacherHomeworkPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'submissions' | 'create'>('all');
  const [homework, setHomework] = useState<MockHomework[]>(MOCK_HOMEWORK);
  const [selectedHomework, setSelectedHomework] = useState<MockHomework | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: '' });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: 'Class 10-A',
    subject: 'Mathematics',
    dueDate: '',
    maxMarks: '20',
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = useMemo(() => ({
    total: homework.length,
    graded: homework.filter((h) => h.status === 'graded').length,
    pending: homework.filter((h) => h.status === 'active').length,
    overdue: homework.filter((h) => h.status === 'overdue').length,
  }), [homework]);

  function handleDelete(id: string) {
    setHomework((prev) => prev.filter((h) => h.id !== id));
    setConfirmModal({ open: false, id: '' });
    showToast('success', 'Assignment deleted successfully');
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;
    const newHw: MockHomework = {
      id: `h${Date.now()}`,
      title: formData.title,
      class: formData.class,
      subject: formData.subject,
      dueDate: formData.dueDate,
      submissions: 0,
      totalStudents: 31,
      status: 'active',
      maxMarks: parseInt(formData.maxMarks, 10) || 20,
      description: formData.description,
    };
    setHomework((prev) => [newHw, ...prev]);
    setFormData({ title: '', description: '', class: 'Class 10-A', subject: 'Mathematics', dueDate: '', maxMarks: '20' });
    setShowForm(false);
    showToast('success', 'Assignment created successfully');
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading homework...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Homework</h1>
            <p className="text-sm text-slate-500">Manage assignments and submissions</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="blue" label="Total Assignments" value={stats.total} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Graded" value={stats.graded} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="amber" label="Pending Review" value={stats.pending} />
        <SchoolStatCard icon={<AlertCircle className="w-5 h-5" />} color="red" label="Overdue" value={stats.overdue} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { key: 'all' as const, label: 'All Assignments' },
          { key: 'submissions' as const, label: 'Submissions' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* All Assignments */}
      {tab === 'all' && (
        <div className="bg-white rounded-xl border border-slate-200" ref={menuRef}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Title</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Subject</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Due Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Submissions</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {homework.map((hw) => (
                  <tr key={hw.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{hw.title}</td>
                    <td className="py-3 px-5 text-slate-600">{hw.class}</td>
                    <td className="py-3 px-5 text-slate-600">{hw.subject}</td>
                    <td className="py-3 px-5 text-slate-600">{new Date(hw.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="py-3 px-5 text-slate-600">{hw.submissions}/{hw.totalStudents}</td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[hw.status]}`}>
                        {hw.status.charAt(0).toUpperCase() + hw.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === hw.id ? null : hw.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === hw.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-36 z-20">
                            <button onClick={() => { setSelectedHomework(hw); setShowDetailModal(true); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                              <Eye className="w-4 h-4" /> View
                            </button>
                            <button onClick={() => { setConfirmModal({ open: true, id: hw.id }); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submissions */}
      {tab === 'submissions' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Submissions — Quadratic Equations Practice Set</h2>
            <p className="text-sm text-slate-500 mt-1">Class 10-A &bull; Mathematics &bull; Due: Mar 10, 2025</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Student Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Submitted Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Grade</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBMISSIONS.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{sub.studentName}</td>
                    <td className="py-3 px-5 text-slate-600">{sub.submittedDate ? new Date(sub.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${submissionStatusColors[sub.status]}`}>
                        {sub.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-700 font-medium">{sub.grade || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <FormModal open={showForm} onClose={() => setShowForm(false)} title="Create New Assignment" size="lg" footer={
        <>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" form="hw-form" className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">Create</button>
        </>
      }>
        <form id="hw-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input type="text" className={inputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Assignment title..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
              <select className={`${inputClass} cursor-pointer`} value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })}>
                {['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A', 'Class 7-C'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <select className={`${inputClass} cursor-pointer`} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                {['Mathematics', 'Physics'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass} value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Marks</label>
              <input type="number" className={inputClass} value={formData.maxMarks} onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Assignment details..." />
          </div>
        </form>
      </FormModal>

      {/* Detail Modal */}
      <FormModal open={showDetailModal && !!selectedHomework} onClose={() => { setShowDetailModal(false); setSelectedHomework(null); }} title={selectedHomework?.title || ''} size="md" footer={
        <button onClick={() => { setShowDetailModal(false); setSelectedHomework(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
      }>
        {selectedHomework && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Class</p>
                <p className="text-sm font-semibold text-slate-900">{selectedHomework.class}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Subject</p>
                <p className="text-sm font-semibold text-slate-900">{selectedHomework.subject}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-700">{selectedHomework.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Due: {new Date(selectedHomework.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>Max Marks: {selectedHomework.maxMarks}</span>
              <span>Submissions: {selectedHomework.submissions}/{selectedHomework.totalStudents}</span>
            </div>
          </div>
        )}
      </FormModal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={() => handleDelete(confirmModal.id)}
        onCancel={() => setConfirmModal({ open: false, id: '' })}
      />
    </section>
  );
}
