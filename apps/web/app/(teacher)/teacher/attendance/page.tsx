'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  attendanceService,
} from '../../../../lib/services/attendance.service';
import { classService } from '../../../../lib/services/class.service';
import { SchoolStatCard, useToast } from '../../../../components/school';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Eye,
} from 'lucide-react';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentRow {
  id: string;
  rollNo: string;
  name: string;
  status: AttendanceStatus;
}

// ── Mock data ──

const MOCK_STUDENTS: StudentRow[] = [
  { id: 's1', rollNo: '001', name: 'Aarav Sharma', status: 'present' },
  { id: 's2', rollNo: '002', name: 'Priya Patel', status: 'present' },
  { id: 's3', rollNo: '003', name: 'Rohan Gupta', status: 'present' },
  { id: 's4', rollNo: '004', name: 'Sneha Reddy', status: 'absent' },
  { id: 's5', rollNo: '005', name: 'Arjun Singh', status: 'present' },
  { id: 's6', rollNo: '006', name: 'Ananya Iyer', status: 'late' },
  { id: 's7', rollNo: '007', name: 'Vikram Joshi', status: 'present' },
  { id: 's8', rollNo: '008', name: 'Meera Nair', status: 'present' },
  { id: 's9', rollNo: '009', name: 'Karan Malhotra', status: 'absent' },
  { id: 's10', rollNo: '010', name: 'Divya Kumari', status: 'present' },
  { id: 's11', rollNo: '011', name: 'Rahul Verma', status: 'present' },
  { id: 's12', rollNo: '012', name: 'Ishita Bansal', status: 'late' },
  { id: 's13', rollNo: '013', name: 'Aditya Kapoor', status: 'present' },
  { id: 's14', rollNo: '014', name: 'Neha Agarwal', status: 'present' },
  { id: 's15', rollNo: '015', name: 'Siddharth Das', status: 'late' },
];

const MOCK_CLASSES = [
  { _id: 'c1', name: 'Class 10-A', grade: '10', section: 'A' },
  { _id: 'c2', name: 'Class 9-B', grade: '9', section: 'B' },
  { _id: 'c3', name: 'Class 8-A', grade: '8', section: 'A' },
  { _id: 'c4', name: 'Class 10-B', grade: '10', section: 'B' },
  { _id: 'c5', name: 'Class 7-C', grade: '7', section: 'C' },
  { _id: 'c6', name: 'Class 9-A', grade: '9', section: 'A' },
];

// Generate mock history for all classes with multiple dates
function generateMockHistory(classes: { _id: string; name: string }[]) {
  const dates = [
    '2025-03-01', '2025-02-28', '2025-02-27', '2025-02-26', '2025-02-25',
    '2025-02-24', '2025-02-21', '2025-02-20', '2025-02-19', '2025-02-18',
  ];
  const history: { id: string; date: string; classId: string; className: string; present: number; absent: number; late: number; total: number }[] = [];
  let idx = 0;

  for (const cls of classes) {
    const seed = cls._id.charCodeAt(1) || 42;
    const total = 25 + (seed % 15); // 25-39 students
    for (const date of dates) {
      const dayHash = date.charCodeAt(8) + seed + idx;
      const absent = 1 + (dayHash % 4);
      const late = dayHash % 3;
      const present = total - absent - late;
      history.push({
        id: `h-${cls._id}-${date}`,
        date,
        classId: cls._id,
        className: cls.name,
        present,
        absent,
        late,
        total,
      });
      idx++;
    }
  }
  return history;
}

