'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities, setAttendance } from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, SlideSheet } from '@/components/ui';
import { Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities, setEntities] = useState(() => getEntities(schoolId));
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
  const [confirm, setConfirm] = useState(false);

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

  const students = entities.students.filter(
    (s) => s.className === (entities.classes.find((c) => c.id === selectedClass)?.name || '')
  );

  const attendanceForDay = entities.attendance[today]?.[selectedClass] || {};
  const [local, setLocal] = useState<Record<string, boolean>>(() => ({ ...attendanceForDay }));

  useEffect(() => {
    setLocal({ ...(entities.attendance[today]?.[selectedClass] || {}) });
  }, [entities.attendance, today, selectedClass]);

  const presentCount = Object.values(local).filter(Boolean).length;
  const total = students.length;
  const percent = total ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            Attendance
            <Icon3D bgColor="bg-blue-500" size="sm">
              <Users className="w-3.5 h-3.5" />
            </Icon3D>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Mark student attendance for your classes</p>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-4 sm:p-6 bg-white/95" hover={false}>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <label className="text-xs sm:text-sm text-gray-700 font-medium" htmlFor="att-date">
              Date
            </label>
            <input
              id="att-date"
              type="date"
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-400"
              value={today}
              onChange={(e) => setToday(e.target.value)}
            />
            <label className="text-xs sm:text-sm text-gray-700 font-medium" htmlFor="att-class">
              Class
            </label>
            <select
              id="att-class"
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm max-w-[100px] sm:max-w-none"
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
        </div>

        {/* Analytics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          <AnimatedStatCard
            title="Present"
            value={presentCount}
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
            iconBgColor="bg-green-50"
            delay={0}
          />
          <AnimatedStatCard
            title="Absent"
            value={total - presentCount}
            icon={<XCircle className="w-5 h-5 text-red-600" />}
            iconBgColor="bg-red-50"
            delay={1}
          />
          <AnimatedStatCard
            title="Attendance Rate"
            value={`${percent}%`}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            iconBgColor="bg-blue-50"
            delay={2}
          />
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-600">
            {students.length} {students.length === 1 ? 'student' : 'students'}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={total === 0}
              className="text-xs sm:text-sm"
              onClick={() => {
                const map = Object.fromEntries(students.map((s) => [s.id, true] as const));
                setLocal(map);
              }}
            >
              <span className="hidden sm:inline">Mark </span>All Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={total === 0}
              className="text-xs sm:text-sm"
              onClick={() => {
                const map = Object.fromEntries(students.map((s) => [s.id, false] as const));
                setLocal(map);
              }}
            >
              Clear<span className="hidden sm:inline"> All</span>
            </Button>
            <Button size="sm" onClick={() => setConfirm(true)} disabled={total === 0} className="text-xs sm:text-sm">
              Save
            </Button>
          </div>
        </div>

        {/* Student List */}
        {students.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-gray-600 text-center py-12 bg-blue-50/40 border border-blue-100 rounded-xl"
          >
            <Users className="w-12 h-12 mx-auto text-blue-300 mb-3" />
            <p className="font-medium text-gray-900">No students found</p>
            <p className="text-gray-500">for this class.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full">
                <thead className="bg-blue-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Student Name
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {students.map((s, index) => {
                      const present = Boolean(local[s.id]);
                      return (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className={`transition-colors ${
                            present
                              ? 'bg-green-50/70'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">{s.name}</td>
                          <td className="py-3 px-4 text-center">
                            <label className="inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={present}
                                onChange={() => setLocal((m) => ({ ...m, [s.id]: !present }))}
                              />
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-11 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-200 ease-in-out ${
                                  present ? '!bg-green-500' : ''
                                }`}
                              >
                                <motion.span
                                  animate={{ x: present ? 20 : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="bg-white w-4 h-4 rounded-full shadow"
                                />
                              </motion.span>
                            </label>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        </GlassCard>
      </motion.div>

      {/* Confirm Modal */}
      <SlideSheet
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        title="Confirm Attendance Submission?"
        subtitle="This will save attendance for the selected class and date."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAttendance(schoolId, today, selectedClass, local);
                setConfirm(false);
              }}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <div className="text-sm text-gray-700 py-2">
          Present: <span className="font-semibold text-green-600">{presentCount}</span> | Absent:{' '}
          <span className="font-semibold text-red-600">{total - presentCount}</span>
        </div>
      </SlideSheet>
    </div>
  );
}
