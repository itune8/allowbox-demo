'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { SchoolStatCard } from '../../../components/school';
import {
  Users,
  BookOpen,
  CheckCircle,
  FileText,
  Clock,
  Calendar,
  MessageSquare,
  GraduationCap,
  Zap,
  CalendarDays,
  Loader2,
} from 'lucide-react';

// ── Mock data ──
const MOCK_SCHEDULE = [
  { id: '1', time: '08:00 - 08:45', class: 'Class 10-A', subject: 'Mathematics', room: 'Room 201' },
  { id: '2', time: '08:50 - 09:35', class: 'Class 9-B', subject: 'Mathematics', room: 'Room 203' },
  { id: '3', time: '10:00 - 10:45', class: 'Class 8-A', subject: 'Physics', room: 'Lab 1' },
  { id: '4', time: '10:50 - 11:35', class: 'Class 10-B', subject: 'Mathematics', room: 'Room 205' },
  { id: '5', time: '12:15 - 13:00', class: 'Class 7-C', subject: 'Physics', room: 'Room 108' },
  { id: '6', time: '13:05 - 13:50', class: 'Class 9-A', subject: 'Mathematics', room: 'Room 201' },
];

const MOCK_ACTIVITY = [
  { id: '1', action: 'Graded homework for Class 10-A Mathematics', time: '30 minutes ago', icon: 'grade' },
  { id: '2', action: 'Marked attendance for Class 9-B', time: '1 hour ago', icon: 'attendance' },
  { id: '3', action: 'Created new assignment: "Quadratic Equations Practice"', time: '2 hours ago', icon: 'homework' },
  { id: '4', action: 'Sent message to Class 8-A parents', time: '3 hours ago', icon: 'message' },
  { id: '5', action: 'Updated lesson plan for Physics — Chapter 5', time: 'Yesterday', icon: 'lesson' },
];

const MOCK_EVENTS = [
  { id: '1', title: 'Parent-Teacher Meeting', date: 'Mar 5, 2025', time: '2:00 PM' },
  { id: '2', title: 'Science Fair Judging', date: 'Mar 8, 2025', time: '10:00 AM' },
  { id: '3', title: 'Staff Meeting — Curriculum Review', date: 'Mar 12, 2025', time: '3:30 PM' },
  { id: '4', title: 'Mid-Term Exam Week Begins', date: 'Mar 18, 2025', time: '8:00 AM' },
];

const activityIcons: Record<string, React.ReactNode> = {
  grade: <GraduationCap className="w-4 h-4 text-purple-600" />,
  attendance: <CheckCircle className="w-4 h-4 text-green-600" />,
  homework: <FileText className="w-4 h-4 text-blue-600" />,
  message: <MessageSquare className="w-4 h-4 text-amber-600" />,
  lesson: <BookOpen className="w-4 h-4 text-teal-600" />,
};

const activityBgs: Record<string, string> = {
  grade: 'bg-purple-100',
  attendance: 'bg-green-100',
  homework: 'bg-blue-100',
  message: 'bg-amber-100',
  lesson: 'bg-teal-100',
};

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate brief load
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#824ef2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName || 'Teacher'}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here&apos;s what&apos;s happening in your classes today</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SchoolStatCard
          icon={<Users className="w-5 h-5" />}
          color="blue"
          label="My Students"
          value={142}
        />
        <SchoolStatCard
          icon={<BookOpen className="w-5 h-5" />}
          color="purple"
          label="Active Classes"
          value={6}
        />
        <SchoolStatCard
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          label="Attendance Today"
          value="94%"
        />
        <SchoolStatCard
          icon={<FileText className="w-5 h-5" />}
          color="orange"
          label="Pending Tasks"
          value={8}
        />
      </div>

      {/* Today's Schedule + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#824ef2]" />
              <h2 className="text-base font-semibold text-slate-900">Today&apos;s Schedule</h2>
            </div>
            <button
              onClick={() => router.push('/teacher/timetable')}
              className="text-sm text-[#824ef2] hover:underline font-medium"
            >
              View Full Schedule
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Time</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Class</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Subject</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Room</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SCHEDULE.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{s.time}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{s.class}</td>
                    <td className="py-3 px-3 text-slate-700">{s.subject}</td>
                    <td className="py-3 px-3 text-slate-500">{s.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {MOCK_ACTIVITY.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${activityBgs[a.icon] || 'bg-slate-100'}`}>
                  {activityIcons[a.icon] || <FileText className="w-4 h-4 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{a.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Homework Due', value: 5, color: 'text-blue-600', bg: 'bg-blue-50', icon: <FileText className="w-5 h-5 text-blue-500" /> },
              { label: 'Upcoming Exams', value: 3, color: 'text-purple-600', bg: 'bg-purple-50', icon: <GraduationCap className="w-5 h-5 text-purple-500" /> },
              { label: 'Unread Messages', value: 7, color: 'text-amber-600', bg: 'bg-amber-50', icon: <MessageSquare className="w-5 h-5 text-amber-500" /> },
              { label: 'Leave Balance', value: '12 days', color: 'text-green-600', bg: 'bg-green-50', icon: <Calendar className="w-5 h-5 text-green-500" /> },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-slate-100`}>
                <div className="flex items-center gap-2 mb-2">
                  {stat.icon}
                  <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#824ef2]" />
              <h2 className="text-base font-semibold text-slate-900">Upcoming Events</h2>
            </div>
            <button
              onClick={() => router.push('/teacher/events')}
              className="text-sm text-[#824ef2] hover:underline font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {MOCK_EVENTS.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 w-12 h-14 rounded-xl bg-[#824ef2]/10 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-[#824ef2] leading-tight">
                    {event.date.split(' ')[1]?.replace(',', '')}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-[#824ef2]/70 leading-none">
                    {event.date.split(' ')[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
