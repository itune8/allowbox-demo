'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, useToast } from '../../../../components/school';
import { FormModal } from '../../../../components/school/form-modal';
import {
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  Loader2,
  GraduationCap,
  Plus,
  Save,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Users,
  Edit3,
  Eye,
  ClipboardList,
  CalendarDays,
} from 'lucide-react';

// ── Types ──
interface MockExam {
  id: string;
  name: string;
  type: 'internal' | 'class-test' | 'unit-test' | 'mid-term' | 'quarterly' | 'lab';
  subject: string;
  class: string;
  date: string;
  maxMarks: number;
  status: 'upcoming' | 'completed' | 'graded';
  students: number;
  category: 'my' | 'school';
}

interface MarkEntry {
  rollNo: string;
  name: string;
  marks: string;
  grade: string;
  remarks: string;
}

interface ResultEntry {
  rollNo: string;
  name: string;
  marks: number;
  grade: string;
}

interface ScheduleEntry {
  date: string;
  time: string;
  subject: string;
  class: string;
  room: string;
}

// ── Student names pool per class ──
const CLASS_STUDENTS: Record<string, string[]> = {
  'Class 10-A': ['Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Sneha Reddy', 'Arjun Singh', 'Ananya Iyer', 'Vikram Joshi', 'Meera Nair', 'Karan Mehta', 'Divya Rao'],
  'Class 10-B': ['Rahul Verma', 'Sanya Kapoor', 'Aditya Kumar', 'Pooja Sharma', 'Nikhil Das', 'Isha Gupta', 'Manish Tiwari', 'Ritu Singh'],
  'Class 9-A': ['Amit Saxena', 'Kavya Nair', 'Harsh Pandey', 'Simran Kaur', 'Varun Reddy', 'Nisha Jain', 'Deepak Yadav', 'Ankita Mishra'],
  'Class 9-B': ['Suresh Bhat', 'Tanvi Desai', 'Pranav Kulkarni', 'Megha Pillai', 'Rohit Agarwal', 'Pallavi Menon', 'Siddharth Nair', 'Jaya Iyer'],
  'Class 8-A': ['Akash Chauhan', 'Shruti Patil', 'Tushar Joshi', 'Neha Shetty', 'Gaurav Thakur', 'Anjali Rao', 'Vishal Hegde', 'Bhavna Kulkarni'],
  'Class 7-C': ['Ravi Prasad', 'Snehal Pawar', 'Kunal Bhatt', 'Mira Chopra', 'Ajay Nambiar', 'Prerna Gokhale', 'Tarun Sethi', 'Lata Deshmukh'],
};

function generateResults(className: string, maxMarks: number): ResultEntry[] {
  const students = CLASS_STUDENTS[className] || CLASS_STUDENTS['Class 10-A']!;
  return students.map((name, i) => {
    const seed = name.length * 7 + i * 13 + maxMarks;
    const pct = 45 + (seed % 50);
    const marks = Math.round((pct / 100) * maxMarks);
    const grade = calcGrade(marks, maxMarks);
    return { rollNo: String(i + 1).padStart(3, '0'), name, marks, grade };
  });
}

