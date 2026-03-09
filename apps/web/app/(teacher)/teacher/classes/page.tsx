'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { SchoolStatCard, FormModal, ConfirmModal, useToast } from '../../../../components/school';
import {
  BookOpen,
  Users,
  ClipboardList,
  GraduationCap,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Plus,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
} from 'lucide-react';

// ── Mock data ──
interface MockClass {
  id: string;
  name: string;
  section: string;
  subject: string;
  studentCount: number;
  isClassTeacher: boolean;
}

interface MockStudent {
  id: string;
  rollNo: string;
  name: string;
  gender: string;
  performance: number;
  attendance: number;
}

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

const MOCK_CLASSES: MockClass[] = [
  { id: 'c1', name: 'Class 10', section: 'A', subject: 'Mathematics', studentCount: 31, isClassTeacher: true },
  { id: 'c2', name: 'Class 9', section: 'B', subject: 'Mathematics', studentCount: 28, isClassTeacher: false },
  { id: 'c3', name: 'Class 8', section: 'A', subject: 'Physics', studentCount: 26, isClassTeacher: false },
  { id: 'c4', name: 'Class 10', section: 'B', subject: 'Mathematics', studentCount: 30, isClassTeacher: false },
  { id: 'c5', name: 'Class 7', section: 'C', subject: 'Physics', studentCount: 24, isClassTeacher: false },
  { id: 'c6', name: 'Class 9', section: 'A', subject: 'Mathematics', studentCount: 29, isClassTeacher: false },
];

const MOCK_STUDENTS: Record<string, MockStudent[]> = {
  c1: [
    { id: 's1', rollNo: '001', name: 'Aarav Sharma', gender: 'Male', performance: 88, attendance: 96 },
    { id: 's2', rollNo: '002', name: 'Priya Patel', gender: 'Female', performance: 92, attendance: 98 },
    { id: 's3', rollNo: '003', name: 'Rohan Gupta', gender: 'Male', performance: 75, attendance: 90 },
    { id: 's4', rollNo: '004', name: 'Sneha Reddy', gender: 'Female', performance: 84, attendance: 94 },
    { id: 's5', rollNo: '005', name: 'Arjun Singh', gender: 'Male', performance: 79, attendance: 88 },
    { id: 's6', rollNo: '006', name: 'Ananya Iyer', gender: 'Female', performance: 95, attendance: 99 },
    { id: 's7', rollNo: '007', name: 'Vikram Joshi', gender: 'Male', performance: 68, attendance: 82 },
    { id: 's8', rollNo: '008', name: 'Meera Nair', gender: 'Female', performance: 91, attendance: 97 },
  ],
  c2: [
    { id: 's9', rollNo: '001', name: 'Karan Malhotra', gender: 'Male', performance: 82, attendance: 92 },
    { id: 's10', rollNo: '002', name: 'Divya Kumari', gender: 'Female', performance: 87, attendance: 95 },
    { id: 's11', rollNo: '003', name: 'Rahul Verma', gender: 'Male', performance: 74, attendance: 86 },
    { id: 's12', rollNo: '004', name: 'Ishita Bansal', gender: 'Female', performance: 90, attendance: 98 },
  ],
};

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

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Physics: 'bg-purple-100 text-purple-700',
  Chemistry: 'bg-green-100 text-green-700',
  English: 'bg-amber-100 text-amber-700',
};

const planStatusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
};

