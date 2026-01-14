'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES } from '@repo/config';
import { getCurrentSchoolId, getEntities, type ClassItem } from '../../../lib/data-store';
import { AnimatedStatCard, GlassCard, Icon3D, gradients } from '@/components/ui';
import {
  Users,
  Calendar,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  FileText,
  Clock,
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

  if (!isTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-3"
        >
          <div className="text-4xl mb-3">⛔</div>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
            You do not have permission to view this page.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          Dashboard Overview
          <Icon3D gradient={gradients.indigo} size="sm">
            <Users className="w-3.5 h-3.5" />
          </Icon3D>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Welcome back, {user?.firstName}!{' '}
          <span className="hidden sm:inline">Here's your teaching summary.</span>
        </p>
      </motion.div>

      {/* Key Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4"
      >
        <AnimatedStatCard
          title="My Students"
          value={studentsInSelectedClass.length}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Classes Today"
          value={scheduleToday.length}
          icon={<Calendar className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-50"
          delay={1}
        />
        <AnimatedStatCard
          title="Pending Homework"
          value={(entities.homework[selectedClass] || []).length}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
          delay={2}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-4 sm:p-6 bg-white/90" hover={false}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            Quick Actions
            <Icon3D gradient={gradients.blue} size="sm">
              <TrendingUp className="w-3.5 h-3.5" />
            </Icon3D>
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/teacher/homework')}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group touch-manipulation"
            >
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-indigo-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">Homework</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/teacher/attendance')}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group touch-manipulation"
            >
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-green-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">Attendance</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/teacher/timetable')}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group touch-manipulation"
            >
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-blue-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">Timetable</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/teacher/reports')}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group touch-manipulation"
            >
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-purple-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">Reports</span>
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Today's Schedule and Activity Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="lg:col-span-2">
          <GlassCard className="p-4 sm:p-6 bg-white/90" hover={false}>
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                Today's Schedule
                <Icon3D gradient={gradients.emerald} size="sm">
                  <Calendar className="w-3.5 h-3.5" />
                </Icon3D>
              </h3>
              <select
                className="border border-gray-300 bg-white text-gray-900 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-400 min-w-0 max-w-[140px] sm:max-w-none"
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
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50/60 rounded-xl py-8 sm:py-10 text-gray-500 text-sm flex flex-col items-center justify-center"
              >
                <div className="text-2xl sm:text-3xl mb-2">📭</div>
                No sessions today
              </motion.div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <AnimatePresence>
                  {scheduleToday.map((t, index) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30 active:bg-gray-50 transition-all gap-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{t.subject}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t.start} - {t.end}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/teacher/attendance')}
                        className="flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors touch-manipulation font-medium"
                      >
                        <span className="hidden sm:inline">Take </span>Attendance
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard className="p-4 sm:p-6 bg-white/90" hover={false}>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              Recent Activity
              <Icon3D gradient={gradients.amber} size="sm">
                <TrendingUp className="w-3.5 h-3.5" />
              </Icon3D>
            </h3>
            <div className="space-y-3">
              {[
                { id: 1, icon: CheckCircle2, text: 'Attendance marked for Grade 6', time: '2h ago', color: 'text-green-600' },
                { id: 2, icon: BookOpen, text: 'Homework created: Algebra Worksheet', time: '5h ago', color: 'text-blue-600' },
                { id: 3, icon: Calendar, text: 'Timetable synced for the week', time: '1d ago', color: 'text-purple-600' },
              ].map((i, index) => {
                const IconComponent = i.icon;
                return (
                  <motion.div
                    key={i.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 sm:gap-3"
                  >
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-50 grid place-items-center text-gray-600 flex-shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm text-gray-800 line-clamp-2">{i.text}</div>
                      <div className="text-xs text-gray-400">{i.time}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
