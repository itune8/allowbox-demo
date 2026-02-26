'use client';

import { useState, useEffect, useMemo } from 'react';
import { examService, type Exam } from '../../../../lib/services/exam.service';
import { classService } from '../../../../lib/services/class.service';
import { SchoolStatCard, FormModal, useToast, SchoolStatusBadge } from '../../../../components/school';
import {
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  Loader2,
  GraduationCap,
  Plus,
  Save,
} from 'lucide-react';

// ── Mock data ──
interface MockExam {
  id: string;
  name: string;
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

const MOCK_EXAMS: MockExam[] = [
  { id: 'e1', name: 'Mid-Term Examination', subject: 'Mathematics', class: 'Class 10-A', date: '2025-03-15', maxMarks: 100, status: 'upcoming' },
  { id: 'e2', name: 'Unit Test 2', subject: 'Mathematics', class: 'Class 9-B', date: '2025-03-10', maxMarks: 50, status: 'upcoming' },
  { id: 'e3', name: 'Lab Practical', subject: 'Physics', class: 'Class 8-A', date: '2025-03-08', maxMarks: 30, status: 'upcoming' },
  { id: 'e4', name: 'Unit Test 1', subject: 'Mathematics', class: 'Class 10-A', date: '2025-02-15', maxMarks: 50, status: 'graded' },
  { id: 'e5', name: 'Quarterly Exam', subject: 'Physics', class: 'Class 10-A', date: '2025-01-20', maxMarks: 100, status: 'graded' },
  { id: 'e6', name: 'Unit Test 1', subject: 'Mathematics', class: 'Class 9-B', date: '2025-02-10', maxMarks: 50, status: 'graded' },
  { id: 'e7', name: 'Lab Assessment', subject: 'Physics', class: 'Class 8-A', date: '2025-02-05', maxMarks: 30, status: 'graded' },
  { id: 'e8', name: 'Class Test', subject: 'Mathematics', class: 'Class 7-C', date: '2025-02-20', maxMarks: 25, status: 'graded' },
  { id: 'e9', name: 'Surprise Quiz', subject: 'Mathematics', class: 'Class 10-B', date: '2025-03-01', maxMarks: 20, status: 'completed' },
  { id: 'e10', name: 'Chapter Test', subject: 'Physics', class: 'Class 9-A', date: '2025-02-28', maxMarks: 40, status: 'completed' },
  { id: 'e11', name: 'Practice Test', subject: 'Mathematics', class: 'Class 10-A', date: '2025-03-05', maxMarks: 30, status: 'completed' },
  { id: 'e12', name: 'Monthly Test', subject: 'Physics', class: 'Class 7-C', date: '2025-03-02', maxMarks: 50, status: 'completed' },
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

const MOCK_RESULTS = [
  { rollNo: '001', name: 'Aarav Sharma', marks: 42, grade: 'A' },
  { rollNo: '002', name: 'Priya Patel', marks: 48, grade: 'A+' },
  { rollNo: '003', name: 'Rohan Gupta', marks: 35, grade: 'B+' },
  { rollNo: '004', name: 'Sneha Reddy', marks: 40, grade: 'A' },
  { rollNo: '005', name: 'Arjun Singh', marks: 32, grade: 'B' },
  { rollNo: '006', name: 'Ananya Iyer', marks: 47, grade: 'A+' },
  { rollNo: '007', name: 'Vikram Joshi', marks: 28, grade: 'B-' },
  { rollNo: '008', name: 'Meera Nair', marks: 44, grade: 'A' },
];

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

export default function TeacherGradesPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'marks' | 'results'>('upcoming');
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>(MOCK_MARKS);
  const [selectedExam, setSelectedExam] = useState('e4');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    const total = MOCK_EXAMS.length;
    const graded = MOCK_EXAMS.filter((e) => e.status === 'graded').length;
    const pending = MOCK_EXAMS.filter((e) => e.status === 'completed').length;
    return { total, graded, pending, avgScore: 72 };
  }, []);

  const upcomingExams = MOCK_EXAMS.filter((e) => e.status === 'upcoming');
  const completedExams = MOCK_EXAMS.filter((e) => e.status !== 'upcoming');

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

  const resultsData = MOCK_RESULTS;
  const classAvg = Math.round(resultsData.reduce((s, r) => s + r.marks, 0) / resultsData.length);
  const highest = Math.max(...resultsData.map((r) => r.marks));
  const lowest = Math.min(...resultsData.map((r) => r.marks));

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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exams & Marks</h1>
          <p className="text-sm text-slate-500">Manage exams, enter marks, and view results</p>
        </div>
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
            onClick={() => setTab(t.key)}
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
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Subject</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Max Marks</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EXAMS.map((exam) => (
                  <tr key={exam.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{exam.name}</td>
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
      {tab === 'results' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Class Average</p>
              <p className="text-2xl font-bold text-[#824ef2]">{classAvg}/50</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Highest Score</p>
              <p className="text-2xl font-bold text-green-600">{highest}/50</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Lowest Score</p>
              <p className="text-2xl font-bold text-red-600">{lowest}/50</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Unit Test 1 — Class 10-A (Mathematics)</h2>
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
                  {resultsData.map((r) => (
                    <tr key={r.rollNo} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 text-slate-600">{r.rollNo}</td>
                      <td className="py-3 px-5 font-medium text-slate-900">{r.name}</td>
                      <td className="py-3 px-5 font-semibold text-slate-700">{r.marks}/50</td>
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
    </section>
  );
}