const planStatusLabels: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function TeacherClassesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'classes' | 'lesson_plans'>('classes');
  const [selectedClass, setSelectedClass] = useState<MockClass | null>(null);

  // Lesson Plans state
  const [plans, setPlans] = useState<MockPlan[]>(MOCK_PLANS);
  const [planFilter, setPlanFilter] = useState('all');
  const [planClassFilter, setPlanClassFilter] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState<MockPlan | null>(null);
  const [showPlanDetail, setShowPlanDetail] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: '' });
  const menuRef = useRef<HTMLDivElement>(null);

  const [planForm, setPlanForm] = useState({
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

  const totalStudents = useMemo(() => MOCK_CLASSES.reduce((sum, c) => sum + c.studentCount, 0), []);
  const uniqueSubjects = useMemo(() => new Set(MOCK_CLASSES.map((c) => c.subject)).size, []);
  const avgPerformance = 78;

  const students = selectedClass ? (MOCK_STUDENTS[selectedClass.id] || MOCK_STUDENTS['c1'] || []) : [];

  // Lesson plan stats & filtering
  const planStats = useMemo(() => ({
    total: plans.length,
    completed: plans.filter((p) => p.status === 'completed').length,
    inProgress: plans.filter((p) => p.status === 'in_progress').length,
    scheduled: plans.filter((p) => p.status === 'scheduled').length,
  }), [plans]);

  const planClasses = useMemo(() => {
    return Array.from(new Set(plans.map((p) => p.class))).sort();
  }, [plans]);

  const filteredPlans = useMemo(() => {
    let result = plans;
    if (planFilter !== 'all') result = result.filter((p) => p.status === planFilter);
    if (planClassFilter !== 'all') result = result.filter((p) => p.class === planClassFilter);
    return result;
  }, [plans, planFilter, planClassFilter]);

  function perfColor(val: number) {
    if (val >= 90) return 'text-green-600';
    if (val >= 75) return 'text-blue-600';
    if (val >= 60) return 'text-amber-600';
    return 'text-red-600';
  }

  function handleDeletePlan(id: string) {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setConfirmModal({ open: false, id: '' });
    showToast('success', 'Lesson plan deleted');
  }

  function handleCreatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!planForm.title.trim() || !planForm.date) return;
    const newPlan: MockPlan = {
      id: `lp${Date.now()}`, ...planForm,
      objectives: planForm.objectives.split('\n').filter(Boolean),
      status: 'draft',
    };
    setPlans((prev) => [newPlan, ...prev]);
    setPlanForm({ title: '', subject: 'Mathematics', class: 'Class 10-A', date: '', duration: '45 min', objectives: '', activities: '', resources: '', assessment: '', notes: '' });
    setShowPlanForm(false);
    showToast('success', 'Lesson plan created');
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading classes...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
          <p className="text-sm text-slate-500">Classes and students you teach</p>
        </div>
        {tab === 'lesson_plans' && (
          <button onClick={() => setShowPlanForm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">
            <Plus className="w-4 h-4" /> Create Plan
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="blue" label="My Classes" value={MOCK_CLASSES.length} />
        <SchoolStatCard icon={<Users className="w-5 h-5" />} color="green" label="Total Students" value={totalStudents} />
        <SchoolStatCard icon={<ClipboardList className="w-5 h-5" />} color="purple" label="Subjects Teaching" value={uniqueSubjects} />
        <SchoolStatCard icon={<GraduationCap className="w-5 h-5" />} color="amber" label="Avg Performance" value={`${avgPerformance}%`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { key: 'classes' as const, label: 'My Classes' },
          { key: 'lesson_plans' as const, label: 'Lesson Plans' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedClass(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* My Classes - Grid */}
      {tab === 'classes' && !selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CLASSES.map((cls) => (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-[#824ef2]/30 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{cls.name}-{cls.section}</h3>
                  <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-medium mt-1 ${subjectColors[cls.subject] || 'bg-slate-100 text-slate-600'}`}>
                    {cls.subject}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#824ef2] transition-colors" />
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {cls.studentCount} students
                </div>
                {cls.isClassTeacher && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#824ef2]/10 text-[#824ef2] font-medium">
                    Class Teacher
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Classes - Student Drilldown */}
      {tab === 'classes' && selectedClass && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center gap-3">
            <button
              onClick={() => setSelectedClass(null)}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedClass.name}-{selectedClass.section}
              </h2>
              <p className="text-sm text-slate-500">{selectedClass.subject} &bull; {selectedClass.studentCount} students</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Roll No</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Gender</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Performance</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">{s.rollNo}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{s.name}</td>
                    <td className="py-3 px-5 text-slate-600">{s.gender}</td>
                    <td className="py-3 px-5">
                      <span className={`font-semibold ${perfColor(s.performance)}`}>{s.performance}%</span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`font-semibold ${perfColor(s.attendance)}`}>{s.attendance}%</span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      No student data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lesson Plans Tab */}
      {tab === 'lesson_plans' && (
        <div className="space-y-4">
          {/* Mini stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <ClipboardList className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Total Plans</p>
              <p className="text-lg font-bold text-slate-900">{planStats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Completed</p>
              <p className="text-lg font-bold text-green-600">{planStats.completed}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-slate-500">In Progress</p>
              <p className="text-lg font-bold text-amber-600">{planStats.inProgress}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
              <Calendar className="w-5 h-5 text-[#824ef2] mx-auto mb-1" />
              <p className="text-xs text-slate-500">Scheduled</p>
              <p className="text-lg font-bold text-[#824ef2]">{planStats.scheduled}</p>
            </div>
          </div>

          {/* Class filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPlanClassFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                planClassFilter === 'all' ? 'bg-[#824ef2] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Classes
            </button>
            {planClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setPlanClassFilter(cls)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  planClassFilter === cls ? 'bg-[#824ef2] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Plans list */}
          <div className="bg-white rounded-xl border border-slate-200" ref={menuRef}>
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Lesson Plans</h2>
              <div className="flex gap-2">
                {[{ key: 'all', label: 'All' }, { key: 'draft', label: 'Draft' }, { key: 'scheduled', label: 'Scheduled' }, { key: 'in_progress', label: 'In Progress' }, { key: 'completed', label: 'Completed' }].map((f) => (
                  <button key={f.key} onClick={() => setPlanFilter(f.key)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${planFilter === f.key ? 'bg-[#824ef2] text-white border-[#824ef2]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredPlans.length === 0 ? (
                <div className="py-16 text-center">
                  <ClipboardList className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">No lesson plans found</p>
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center gap-4 p-4 px-5 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedPlan(plan); setShowPlanDetail(true); }}>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{plan.title}</h3>
                      <p className="text-sm text-slate-500">{plan.subject} &bull; {plan.class} &bull; {plan.duration}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${planStatusColors[plan.status]}`}>
                          {planStatusLabels[plan.status]}
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
                          <button onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); setShowPlanDetail(true); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
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
        </div>
      )}

      {/* Create Lesson Plan Modal */}
      <FormModal open={showPlanForm} onClose={() => setShowPlanForm(false)} title="Create Lesson Plan" size="lg" footer={
        <>
          <button onClick={() => setShowPlanForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" form="lp-form" className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors">Create</button>
        </>
      }>
        <form id="lp-form" onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input type="text" className={inputClass} value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} required placeholder="Lesson title..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <select className={`${inputClass} cursor-pointer`} value={planForm.subject} onChange={(e) => setPlanForm({ ...planForm, subject: e.target.value })}>
                {['Mathematics', 'Physics'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
              <select className={`${inputClass} cursor-pointer`} value={planForm.class} onChange={(e) => setPlanForm({ ...planForm, class: e.target.value })}>
                {['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A', 'Class 7-C'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass} value={planForm.date} onChange={(e) => setPlanForm({ ...planForm, date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
              <input type="text" className={inputClass} value={planForm.duration} onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })} placeholder="e.g., 45 min" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Objectives (one per line)</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={planForm.objectives} onChange={(e) => setPlanForm({ ...planForm, objectives: e.target.value })} placeholder="Learning objectives..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Activities</label>
            <textarea className={`${inputClass} resize-none`} rows={2} value={planForm.activities} onChange={(e) => setPlanForm({ ...planForm, activities: e.target.value })} placeholder="Planned activities..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Resources</label>
            <input type="text" className={inputClass} value={planForm.resources} onChange={(e) => setPlanForm({ ...planForm, resources: e.target.value })} placeholder="Required resources..." />
          </div>
        </form>
      </FormModal>

      {/* Lesson Plan Detail Modal */}
      <FormModal open={showPlanDetail && !!selectedPlan} onClose={() => { setShowPlanDetail(false); setSelectedPlan(null); }} title={selectedPlan?.title || ''} size="lg" footer={
        <button onClick={() => { setShowPlanDetail(false); setSelectedPlan(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
      }>
        {selectedPlan && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${planStatusColors[selectedPlan.status]}`}>{planStatusLabels[selectedPlan.status]}</span>
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
            {selectedPlan.assessment && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Assessment</h4>
                <p className="text-sm text-slate-700">{selectedPlan.assessment}</p>
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

      {/* Confirm Delete */}
      <ConfirmModal open={confirmModal.open} title="Delete Lesson Plan" message="Are you sure you want to delete this lesson plan?" confirmLabel="Delete" confirmColor="red" onConfirm={() => handleDeletePlan(confirmModal.id)} onCancel={() => setConfirmModal({ open: false, id: '' })} />
    </section>
  );
}
