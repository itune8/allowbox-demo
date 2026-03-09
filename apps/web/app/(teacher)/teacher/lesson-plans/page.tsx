'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { lessonPlanService } from '../../../../lib/services/lesson-plan.service';
import { SchoolStatCard, FormModal, ConfirmModal, useToast, SchoolStatusBadge } from '../../../../components/school';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

// ── Mock data ──
interface MockPlan {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed';
  duration: string;
  objectives: string[];
  activities: string;
  resources: string;
  assessment: string;
  notes: string;
}

const MOCK_PLANS: MockPlan[] = [
  { id: 'lp1', title: 'Introduction to Quadratic Equations', subject: 'Mathematics', class: 'Class 10-A', date: '2025-03-10', status: 'scheduled', duration: '45 min', objectives: ['Understand the standard form', 'Identify coefficients'], activities: 'Interactive examples on board, student practice', resources: 'Textbook Ch. 4, Whiteboard', assessment: 'Quick quiz at end', notes: 'Focus on weaker students' },
  { id: 'lp2', title: 'Newton\'s Third Law', subject: 'Physics', class: 'Class 8-A', date: '2025-03-11', status: 'scheduled', duration: '45 min', objectives: ['State Newton\'s Third Law', 'Identify action-reaction pairs'], activities: 'Demonstration with balloon, discussion', resources: 'Lab equipment, balloons', assessment: 'Worksheet', notes: '' },
  { id: 'lp3', title: 'Trigonometric Ratios', subject: 'Mathematics', class: 'Class 10-B', date: '2025-03-08', status: 'in_progress', duration: '45 min', objectives: ['Define sin, cos, tan', 'Apply to right triangles'], activities: 'Board work, group problem solving', resources: 'Textbook, protractors', assessment: 'Practice set', notes: '' },
  { id: 'lp4', title: 'Linear Equations Revision', subject: 'Mathematics', class: 'Class 9-B', date: '2025-03-07', status: 'completed', duration: '45 min', objectives: ['Revise graphing linear equations', 'Solve word problems'], activities: 'Graph plotting, word problems', resources: 'Graph paper, textbook', assessment: 'Homework assignment', notes: 'Students struggled with word problems' },
  { id: 'lp5', title: 'Optics — Reflection', subject: 'Physics', class: 'Class 10-A', date: '2025-03-06', status: 'completed', duration: '90 min', objectives: ['Laws of reflection', 'Image formation in plane mirror'], activities: 'Lab experiment, ray diagrams', resources: 'Mirrors, laser pointer', assessment: 'Lab report', notes: '' },
  { id: 'lp6', title: 'Polynomials', subject: 'Mathematics', class: 'Class 9-A', date: '2025-03-05', status: 'completed', duration: '45 min', objectives: ['Degree of polynomial', 'Zeroes of polynomial'], activities: 'Examples, class discussion', resources: 'Textbook Ch. 2', assessment: 'Class work', notes: '' },
  { id: 'lp7', title: 'Wave Motion Introduction', subject: 'Physics', class: 'Class 9-A', date: '2025-03-12', status: 'draft', duration: '45 min', objectives: ['Types of waves', 'Wave properties'], activities: 'Slinky demonstration', resources: 'Slinky, projector', assessment: 'Oral questions', notes: 'Need to prepare slides' },
  { id: 'lp8', title: 'Integers and Number Line', subject: 'Mathematics', class: 'Class 7-C', date: '2025-03-13', status: 'draft', duration: '45 min', objectives: ['Represent integers on number line', 'Addition of integers'], activities: 'Number line activity', resources: 'Number line charts', assessment: 'Worksheet', notes: '' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function TeacherLessonPlansPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<MockPlan[]>(MOCK_PLANS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MockPlan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: '' });
  const menuRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '', subject: 'Mathematics', class: 'Class 10-A', date: '', duration: '45 min',
    objectives: '', activities: '', resources: '', assessment: '', notes: '',
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = useMemo(() => ({
    total: plans.length,
    completed: plans.filter((p) => p.status === 'completed').length,
    inProgress: plans.filter((p) => p.status === 'in_progress').length,
    thisWeek: plans.filter((p) => p.status === 'scheduled').length,
  }), [plans]);

  const planClasses = useMemo(() => {
    return Array.from(new Set(plans.map((p) => p.class))).sort();
  }, [plans]);

  const filtered = useMemo(() => {
    let result = plans;
    if (filterStatus !== 'all') result = result.filter((p) => p.status === filterStatus);
    if (filterClass !== 'all') result = result.filter((p) => p.class === filterClass);
    return result;
  }, [plans, filterStatus, filterClass]);

  function handleDelete(id: string) {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setConfirmModal({ open: false, id: '' });
    showToast('success', 'Lesson plan deleted');
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) return;
    const newPlan: MockPlan = {
      id: `lp${Date.now()}`, ...formData,
      objectives: formData.objectives.split('\n').filter(Boolean),
      status: 'draft',
    };
    setPlans((prev) => [newPlan, ...prev]);
    setFormData({ title: '', subject: 'Mathematics', class: 'Class 10-A', date: '', duration: '45 min', objectives: '', activities: '', resources: '', assessment: '', notes: '' });
    setShowForm(false);
    showToast('success', 'Lesson plan created');
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading lesson plans...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-[#824ef2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lesson Plans</h1>
            <p className="text-sm text-slate-500">Plan and track your lessons</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<ClipboardList className="w-5 h-5" />} color="blue" label="Total Plans" value={stats.total} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Completed" value={stats.completed} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="amber" label="In Progress" value={stats.inProgress} />
        <SchoolStatCard icon={<Calendar className="w-5 h-5" />} color="purple" label="This Week" value={stats.thisWeek} />
      </div>

      {/* Class filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterClass('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filterClass === 'all' ? 'bg-[#824ef2] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Classes
        </button>
        {planClasses.map((cls) => (
          <button
            key={cls}
            onClick={() => setFilterClass(cls)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterClass === cls ? 'bg-[#824ef2] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* Filter + List */}
      <div className="bg-white rounded-xl border border-slate-200" ref={menuRef}>
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Lesson Plans</h2>
          <div className="flex gap-2">
            {[{ key: 'all', label: 'All' }, { key: 'draft', label: 'Draft' }, { key: 'scheduled', label: 'Scheduled' }, { key: 'in_progress', label: 'In Progress' }, { key: 'completed', label: 'Completed' }].map((f) => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filterStatus === f.key ? 'bg-[#824ef2] text-white border-[#824ef2]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No lesson plans found</p>
            </div>
          ) : (
            filtered.map((plan) => (
              <div key={plan.id} className="flex items-center gap-4 p-4 px-5 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedPlan(plan); setShowDetailModal(true); }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-900 truncate">{plan.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500">{plan.subject} &bull; {plan.class} &bull; {plan.duration}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[plan.status]}`}>
                      {statusLabels[plan.status]}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="relative flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === plan.id ? null : plan.id); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenuId === plan.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-36 z-20">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); setShowDetailModal(true); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ open: true, id: plan.id }); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      <FormModal open={showForm} onClose={() => setShowForm(false)} title="Create Lesson Plan" size="lg" footer={
        <>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" form="lp-form" className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">Create</button>
        </>
      }>
        <form id="lp-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input type="text" className={inputClass} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Lesson title..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <select className={`${inputClass} cursor-pointer`} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                {['Mathematics', 'Physics'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
              <select className={`${inputClass} cursor-pointer`} value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })}>
                {['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A', 'Class 7-C'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
              <input type="text" className={inputClass} value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 45 min" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Objectives (one per line)</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={formData.objectives} onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} placeholder="Learning objectives..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Activities</label>
            <textarea className={`${inputClass} resize-none`} rows={2} value={formData.activities} onChange={(e) => setFormData({ ...formData, activities: e.target.value })} placeholder="Planned activities..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Resources</label>
            <input type="text" className={inputClass} value={formData.resources} onChange={(e) => setFormData({ ...formData, resources: e.target.value })} placeholder="Required resources..." />
          </div>
        </form>
      </FormModal>

      {/* Detail Modal */}
      <FormModal open={showDetailModal && !!selectedPlan} onClose={() => { setShowDetailModal(false); setSelectedPlan(null); }} title={selectedPlan?.title || ''} size="lg" footer={
        <button onClick={() => { setShowDetailModal(false); setSelectedPlan(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
      }>
        {selectedPlan && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[selectedPlan.status]}`}>{statusLabels[selectedPlan.status]}</span>
              <span className="text-xs text-slate-500">{selectedPlan.subject} &bull; {selectedPlan.class} &bull; {selectedPlan.duration}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Date</p>
                <p className="text-sm font-semibold text-slate-900">{new Date(selectedPlan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className="text-sm font-semibold text-slate-900">{selectedPlan.duration}</p>
              </div>
            </div>
            {selectedPlan.objectives.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Objectives</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedPlan.objectives.map((obj, i) => <li key={i} className="text-sm text-slate-700">{obj}</li>)}
                </ul>
              </div>
            )}
            {selectedPlan.activities && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Activities</h4>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200">{selectedPlan.activities}</p>
              </div>
            )}
            {selectedPlan.resources && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Resources</h4>
                <p className="text-sm text-slate-700">{selectedPlan.resources}</p>
              </div>
            )}
            {selectedPlan.notes && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Notes</h4>
                <p className="text-sm text-slate-600 italic">{selectedPlan.notes}</p>
              </div>
            )}
          </div>
        )}
      </FormModal>

      <ConfirmModal open={confirmModal.open} title="Delete Lesson Plan" message="Are you sure you want to delete this lesson plan?" confirmLabel="Delete" confirmColor="red" onConfirm={() => handleDelete(confirmModal.id)} onCancel={() => setConfirmModal({ open: false, id: '' })} />
    </section>
  );
}
