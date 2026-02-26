'use client';

import { useState, useMemo } from 'react';
import { SchoolStatCard } from '../../../../components/school';
import {
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  Loader2,
  Download,
  Printer,
} from 'lucide-react';

// ── Mock data ──
const MOCK_CLASS_PERFORMANCE = [
  { class: 'Class 10-A', subject: 'Mathematics', avgScore: 82, highest: 98, lowest: 45, students: 31 },
  { class: 'Class 10-B', subject: 'Mathematics', avgScore: 78, highest: 95, lowest: 42, students: 30 },
  { class: 'Class 9-A', subject: 'Mathematics', avgScore: 76, highest: 92, lowest: 38, students: 29 },
  { class: 'Class 9-B', subject: 'Mathematics', avgScore: 74, highest: 90, lowest: 35, students: 28 },
  { class: 'Class 8-A', subject: 'Physics', avgScore: 71, highest: 88, lowest: 32, students: 26 },
  { class: 'Class 7-C', subject: 'Physics', avgScore: 68, highest: 85, lowest: 28, students: 24 },
];

const MOCK_ATTENDANCE_SUMMARY = [
  { class: 'Class 10-A', avgAttendance: 94, totalDays: 120, present: 113, absent: 7 },
  { class: 'Class 10-B', avgAttendance: 91, totalDays: 120, present: 109, absent: 11 },
  { class: 'Class 9-A', avgAttendance: 88, totalDays: 120, present: 106, absent: 14 },
  { class: 'Class 9-B', avgAttendance: 92, totalDays: 120, present: 110, absent: 10 },
  { class: 'Class 8-A', avgAttendance: 89, totalDays: 120, present: 107, absent: 13 },
  { class: 'Class 7-C', avgAttendance: 86, totalDays: 120, present: 103, absent: 17 },
];

const MOCK_STUDENT_RANKINGS = [
  { rank: 1, name: 'Ananya Iyer', class: 'Class 10-A', score: 98 },
  { rank: 2, name: 'Priya Patel', class: 'Class 10-A', score: 96 },
  { rank: 3, name: 'Meera Nair', class: 'Class 10-A', score: 94 },
  { rank: 4, name: 'Ishita Bansal', class: 'Class 9-B', score: 92 },
  { rank: 5, name: 'Aarav Sharma', class: 'Class 10-A', score: 91 },
  { rank: 6, name: 'Sneha Reddy', class: 'Class 10-A', score: 88 },
  { rank: 7, name: 'Divya Kumari', class: 'Class 9-B', score: 87 },
  { rank: 8, name: 'Aditya Kapoor', class: 'Class 10-B', score: 86 },
  { rank: 9, name: 'Rohan Gupta', class: 'Class 10-A', score: 85 },
  { rank: 10, name: 'Arjun Singh', class: 'Class 10-A', score: 83 },
];

type ReportType = 'performance' | 'attendance' | 'student' | 'exam';

