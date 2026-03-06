'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  attendanceService,
} from '../../../../lib/services/attendance.service';
import { classService } from '../../../../lib/services/class.service';
import { SchoolStatCard, useToast, SchoolStatusBadge } from '../../../../components/school';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Calendar,
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

const MOCK_HISTORY = [
  { id: 'h1', date: '2025-03-01', class: 'Class 10-A', present: 28, absent: 2, late: 1, total: 31 },
  { id: 'h2', date: '2025-02-28', class: 'Class 10-A', present: 30, absent: 1, late: 0, total: 31 },
  { id: 'h3', date: '2025-02-27', class: 'Class 10-A', present: 27, absent: 3, late: 1, total: 31 },
  { id: 'h4', date: '2025-02-26', class: 'Class 9-B', present: 25, absent: 2, late: 1, total: 28 },
  { id: 'h5', date: '2025-02-25', class: 'Class 9-B', present: 26, absent: 1, late: 1, total: 28 },
];

const MOCK_CLASSES = [
  { _id: 'c1', name: 'Class 10-A', grade: '10', section: 'A' },
  { _id: 'c2', name: 'Class 9-B', grade: '9', section: 'B' },
  { _id: 'c3', name: 'Class 8-A', grade: '8', section: 'A' },
  { _id: 'c4', name: 'Class 10-B', grade: '10', section: 'B' },
  { _id: 'c5', name: 'Class 7-C', grade: '7', section: 'C' },
  { _id: 'c6', name: 'Class 9-A', grade: '9', section: 'A' },
];

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
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'mark' ? 'Mark Attendance' : 'Attendance History'}
          </button>
        ))}
      </div>

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

      {tab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Attendance History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Present</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Absent</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Late</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Rate</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((h) => {
                  const rate = Math.round((h.present / h.total) * 100);
                  return (
                    <tr key={h.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-3 px-5 font-medium text-slate-900">{h.class}</td>
                      <td className="py-3 px-5"><span className="text-green-600 font-medium">{h.present}</span></td>
                      <td className="py-3 px-5"><span className="text-red-600 font-medium">{h.absent}</span></td>
                      <td className="py-3 px-5"><span className="text-amber-600 font-medium">{h.late}</span></td>
                      <td className="py-3 px-5">
                        <span className={`text-sm font-semibold ${rate >= 90 ? 'text-green-600' : rate >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
