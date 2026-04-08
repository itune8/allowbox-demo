'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { SchoolStatCard } from '../../../components/school';
import {
  CheckCircle,
  FileText,
  GraduationCap,
  DollarSign,
  Clock,
  Calendar,
  CalendarDays,
  MessageSquare,
  ChevronDown,
  Loader2,
} from 'lucide-react';

// ── Mock data ──
const MOCK_CHILDREN = [
  { id: 'child1', name: 'Aarav Sharma', class: 'Class 10-A', photo: 'AS' },
  { id: 'child2', name: 'Priya Sharma', class: 'Class 7-B', photo: 'PS' },
];

const MOCK_SCHEDULE = [
  { id: '1', time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Mrs. Gupta', room: 'Room 201' },
  { id: '2', time: '08:50 - 09:35', subject: 'English', teacher: 'Mr. Singh', room: 'Room 203' },
  { id: '3', time: '10:00 - 10:45', subject: 'Science', teacher: 'Mrs. Patel', room: 'Lab 1' },
  { id: '4', time: '10:50 - 11:35', subject: 'Hindi', teacher: 'Mr. Verma', room: 'Room 205' },
  { id: '5', time: '12:15 - 13:00', subject: 'Social Studies', teacher: 'Mrs. Reddy', room: 'Room 108' },
  { id: '6', time: '13:05 - 13:50', subject: 'Computer Science', teacher: 'Mr. Kumar', room: 'Lab 2' },
];

const MOCK_HOMEWORK = [
  { id: 'hw1', subject: 'Mathematics', title: 'Quadratic Equations - Exercise 5.2', due: '2026-03-02', status: 'pending' },
  { id: 'hw2', subject: 'English', title: 'Essay: My Role Model', due: '2026-03-03', status: 'pending' },
  { id: 'hw3', subject: 'Science', title: 'Lab Report - Photosynthesis', due: '2026-03-04', status: 'submitted' },
];

const MOCK_ATTENDANCE_WEEK = [
  { day: 'Mon', date: 9, status: 'present' },
  { day: 'Tue', date: 10, status: 'present' },
  { day: 'Wed', date: 11, status: 'absent' },
  { day: 'Thu', date: 12, status: 'present' },
  { day: 'Fri', date: 13, status: 'late' },
  { day: 'Sat', date: 14, status: 'holiday' },
];

const MOCK_EVENTS = [
  { id: 'e1', title: 'Parent-Teacher Meeting', date: 'Mar 5, 2026', time: '2:00 PM' },
  { id: 'e2', title: 'Annual Sports Day', date: 'Mar 10, 2026', time: '9:00 AM' },
  { id: 'e3', title: 'Science Fair Exhibition', date: 'Mar 15, 2026', time: '10:00 AM' },
];

const statusDotColors: Record<string, string> = {
  present: 'bg-green-50 border border-green-200',
  absent: 'bg-red-50 border border-red-200',
  late: 'bg-amber-50 border border-amber-200',
  holiday: 'bg-slate-50 border border-slate-200',
};

const statusIconColors: Record<string, string> = {
  present: 'text-green-600',
  absent: 'text-red-600',
  late: 'text-amber-600',
  holiday: 'text-slate-400',
};

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]!.id);
  const [showChildDropdown, setShowChildDropdown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const currentChild = MOCK_CHILDREN.find((c) => c.id === selectedChild) || MOCK_CHILDREN[0]!;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome + Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.firstName || 'Parent'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s how your children are doing today</p>
        </div>
        {MOCK_CHILDREN.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowChildDropdown(!showChildDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-xs font-bold text-[#824ef2]">
                {currentChild.photo}
              </div>
              <span className="text-sm font-medium text-slate-700">{currentChild.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showChildDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                {MOCK_CHILDREN.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => { setSelectedChild(child.id); setShowChildDropdown(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedChild === child.id ? 'bg-[#824ef2]/5 text-[#824ef2]' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#824ef2]/10 flex items-center justify-center text-xs font-bold text-[#824ef2]">
                      {child.photo}
                    </div>
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

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SchoolStatCard icon={<CheckCircle className="w-5 h-5" />} color="green" label="Attendance Rate" value="94%" />
        <SchoolStatCard icon={<FileText className="w-5 h-5" />} color="orange" label="Pending Homework" value={2} />
        <SchoolStatCard icon={<GraduationCap className="w-5 h-5" />} color="purple" label="Average Grade" value="A-" />
        <SchoolStatCard icon={<DollarSign className="w-5 h-5" />} color="amber" label="Pending Fees" value="₹12,500" />
      </div>

      {/* Today's Schedule + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#824ef2]" />
              <h2 className="text-base font-semibold text-slate-900">Today&apos;s Schedule</h2>
            </div>
            <button onClick={() => router.push('/parent/timetable')} className="text-sm text-[#824ef2] hover:underline font-medium">View Full Timetable</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Time</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Subject</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Teacher</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Room</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCHEDULE.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-600">{s.time}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{s.subject}</td>
                    <td className="py-3 px-3 text-slate-700">{s.teacher}</td>
                    <td className="py-3 px-3 text-slate-500">{s.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Homework */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <h2 className="text-base font-semibold text-slate-900">Upcoming Homework</h2>
              </div>
              <button onClick={() => router.push('/parent/homework')} className="text-sm text-[#824ef2] hover:underline font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {MOCK_HOMEWORK.map((hw) => (
                <div key={hw.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${hw.status === 'submitted' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <FileText className={`w-4 h-4 ${hw.status === 'submitted' ? 'text-green-600' : 'text-orange-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{hw.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{hw.subject} &bull; Due: {new Date(hw.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${hw.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {hw.status === 'submitted' ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance This Week */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-base font-semibold text-slate-900">Attendance This Week</h2>
            </div>
            <div className="flex items-center justify-between">
              {MOCK_ATTENDANCE_WEEK.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">{d.day}</span>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${statusDotColors[d.status]}`}>
                    <span className={`text-sm font-semibold ${statusIconColors[d.status]}`}>{d.date}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'View Report Card', icon: <GraduationCap className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50', href: '/parent/exams' },
              { label: 'Pay Fees', icon: <DollarSign className="w-5 h-5 text-green-500" />, bg: 'bg-green-50', href: '/parent/fees' },
              { label: 'Message Teacher', icon: <MessageSquare className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50', href: '/parent/messages' },
            ].map((action) => (
              <button key={action.label} onClick={() => router.push(action.href)} className={`${action.bg} rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-all text-left`}>
                <div className="mb-2">{action.icon}</div>
                <p className="text-sm font-medium text-slate-700">{action.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#824ef2]" />
              <h2 className="text-base font-semibold text-slate-900">Upcoming Events</h2>
            </div>
            <button onClick={() => router.push('/parent/events')} className="text-sm text-[#824ef2] hover:underline font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {MOCK_EVENTS.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 w-12 h-14 rounded-xl bg-[#824ef2]/10 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-[#824ef2] leading-tight">{event.date.split(' ')[1]?.replace(',', '')}</span>
                  <span className="text-[10px] font-semibold uppercase text-[#824ef2]/70 leading-none">{event.date.split(' ')[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
