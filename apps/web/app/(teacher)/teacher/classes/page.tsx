'use client';

import { useState, useEffect, useMemo } from 'react';
import { classService } from '../../../../lib/services/class.service';
import { SchoolStatCard, FormModal } from '../../../../components/school';
import {
  BookOpen,
  Users,
  ClipboardList,
  GraduationCap,
  Loader2,
  ChevronRight,
  ArrowLeft,
  X,
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

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Physics: 'bg-purple-100 text-purple-700',
  Chemistry: 'bg-green-100 text-green-700',
  English: 'bg-amber-100 text-amber-700',
};

export default function TeacherClassesPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'classes' | 'students'>('classes');
  const [selectedClass, setSelectedClass] = useState<MockClass | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [modalStudent, setModalStudent] = useState<MockStudent | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const totalStudents = useMemo(() => MOCK_CLASSES.reduce((sum, c) => sum + c.studentCount, 0), []);
  const uniqueSubjects = useMemo(() => new Set(MOCK_CLASSES.map((c) => c.subject)).size, []);
  const avgPerformance = 78;

  const students = selectedClass ? (MOCK_STUDENTS[selectedClass.id] || MOCK_STUDENTS['c1'] || []) : [];

  function perfColor(val: number) {
    if (val >= 90) return 'text-green-600';
    if (val >= 75) return 'text-blue-600';
    if (val >= 60) return 'text-amber-600';
    return 'text-red-600';
  }

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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
          <p className="text-sm text-slate-500">Classes and students you teach</p>
        </div>
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
        {(['classes', 'students'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'classes' ? 'My Classes' : 'Student Details'}
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      {tab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CLASSES.map((cls) => (
            <div
              key={cls.id}
              onClick={() => { setSelectedClass(cls); setTab('students'); }}
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

      {/* Students Table */}
      {tab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center gap-3">
            <button
              onClick={() => { setTab('classes'); setSelectedClass(null); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedClass ? `${selectedClass.name}-${selectedClass.section}` : 'Select a class'}
              </h2>
              {selectedClass && (
                <p className="text-sm text-slate-500">{selectedClass.subject} &bull; {selectedClass.studentCount} students</p>
              )}
            </div>
            {!selectedClass && (
              <select
                className="ml-auto border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
                onChange={(e) => {
                  const cls = MOCK_CLASSES.find((c) => c.id === e.target.value);
                  if (cls) setSelectedClass(cls);
                }}
              >
                <option value="">Select class...</option>
                {MOCK_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}-{c.section}</option>
                ))}
              </select>
            )}
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
                      Select a class to view students
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