export default function TeacherReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('performance');

  function scoreColor(val: number) {
    if (val >= 85) return 'text-green-600';
    if (val >= 70) return 'text-blue-600';
    if (val >= 55) return 'text-amber-600';
    return 'text-red-600';
  }

  function barWidth(val: number) {
    return `${Math.min(val, 100)}%`;
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-sm text-slate-500">View class performance and analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<BarChart3 className="w-5 h-5" />} color="blue" label="Reports Generated" value={15} />
        <SchoolStatCard icon={<Users className="w-5 h-5" />} color="green" label="Students Covered" value={142} />
        <SchoolStatCard icon={<TrendingUp className="w-5 h-5" />} color="purple" label="Class Avg" value="76%" />
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="amber" label="Pending Reports" value={3} />
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { key: 'performance' as ReportType, label: 'Class Performance' },
          { key: 'attendance' as ReportType, label: 'Attendance Summary' },
          { key: 'student' as ReportType, label: 'Student Progress' },
          { key: 'exam' as ReportType, label: 'Exam Analysis' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setReportType(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              reportType === t.key ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Class Performance */}
      {reportType === 'performance' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Class-wise Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Subject</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Average</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Highest</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Lowest</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-48">Progress</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CLASS_PERFORMANCE.map((row) => (
                  <tr key={`${row.class}-${row.subject}`} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{row.class}</td>
                    <td className="py-3 px-5 text-slate-600">{row.subject}</td>
                    <td className="py-3 px-5"><span className={`font-semibold ${scoreColor(row.avgScore)}`}>{row.avgScore}%</span></td>
                    <td className="py-3 px-5 text-green-600 font-medium">{row.highest}%</td>
                    <td className="py-3 px-5 text-red-600 font-medium">{row.lowest}%</td>
                    <td className="py-3 px-5">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${row.avgScore >= 80 ? 'bg-green-500' : row.avgScore >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: barWidth(row.avgScore) }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Summary */}
      {reportType === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Attendance Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Avg Attendance</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Working Days</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Present</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Absent</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-48">Progress</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ATTENDANCE_SUMMARY.map((row) => (
                  <tr key={row.class} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{row.class}</td>
                    <td className="py-3 px-5"><span className={`font-semibold ${scoreColor(row.avgAttendance)}`}>{row.avgAttendance}%</span></td>
                    <td className="py-3 px-5 text-slate-600">{row.totalDays}</td>
                    <td className="py-3 px-5 text-green-600 font-medium">{row.present}</td>
                    <td className="py-3 px-5 text-red-600 font-medium">{row.absent}</td>
                    <td className="py-3 px-5">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${row.avgAttendance >= 90 ? 'bg-green-500' : row.avgAttendance >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: barWidth(row.avgAttendance) }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Progress (Rankings) */}
      {reportType === 'student' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Top Performing Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-16">Rank</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Student Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Score</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_STUDENT_RANKINGS.map((r) => (
                  <tr key={r.rank} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        r.rank <= 3 ? 'bg-[#824ef2]/10 text-[#824ef2]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.rank}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-medium text-slate-900">{r.name}</td>
                    <td className="py-3 px-5 text-slate-600">{r.class}</td>
                    <td className="py-3 px-5"><span className={`font-semibold ${scoreColor(r.score)}`}>{r.score}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exam Analysis */}
      {reportType === 'exam' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p className="text-xs text-slate-500 mb-1">Overall Average</p>
              <p className="text-3xl font-bold text-[#824ef2]">76%</p>
              <p className="text-xs text-green-600 mt-1">+3% from last term</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p className="text-xs text-slate-500 mb-1">Pass Rate</p>
              <p className="text-3xl font-bold text-green-600">92%</p>
              <p className="text-xs text-green-600 mt-1">+1% from last term</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <p className="text-xs text-slate-500 mb-1">Distinction Rate</p>
              <p className="text-3xl font-bold text-blue-600">28%</p>
              <p className="text-xs text-amber-600 mt-1">-2% from last term</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Grade Distribution</h3>
            <div className="space-y-3">
              {[
                { grade: 'A+ (90-100%)', count: 18, pct: 13, color: 'bg-green-500' },
                { grade: 'A (80-89%)', count: 24, pct: 17, color: 'bg-blue-500' },
                { grade: 'B+ (70-79%)', count: 32, pct: 23, color: 'bg-sky-400' },
                { grade: 'B (60-69%)', count: 28, pct: 20, color: 'bg-amber-400' },
                { grade: 'C (50-59%)', count: 20, pct: 14, color: 'bg-orange-400' },
                { grade: 'D (40-49%)', count: 12, pct: 8, color: 'bg-red-400' },
                { grade: 'F (Below 40%)', count: 8, pct: 5, color: 'bg-red-600' },
              ].map((g) => (
                <div key={g.grade}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{g.grade}</span>
                    <span className="text-sm font-medium text-slate-700">{g.count} students ({g.pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${g.color} rounded-full transition-all duration-700`} style={{ width: `${g.pct * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
