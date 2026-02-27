'use client';

import { useState, useEffect } from 'react';
import { SchoolStatCard } from '../../../../components/school';
import {
  Calendar,
  BookOpen,
  Clock,
  Coffee,
  ChevronDown,
  Loader2,
} from 'lucide-react';

// ── Mock data ──
const MOCK_CHILDREN = [
  { id: 'child1', name: 'Aarav Sharma', class: 'Class 10-A', photo: 'AS' },
  { id: 'child2', name: 'Priya Sharma', class: 'Class 7-B', photo: 'PS' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = ['08:00', '08:50', '09:40', '10:30', '11:20', '12:10', '13:00', '13:50'];

interface TimetableSlot {
  subject: string;
  teacher: string;
  room: string;
  color: string;
  isBreak?: boolean;
}

const MOCK_TIMETABLE: Record<string, Record<string, TimetableSlot>> = {
  Monday: {
    '08:00': { subject: 'Mathematics', teacher: 'Mrs. Gupta', room: 'R-201', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    '08:50': { subject: 'English', teacher: 'Mr. Singh', room: 'R-203', color: 'bg-green-100 text-green-700 border-green-200' },
    '09:40': { subject: 'Break', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '10:30': { subject: 'Science', teacher: 'Mrs. Patel', room: 'Lab 1', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    '11:20': { subject: 'Hindi', teacher: 'Mr. Verma', room: 'R-205', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    '12:10': { subject: 'Lunch', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '13:00': { subject: 'Social Studies', teacher: 'Mrs. Reddy', room: 'R-108', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    '13:50': { subject: 'Computer Science', teacher: 'Mr. Kumar', room: 'Lab 2', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  },
  Tuesday: {
    '08:00': { subject: 'Science', teacher: 'Mrs. Patel', room: 'Lab 1', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    '08:50': { subject: 'Mathematics', teacher: 'Mrs. Gupta', room: 'R-201', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    '09:40': { subject: 'Break', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '10:30': { subject: 'English', teacher: 'Mr. Singh', room: 'R-203', color: 'bg-green-100 text-green-700 border-green-200' },
    '11:20': { subject: 'Physical Ed.', teacher: 'Mr. Rao', room: 'Ground', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    '12:10': { subject: 'Lunch', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '13:00': { subject: 'Hindi', teacher: 'Mr. Verma', room: 'R-205', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    '13:50': { subject: 'Art', teacher: 'Mrs. Das', room: 'Art Room', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  },
  Wednesday: {
    '08:00': { subject: 'English', teacher: 'Mr. Singh', room: 'R-203', color: 'bg-green-100 text-green-700 border-green-200' },
    '08:50': { subject: 'Science', teacher: 'Mrs. Patel', room: 'Lab 1', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    '09:40': { subject: 'Break', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '10:30': { subject: 'Mathematics', teacher: 'Mrs. Gupta', room: 'R-201', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    '11:20': { subject: 'Computer Science', teacher: 'Mr. Kumar', room: 'Lab 2', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    '12:10': { subject: 'Lunch', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '13:00': { subject: 'Social Studies', teacher: 'Mrs. Reddy', room: 'R-108', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    '13:50': { subject: 'Music', teacher: 'Mr. Bhatt', room: 'Music Room', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  },
  Thursday: {
    '08:00': { subject: 'Hindi', teacher: 'Mr. Verma', room: 'R-205', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    '08:50': { subject: 'Mathematics', teacher: 'Mrs. Gupta', room: 'R-201', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    '09:40': { subject: 'Break', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '10:30': { subject: 'English', teacher: 'Mr. Singh', room: 'R-203', color: 'bg-green-100 text-green-700 border-green-200' },
    '11:20': { subject: 'Science', teacher: 'Mrs. Patel', room: 'Lab 1', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    '12:10': { subject: 'Lunch', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '13:00': { subject: 'Physical Ed.', teacher: 'Mr. Rao', room: 'Ground', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    '13:50': { subject: 'Computer Science', teacher: 'Mr. Kumar', room: 'Lab 2', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  },
  Friday: {
    '08:00': { subject: 'Mathematics', teacher: 'Mrs. Gupta', room: 'R-201', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    '08:50': { subject: 'Hindi', teacher: 'Mr. Verma', room: 'R-205', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    '09:40': { subject: 'Break', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '10:30': { subject: 'Science', teacher: 'Mrs. Patel', room: 'Lab 1', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    '11:20': { subject: 'English', teacher: 'Mr. Singh', room: 'R-203', color: 'bg-green-100 text-green-700 border-green-200' },
    '12:10': { subject: 'Lunch', teacher: '', room: '', color: 'bg-slate-50 text-slate-500 border-slate-200', isBreak: true },
    '13:00': { subject: 'Art', teacher: 'Mrs. Das', room: 'Art Room', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    '13:50': { subject: 'Social Studies', teacher: 'Mrs. Reddy', room: 'R-108', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  },
};

export default function ParentTimetablePage() {
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]!.id);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? DAYS[d - 1]! : 'Monday';
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const currentChild = MOCK_CHILDREN.find((c) => c.id === selectedChild) || MOCK_CHILDREN[0]!;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
        <p className="mt-4 text-slate-500">Loading timetable...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Timetable</h1>
            <p className="text-sm text-slate-500">View your child&apos;s class schedule</p>
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
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="blue" label="Total Periods" value={8} />
        <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="purple" label="Subjects" value={10} />
        <SchoolStatCard icon={<Calendar className="w-5 h-5" />} color="green" label="Classes Today" value={6} />
        <SchoolStatCard icon={<Coffee className="w-5 h-5" />} color="amber" label="Break Periods" value={2} />
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        {(['weekly', 'daily'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === v ? 'bg-[#824ef2] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {v === 'weekly' ? 'Weekly View' : 'Daily View'}
          </button>
        ))}
      </div>

      {/* Weekly View */}
      {view === 'weekly' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-medium text-slate-500 w-20">Time</th>
                {DAYS.map((d) => (
                  <th key={d} className="text-left py-3 px-3 font-medium text-slate-500">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((time) => (
                <tr key={time} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-2 px-4 text-xs text-slate-500 font-medium">{time}</td>
                  {DAYS.map((day) => {
                    const slot = MOCK_TIMETABLE[day]?.[time];
                    return (
                      <td key={day} className="py-2 px-2">
                        {slot && (
                          <div className={`rounded-lg px-2.5 py-2 border ${slot.color}`}>
                            <p className="font-medium text-xs">{slot.subject}</p>
                            {!slot.isBreak && (
                              <p className="text-[10px] opacity-75 mt-0.5">{slot.teacher} &bull; {slot.room}</p>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Daily View */}
      {view === 'daily' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d) => (
              <button key={d} onClick={() => setSelectedDay(d)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedDay === d ? 'bg-[#824ef2] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200">
            {TIMES.map((time, i) => {
              const slot = MOCK_TIMETABLE[selectedDay]?.[time];
              if (!slot) return null;
              return (
                <div key={time} className={`flex items-stretch ${i < TIMES.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="w-24 flex-shrink-0 p-4 flex flex-col justify-center border-r border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">{time}</span>
                    <span className="text-xs text-slate-400">50 min</span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className={`rounded-lg px-4 py-3 border ${slot.color}`}>
                      <p className="font-semibold text-sm">{slot.subject}</p>
                      {!slot.isBreak && (
                        <div className="flex items-center gap-4 mt-1.5 text-xs opacity-75">
                          <span>Teacher: {slot.teacher}</span>
                          <span>Room: {slot.room}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
