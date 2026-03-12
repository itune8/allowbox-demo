'use client';

import { useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  Download,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';

// ── Class data ──
const TEACHER_CLASSES = [
  { id: 'c1', name: 'Class 10-A', section: 'Science Section', students: 31, subject: 'Mathematics' },
  { id: 'c2', name: 'Class 10-B', section: 'Science Section', students: 30, subject: 'Mathematics' },
  { id: 'c3', name: 'Class 9-A', section: 'Science Section', students: 29, subject: 'Mathematics' },
  { id: 'c4', name: 'Class 9-B', section: 'Science Section', students: 28, subject: 'Mathematics' },
  { id: 'c5', name: 'Class 8-A', section: 'Science Section', students: 26, subject: 'Physics' },
  { id: 'c6', name: 'Class 7-C', section: 'General Section', students: 24, subject: 'Physics' },
];

// ── Mock data per class ──
const CLASS_STUDENTS: Record<string, { name: string; gender: string; performance: number; attendance: number }[]> = {
  'Class 10-A': [
    { name: 'Aarav Sharma', gender: 'Male', performance: 88, attendance: 96 },
    { name: 'Priya Patel', gender: 'Female', performance: 92, attendance: 98 },
    { name: 'Rohan Gupta', gender: 'Male', performance: 75, attendance: 90 },
    { name: 'Sneha Reddy', gender: 'Female', performance: 84, attendance: 94 },
    { name: 'Arjun Singh', gender: 'Male', performance: 79, attendance: 88 },
    { name: 'Ananya Iyer', gender: 'Female', performance: 96, attendance: 99 },
    { name: 'Vikram Joshi', gender: 'Male', performance: 68, attendance: 85 },
    { name: 'Meera Nair', gender: 'Female', performance: 91, attendance: 97 },
    { name: 'Karan Mehta', gender: 'Male', performance: 73, attendance: 91 },
    { name: 'Divya Rao', gender: 'Female', performance: 87, attendance: 95 },
  ],
  'Class 10-B': [
    { name: 'Rahul Verma', gender: 'Male', performance: 82, attendance: 93 },
    { name: 'Sanya Kapoor', gender: 'Female', performance: 89, attendance: 96 },
    { name: 'Aditya Kumar', gender: 'Male', performance: 76, attendance: 88 },
    { name: 'Pooja Sharma', gender: 'Female', performance: 85, attendance: 95 },
    { name: 'Nikhil Das', gender: 'Male', performance: 71, attendance: 87 },
    { name: 'Isha Gupta', gender: 'Female', performance: 93, attendance: 98 },
    { name: 'Manish Tiwari', gender: 'Male', performance: 67, attendance: 84 },
    { name: 'Ritu Singh', gender: 'Female', performance: 80, attendance: 92 },
  ],
  'Class 9-A': [
    { name: 'Amit Saxena', gender: 'Male', performance: 78, attendance: 90 },
    { name: 'Kavya Nair', gender: 'Female', performance: 86, attendance: 95 },
    { name: 'Harsh Pandey', gender: 'Male', performance: 72, attendance: 86 },
    { name: 'Simran Kaur', gender: 'Female', performance: 90, attendance: 97 },
    { name: 'Varun Reddy', gender: 'Male', performance: 65, attendance: 82 },
    { name: 'Nisha Jain', gender: 'Female', performance: 83, attendance: 93 },
    { name: 'Deepak Yadav', gender: 'Male', performance: 70, attendance: 88 },
    { name: 'Ankita Mishra', gender: 'Female', performance: 88, attendance: 96 },
  ],
  'Class 9-B': [
    { name: 'Suresh Bhat', gender: 'Male', performance: 74, attendance: 89 },
    { name: 'Tanvi Desai', gender: 'Female', performance: 87, attendance: 94 },
    { name: 'Pranav Kulkarni', gender: 'Male', performance: 69, attendance: 85 },
    { name: 'Megha Pillai', gender: 'Female', performance: 92, attendance: 97 },
    { name: 'Rohit Agarwal', gender: 'Male', performance: 76, attendance: 90 },
    { name: 'Pallavi Menon', gender: 'Female', performance: 81, attendance: 93 },
    { name: 'Siddharth Nair', gender: 'Male', performance: 63, attendance: 80 },
    { name: 'Jaya Iyer', gender: 'Female', performance: 85, attendance: 95 },
  ],
  'Class 8-A': [
    { name: 'Akash Chauhan', gender: 'Male', performance: 71, attendance: 87 },
    { name: 'Shruti Patil', gender: 'Female', performance: 84, attendance: 94 },
    { name: 'Tushar Joshi', gender: 'Male', performance: 66, attendance: 83 },
    { name: 'Neha Shetty', gender: 'Female', performance: 79, attendance: 91 },
    { name: 'Gaurav Thakur', gender: 'Male', performance: 73, attendance: 88 },
    { name: 'Anjali Rao', gender: 'Female', performance: 88, attendance: 96 },
    { name: 'Vishal Hegde', gender: 'Male', performance: 62, attendance: 80 },
    { name: 'Bhavna Kulkarni', gender: 'Female', performance: 77, attendance: 92 },
  ],
  'Class 7-C': [
    { name: 'Ravi Prasad', gender: 'Male', performance: 68, attendance: 85 },
    { name: 'Snehal Pawar', gender: 'Female', performance: 82, attendance: 93 },
    { name: 'Kunal Bhatt', gender: 'Male', performance: 64, attendance: 81 },
    { name: 'Mira Chopra', gender: 'Female', performance: 75, attendance: 90 },
    { name: 'Ajay Nambiar', gender: 'Male', performance: 70, attendance: 86 },
    { name: 'Prerna Gokhale', gender: 'Female', performance: 86, attendance: 95 },
    { name: 'Tarun Sethi', gender: 'Male', performance: 59, attendance: 78 },
    { name: 'Lata Deshmukh', gender: 'Female', performance: 73, attendance: 89 },
  ],
};

const MOCK_ATTENDANCE_SUMMARY = [
  { class: 'Class 10-A', avgAttendance: 94, totalDays: 120, present: 113, absent: 7 },
  { class: 'Class 10-B', avgAttendance: 91, totalDays: 120, present: 109, absent: 11 },
  { class: 'Class 9-A', avgAttendance: 88, totalDays: 120, present: 106, absent: 14 },
  { class: 'Class 9-B', avgAttendance: 92, totalDays: 120, present: 110, absent: 10 },
  { class: 'Class 8-A', avgAttendance: 89, totalDays: 120, present: 107, absent: 13 },
  { class: 'Class 7-C', avgAttendance: 86, totalDays: 120, present: 103, absent: 17 },
];

const MOCK_CLASS_PERFORMANCE = [
  { class: 'Class 10-A', subject: 'Mathematics', avgScore: 82, highest: 98, lowest: 45, students: 31 },
  { class: 'Class 10-B', subject: 'Mathematics', avgScore: 78, highest: 95, lowest: 42, students: 30 },
  { class: 'Class 9-A', subject: 'Mathematics', avgScore: 76, highest: 92, lowest: 38, students: 29 },
  { class: 'Class 9-B', subject: 'Mathematics', avgScore: 74, highest: 90, lowest: 35, students: 28 },
  { class: 'Class 8-A', subject: 'Physics', avgScore: 71, highest: 88, lowest: 32, students: 26 },
  { class: 'Class 7-C', subject: 'Physics', avgScore: 68, highest: 85, lowest: 28, students: 24 },
];

type View = 'home' | 'students-select' | 'students-detail' | 'attendance-select' | 'attendance-detail' | 'class-select' | 'class-detail';

export default function TeacherReportsPage() {
  const [view, setView] = useState<View>('home');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  function scoreColor(val: number) {
    if (val >= 85) return 'text-green-600';
    if (val >= 70) return 'text-blue-600';
    if (val >= 55) return 'text-amber-600';
    return 'text-red-600';
  }

  function barWidth(val: number) {
    return `${Math.min(val, 100)}%`;
  }

  const selectedClassInfo = TEACHER_CLASSES.find((c) => c.name === selectedClass);
  const students = selectedClass ? CLASS_STUDENTS[selectedClass] || [] : [];
  const attendanceRow = selectedClass ? MOCK_ATTENDANCE_SUMMARY.find((r) => r.class === selectedClass) : null;
  const classRow = selectedClass ? MOCK_CLASS_PERFORMANCE.find((r) => r.class === selectedClass) : null;

  // ── Class selection cards (reusable) ──
  function renderClassCards(title: string, backView: View, detailView: View) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView(backView)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEACHER_CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => { setSelectedClass(cls.name); setView(detailView); }}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-[#824ef2]/30 transition-all flex items-center justify-between group"
            >
              <div>
                <h3 className="font-semibold text-slate-900">{cls.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{cls.subject} &bull; {cls.students} Students</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#824ef2] transition-colors" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  // ── Students detail ──
  if (view === 'students-select') {
    return renderClassCards('Select Class for Student Reports', 'home', 'students-detail');
  }

  if (view === 'students-detail' && selectedClass) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('students-select')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{selectedClass}</h1>
            <p className="text-sm text-slate-500">{selectedClassInfo?.subject} &bull; {selectedClassInfo?.students} students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
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
                {students.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">{String(idx + 1).padStart(3, '0')}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{s.name}</td>
                    <td className="py-3 px-5 text-slate-600">{s.gender}</td>
                    <td className="py-3 px-5"><span className={`font-semibold ${scoreColor(s.performance)}`}>{s.performance}%</span></td>
                    <td className="py-3 px-5"><span className={`font-semibold ${scoreColor(s.attendance)}`}>{s.attendance}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  // ── Attendance detail ──
  if (view === 'attendance-select') {
    return renderClassCards('Select Class for Attendance Reports', 'home', 'attendance-detail');
  }

  if (view === 'attendance-detail' && selectedClass && attendanceRow) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('attendance-select')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{selectedClass} &mdash; Attendance</h1>
            <p className="text-sm text-slate-500">{selectedClassInfo?.students} students</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Avg Attendance</p>
            <p className={`text-2xl font-bold ${scoreColor(attendanceRow.avgAttendance)}`}>{attendanceRow.avgAttendance}%</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Working Days</p>
            <p className="text-2xl font-bold text-slate-900">{attendanceRow.totalDays}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Present</p>
            <p className="text-2xl font-bold text-green-600">{attendanceRow.present}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-600">{attendanceRow.absent}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Roll No</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Attendance</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-48">Progress</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">{String(idx + 1).padStart(3, '0')}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{s.name}</td>
                    <td className="py-3 px-5"><span className={`font-semibold ${scoreColor(s.attendance)}`}>{s.attendance}%</span></td>
                    <td className="py-3 px-5">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${s.attendance >= 90 ? 'bg-green-500' : s.attendance >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: barWidth(s.attendance) }} />
                      </div>
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

  // ── Class report detail ──
  if (view === 'class-select') {
    return renderClassCards('Select Class for Class Report', 'home', 'class-detail');
  }

  if (view === 'class-detail' && selectedClass && classRow) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('class-select')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{selectedClass} &mdash; Class Report</h1>
            <p className="text-sm text-slate-500">{classRow.subject} &bull; {classRow.students} students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Class Average</p>
            <p className={`text-2xl font-bold ${scoreColor(classRow.avgScore)}`}>{classRow.avgScore}%</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Highest Score</p>
            <p className="text-2xl font-bold text-green-600">{classRow.highest}%</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Lowest Score</p>
            <p className="text-2xl font-bold text-red-600">{classRow.lowest}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Roll No</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Performance</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500 w-48">Progress</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">{String(idx + 1).padStart(3, '0')}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{s.name}</td>
                    <td className="py-3 px-5"><span className={`font-semibold ${scoreColor(s.performance)}`}>{s.performance}%</span></td>
                    <td className="py-3 px-5">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${s.performance >= 80 ? 'bg-green-500' : s.performance >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: barWidth(s.performance) }} />
                      </div>
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

  // ── Home: 3 report cards ──
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports Center</h1>
            <p className="text-sm text-slate-500">View comprehensive reports for students, attendance, and class performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export All
          </button>
        </div>
      </div>

      {/* 3 Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-[#824ef2]/10 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-[#824ef2]" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Students Report</h3>
          <p className="text-sm text-slate-500 mb-5">Detailed academic performance reports for individual students across exams.</p>
          <button
            onClick={() => setView('students-select')}
            className="text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] flex items-center gap-1.5 transition-colors"
          >
            View Reports <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Attendance Reports</h3>
          <p className="text-sm text-slate-500 mb-5">Monthly attendance tracking, absence records, and leave management.</p>
          <button
            onClick={() => setView('attendance-select')}
            className="text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] flex items-center gap-1.5 transition-colors"
          >
            View Reports <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Class Report</h3>
          <p className="text-sm text-slate-500 mb-5">Overall class performance analytics, average scores, and improvement trends.</p>
          <button
            onClick={() => setView('class-select')}
            className="text-sm font-medium text-[#824ef2] hover:text-[#6b3fd4] flex items-center gap-1.5 transition-colors"
          >
            View Reports <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
