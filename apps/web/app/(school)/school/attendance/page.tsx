'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities, setAttendance } from '../../../../lib/data-store';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { SchoolStatCard, SchoolStatusBadge, FormModal, ConfirmModal, useToast, Pagination } from '../../../../components/school';

export default function AttendancePage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities, setEntities] = useState(() => getEntities(schoolId));
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const absentCount = total - presentCount;
  const lateCount = 0; // Placeholder - would come from data in production
  const percent = total ? Math.round((presentCount / total) * 100) : 0;

  const handleSave = () => {
    setSaving(true);
    try {
      setAttendance(schoolId, today, selectedClass, local);
      setShowConfirmModal(false);
      showToast('success', `Attendance saved: ${presentCount} present, ${absentCount} absent.`);
    } catch (error) {
      showToast('error', 'Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-slate-700 font-medium" htmlFor="att-date">
              Date
            </label>
            <input
              id="att-date"
              type="date"
              className="border border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none hover:border-slate-400 transition-colors"
              value={today}
              onChange={(e) => setToday(e.target.value)}
            />
            <label className="text-sm text-slate-700 font-medium" htmlFor="att-class">
              Class
            </label>
            <select
              id="att-class"
              className="border border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] focus:outline-none hover:border-slate-400 transition-colors"
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SchoolStatCard
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
            label="Present Today"
            value={presentCount}
          />
          <SchoolStatCard
            icon={<XCircle className="w-5 h-5" />}
            color="red"
            label="Absent"
            value={absentCount}
          />
          <SchoolStatCard
            icon={<Clock className="w-5 h-5" />}
            color="amber"
            label="Late"
            value={lateCount}
          />
          <SchoolStatCard
            icon={<BarChart3 className="w-5 h-5" />}
            color="blue"
            label="Attendance Rate"
            value={`${percent}%`}
            percentage={percent}
            progressBar
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 pb-4 border-b border-slate-200">
          <div className="text-sm text-slate-600">
            {students.length} {students.length === 1 ? 'student' : 'students'}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              disabled={total === 0}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => {
                const map = Object.fromEntries(students.map((s) => [s.id, true] as const));
                setLocal(map);
              }}
            >
              <span className="hidden sm:inline">Mark </span>All Present
            </button>
            <button
              disabled={total === 0}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => {
                const map = Object.fromEntries(students.map((s) => [s.id, false] as const));
                setLocal(map);
              }}
            >
              Clear<span className="hidden sm:inline"> All</span>
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={total === 0}
              className="px-4 py-1.5 text-sm font-medium text-white bg-[#824ef2] hover:bg-[#6b3fd4] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Attendance
            </button>
          </div>
        </div>

        {/* Student List */}
        {students.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-xl">
            <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="font-medium text-slate-900">No students found</p>
            <p className="text-sm text-slate-500 mt-1">No students are enrolled in this class.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 border-b border-slate-200">
                      Student Name
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 border-b border-slate-200">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((s) => {
                    const present = Boolean(local[s.id]);
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors ${
                          present
                            ? 'bg-emerald-50/50 hover:bg-emerald-50'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-900">{s.name}</span>
                            {present ? (
                              <SchoolStatusBadge value="present" />
                            ) : (
                              <SchoolStatusBadge value="absent" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={present}
                              onChange={() => setLocal((m) => ({ ...m, [s.id]: !present }))}
                            />
                            <span
                              className={`w-11 h-6 flex items-center bg-slate-300 rounded-full p-1 duration-200 ease-in-out transition-colors ${
                                present ? '!bg-emerald-500' : ''
                              }`}
                            >
                              <span
                                className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${
                                  present ? 'translate-x-5' : 'translate-x-0'
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
      <ConfirmModal
        open={showConfirmModal}
        title="Confirm Attendance Submission"
        message={`Save attendance for ${today}? Present: ${presentCount}, Absent: ${absentCount}, Total: ${total}, Rate: ${percent}%`}
        confirmLabel={saving ? 'Saving...' : 'Confirm'}
        confirmColor="purple"
        onConfirm={handleSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
