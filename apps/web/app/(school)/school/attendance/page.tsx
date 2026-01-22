'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { getCurrentSchoolId, getEntities, setAttendance } from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';
import { Users, CheckCircle, XCircle, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';

// Professional Banner Component
function Banner({
  type,
  title,
  message,
  onClose,
}: {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}) {
  const styles = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      text: 'text-emerald-800',
      Icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-800',
      Icon: AlertCircle,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-800',
      Icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-800',
      Icon: AlertCircle,
    },
  };

  const style = styles[type];
  const Icon = style.Icon;

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.icon} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${style.text}`}>{title}</h3>
          <p className={`text-sm ${style.text} mt-1 opacity-90`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Professional Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 ${iconBgColor} rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities, setEntities] = useState(() => getEntities(schoolId));
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [banner, setBanner] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
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
  const percent = total ? Math.round((presentCount / total) * 100) : 0;

  const handleSave = () => {
    setSaving(true);
    try {
      setAttendance(schoolId, today, selectedClass, local);
      setShowConfirmSheet(false);
      setBanner({
        type: 'success',
        title: 'Attendance Saved',
        message: `Successfully saved attendance for ${presentCount} present and ${total - presentCount} absent students.`,
      });
      // Auto-dismiss banner after 5 seconds
      setTimeout(() => setBanner(null), 5000);
    } catch (error) {
      setBanner({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save attendance. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            Attendance Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Mark and track student attendance for all classes</p>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <Banner
          type={banner.type}
          title={banner.title}
          message={banner.message}
          onClose={() => setBanner(null)}
        />
      )}

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
              className="border border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent hover:border-slate-400 transition-colors"
              value={today}
              onChange={(e) => setToday(e.target.value)}
            />
            <label className="text-sm text-slate-700 font-medium" htmlFor="att-class">
              Class
            </label>
            <select
              id="att-class"
              className="border border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent hover:border-slate-400 transition-colors"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Present"
            value={presentCount}
            icon={CheckCircle}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Absent"
            value={total - presentCount}
            icon={XCircle}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
          />
          <StatCard
            title="Attendance Rate"
            value={`${percent}%`}
            icon={TrendingUp}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 pb-4 border-b border-slate-200">
          <div className="text-sm text-slate-600">
            {students.length} {students.length === 1 ? 'student' : 'students'}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={total === 0}
              className="text-sm hover:bg-slate-50"
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
              className="text-sm hover:bg-slate-50"
              onClick={() => {
                const map = Object.fromEntries(students.map((s) => [s.id, false] as const));
                setLocal(map);
              }}
            >
              Clear<span className="hidden sm:inline"> All</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowConfirmSheet(true)}
              disabled={total === 0}
              className="text-sm bg-primary hover:bg-primary-dark"
            >
              Save Attendance
            </Button>
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
                        <td className="py-3 px-4 text-sm text-slate-900">{s.name}</td>
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

      {/* Confirm Sheet */}
      <SlideSheet
        isOpen={showConfirmSheet}
        onClose={() => setShowConfirmSheet(false)}
        title="Confirm Attendance Submission"
        subtitle="This will save attendance for the selected class and date."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmSheet(false)}
              disabled={saving}
              className="hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        }
      >
        <SheetSection>
          <div className="space-y-4">
            <SheetDetailRow
              label="Present"
              value={<span className="font-semibold text-emerald-600">{presentCount}</span>}
            />
            <SheetDetailRow
              label="Absent"
              value={<span className="font-semibold text-red-600">{total - presentCount}</span>}
            />
            <SheetDetailRow
              label="Total Students"
              value={<span className="font-semibold text-slate-900">{total}</span>}
            />
            <SheetDetailRow
              label="Attendance Rate"
              value={<span className="font-semibold text-blue-600">{percent}%</span>}
            />
          </div>
        </SheetSection>
      </SlideSheet>
    </div>
  );
}
