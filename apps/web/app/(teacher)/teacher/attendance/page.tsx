'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities, setAttendance } from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attendance</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Mark student attendance for your classes</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium" htmlFor="att-date">
              Date
            </label>
            <input
              id="att-date"
              type="date"
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              value={today}
              onChange={(e) => setToday(e.target.value)}
            />
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium" htmlFor="att-class">
              Class
            </label>
            <select
              id="att-class"
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 p-4">
            <div className="text-sm font-medium text-green-800 dark:text-green-300">Present</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-200 mt-1">{presentCount}</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 p-4">
            <div className="text-sm font-medium text-red-800 dark:text-red-300">Absent</div>
            <div className="text-3xl font-bold text-red-900 dark:text-red-200 mt-1">{total - presentCount}</div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 p-4">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Attendance Rate</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-200 mt-1">{percent}%</div>
            <div className="mt-2 h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
              <div className="h-full bg-blue-600 dark:bg-blue-400 transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {students.length} {students.length === 1 ? 'student' : 'students'}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={total === 0}
              onClick={() => {
                const map = Object.fromEntries(students.map((s) => [s.id, true] as const));
                setLocal(map);
              }}
            >
              Mark All Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={total === 0}
              onClick={() => {
                const map = Object.fromEntries(students.map((s) => [s.id, false] as const));
                setLocal(map);
              }}
            >
              Clear All
            </Button>
            <Button size="sm" onClick={() => setConfirm(true)} disabled={total === 0}>
              Save Attendance
            </Button>
          </div>
        </div>

        {/* Student List */}
        {students.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300 text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No students found for this class.
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Roll No
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {students.map((s) => {
                    const present = Boolean(local[s.id]);
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors ${
                          present
                            ? 'bg-green-50/50 dark:bg-green-900/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{s.name}</td>
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        {/* <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{s?.rollNo || '-' }</td> */}
                        <td className="py-3 px-4 text-center">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={present}
                              onChange={() => setLocal((m) => ({ ...m, [s.id]: !present }))}
                            />
                            <span
                              className={`w-11 h-6 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 duration-200 ease-in-out ${
                                present ? '!bg-green-500' : ''
                              }`}
                            >
                              <span
                                className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ease-in-out ${
                                  present ? 'translate-x-5' : ''
                                }`}
                              />
                            </span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-96 shadow-lg animate-zoom-in">
            <div className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Confirm Attendance Submission?
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              This will save attendance for the selected class and date.
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Present: <span className="font-semibold text-green-600">{presentCount}</span> | Absent:{' '}
              <span className="font-semibold text-red-600">{total - presentCount}</span>
            </div>
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
          </div>
        </div>
      )}
    </div>
  );
}
