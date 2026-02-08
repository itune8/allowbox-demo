'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { ROLES } from '@repo/config';
import { getCurrentSchoolId, getEntities } from '../../../lib/data-store';
import { MinimalCard, StatCard, ActionCard } from '@repo/ui/cards';
import { Badge } from '@repo/ui/data-display';
import {
  Users,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  ClipboardCheck,
  Send,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities, setEntities] = useState(() => getEntities(schoolId));
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const isTeacher = (user?.roles || []).includes(ROLES.TEACHER);

  // Determine classes assigned to this teacher
  const teacherEmail = user?.email || '';
  const assignedClassIds = useMemo(
    () => entities.teacherAssignments?.[teacherEmail] || [],
    [entities.teacherAssignments, teacherEmail]
  );

  const classesForTeacher = useMemo(() => {
    const all = entities.classes || [];
    if (!assignedClassIds || assignedClassIds.length === 0) return all;
    return all.filter((c) => assignedClassIds.includes(c.id));
  }, [entities.classes, assignedClassIds]);

  const [selectedClass, setSelectedClass] = useState(() => classesForTeacher[0]?.id || '');

  useEffect(() => {
    if (!selectedClass && classesForTeacher[0]) {
      setSelectedClass(classesForTeacher[0].id);
    }
  }, [classesForTeacher, selectedClass]);

  const scheduleToday = useMemo(() => {
    const day = new Date(today).toLocaleDateString(undefined, { weekday: 'long' });
    const map = entities.timetable[selectedClass] || [];
    return map.filter((t) => t.day === day);
  }, [entities, selectedClass, today]);

  const studentsInSelectedClass = useMemo(
    () =>
      entities.students.filter(
        (s) => s.className === (entities.classes.find((c) => c.id === selectedClass)?.name || '')
      ),
    [entities, selectedClass]
  );

  // Mock data for demo
  const stats = {
    totalStudents: studentsInSelectedClass.length || 156,
    classesScheduled: scheduleToday.length || 5,
    tasksDue: (entities.homework[selectedClass] || []).length || 12,
    parentMessages: 5,
  };

  const pendingTasks = [
    { id: 1, task: 'Grade Math Quiz - Grade 6B', due: 'Due Today', urgent: true },
    { id: 2, task: 'Submit Lesson Plans for Week 3', due: 'Due Tomorrow', urgent: false },
    { id: 3, task: 'Review Science Project Proposals', due: 'Due in 2 days', urgent: false },
  ];

  const recentMessages = [
    {
      id: 1,
      from: 'Emily Johnson (Parent)',
      message: 'Regarding Emma\'s recent performance in Math class',
      time: '2h ago',
      unread: true
    },
    {
      id: 2,
      from: 'Michael Chen (Parent)',
      message: 'Request for parent-teacher meeting next week',
      time: '5h ago',
      unread: true
    },
    {
      id: 3,
      from: 'Sarah Williams (Coordinator)',
      message: 'Updated guidelines for the upcoming science fair',
      time: '1d ago',
      unread: false
    },
  ];

  if (!isTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="text-4xl mb-3">⛔</div>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
            You do not have permission to view this page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.firstName || 'Teacher'}!
        </h1>
        <p className="text-slate-600 mt-1">Here's what's happening in your classes today</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Across All Classes"
          icon={<Users className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="Classes Scheduled"
          value={stats.classesScheduled}
          subtitle="Today"
          icon={<Calendar className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Tasks Due"
          value={stats.tasksDue}
          subtitle="This Week"
          icon={<FileText className="w-5 h-5 text-orange-600" />}
          iconBgColor="bg-orange-100"
        />
        <StatCard
          title="Parent Messages"
          value={stats.parentMessages}
          subtitle="Unread"
          icon={<MessageSquare className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <MinimalCard padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Today's Schedule</h3>
              <select
                className="border border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classesForTeacher.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {scheduleToday.length === 0 ? (
              <div className="bg-slate-50 rounded-xl py-10 text-slate-500 text-sm flex flex-col items-center justify-center">
                <Calendar className="w-12 h-12 text-slate-300 mb-2" />
                <p>No classes scheduled today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduleToday.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-semibold text-slate-900">{session.subject}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.start} - {session.end}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/teacher/attendance')}
                      className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Mark Attendance
                    </button>
                  </div>
                ))}
              </div>
            )}
          </MinimalCard>

          {/* Quick Actions */}
          <MinimalCard padding="md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ActionCard
                icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
                title="Mark Attendance"
                onClick={() => router.push('/teacher/attendance')}
                iconBgColor="bg-purple-100"
              />
              <ActionCard
                icon={<FileText className="w-6 h-6 text-blue-600" />}
                title="Create Assignment"
                onClick={() => router.push('/teacher/homework')}
                iconBgColor="bg-blue-100"
              />
              <ActionCard
                icon={<Award className="w-6 h-6 text-green-600" />}
                title="Grade Submissions"
                onClick={() => router.push('/teacher/grades')}
                iconBgColor="bg-green-100"
              />
              <ActionCard
                icon={<Send className="w-6 h-6 text-orange-600" />}
                title="Message Parents"
                onClick={() => router.push('/teacher/messages')}
                iconBgColor="bg-orange-100"
              />
            </div>
          </MinimalCard>

          {/* Recent Messages */}
          <MinimalCard padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recent Messages</h3>
              <button
                onClick={() => router.push('/teacher/messages')}
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    msg.unread
                      ? 'border-purple-200 bg-purple-50 hover:bg-purple-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => router.push('/teacher/messages')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${msg.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                          {msg.from}
                        </p>
                        <p className="text-sm text-slate-600 truncate">{msg.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{msg.time}</span>
                      {msg.unread && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MinimalCard>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <MinimalCard padding="md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pending Tasks</h3>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{task.task}</p>
                    <p className={`text-xs mt-1 ${task.urgent ? 'text-red-600' : 'text-slate-500'}`}>
                      {task.due}
                    </p>
                  </div>
                  {task.urgent && (
                    <Badge variant="error" size="sm">Urgent</Badge>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
              + Add Task
            </button>
          </MinimalCard>

          {/* Class Performance Summary */}
          <MinimalCard padding="md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Class Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Grade 6B - Math</span>
                  <span className="text-sm font-semibold text-green-600">87%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Grade 5A - Science</span>
                  <span className="text-sm font-semibold text-blue-600">92%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Grade 7C - Physics</span>
                  <span className="text-sm font-semibold text-orange-600">78%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </MinimalCard>
        </div>
      </div>
    </div>
  );
}