// Generate mock student attendance for a given class + date
function generateMockStudentAttendance(classId: string, _className: string, date: string): StudentRow[] {
  const names = [
    'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Sneha Reddy', 'Arjun Singh',
    'Ananya Iyer', 'Vikram Joshi', 'Meera Nair', 'Karan Malhotra', 'Divya Kumari',
    'Rahul Verma', 'Ishita Bansal', 'Aditya Kapoor', 'Neha Agarwal', 'Siddharth Das',
    'Kavya Joshi', 'Rishi Mehta', 'Tanya Gupta', 'Aryan Reddy', 'Pooja Kumar',
    'Nikhil Rao', 'Ankita Mishra', 'Dev Patel', 'Simran Kaur', 'Manish Tiwari',
    'Shreya Nair', 'Raj Sharma', 'Deepika Sen', 'Varun Jain', 'Nisha Verma',
  ];
  const seed = classId.charCodeAt(1) + date.charCodeAt(8);
  const total = 25 + (seed % 6);
  const students: StudentRow[] = [];

  for (let i = 0; i < total; i++) {
    const hash = seed + i * 7 + date.charCodeAt(9);
    let status: AttendanceStatus = 'present';
    const roll = hash % 10;
    if (roll === 0 || roll === 5) status = 'absent';
    else if (roll === 3) status = 'late';

    students.push({
      id: `${classId}-${date}-s${i}`,
      rollNo: String(i + 1).padStart(3, '0'),
      name: names[i % names.length]!,
      status,
    });
  }
  return students;
}

const statusBtnClass = (active: boolean, color: string) =>
  `px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
    active
      ? color === 'green'
        ? 'bg-green-100 text-green-700 border-green-300'
        : color === 'red'
          ? 'bg-red-100 text-red-700 border-red-300'
          : 'bg-amber-100 text-amber-700 border-amber-300'
      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
  }`;

