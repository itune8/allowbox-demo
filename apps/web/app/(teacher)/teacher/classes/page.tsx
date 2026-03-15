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
  Search,
  Filter,
  ListFilter,
  ChevronLeft,
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

interface MockSubject {
  id: string;
  name: string;
  code: string;
  assignedClass: string;
  scheduleDays: string;
  scheduleTime: string;
  completedLessons: number;
  totalLessons: number;
  color: string;
}

const MOCK_SUBJECTS: MockSubject[] = [
  { id: 'sub1', name: 'Advanced Mathematics', code: 'MTH-101', assignedClass: 'Grade 10-A', scheduleDays: 'Mon, Wed, Fri', scheduleTime: '09:00 AM - 10:30 AM', completedLessons: 12, totalLessons: 24, color: 'bg-blue-500' },
  { id: 'sub2', name: 'Physics Lab', code: 'PHY-202', assignedClass: 'Grade 11-B', scheduleDays: 'Tue, Thu', scheduleTime: '11:00 AM - 12:30 PM', completedLessons: 8, totalLessons: 16, color: 'bg-green-500' },
  { id: 'sub3', name: 'World History', code: 'HIS-105', assignedClass: 'Grade 9-C', scheduleDays: 'Mon, Wed', scheduleTime: '01:00 PM - 02:00 PM', completedLessons: 18, totalLessons: 20, color: 'bg-red-500' },
  { id: 'sub4', name: 'English Literature', code: 'ENG-301', assignedClass: 'Grade 10-A', scheduleDays: 'Tue, Thu, Fri', scheduleTime: '10:30 AM - 11:30 AM', completedLessons: 5, totalLessons: 25, color: 'bg-indigo-500' },
  { id: 'sub5', name: 'Chemistry', code: 'CHM-201', assignedClass: 'Grade 11-A', scheduleDays: 'Mon, Wed, Fri', scheduleTime: '02:00 PM - 03:00 PM', completedLessons: 10, totalLessons: 22, color: 'bg-amber-500' },
];

interface TopicData {
  chapter: string;
  subtopics: { name: string; completed: boolean }[];
}

const INITIAL_TOPICS: Record<string, TopicData[]> = {
  sub1: [
    { chapter: 'Chapter 1: Number Systems', subtopics: [{ name: 'Real Numbers', completed: true }, { name: 'Irrational Numbers', completed: true }, { name: 'Decimal Expansions', completed: false }] },
    { chapter: 'Chapter 2: Polynomials', subtopics: [{ name: 'Degree of Polynomial', completed: true }, { name: 'Zeroes of Polynomial', completed: false }, { name: 'Factorization', completed: false }] },
    { chapter: 'Chapter 3: Algebra', subtopics: [{ name: 'Linear Equations', completed: false }, { name: 'Quadratic Equations', completed: false }] },
  ],
  sub2: [
    { chapter: 'Chapter 1: Motion', subtopics: [{ name: 'Speed & Velocity', completed: true }, { name: 'Acceleration', completed: true }, { name: 'Equations of Motion', completed: true }] },
    { chapter: 'Chapter 2: Force & Laws', subtopics: [{ name: "Newton's First Law", completed: true }, { name: "Newton's Second Law", completed: false }, { name: "Newton's Third Law", completed: false }] },
  ],
  sub3: [
    { chapter: 'Chapter 1: French Revolution', subtopics: [{ name: 'Causes', completed: true }, { name: 'Key Events', completed: true }, { name: 'Aftermath', completed: true }] },
    { chapter: 'Chapter 2: Russian Revolution', subtopics: [{ name: 'February Revolution', completed: true }, { name: 'October Revolution', completed: true }] },
    { chapter: 'Chapter 3: Nazism', subtopics: [{ name: 'Rise of Hitler', completed: true }, { name: 'World War II Impact', completed: true }] },
  ],
  sub4: [
    { chapter: 'Chapter 1: The Fun They Had', subtopics: [{ name: 'Summary', completed: true }, { name: 'Character Analysis', completed: false }] },
    { chapter: 'Chapter 2: The Sound of Music', subtopics: [{ name: 'Evelyn Glennie', completed: false }, { name: 'Bismillah Khan', completed: false }] },
  ],
  sub5: [
    { chapter: 'Chapter 1: Matter', subtopics: [{ name: 'States of Matter', completed: true }, { name: 'Change of State', completed: true }, { name: 'Evaporation', completed: false }] },
    { chapter: 'Chapter 2: Atoms & Molecules', subtopics: [{ name: 'Laws of Chemical Combination', completed: false }, { name: 'Atomic Mass', completed: false }] },
  ],
};

