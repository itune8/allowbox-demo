'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { ROLES } from '@repo/config';
import { getCurrentSchoolId, getEntities, type ClassItem } from '../../../lib/data-store';
import { StatCard } from '@/components/dashboard/stat-card';

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

  if (!isTeacher) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.firstName}! <span className="hidden sm:inline">Here's your teaching summary.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          title="My Students"
          value={studentsInSelectedClass.length}
          icon={
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
          iconBgColor="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard
          title="Classes Today"
          value={scheduleToday.length}
          icon={
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
            </svg>
          }
          iconBgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          title="Pending Homework"
          value={(entities.homework[selectedClass] || []).length}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          }
          iconBgColor="bg-blue-50 dark:bg-blue-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/teacher/homework')}
            className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95 transition-all group touch-manipulation"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1 sm:mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">Homework</span>
          </button>

          <button
            onClick={() => router.push('/teacher/attendance')}
            className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 active:scale-95 transition-all group touch-manipulation"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 mb-1 sm:mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">Attendance</span>
          </button>

          <button
            onClick={() => router.push('/teacher/timetable')}
            className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 transition-all group touch-manipulation"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1 sm:mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">Timetable</span>
          </button>

          <button
            onClick={() => router.push('/teacher/reports')}
            className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 active:scale-95 transition-all group touch-manipulation"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 mb-1 sm:mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">Reports</span>
          </button>
        </div>
      </div>

      {/* Today's Schedule and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Schedule</h3>
            <select
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-gray-400 min-w-0 max-w-[140px] sm:max-w-none"
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
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl py-8 sm:py-10 text-gray-500 text-sm flex flex-col items-center justify-center">
              <div className="text-2xl sm:text-3xl mb-2">📭</div>
              No sessions today
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {scheduleToday.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md active:bg-gray-50 dark:active:bg-gray-800 transition-all gap-3"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{t.subject}</div>
                      <div className="text-xs text-gray-500">
                        {t.start} - {t.end}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3" onClick={() => router.push('/teacher/attendance')}>
                    <span className="hidden sm:inline">Take </span>Attendance
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { id: 1, icon: '✓', text: 'Attendance marked for Grade 6', time: '2h ago' },
              { id: 2, icon: '✎', text: 'Homework created: Algebra Worksheet', time: '5h ago' },
              { id: 3, icon: '📅', text: 'Timetable synced for the week', time: '1d ago' },
            ].map((i) => (
              <div key={i.id} className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 grid place-items-center text-gray-600 flex-shrink-0 text-sm">
                  {i.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{i.text}</div>
                  <div className="text-xs text-gray-400">{i.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