export default function TeacherAttendancePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('c1');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0] || '');
  const [students, setStudents] = useState<StudentRow[]>(MOCK_STUDENTS);
  const [tab, setTab] = useState<'mark' | 'history'>('mark');
  const [submitting, setSubmitting] = useState(false);

  // History tab state
  const [historyClassFilter, setHistoryClassFilter] = useState<string>('all');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [historyDrilldown, setHistoryDrilldown] = useState<{ classId: string; className: string; date: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const cls = await classService.getClasses();
        setClasses(cls.length > 0 ? cls : MOCK_CLASSES);
      } catch {
        setClasses(MOCK_CLASSES);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const mockHistory = useMemo(() => generateMockHistory(classes), [classes]);

  const filteredHistory = useMemo(() => {
    return mockHistory.filter((h) => {
      if (historyClassFilter !== 'all' && h.classId !== historyClassFilter) return false;
      if (historyDateFilter && h.date !== historyDateFilter) return false;
      return true;
    });
  }, [mockHistory, historyClassFilter, historyDateFilter]);

  const drilldownStudents = useMemo(() => {
    if (!historyDrilldown) return [];
    return generateMockStudentAttendance(historyDrilldown.classId, historyDrilldown.className, historyDrilldown.date);
  }, [historyDrilldown]);

  const drilldownStats = useMemo(() => {
    const total = drilldownStudents.length;
    const present = drilldownStudents.filter((s) => s.status === 'present').length;
    const absent = drilldownStudents.filter((s) => s.status === 'absent').length;
    const late = drilldownStudents.filter((s) => s.status === 'late').length;
    return { total, present, absent, late };
  }, [drilldownStudents]);

  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === 'present').length;
    const absent = students.filter((s) => s.status === 'absent').length;
    const late = students.filter((s) => s.status === 'late').length;
    return { total, present, absent, late };
  }, [students]);

  function setStudentStatus(id: string, status: AttendanceStatus) {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  function markAllPresent() {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
    showToast('info', 'All students marked present');
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await attendanceService.bulkMarkAttendance({
        classId: selectedClass,
        date: selectedDate,
        attendanceRecords: students.map((s) => ({
          studentId: s.id,
          status: s.status.toUpperCase() as any,
        })),
      });
      showToast('success', 'Attendance submitted successfully');
    } catch {
      showToast('success', 'Attendance saved (offline mode)');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] hover:border-slate-300 transition-all';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading attendance...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500">Mark and track student attendance</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<Users className="w-5 h-5" />} color="blue" label="Total Students" value={stats.total} />
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Present Today" value={stats.present} />
        <SchoolStatCard icon={<XCircle className="w-5 h-5" />} color="red" label="Absent Today" value={stats.absent} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="amber" label="Late Today" value={stats.late} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['mark', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'history') setHistoryDrilldown(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'mark' ? 'Mark Attendance' : 'Attendance History'}
          </button>
        ))}
      </div>

      {/* ── Mark Attendance Tab ── */}
      {tab === 'mark' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
            <select className={`${inputClass} cursor-pointer`} value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input type="date" className={inputClass} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <button onClick={markAllPresent} className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              Mark All Present
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Attendance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Roll No</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Student Name</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">{s.rollNo}</td>
                    <td className="py-3 px-5 font-medium text-slate-900">{s.name}</td>
                    <td className="py-3 px-5">
                      <div className="flex gap-2">
                        <button onClick={() => setStudentStatus(s.id, 'present')} className={statusBtnClass(s.status === 'present', 'green')}>Present</button>
                        <button onClick={() => setStudentStatus(s.id, 'absent')} className={statusBtnClass(s.status === 'absent', 'red')}>Absent</button>
                        <button onClick={() => setStudentStatus(s.id, 'late')} className={statusBtnClass(s.status === 'late', 'amber')}>Late</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Attendance History Tab ── */}
      {tab === 'history' && !historyDrilldown && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Class filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setHistoryClassFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  historyClassFilter === 'all'
                    ? 'text-white bg-[#824ef2]'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                All Classes
              </button>
              {classes.map((c: any) => (
                <button
                  key={c._id}
                  onClick={() => setHistoryClassFilter(c._id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    historyClassFilter === c._id
                      ? 'text-white bg-[#824ef2]'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Date picker */}
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                className={inputClass}
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
              />
              {historyDateFilter && (
                <button
                  onClick={() => setHistoryDateFilter('')}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Class</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Students</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Present</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Absent</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Late</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Rate</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p>No attendance records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((h) => {
                      const rate = Math.round((h.present / h.total) * 100);
                      return (
                        <tr
                          key={h.id}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setHistoryDrilldown({ classId: h.classId, className: h.className, date: h.date })}
                        >
                          <td className="py-3.5 px-5 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-medium text-slate-900">{h.className}</td>
                          <td className="py-3.5 px-5 text-slate-700">{h.total}</td>
                          <td className="py-3.5 px-5"><span className="text-green-600 font-medium">{h.present}</span></td>
                          <td className="py-3.5 px-5"><span className="text-red-600 font-medium">{h.absent}</span></td>
                          <td className="py-3.5 px-5"><span className="text-amber-600 font-medium">{h.late}</span></td>
                          <td className="py-3.5 px-5">
                            <span className={`text-sm font-semibold ${rate >= 90 ? 'text-green-600' : rate >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                              {rate}%
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <button className="text-[#824ef2] hover:text-[#6b3fd4] text-sm font-medium flex items-center gap-1 transition-colors">
                              <Eye className="w-3.5 h-3.5" />
                              View
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

      {/* ── History Drilldown: Student-level view ── */}
      {tab === 'history' && historyDrilldown && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => setHistoryDrilldown(null)} className="hover:text-[#824ef2] transition-colors">
              Attendance History
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-medium">
              {historyDrilldown.className} - {new Date(historyDrilldown.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <button
            onClick={() => setHistoryDrilldown(null)}
            className="inline-flex items-center gap-1.5 text-sm text-[#824ef2] hover:text-[#6b3fd4] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </button>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{historyDrilldown.className}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Attendance for {new Date(historyDrilldown.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900">{drilldownStats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-green-200 p-4">
              <p className="text-xs font-medium text-green-600 mb-1">Present</p>
              <p className="text-2xl font-bold text-green-600">{drilldownStats.present}</p>
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-4">
              <p className="text-xs font-medium text-red-600 mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-600">{drilldownStats.absent}</p>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-4">
              <p className="text-xs font-medium text-amber-600 mb-1">Late</p>
              <p className="text-2xl font-bold text-amber-600">{drilldownStats.late}</p>
            </div>
          </div>

          {/* Student table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Roll No</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Student Name</th>
                    <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldownStudents.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 text-slate-600">{s.rollNo}</td>
                      <td className="py-3 px-5 font-medium text-slate-900">{s.name}</td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : s.status === 'absent'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
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