const ITEMS_PER_PAGE = 4;

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

  // Subjects state
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectPage, setSubjectPage] = useState(1);
  const [viewTopicsSubject, setViewTopicsSubject] = useState<MockSubject | null>(null);
  const [topics, setTopics] = useState<Record<string, TopicData[]>>(INITIAL_TOPICS);

  const [planForm, setPlanForm] = useState({
    title: '', subject: 'Mathematics', class: 'Class 10-A', date: '',
    chapterName: '', subtopics: [''] as string[],
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

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return MOCK_SUBJECTS;
    const q = subjectSearch.toLowerCase();
    return MOCK_SUBJECTS.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }, [subjectSearch]);

  const totalSubjectPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const paginatedSubjects = filteredSubjects.slice((subjectPage - 1) * ITEMS_PER_PAGE, subjectPage * ITEMS_PER_PAGE);

  function getSubjectProgress(subjectId: string) {
    const subjectTopics = topics[subjectId] || [];
    let total = 0;
    let completed = 0;
    subjectTopics.forEach((t) => {
      t.subtopics.forEach((st) => {
        total++;
        if (st.completed) completed++;
      });
    });
    return { completed, total };
  }

  function toggleSubtopic(subjectId: string, chapterIdx: number, subtopicIdx: number) {
    setTopics((prev) => {
      const updated = { ...prev };
      const chapters = [...(updated[subjectId] || [])];
      const chapter = chapters[chapterIdx];
      if (!chapter) return prev;
      const subtopic = chapter.subtopics[subtopicIdx];
      if (!subtopic) return prev;
      const newSubtopics = [...chapter.subtopics];
      newSubtopics[subtopicIdx] = { ...subtopic, completed: !subtopic.completed };
      chapters[chapterIdx] = { ...chapter, subtopics: newSubtopics };
      updated[subjectId] = chapters;
      return updated;
    });
  }

  function progressColor(pct: number) {
    if (pct >= 90) return 'bg-red-500 text-red-600';
    if (pct >= 50) return 'bg-green-500 text-green-600';
    return 'bg-blue-500 text-blue-600';
  }

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
    if (!planForm.chapterName.trim() || !planForm.date) return;
    const newPlan: MockPlan = {
      id: `lp${Date.now()}`,
      title: planForm.chapterName,
      subject: planForm.subject,
      class: planForm.class,
      date: planForm.date,
      duration: '45 min',
      objectives: planForm.subtopics.filter(Boolean),
      activities: '',
      resources: '',
      assessment: '',
      notes: planForm.chapterName,
      status: 'draft',
    };
    setPlans((prev) => [newPlan, ...prev]);
    setPlanForm({ title: '', subject: 'Mathematics', class: 'Class 10-A', date: '', chapterName: '', subtopics: [''] });
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
    <section className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Classes &amp; Subjects</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage your assigned classes, subjects, and lesson plans.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="blue" label="My Classes" value={MOCK_CLASSES.length} />
        <SchoolStatCard icon={<Users className="w-5 h-5" />} color="green" label="Total Students" value={totalStudents} />
        <SchoolStatCard icon={<ClipboardList className="w-5 h-5" />} color="purple" label="Subjects Teaching" value={uniqueSubjects} />
        <SchoolStatCard icon={<GraduationCap className="w-5 h-5" />} color="amber" label="Avg Performance" value={`${avgPerformance}%`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { key: 'classes' as const, label: 'My Classes' },
          { key: 'lesson_plans' as const, label: 'Subjects Management' },
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

          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-3 sm:px-5 font-medium text-slate-500 text-xs sm:text-sm">Roll No</th>
                  <th className="text-left py-3 px-3 sm:px-5 font-medium text-slate-500 text-xs sm:text-sm">Name</th>
                  <th className="text-left py-3 px-3 sm:px-5 font-medium text-slate-500 text-xs sm:text-sm">Gender</th>
                  <th className="text-left py-3 px-3 sm:px-5 font-medium text-slate-500 text-xs sm:text-sm">Performance</th>
                  <th className="text-left py-3 px-3 sm:px-5 font-medium text-slate-500 text-xs sm:text-sm">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 sm:px-5 text-slate-600">{s.rollNo}</td>
                    <td className="py-3 px-3 sm:px-5 font-medium text-slate-900 whitespace-nowrap">{s.name}</td>
                    <td className="py-3 px-3 sm:px-5 text-slate-600">{s.gender}</td>
                    <td className="py-3 px-3 sm:px-5">
                      <span className={`font-semibold ${perfColor(s.performance)}`}>{s.performance}%</span>
                    </td>
                    <td className="py-3 px-3 sm:px-5">
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

      {/* Subjects Management Tab */}
      {tab === 'lesson_plans' && (
        <div className="space-y-4">
          {/* Search & Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={subjectSearch}
                  onChange={(e) => { setSubjectSearch(e.target.value); setSubjectPage(1); }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all"
                />
              </div>
              <button className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0">
                <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">Showing {filteredSubjects.length} subjects</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3.5 px-5 font-semibold text-xs uppercase tracking-wider text-slate-500">Subject Name</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-xs uppercase tracking-wider text-slate-500">Assigned Class</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-xs uppercase tracking-wider text-slate-500">Schedule</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-xs uppercase tracking-wider text-slate-500">Progress</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-xs uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-500">
                        <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        No subjects found
                      </td>
                    </tr>
                  ) : (
                    paginatedSubjects.map((subject) => {
                      const prog = getSubjectProgress(subject.id);
                      const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                      const colors = progressColor(pct);
                      const barColor = colors.split(' ')[0];
                      const textColor = colors.split(' ')[1];
                      return (
                        <tr key={subject.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg ${subject.color} flex items-center justify-center text-white text-xs font-bold`}>
                                {subject.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{subject.name}</p>
                                <p className="text-xs text-slate-400">Code: {subject.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-600">{subject.assignedClass}</td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <div>
                                <p className="text-sm">{subject.scheduleDays}</p>
                                <p className="text-xs text-slate-400">{subject.scheduleTime}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-700">{prog.completed}/{prog.total} Lessons</span>
                              <span className={`text-xs font-semibold ${textColor}`}>{pct}%</span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewTopicsSubject(subject)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <ListFilter className="w-3.5 h-3.5" /> View Topics
                              </button>
                              <button
                                onClick={() => setShowPlanForm(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Plan
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination */}
            {filteredSubjects.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Showing {(subjectPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(subjectPage * ITEMS_PER_PAGE, filteredSubjects.length)} of {filteredSubjects.length} results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSubjectPage((p) => Math.max(1, p - 1))}
                    disabled={subjectPage === 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalSubjectPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setSubjectPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        subjectPage === page ? 'bg-[#824ef2] text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setSubjectPage((p) => Math.min(totalSubjectPages, p + 1))}
                    disabled={subjectPage === totalSubjectPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {paginatedSubjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 py-12 text-center text-slate-500">
                <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                No subjects found
              </div>
            ) : (
              paginatedSubjects.map((subject) => {
                const prog = getSubjectProgress(subject.id);
                const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                const colors = progressColor(pct);
                const barColor = colors.split(' ')[0];
                const textColor = colors.split(' ')[1];
                return (
                  <div key={subject.id} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg ${subject.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {subject.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{subject.name}</p>
                          <p className="text-xs text-slate-400">{subject.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setViewTopicsSubject(subject)}
                          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Topics"
                        >
                          <ListFilter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowPlanForm(true)}
                          className="p-2 text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors"
                          title="Add Plan"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <p className="text-slate-400">Class</p>
                        <p className="text-slate-700 font-medium">{subject.assignedClass}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Schedule</p>
                        <p className="text-slate-700 font-medium">{subject.scheduleDays}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-400">Time</p>
                        <p className="text-slate-700 font-medium">{subject.scheduleTime}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600">{prog.completed}/{prog.total} Lessons</span>
                        <span className={`font-semibold ${textColor}`}>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Mobile Pagination */}
            {filteredSubjects.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-500">
                  {(subjectPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(subjectPage * ITEMS_PER_PAGE, filteredSubjects.length)} of {filteredSubjects.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSubjectPage((p) => Math.max(1, p - 1))}
                    disabled={subjectPage === 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalSubjectPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setSubjectPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        subjectPage === page ? 'bg-[#824ef2] text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setSubjectPage((p) => Math.min(totalSubjectPages, p + 1))}
                    disabled={subjectPage === totalSubjectPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Lesson Plan Modal */}
      <FormModal open={showPlanForm} onClose={() => setShowPlanForm(false)} title="Create Lesson Plan" size="lg" footer={
        <>
          <button onClick={() => setShowPlanForm(false)} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" form="lp-form" className="px-6 py-2.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors shadow-sm">Save Topic</button>
        </>
      }>
        <form id="lp-form" onSubmit={handleCreatePlan} className="space-y-6">
          {/* Class Details Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Class Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                <select className={`${inputClass} cursor-pointer bg-white`} value={planForm.subject} onChange={(e) => setPlanForm({ ...planForm, subject: e.target.value })}>
                  {['Mathematics', 'Physics'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Class</label>
                <select className={`${inputClass} cursor-pointer bg-white`} value={planForm.class} onChange={(e) => setPlanForm({ ...planForm, class: e.target.value })}>
                  {['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A', 'Class 7-C'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                <input type="date" className={`${inputClass} bg-white`} value={planForm.date} onChange={(e) => setPlanForm({ ...planForm, date: e.target.value })} required />
              </div>
            </div>
          </div>

          {/* Topic Section */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Add New Topic</p>
            <div className="border border-slate-200 rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Chapter Name <span className="text-red-500">*</span></label>
                <input type="text" className={inputClass} value={planForm.chapterName} onChange={(e) => setPlanForm({ ...planForm, chapterName: e.target.value })} required placeholder="e.g., Chapter 3: Algebra" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sub-topics</label>
                <div className="space-y-2.5">
                  {planForm.subtopics.map((st, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#824ef2]/10 text-[#824ef2] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        className={inputClass}
                        value={st}
                        onChange={(e) => {
                          const updated = [...planForm.subtopics];
                          updated[i] = e.target.value;
                          setPlanForm({ ...planForm, subtopics: updated });
                        }}
                        placeholder={`Sub-topic ${i + 1}`}
                      />
                      {planForm.subtopics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = planForm.subtopics.filter((_, idx) => idx !== i);
                            setPlanForm({ ...planForm, subtopics: updated });
                          }}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPlanForm({ ...planForm, subtopics: [...planForm.subtopics, ''] })}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#824ef2] hover:text-[#6b3fd4] font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Sub-topic
                </button>
              </div>
            </div>
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

      {/* View Topics Modal */}
      <FormModal
        open={!!viewTopicsSubject}
        onClose={() => setViewTopicsSubject(null)}
        title={viewTopicsSubject ? `${viewTopicsSubject.name} — Topics` : ''}
        size="lg"
        footer={
          <button onClick={() => setViewTopicsSubject(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
        }
      >
        {viewTopicsSubject && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{viewTopicsSubject.assignedClass}</span>
              <span>&bull;</span>
              <span>{viewTopicsSubject.scheduleDays}</span>
            </div>
            {(() => {
              const subjectTopics = topics[viewTopicsSubject.id] || [];
              const prog = getSubjectProgress(viewTopicsSubject.id);
              return subjectTopics.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  No topics added yet
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">{prog.completed}/{prog.total} completed</span>
                        <span className="font-semibold text-slate-900">{prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full">
                        <div className="h-full rounded-full bg-[#824ef2] transition-all" style={{ width: `${prog.total > 0 ? (prog.completed / prog.total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {subjectTopics.map((topic, i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 text-sm mb-2">{topic.chapter}</h4>
                        {topic.subtopics.length > 0 && (
                          <ul className="space-y-2">
                            {topic.subtopics.map((st, j) => (
                              <li key={j} className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleSubtopic(viewTopicsSubject.id, i, j)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    st.completed
                                      ? 'bg-[#824ef2] border-[#824ef2] text-white'
                                      : 'border-slate-300 hover:border-[#824ef2]'
                                  }`}
                                >
                                  {st.completed && (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <span className={`text-sm ${st.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  {st.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </FormModal>

      {/* Confirm Delete */}
      <ConfirmModal open={confirmModal.open} title="Delete Lesson Plan" message="Are you sure you want to delete this lesson plan?" confirmLabel="Delete" confirmColor="red" onConfirm={() => handleDeletePlan(confirmModal.id)} onCancel={() => setConfirmModal({ open: false, id: '' })} />
    </section>
  );
}