// ── Mock data ──
const INITIAL_EXAMS: MockExam[] = [
  { id: 'e1', name: 'Mid-Term Examination', type: 'mid-term', subject: 'Mathematics', class: 'Class 10-A', date: '2025-03-15', maxMarks: 100, status: 'upcoming', students: 10, category: 'my' },
  { id: 'e2', name: 'Unit Test 2', type: 'unit-test', subject: 'Mathematics', class: 'Class 9-B', date: '2025-03-10', maxMarks: 50, status: 'upcoming', students: 8, category: 'my' },
  { id: 'e3', name: 'Lab Practical', type: 'lab', subject: 'Physics', class: 'Class 8-A', date: '2025-03-08', maxMarks: 30, status: 'upcoming', students: 8, category: 'my' },
  { id: 'e4', name: 'Unit Test 1', type: 'unit-test', subject: 'Mathematics', class: 'Class 10-A', date: '2025-02-15', maxMarks: 50, status: 'graded', students: 10, category: 'my' },
  { id: 'e5', name: 'Quarterly Exam', type: 'quarterly', subject: 'Physics', class: 'Class 10-A', date: '2025-01-20', maxMarks: 100, status: 'graded', students: 10, category: 'my' },
  { id: 'e6', name: 'Unit Test 1', type: 'unit-test', subject: 'Mathematics', class: 'Class 9-B', date: '2025-02-10', maxMarks: 50, status: 'graded', students: 8, category: 'my' },
  { id: 'e7', name: 'Lab Assessment', type: 'lab', subject: 'Physics', class: 'Class 8-A', date: '2025-02-05', maxMarks: 30, status: 'graded', students: 8, category: 'my' },
  { id: 'e8', name: 'Class Test', type: 'class-test', subject: 'Mathematics', class: 'Class 7-C', date: '2025-02-20', maxMarks: 25, status: 'graded', students: 8, category: 'my' },
  { id: 'e9', name: 'Surprise Quiz', type: 'internal', subject: 'Mathematics', class: 'Class 10-B', date: '2025-03-01', maxMarks: 20, status: 'completed', students: 8, category: 'my' },
  { id: 'e10', name: 'Chapter Test', type: 'class-test', subject: 'Physics', class: 'Class 9-A', date: '2025-02-28', maxMarks: 40, status: 'completed', students: 8, category: 'my' },
  { id: 'e11', name: 'Practice Test', type: 'internal', subject: 'Mathematics', class: 'Class 10-A', date: '2025-03-05', maxMarks: 30, status: 'completed', students: 10, category: 'my' },
  { id: 'e12', name: 'Monthly Test', type: 'class-test', subject: 'Physics', class: 'Class 7-C', date: '2025-03-02', maxMarks: 50, status: 'completed', students: 8, category: 'my' },
  // School exams
  { id: 's1', name: 'Annual Examination 2025', type: 'mid-term', subject: 'All Subjects', class: 'All Classes', date: '2025-04-01', maxMarks: 100, status: 'upcoming', students: 450, category: 'school' },
  { id: 's2', name: 'Half-Yearly Examination', type: 'quarterly', subject: 'All Subjects', class: 'All Classes', date: '2025-09-15', maxMarks: 100, status: 'upcoming', students: 450, category: 'school' },
  { id: 's3', name: 'First Term Examination', type: 'quarterly', subject: 'All Subjects', class: 'All Classes', date: '2024-12-10', maxMarks: 100, status: 'graded', students: 448, category: 'school' },
  { id: 's4', name: 'Pre-Board Examination', type: 'mid-term', subject: 'All Subjects', class: 'Class 10', date: '2025-01-15', maxMarks: 100, status: 'graded', students: 80, category: 'school' },
];

const MOCK_MARKS: MarkEntry[] = [
  { rollNo: '001', name: 'Aarav Sharma', marks: '42', grade: 'A', remarks: '' },
  { rollNo: '002', name: 'Priya Patel', marks: '48', grade: 'A+', remarks: 'Excellent work' },
  { rollNo: '003', name: 'Rohan Gupta', marks: '35', grade: 'B+', remarks: '' },
  { rollNo: '004', name: 'Sneha Reddy', marks: '40', grade: 'A', remarks: '' },
  { rollNo: '005', name: 'Arjun Singh', marks: '32', grade: 'B', remarks: 'Needs improvement in algebra' },
  { rollNo: '006', name: 'Ananya Iyer', marks: '47', grade: 'A+', remarks: '' },
  { rollNo: '007', name: 'Vikram Joshi', marks: '28', grade: 'B-', remarks: '' },
  { rollNo: '008', name: 'Meera Nair', marks: '44', grade: 'A', remarks: '' },
];

const MOCK_SCHEDULE: ScheduleEntry[] = [
  { date: '2025-04-01', time: '09:00 - 12:00', subject: 'Mathematics', class: 'All Classes', room: 'Respective Rooms' },
  { date: '2025-04-03', time: '09:00 - 12:00', subject: 'English', class: 'All Classes', room: 'Respective Rooms' },
  { date: '2025-04-05', time: '09:00 - 12:00', subject: 'Science', class: 'All Classes', room: 'Labs / Rooms' },
  { date: '2025-04-07', time: '09:00 - 12:00', subject: 'Social Studies', class: 'All Classes', room: 'Respective Rooms' },
  { date: '2025-04-09', time: '09:00 - 11:00', subject: 'Hindi', class: 'All Classes', room: 'Respective Rooms' },
  { date: '2025-04-10', time: '09:00 - 11:00', subject: 'Computer Science', class: 'All Classes', room: 'Computer Lab' },
];

const EXAM_TYPES = [
  { value: 'internal', label: 'Internal Exam' },
  { value: 'class-test', label: 'Class Test' },
  { value: 'unit-test', label: 'Unit Test' },
  { value: 'mid-term', label: 'Mid-Term' },
  { value: 'quarterly', label: 'Quarterly Exam' },
  { value: 'lab', label: 'Lab Practical' },
];

