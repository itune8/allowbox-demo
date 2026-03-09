'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard, useToast } from '../../../../components/school';
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
  // Seed-like deterministic marks based on student name + maxMarks
  return students.map((name, i) => {
    const seed = name.length * 7 + i * 13 + maxMarks;
    const pct = 45 + (seed % 50); // 45-94% range
    const marks = Math.round((pct / 100) * maxMarks);
    const grade = calcGrade(marks, maxMarks);
    return { rollNo: String(i + 1).padStart(3, '0'), name, marks, grade };
  });
}

// ── Mock data ──
const INITIAL_EXAMS: MockExam[] = [
  { id: 'e1', name: 'Mid-Term Examination', type: 'mid-term', subject: 'Mathematics', class: 'Class 10-A', date: '2025-03-15', maxMarks: 100, status: 'upcoming' },
  { id: 'e2', name: 'Unit Test 2', type: 'unit-test', subject: 'Mathematics', class: 'Class 9-B', date: '2025-03-10', maxMarks: 50, status: 'upcoming' },
  { id: 'e3', name: 'Lab Practical', type: 'lab', subject: 'Physics', class: 'Class 8-A', date: '2025-03-08', maxMarks: 30, status: 'upcoming' },
  { id: 'e4', name: 'Unit Test 1', type: 'unit-test', subject: 'Mathematics', class: 'Class 10-A', date: '2025-02-15', maxMarks: 50, status: 'graded' },
  { id: 'e5', name: 'Quarterly Exam', type: 'quarterly', subject: 'Physics', class: 'Class 10-A', date: '2025-01-20', maxMarks: 100, status: 'graded' },
  { id: 'e6', name: 'Unit Test 1', type: 'unit-test', subject: 'Mathematics', class: 'Class 9-B', date: '2025-02-10', maxMarks: 50, status: 'graded' },
  { id: 'e7', name: 'Lab Assessment', type: 'lab', subject: 'Physics', class: 'Class 8-A', date: '2025-02-05', maxMarks: 30, status: 'graded' },
  { id: 'e8', name: 'Class Test', type: 'class-test', subject: 'Mathematics', class: 'Class 7-C', date: '2025-02-20', maxMarks: 25, status: 'graded' },
  { id: 'e9', name: 'Surprise Quiz', type: 'internal', subject: 'Mathematics', class: 'Class 10-B', date: '2025-03-01', maxMarks: 20, status: 'completed' },
  { id: 'e10', name: 'Chapter Test', type: 'class-test', subject: 'Physics', class: 'Class 9-A', date: '2025-02-28', maxMarks: 40, status: 'completed' },
  { id: 'e11', name: 'Practice Test', type: 'internal', subject: 'Mathematics', class: 'Class 10-A', date: '2025-03-05', maxMarks: 30, status: 'completed' },
  { id: 'e12', name: 'Monthly Test', type: 'class-test', subject: 'Physics', class: 'Class 7-C', date: '2025-03-02', maxMarks: 50, status: 'completed' },
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

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  completed: 'bg-amber-100 text-amber-700',
  graded: 'bg-green-100 text-green-700',
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
  const [tab, setTab] = useState<'upcoming' | 'marks' | 'results'>('upcoming');
  const [exams, setExams] = useState<MockExam[]>(INITIAL_EXAMS);
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>(MOCK_MARKS);
  const [selectedExam, setSelectedExam] = useState('e4');
  const [submitting, setSubmitting] = useState(false);

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

  // Results state
  const [resultClassFilter, setResultClassFilter] = useState('all');
  const [selectedResultExam, setSelectedResultExam] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    const total = exams.length;
    const graded = exams.filter((e) => e.status === 'graded').length;
    const pending = exams.filter((e) => e.status === 'completed').length;
    const gradedExams = exams.filter((e) => e.status === 'graded');
    let avgScore = 72;
    if (gradedExams.length > 0) {
      const allResults = gradedExams.flatMap((ex) => generateResults(ex.class, ex.maxMarks));
      const avgPct = allResults.reduce((s, r) => s + (r.marks / gradedExams[0]!.maxMarks) * 100, 0) / allResults.length;
      avgScore = Math.round(avgPct) || 72;
    }
    return { total, graded, pending, avgScore };
  }, [exams]);

  const completedExams = exams.filter((e) => e.status !== 'upcoming');
  const gradedExams = exams.filter((e) => e.status === 'graded');

  // Get unique classes from graded exams
  const resultClasses = useMemo(() => {
    const classes = Array.from(new Set(gradedExams.map((e) => e.class)));
    return classes.sort();
  }, [gradedExams]);

  // Filtered graded exams based on class filter
  const filteredGradedExams = useMemo(() => {
    if (resultClassFilter === 'all') return gradedExams;
    return gradedExams.filter((e) => e.class === resultClassFilter);
  }, [gradedExams, resultClassFilter]);

  // Selected exam for detailed results view
  const activeResultExam = selectedResultExam ? exams.find((e) => e.id === selectedResultExam) : null;
  const activeResults = activeResultExam ? generateResults(activeResultExam.class, activeResultExam.maxMarks) : [];
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
    };
    setExams((prev) => [exam, ...prev]);
    setShowCreateModal(false);
    setNewExam({ name: '', type: 'class-test', subject: 'Mathematics', class: 'Class 10-A', date: '', maxMarks: '50' });
    showToast('success', `Exam "${exam.name}" created for ${exam.class}`);
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

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-[#824ef2]" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Exams & Marks</h1>
          <p className="text-sm text-slate-500">Manage exams, enter marks, and view results</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Exam
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="blue" label="Total Exams" value={stats.total} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Graded" value={stats.graded} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="amber" label="Pending" value={stats.pending} />
        <SchoolStatCard icon={<BarChart3 className="w-5 h-5" />} color="purple" label="Avg Score" value={`${stats.avgScore}%`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { key: 'upcoming' as const, label: 'Upcoming Exams' },
          { key: 'marks' as const, label: 'Enter Marks' },
          { key: 'results' as const, label: 'Results' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedResultExam(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upcoming Exams */}
      {tab === 'upcoming' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Exam Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Type</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Subject</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Max Marks</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{exam.name}</td>
                    <td className="py-3 px-5 text-slate-600">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {typeLabels[exam.type] || exam.type}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-600">{exam.subject}</td>
                    <td className="py-3 px-5 text-slate-600">{exam.class}</td>
                    <td className="py-3 px-5 text-slate-600">{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="py-3 px-5 text-slate-600">{exam.maxMarks}</td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[exam.status]}`}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enter Marks */}
      {tab === 'marks' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
            <select className={`${inputClass} cursor-pointer`} value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
              {completedExams.map((e) => (
                <option key={e.id} value={e.id}>{e.name} — {e.class} ({e.subject})</option>
              ))}
            </select>
            <button
              onClick={handleSaveMarks}
              disabled={submitting}
              className="ml-auto px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Marks
            </button>
          </div>
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
      )}

      {/* Results */}
      {tab === 'results' && !selectedResultExam && (
        <div className="space-y-4">
          {/* Class filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setResultClassFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                resultClassFilter === 'all'
                  ? 'bg-[#824ef2] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Classes
            </button>
            {resultClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setResultClassFilter(cls)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  resultClassFilter === cls
                    ? 'bg-[#824ef2] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Graded exams list */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Exam Name</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Subject</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Date</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Max Marks</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Students</th>
                    <th className="text-left py-3 px-5 font-medium text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGradedExams.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">No graded exams found for this class</td>
                    </tr>
                  ) : (
                    filteredGradedExams.map((exam) => {
                      const students = CLASS_STUDENTS[exam.class]?.length || 8;
                      return (
                        <tr key={exam.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-5 font-medium text-slate-900">{exam.name}</td>
                          <td className="py-3 px-5 text-slate-600">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {typeLabels[exam.type] || exam.type}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-slate-600">{exam.subject}</td>
                          <td className="py-3 px-5 text-slate-600">{exam.class}</td>
                          <td className="py-3 px-5 text-slate-600">{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td className="py-3 px-5 text-slate-600">{exam.maxMarks}</td>
                          <td className="py-3 px-5 text-slate-600">{students}</td>
                          <td className="py-3 px-5">
                            <button
                              onClick={() => setSelectedResultExam(exam.id)}
                              className="text-[#824ef2] hover:text-[#6b3fd4] text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              View Results <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Results Detail View */}
      {tab === 'results' && selectedResultExam && activeResultExam && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setSelectedResultExam(null)}
              className="text-[#824ef2] hover:text-[#6b3fd4] font-medium transition-colors"
            >
              Results
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{activeResultExam.name} — {activeResultExam.class}</span>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Class Average</p>
              <p className="text-2xl font-bold text-[#824ef2]">{activeAvg}/{activeResultExam.maxMarks}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Highest Score</p>
              <p className="text-2xl font-bold text-green-600">{activeHighest}/{activeResultExam.maxMarks}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Lowest Score</p>
              <p className="text-2xl font-bold text-red-600">{activeLowest}/{activeResultExam.maxMarks}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {activeResultExam.name} — {activeResultExam.class} ({activeResultExam.subject})
              </h2>
              <button
                onClick={() => setSelectedResultExam(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Back to All
              </button>
            </div>
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
                      <td className="py-3 px-5 font-semibold text-slate-700">{r.marks}/{activeResultExam.maxMarks}</td>
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
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Create New Exam</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Exam Name */}
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

              {/* Type & Subject row */}
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

              {/* Class */}
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

              {/* Date & Max Marks */}
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
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
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
