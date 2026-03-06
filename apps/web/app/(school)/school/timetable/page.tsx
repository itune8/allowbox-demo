'use client';

import { useState, useEffect, useMemo } from 'react';
import { classService, type Class } from '../../../../lib/services/class.service';
import { timetableService, type TimetableSlot, type CreateTimetableSlotDto, DayOfWeek } from '../../../../lib/services/timetable.service';
import { subjectService, type Subject } from '../../../../lib/services/subject.service';
import { userService } from '../../../../lib/services/user.service';
import { SchoolStatCard, FormModal, useToast } from '../../../../components/school';
import {
  Calendar,
  BookOpen,
  Users as UsersIcon,
  Clock,
  Plus,
  Download,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
};
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);
const DEFAULT_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '08:00', end: '08:45' },
  2: { start: '08:50', end: '09:35' },
  3: { start: '09:40', end: '10:25' },
  4: { start: '10:40', end: '11:25' },
  5: { start: '11:30', end: '12:15' },
  6: { start: '13:00', end: '13:45' },
  7: { start: '13:50', end: '14:35' },
  8: { start: '14:40', end: '15:25' },
};

const slotColors = [
  { bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', hover: 'hover:bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  { bg: 'bg-orange-50', border: 'border-orange-200', hover: 'hover:bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  { bg: 'bg-teal-50', border: 'border-teal-200', hover: 'hover:bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
];

interface TeacherUser {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

type View = 'classes' | 'timetable';

export default function TimetablePage() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);

  // Navigation
  const [view, setView] = useState<View>('classes');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSection, setSelectedSection] = useState('');

  // Timetable data
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<TimetableSlot | null>(null);

  // Add/Edit form
  const [formDay, setFormDay] = useState<DayOfWeek>('monday');
  const [formPeriod, setFormPeriod] = useState(1);
  const [formSubject, setFormSubject] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('08:45');
  const [saving, setSaving] = useState(false);

  // Subject color map
  const subjectColorMap = useMemo(() => {
    const activeSubjectIds = [...new Set(timetableSlots.filter(s => s.isActive).map(s => s.subjectId))];
    const map: Record<string, typeof slotColors[0]> = {};
    activeSubjectIds.forEach((id, i) => {
      map[id] = slotColors[i % slotColors.length]!;
    });
    return map;
  }, [timetableSlots]);

  // Stats
  const activeSlots = timetableSlots.filter(s => s.isActive);
  const uniqueSubjects = new Set(activeSlots.map(s => s.subjectId)).size;
  const uniqueTeachers = new Set(activeSlots.map(s => s.teacherId)).size;
  const daysWithSlots = new Set(activeSlots.map(s => s.day)).size;

  // Aggregated stats across all classes
  const [allSlots, setAllSlots] = useState<TimetableSlot[]>([]);
  const totalSlots = allSlots.filter(s => s.isActive).length;
  const totalSubjects = new Set(allSlots.filter(s => s.isActive).map(s => s.subjectId)).size;
  const totalTeachers = new Set(allSlots.filter(s => s.isActive).map(s => s.teacherId)).size;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [fetchedClasses, fetchedSubjects, fetchedUsers] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
        userService.getUsers(),
      ]);

      const activeClasses = fetchedClasses.filter(c => c.isActive);
      setClasses(activeClasses);
      setSubjects(fetchedSubjects);
      setTeachers(fetchedUsers.filter((u: TeacherUser) => u.role === 'teacher'));

      // Load all timetable slots for aggregate stats
      try {
        const all = await timetableService.getAllSlots();
        setAllSlots(all);
      } catch {
        // getAllSlots might fail, that's ok
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      showToast('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async (classId: string, section: string) => {
    setLoadingSlots(true);
    try {
      const slots = await timetableService.getSlotsByClass(classId, section);
      setTimetableSlots(slots);
    } catch (err) {
      console.error('Failed to fetch timetable:', err);
      setTimetableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleClassClick = (cls: Class) => {
    setSelectedClass(cls);
    const firstSection = cls.sections?.[0] || 'A';
    setSelectedSection(firstSection);
    setView('timetable');
    fetchTimetable(cls._id, firstSection);
  };

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    if (selectedClass) {
      fetchTimetable(selectedClass._id, section);
    }
  };

  const handleBackToClasses = () => {
    setView('classes');
    setSelectedClass(null);
    setTimetableSlots([]);
  };

  const getTimetableSlot = (day: DayOfWeek, period: number): TimetableSlot | undefined => {
    return timetableSlots.find(slot => slot.day === day && slot.period === period && slot.isActive);
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.name || 'Unknown';
  };

  const getTeacherName = (teacherId: string): string => {
    const teacher = teachers.find(t => (t._id || t.id) === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned';
  };

  // Open add modal for a specific cell
  const handleCellClick = (day: DayOfWeek, period: number) => {
    const existingSlot = getTimetableSlot(day, period);
    if (existingSlot) {
      // Edit existing slot
      setEditingSlot(existingSlot);
      setFormDay(existingSlot.day);
      setFormPeriod(existingSlot.period);
      setFormSubject(existingSlot.subjectId);
      setFormTeacher(existingSlot.teacherId);
      setFormRoom(existingSlot.roomNumber || '');
      setFormStartTime(existingSlot.startTime);
      setFormEndTime(existingSlot.endTime);
      setShowAddModal(true);
    } else {
      // Add new
      setEditingSlot(null);
      setFormDay(day);
      setFormPeriod(period);
      setFormSubject(subjects[0]?._id || '');
      setFormTeacher('');
      setFormRoom('');
      const times = DEFAULT_TIMES[period] || { start: '08:00', end: '08:45' };
      setFormStartTime(times.start);
      setFormEndTime(times.end);
      setShowAddModal(true);
    }
  };

  const handleSaveSlot = async () => {
    if (!selectedClass || !formSubject || !formTeacher) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Check for teacher conflicts
      const hasConflict = await timetableService.checkTeacherConflict(
        formTeacher,
        formDay,
        formPeriod,
        editingSlot?._id
      );

      if (hasConflict) {
        showToast('error', 'Teacher already has a class scheduled at this time');
        setSaving(false);
        return;
      }

      if (editingSlot) {
        await timetableService.updateSlot(editingSlot._id, {
          subjectId: formSubject,
          teacherId: formTeacher,
          day: formDay,
          period: formPeriod,
          startTime: formStartTime,
          endTime: formEndTime,
          roomNumber: formRoom || undefined,
        });
        showToast('success', 'Timetable slot updated');
      } else {
        const dto: CreateTimetableSlotDto = {
          classId: selectedClass._id,
          section: selectedSection,
          subjectId: formSubject,
          teacherId: formTeacher,
          day: formDay,
          period: formPeriod,
          startTime: formStartTime,
          endTime: formEndTime,
          roomNumber: formRoom || undefined,
        };
        await timetableService.createSlot(dto);
        showToast('success', 'Timetable slot added');
      }

      setShowAddModal(false);
      setEditingSlot(null);
      fetchTimetable(selectedClass._id, selectedSection);
    } catch (err) {
      console.error('Failed to save slot:', err);
      showToast('error', 'Failed to save timetable slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!showDeleteConfirm || !selectedClass) return;

    try {
      await timetableService.deleteSlot(showDeleteConfirm._id);
      showToast('success', 'Slot deleted');
      setShowDeleteConfirm(null);
      fetchTimetable(selectedClass._id, selectedSection);
    } catch (err) {
      console.error('Failed to delete slot:', err);
      showToast('error', 'Failed to delete slot');
    }
  };

  const downloadCSV = () => {
    if (!selectedClass) return;
    const rows: string[] = ['Day,Period,Start Time,End Time,Subject,Teacher,Room'];
    for (const slot of activeSlots) {
      rows.push(
        [
          DAY_LABELS[slot.day] || slot.day,
          `Period ${slot.period}`,
          slot.startTime,
          slot.endTime,
          getSubjectName(slot.subjectId),
          getTeacherName(slot.teacherId),
          slot.roomNumber || '',
        ]
          .map(v => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      );
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${selectedClass.name}-${selectedSection}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'CSV downloaded');
  };

  const classColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500'];

  // Count slots per class from allSlots
  const classSlotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allSlots.filter(s => s.isActive).forEach(s => {
      counts[s.classId] = (counts[s.classId] || 0) + 1;
    });
    return counts;
  }, [allSlots]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#824ef2] mx-auto" />
          <div className="text-slate-500">Loading timetable...</div>
        </div>
      </div>
    );
  }

  // ─── CLASS CARDS VIEW ─────────────────────────────────────────────
  if (view === 'classes') {
    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SchoolStatCard icon={<Calendar className="w-5 h-5" />} color="purple" label="Total Classes" value={classes.length} />
          <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="blue" label="Total Slots" value={totalSlots} />
          <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="green" label="Subjects" value={totalSubjects} />
          <SchoolStatCard icon={<UsersIcon className="w-5 h-5" />} color="amber" label="Teachers Assigned" value={totalTeachers} />
        </div>

        {/* Class Cards Grid */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Classes Found</h3>
            <p className="text-sm text-slate-600">Create classes first to manage timetables.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {classes.map((cls, idx) => {
              const color = classColors[idx % classColors.length];
              const slotCount = classSlotCounts[cls._id] || 0;
              const sectionCount = cls.sections?.length || 0;

              return (
                <button
                  key={cls._id}
                  onClick={() => handleClassClick(cls)}
                  className="bg-white rounded-xl border border-slate-200 hover:border-[#824ef2]/40 hover:shadow-md transition-all text-left group"
                >
                  <div className={`h-2 rounded-t-xl ${color}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#824ef2] transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{cls.name}</h3>
                    <p className="text-sm text-slate-500 mb-3">Grade {cls.grade}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-[#824ef2] rounded-full" />
                        {sectionCount} Section{sectionCount !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {slotCount} Slot{slotCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── TIMETABLE GRID VIEW ─────────────────────────────────────────
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToClasses}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-0.5">
              <button onClick={handleBackToClasses} className="hover:text-[#824ef2] transition-colors">
                Timetable
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-medium">{selectedClass?.name}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {selectedClass?.name} — Section {selectedSection}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Section selector */}
          {selectedClass && selectedClass.sections && selectedClass.sections.length > 1 && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {selectedClass.sections.map(section => (
                <button
                  key={section}
                  onClick={() => handleSectionChange(section)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    selectedSection === section
                      ? 'bg-[#824ef2] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => handleCellClick('monday', 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </button>

          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SchoolStatCard icon={<Clock className="w-5 h-5" />} color="purple" label="Total Slots" value={activeSlots.length} />
        <SchoolStatCard icon={<BookOpen className="w-5 h-5" />} color="green" label="Subjects" value={uniqueSubjects} />
        <SchoolStatCard icon={<UsersIcon className="w-5 h-5" />} color="blue" label="Teachers" value={uniqueTeachers} />
        <SchoolStatCard icon={<Calendar className="w-5 h-5" />} color="amber" label="Days Active" value={daysWithSlots} />
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loadingSlots ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#824ef2]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200 w-36">
                    Period
                  </th>
                  {DAYS.map(day => (
                    <th
                      key={day}
                      className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-slate-200 last:border-r-0 ${
                        day === todayName
                          ? 'text-[#824ef2] bg-[#824ef2]/5'
                          : 'text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {DAY_LABELS[day]}
                        {day === todayName && (
                          <span className="text-[10px] bg-[#824ef2] text-white px-1.5 py-0.5 rounded-full font-medium normal-case">
                            Today
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERIODS.map(period => {
                  const times = DEFAULT_TIMES[period];
                  return (
                    <tr key={period} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 border-r border-slate-200 bg-slate-50/80">
                        <div className="text-sm font-semibold text-slate-900">Period {period}</div>
                        {times && (
                          <div className="text-xs text-slate-500 mt-0.5">{times.start} - {times.end}</div>
                        )}
                      </td>
                      {DAYS.map(day => {
                        const slot = getTimetableSlot(day, period);
                        const colors = slot ? subjectColorMap[slot.subjectId] : null;

                        return (
                          <td
                            key={`${day}-${period}`}
                            className={`px-2 py-2 border-r border-slate-200 last:border-r-0 cursor-pointer transition-all ${
                              day === todayName ? 'bg-[#824ef2]/[0.02]' : ''
                            }`}
                            onClick={() => handleCellClick(day, period)}
                          >
                            {slot ? (
                              <div
                                className={`p-2.5 rounded-lg border ${colors?.bg || 'bg-slate-50'} ${colors?.border || 'border-slate-200'} ${colors?.hover || 'hover:bg-slate-100'} transition-colors group relative`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                      {getSubjectName(slot.subjectId)}
                                    </div>
                                    <div className="text-xs text-slate-600 mt-0.5 truncate">
                                      {getTeacherName(slot.teacherId)}
                                    </div>
                                    {slot.roomNumber && (
                                      <div className="text-xs text-slate-500 mt-0.5">
                                        Room {slot.roomNumber}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDeleteConfirm(slot);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-lg border border-dashed border-slate-200 hover:border-[#824ef2]/40 hover:bg-[#824ef2]/5 transition-all text-center min-h-[60px] flex items-center justify-center">
                                <span className="text-xs text-slate-400 group-hover:text-[#824ef2]">
                                  <Plus className="w-4 h-4 mx-auto mb-0.5 text-slate-300" />
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Empty state info */}
      {activeSlots.length === 0 && !loadingSlots && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Timetable Created Yet</h3>
          <p className="text-sm text-slate-600 mb-4">
            Click on any cell in the grid above or use the &quot;Add Slot&quot; button to start building the timetable for {selectedClass?.name} — Section {selectedSection}.
          </p>
        </div>
      )}

      {/* Subject Legend */}
      {activeSlots.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Subject Legend</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(subjectColorMap).map(([subjectId, colors]) => (
              <div key={subjectId} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                <span className="text-sm text-slate-700">{getSubjectName(subjectId)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ADD/EDIT SLOT MODAL ───────────────────────────────────── */}
      <FormModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingSlot(null); }}
        title={editingSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowAddModal(false); setEditingSlot(null); }}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSlot}
              disabled={saving || !formSubject || !formTeacher}
              className="px-5 py-2 text-sm font-medium text-white bg-[#824ef2] rounded-lg hover:bg-[#6b3fd4] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingSlot ? 'Update Slot' : 'Add Slot'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Day & Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Day</label>
              <select
                value={formDay}
                onChange={e => setFormDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] outline-none"
              >
                {DAYS.map(d => (
                  <option key={d} value={d}>{DAY_LABELS[d]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Period</label>
              <select
                value={formPeriod}
                onChange={e => {
                  const p = Number(e.target.value);
                  setFormPeriod(p);
                  const times = DEFAULT_TIMES[p];
                  if (times) {
                    setFormStartTime(times.start);
                    setFormEndTime(times.end);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] outline-none"
              >
                {PERIODS.map(p => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject *</label>
            <select
              value={formSubject}
              onChange={e => setFormSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] outline-none"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Teacher */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Teacher *</label>
            <select
              value={formTeacher}
              onChange={e => setFormTeacher(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] outline-none"
            >
              <option value="">Select Teacher</option>
              {teachers.map(t => (
                <option key={t._id || t.id} value={t._id || t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
              <input
                type="time"
                value={formStartTime}
                onChange={e => setFormStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
              <input
                type="time"
                value={formEndTime}
                onChange={e => setFormEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] outline-none"
              />
            </div>
          </div>

          {/* Room */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Room Number (Optional)</label>
            <input
              type="text"
              value={formRoom}
              onChange={e => setFormRoom(e.target.value)}
              placeholder="e.g. 201, Lab 3"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </FormModal>

      {/* ─── DELETE CONFIRMATION MODAL ────────────────────────────── */}
      <FormModal
        open={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Timetable Slot"
        size="sm"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSlot}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        }
      >
        {showDeleteConfirm && (
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm text-slate-700">
              Are you sure you want to delete the <strong>{getSubjectName(showDeleteConfirm.subjectId)}</strong> slot
              on <strong>{DAY_LABELS[showDeleteConfirm.day]}</strong>, Period {showDeleteConfirm.period}?
            </p>
          </div>
        )}
      </FormModal>
    </div>
  );
}