const TEACHER_CLASSES = ['Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A', 'Class 7-C'];
const TEACHER_SUBJECTS = ['Mathematics', 'Physics'];

function calcGrade(marks: number, maxMarks: number): string {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 95) return 'A+';
  if (pct >= 85) return 'A';
  if (pct >= 75) return 'B+';
  if (pct >= 65) return 'B';
  if (pct >= 55) return 'B-';
  if (pct >= 45) return 'C';
  if (pct >= 35) return 'D';
  return 'F';
}

const defaultStatus = { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Upcoming' } as const;

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  upcoming: defaultStatus,
  completed: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Grading' },
  graded: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Completed' },
};

const typeLabels: Record<string, string> = {
  'internal': 'Internal',
  'class-test': 'Class Test',
  'unit-test': 'Unit Test',
  'mid-term': 'Mid-Term',
  'quarterly': 'Quarterly',
  'lab': 'Lab',
};

export default function TeacherGradesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [topTab, setTopTab] = useState<'my' | 'school'>('my');
  const [exams, setExams] = useState<MockExam[]>(INITIAL_EXAMS);
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>(MOCK_MARKS);
  const [submitting, setSubmitting] = useState(false);

  // Sub-views
  const [viewMode, setViewMode] = useState<'list' | 'marks' | 'results' | 'schedule'>('list');
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  // Create exam modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    type: 'class-test' as MockExam['type'],
    subject: 'Mathematics',
    class: 'Class 10-A',
    date: '',
    maxMarks: '50',
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const myExams = useMemo(() => exams.filter((e) => e.category === 'my'), [exams]);
  const schoolExams = useMemo(() => exams.filter((e) => e.category === 'school'), [exams]);

  const stats = useMemo(() => {
    const list = topTab === 'my' ? myExams : schoolExams;
    const total = list.length;
    const graded = list.filter((e) => e.status === 'graded').length;
    const pending = list.filter((e) => e.status === 'completed').length;
    const upcoming = list.filter((e) => e.status === 'upcoming').length;
    return { total, graded, pending, upcoming };
  }, [topTab, myExams, schoolExams]);

  const activeExam = activeExamId ? exams.find((e) => e.id === activeExamId) : null;
  const activeResults = activeExam && activeExam.class !== 'All Classes' && activeExam.class !== 'Class 10'
    ? generateResults(activeExam.class, activeExam.maxMarks)
    : [];
  const activeAvg = activeResults.length > 0 ? Math.round(activeResults.reduce((s, r) => s + r.marks, 0) / activeResults.length) : 0;
  const activeHighest = activeResults.length > 0 ? Math.max(...activeResults.map((r) => r.marks)) : 0;
  const activeLowest = activeResults.length > 0 ? Math.min(...activeResults.map((r) => r.marks)) : 0;

  function updateMark(idx: number, field: keyof MarkEntry, value: string) {
    setMarkEntries((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx]!, [field]: value };
      if (field === 'marks') {
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
          updated[idx]!.grade = calcGrade(num, 50);
        }
      }
      return updated;
    });
  }

  async function handleSaveMarks() {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      showToast('success', 'Marks saved successfully');
    } catch {
      showToast('error', 'Failed to save marks');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCreateExam() {
    if (!newExam.name.trim() || !newExam.date || !newExam.maxMarks) {
      showToast('error', 'Please fill all required fields');
      return;
    }
    const id = `e${Date.now()}`;
    const exam: MockExam = {
      id,
      name: newExam.name.trim(),
      type: newExam.type,
      subject: newExam.subject,
      class: newExam.class,
      date: newExam.date,
      maxMarks: parseInt(newExam.maxMarks, 10),
      status: 'upcoming',
      students: CLASS_STUDENTS[newExam.class]?.length || 8,
      category: 'my',
    };
    setExams((prev) => [exam, ...prev]);
    setShowCreateModal(false);
    setNewExam({ name: '', type: 'class-test', subject: 'Mathematics', class: 'Class 10-A', date: '', maxMarks: '50' });
    showToast('success', `Exam "${exam.name}" created for ${exam.class}`);
  }

  function openExamView(examId: string, mode: 'marks' | 'results' | 'schedule') {
    setActiveExamId(examId);
    setViewMode(mode);
  }

  function backToList() {
    setActiveExamId(null);
    setViewMode('list');
  }

  const inputClass = 'border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading exams...</p>
      </div>
    );
  }

  // ── Sub-views: Marks Entry ──
  if (viewMode === 'marks' && activeExam) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={backToList} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{activeExam.status === 'graded' ? 'View' : 'Assign'} Marks</h1>
            <p className="text-sm text-slate-500">{activeExam.name} &mdash; {activeExam.class} ({activeExam.subject})</p>
          </div>
          {activeExam.status !== 'graded' && (
            <button
              onClick={handleSaveMarks}
              disabled={submitting}
              className="ml-auto px-5 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Marks
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Roll No</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Student Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-24">Marks</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-20">Grade</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {markEntries.map((m, idx) => (
                  <tr key={m.rollNo} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-2.5 px-5 text-slate-600">{m.rollNo}</td>
                    <td className="py-2.5 px-5 font-medium text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-5">
                      <input
                        type="number"
                        className={`${inputClass} w-20`}
                        value={m.marks}
                        onChange={(e) => updateMark(idx, 'marks', e.target.value)}
                      />
                    </td>
                    <td className="py-2.5 px-5">
                      <span className="text-sm font-semibold text-slate-700">{m.grade}</span>
                    </td>
                    <td className="py-2.5 px-5">
                      <input
                        type="text"
                        className={`${inputClass} w-full`}
                        value={m.remarks}
                        onChange={(e) => updateMark(idx, 'remarks', e.target.value)}
                        placeholder="Optional remarks..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  // ── Sub-views: Results Detail ──
  if (viewMode === 'results' && activeExam) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={backToList} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Exam Results</h1>
            <p className="text-sm text-slate-500">{activeExam.name} &mdash; {activeExam.class} ({activeExam.subject})</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Class Average</p>
            <p className="text-2xl font-bold text-[#824ef2]">{activeAvg}/{activeExam.maxMarks}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Highest Score</p>
            <p className="text-2xl font-bold text-green-600">{activeHighest}/{activeExam.maxMarks}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Lowest Score</p>
            <p className="text-2xl font-bold text-red-600">{activeLowest}/{activeExam.maxMarks}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Roll No</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Student Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Marks</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Grade</th>
                </tr>
              </thead>
              <tbody>
                {activeResults.map((r) => (
                  <tr key={r.rollNo} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">{r.rollNo}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{r.name}</td>
                    <td className="py-3 px-5 font-semibold text-slate-700">{r.marks}/{activeExam.maxMarks}</td>
                    <td className="py-3 px-5">
                      <span className={`text-sm font-semibold ${
                        r.grade.startsWith('A') ? 'text-green-600' : r.grade.startsWith('B') ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  // ── Sub-views: Schedule View (School Exams only) ──
  if (viewMode === 'schedule' && activeExam) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={backToList} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Exam Schedule</h1>
            <p className="text-sm text-slate-500">{activeExam.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Time</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Subject</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Room</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCHEDULE.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600 font-medium">
                      {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-5 text-slate-600">{s.time}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{s.subject}</td>
                    <td className="py-3 px-5 text-slate-600">{s.class}</td>
                    <td className="py-3 px-5 text-slate-500">{s.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {MOCK_SCHEDULE.map((s, idx) => (
              <div key={idx} className="p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-14 rounded-xl bg-[#824ef2]/10 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-[#824ef2] leading-tight">
                    {new Date(s.date).getDate()}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-[#824ef2]/70 leading-none">
                    {new Date(s.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{s.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.time}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Main list view ──
  const currentExams = topTab === 'my' ? myExams : schoolExams;

  return (
    <section className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-[#824ef2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exams & Marks</h1>
            <p className="text-sm text-slate-500">Manage exams, enter marks, and view results</p>
          </div>
        </div>
        {topTab === 'my' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Exam</span>
            <span className="sm:hidden">Create</span>
          </button>
        )}
      </div>

      {/* Top-level Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'my' as const, label: 'My Exams' },
          { key: 'school' as const, label: 'School Exams' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTopTab(t.key); setViewMode('list'); setActiveExamId(null); }}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
              topTab === t.key
                ? 'bg-[#824ef2] text-white border-[#824ef2]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="blue" label="Total Exams" value={stats.total} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Graded" value={stats.graded} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="amber" label="Pending" value={stats.pending} />
        <SchoolStatCard icon={<BarChart3 className="w-5 h-5" />} color="purple" label="Upcoming" value={stats.upcoming} />
      </div>

      {/* Exam List */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-5 font-medium text-slate-500">Exam Name</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Subject</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Type</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Date</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Marks</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-5 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No exams found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {topTab === 'my' ? 'Create your first exam to get started' : 'No school exams scheduled'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentExams.map((exam) => {
                  const sc = statusConfig[exam.status] ?? defaultStatus;
                  return (
                    <tr key={exam.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5">
                        <p className="font-medium text-slate-900">{exam.name}</p>
                        <p className="text-xs text-slate-400">{exam.students} students</p>
                      </td>
                      <td className="py-3 px-5 text-slate-600">{exam.class}</td>
                      <td className="py-3 px-5 text-slate-600">{exam.subject}</td>
                      <td className="py-3 px-5">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {typeLabels[exam.type] || exam.type}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-slate-600 whitespace-nowrap">
                        {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-5 text-slate-600">{exam.maxMarks}</td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          {exam.status === 'graded' && (
                            <button
                              onClick={() => openExamView(exam.id, 'results')}
                              className="text-xs font-medium text-[#824ef2] hover:text-[#6b3fd4] flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Marks
                            </button>
                          )}
                          {exam.status === 'completed' && (
                            <button
                              onClick={() => openExamView(exam.id, 'marks')}
                              className="text-xs font-medium text-[#824ef2] hover:text-[#6b3fd4] flex items-center gap-1 transition-colors"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              Assign Marks
                            </button>
                          )}
                          {exam.status === 'upcoming' && (
                            <button
                              onClick={() => openExamView(exam.id, 'marks')}
                              className="text-xs font-medium text-slate-600 hover:text-slate-800 flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          )}
                          {exam.category === 'school' && (
                            <button
                              onClick={() => openExamView(exam.id, 'schedule')}
                              className="text-xs font-medium text-slate-600 hover:text-slate-800 flex items-center gap-1 transition-colors"
                            >
                              <CalendarDays className="w-3.5 h-3.5" />
                              Schedule
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-slate-100">
          {currentExams.length === 0 ? (
            <div className="py-12 text-center">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">No exams found</p>
            </div>
          ) : (
            currentExams.map((exam) => {
              const sc = statusConfig[exam.status] ?? defaultStatus;
              return (
                <div key={exam.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{exam.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{typeLabels[exam.type] || exam.type}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                    <span>{exam.subject}</span>
                    <span>{exam.class}</span>
                    <span>{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>Max: {exam.maxMarks}</span>
                  </div>
                  <div className="flex gap-2">
                    {exam.status === 'graded' && (
                      <button
                        onClick={() => openExamView(exam.id, 'results')}
                        className="px-3 py-1.5 text-xs font-medium text-[#824ef2] bg-[#824ef2]/10 rounded-lg hover:bg-[#824ef2]/20 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Marks
                      </button>
                    )}
                    {exam.status === 'completed' && (
                      <button
                        onClick={() => openExamView(exam.id, 'marks')}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-1"
                      >
                        <ClipboardList className="w-3 h-3" /> Assign Marks
                      </button>
                    )}
                    {exam.status === 'upcoming' && (
                      <button
                        onClick={() => openExamView(exam.id, 'marks')}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    )}
                    {exam.category === 'school' && (
                      <button
                        onClick={() => openExamView(exam.id, 'schedule')}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        <CalendarDays className="w-3 h-3" /> Schedule
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Exam Modal */}
      <FormModal
        open={showCreateModal}
        title="Create New Exam"
        onClose={() => setShowCreateModal(false)}
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateExam}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Exam
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Exam Name *</label>
            <input
              type="text"
              className={`${inputClass} w-full`}
              value={newExam.name}
              onChange={(e) => setNewExam((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Unit Test 3, Internal Assessment..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type *</label>
              <select
                className={`${inputClass} w-full cursor-pointer`}
                value={newExam.type}
                onChange={(e) => setNewExam((p) => ({ ...p, type: e.target.value as MockExam['type'] }))}
              >
                {EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
              <select
                className={`${inputClass} w-full cursor-pointer`}
                value={newExam.subject}
                onChange={(e) => setNewExam((p) => ({ ...p, subject: e.target.value }))}
              >
                {TEACHER_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
            <select
              className={`${inputClass} w-full cursor-pointer`}
              value={newExam.class}
              onChange={(e) => setNewExam((p) => ({ ...p, class: e.target.value }))}
            >
              {TEACHER_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                className={`${inputClass} w-full`}
                value={newExam.date}
                onChange={(e) => setNewExam((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Marks *</label>
              <input
                type="number"
                className={`${inputClass} w-full`}
                value={newExam.maxMarks}
                onChange={(e) => setNewExam((p) => ({ ...p, maxMarks: e.target.value }))}
                placeholder="50"
                min="1"
              />
            </div>
          </div>
        </div>
      </FormModal>
    </section>
  );
}
