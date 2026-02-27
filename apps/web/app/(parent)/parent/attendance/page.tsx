'use client';

import { useState, useEffect, useMemo } from 'react';
import { SchoolStatCard } from '../../../../components/school';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
} from 'lucide-react';

// ── Mock data ──
const MOCK_CHILDREN = [
  { id: 'child1', name: 'Aarav Sharma', class: 'Class 10-A', photo: 'AS' },
  { id: 'child2', name: 'Priya Sharma', class: 'Class 7-B', photo: 'PS' },
];

const MOCK_HISTORY = [
  { id: 'a1', date: '2026-02-27', day: 'Friday', checkIn: '07:55 AM', checkOut: '02:30 PM', status: 'present' as const },
  { id: 'a2', date: '2026-02-26', day: 'Thursday', checkIn: '08:10 AM', checkOut: '02:30 PM', status: 'late' as const },
  { id: 'a3', date: '2026-02-25', day: 'Wednesday', checkIn: '-', checkOut: '-', status: 'absent' as const },
  { id: 'a4', date: '2026-02-24', day: 'Tuesday', checkIn: '07:50 AM', checkOut: '02:30 PM', status: 'present' as const },
  { id: 'a5', date: '2026-02-23', day: 'Monday', checkIn: '07:48 AM', checkOut: '02:30 PM', status: 'present' as const },
  { id: 'a6', date: '2026-02-20', day: 'Friday', checkIn: '07:52 AM', checkOut: '02:30 PM', status: 'present' as const },
  { id: 'a7', date: '2026-02-19', day: 'Thursday', checkIn: '07:45 AM', checkOut: '02:30 PM', status: 'present' as const },
  { id: 'a8', date: '2026-02-18', day: 'Wednesday', checkIn: '08:05 AM', checkOut: '02:30 PM', status: 'late' as const },
  { id: 'a9', date: '2026-02-17', day: 'Tuesday', checkIn: '07:50 AM', checkOut: '02:30 PM', status: 'present' as const },
  { id: 'a10', date: '2026-02-16', day: 'Monday', checkIn: '-', checkOut: '-', status: 'absent' as const },
];

const statusBadge: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
};

// Generate calendar data
function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: { day: number; status: 'present' | 'absent' | 'late' | 'holiday' | null }[] = [];

  for (let i = 0; i < firstDay; i++) days.push({ day: 0, status: null });

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0) {
      days.push({ day: d, status: 'holiday' });
    } else {
      const rand = Math.random();
      days.push({ day: d, status: rand > 0.15 ? 'present' : rand > 0.08 ? 'late' : 'absent' });
    }
  }
  return days;
}

const calendarDotColors: Record<string, string> = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-amber-500',
  holiday: 'bg-slate-300',
};

export default function ParentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]!.id);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [tab, setTab] = useState<'history' | 'calendar'>('history');
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const currentChild = MOCK_CHILDREN.find((c) => c.id === selectedChild) || MOCK_CHILDREN[0]!;

  const stats = useMemo(() => {
    const present = MOCK_HISTORY.filter((h) => h.status === 'present').length;
    const absent = MOCK_HISTORY.filter((h) => h.status === 'absent').length;
    const late = MOCK_HISTORY.filter((h) => h.status === 'late').length;
    return { present, absent, late, total: MOCK_HISTORY.length };
  }, []);

  const calendarDays = useMemo(() => generateCalendarDays(calYear, calMonth), [calYear, calMonth]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
            <p className="text-sm text-slate-500">Track your child&apos;s attendance records</p>
          </div>
        </div>
        {MOCK_CHILDREN.length > 1 && (
          <div className="relative">
            <button onClick={() => setShowChildDropdown(!showChildDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-xs font-bold text-[#824ef2]">{currentChild.photo}</div>
              <span className="text-sm font-medium text-slate-700">{currentChild.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showChildDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                {MOCK_CHILDREN.map((child) => (
                  <button key={child.id} onClick={() => { setSelectedChild(child.id); setShowChildDropdown(false); }} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedChild === child.id ? 'bg-[#824ef2]/5 text-[#824ef2]' : 'text-slate-700'}`}>
                    <div className="w-7 h-7 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-xs font-bold text-[#824ef2]">{child.photo}</div>
                    <div className="text-left">
                      <p className="font-medium">{child.name}</p>
                      <p className="text-xs text-slate-400">{child.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Days Present" value={stats.present} />
        <SchoolStatCard icon={<XCircle className="w-5 h-5" />} color="red" label="Days Absent" value={stats.absent} />
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="amber" label="Late Arrivals" value={stats.late} />
        <SchoolStatCard icon={<Users className="w-5 h-5" />} color="blue" label="Total Days" value={stats.total} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['history', 'calendar'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-[#824ef2] text-[#824ef2]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t === 'history' ? 'History' : 'Calendar View'}
          </button>
        ))}
      </div>

      {/* History Tab */}
      {tab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Day</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Check In</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Check Out</th>
                  <th className="text-left py-3 px-5 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-slate-700">{h.day}</td>
                    <td className="py-3 px-5 text-slate-600">{h.checkIn}</td>
                    <td className="py-3 px-5 text-slate-600">{h.checkOut}</td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge[h.status]}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {tab === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h3 className="text-lg font-semibold text-slate-900">
              {new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((d, i) => (
              <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm ${d.day === 0 ? '' : 'hover:bg-slate-50'}`}>
                {d.day > 0 && (
                  <>
                    <span className="text-slate-700 font-medium">{d.day}</span>
                    {d.status && <div className={`w-2 h-2 rounded-full mt-1 ${calendarDotColors[d.status]}`} />}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-200">
            {[
              { label: 'Present', color: 'bg-green-500' },
              { label: 'Absent', color: 'bg-red-500' },
              { label: 'Late', color: 'bg-amber-500' },
              { label: 'Holiday', color: 'bg-slate-300' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${l.color}`} />
                <span className="text-xs text-slate-600">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
