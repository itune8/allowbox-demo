'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { classService, type Class } from '@/lib/services/class.service';
import { timetableService, type TimetableSlot, DayOfWeek } from '@/lib/services/timetable.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { userService, type User } from '@/lib/services/user.service';
import { SchoolStatCard, CustomSelect } from '../../../../../../components/school';
import { Calendar, BookOpen, Users as UsersIcon, Clock } from 'lucide-react';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'];

const slotColors = [
  'bg-blue-50 border-blue-200 hover:bg-blue-100',
  'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
  'bg-purple-50 border-purple-200 hover:bg-purple-100',
  'bg-amber-50 border-amber-200 hover:bg-amber-100',
  'bg-pink-50 border-pink-200 hover:bg-pink-100',
  'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
  'bg-orange-50 border-orange-200 hover:bg-orange-100',
  'bg-teal-50 border-teal-200 hover:bg-teal-100',
];

export default function ClassTimetablePage() {
  const router = useRouter();
  const params = useParams();
  const classId = params?.classId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [banner, setBanner] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<{ day: DayOfWeek; period: number } | null>(null);

  // Map subject IDs to colors for consistent coloring
  const [subjectColorMap, setSubjectColorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAllData();
  }, [classId]);

  useEffect(() => {
    if (selectedSection) {
      fetchTimetable();
    }
  }, [selectedSection]);

  useEffect(() => {
    // Build color map for subjects
    const activeSubjectIds = [...new Set(timetableSlots.filter(s => s.isActive).map(s => s.subjectId))];
    const colorMap: Record<string, string> = {};
    activeSubjectIds.forEach((id, i) => {
      colorMap[id] = slotColors[i % slotColors.length] ?? slotColors[0] ?? '';
    });
    setSubjectColorMap(colorMap);
  }, [timetableSlots]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [fetchedClass, allSubjects, allUsers] = await Promise.all([
        classService.getClassById(classId),
        subjectService.getSubjects(),
        userService.getUsers(),
      ]);

      setClassData(fetchedClass);
      setSubjects(allSubjects);

      const teachersList = allUsers.filter(u => u.role === 'teacher');
      setTeachers(teachersList);

      // Auto-select first section if available
      if (fetchedClass.sections && fetchedClass.sections.length > 0) {
        setSelectedSection(fetchedClass.sections[0] || '');
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load class and timetable data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedSection) return;

    try {
      const slots = await timetableService.getSlotsByClass(classId, selectedSection);
      setTimetableSlots(slots);
    } catch (err) {
      console.error('Failed to fetch timetable:', err);
    }
  };

  const getTimetableSlot = (day: DayOfWeek, period: number): TimetableSlot | undefined => {
    return timetableSlots.find(slot => slot.day === day && slot.period === period && slot.isActive);
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find(s => s._id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getTeacherName = (teacherId: string): string => {
    const teacher = teachers.find(t => t.id === teacherId || t._id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned';
  };

  const activeSlots = timetableSlots.filter(s => s.isActive);
  const uniqueSubjects = new Set(activeSlots.map(s => s.subjectId)).size;
  const uniqueTeachers = new Set(activeSlots.map(s => s.teacherId)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#824ef2] mx-auto"></div>
          <div className="text-slate-500">Loading timetable...</div>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-lg">
          {error || 'Class not found'}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className="animate-fade-in">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {banner}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {classData.name} - Timetable
            </h1>
            <p className="text-sm text-slate-600">Grade {classData.grade}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CustomSelect
            value={selectedSection}
            onChange={(value) => setSelectedSection(value)}
            options={classData.sections?.map((section) => ({
              value: section,
              label: `Section ${section}`,
            })) || []}
            size="sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SchoolStatCard
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
          label="Total Slots"
          value={activeSlots.length}
        />
        <SchoolStatCard
          icon={<BookOpen className="w-5 h-5" />}
          color="green"
          label="Subjects"
          value={uniqueSubjects}
        />
        <SchoolStatCard
          icon={<UsersIcon className="w-5 h-5" />}
          color="purple"
          label="Teachers"
          value={uniqueTeachers}
        />
        <SchoolStatCard
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          label="Periods/Day"
          value={PERIODS.length}
        />
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-r border-slate-200 w-32">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-r border-slate-200 last:border-r-0 capitalize"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {PERIODS.map((periodLabel, periodIndex) => (
                <tr key={periodLabel} className="hover:bg-slate-50/50">
                  <td className="px-4 py-4 text-sm font-medium text-slate-900 border-r border-slate-200 bg-slate-50">
                    {periodLabel}
                  </td>
                  {DAYS.map((day) => {
                    const slot = getTimetableSlot(day, periodIndex + 1);
                    const colorClass = slot ? (subjectColorMap[slot.subjectId] || 'bg-slate-50 border-slate-200') : '';
                    return (
                      <td
                        key={`${day}-${periodIndex}`}
                        className={`px-3 py-4 text-sm border-r border-slate-200 last:border-r-0 cursor-pointer transition-colors ${
                          slot ? `${colorClass} border` : 'hover:bg-purple-50'
                        }`}
                        onClick={() => setEditingSlot({ day, period: periodIndex + 1 })}
                      >
                        {slot ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900">
                              {getSubjectName(slot.subjectId)}
                            </div>
                            <div className="text-xs text-slate-600">
                              {getTeacherName(slot.teacherId)}
                            </div>
                            {slot.roomNumber && (
                              <div className="text-xs text-slate-500">
                                Room: {slot.roomNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-xs">
                            Click to add
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      {timetableSlots.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Timetable Created Yet
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Start building your timetable by clicking on any time slot above.
          </p>
          <p className="text-xs text-slate-500">
            Tip: Assign subjects and teachers to each period for section {selectedSection}
          </p>
        </div>
      )}

      {/* Note about timetable management */}
      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 text-[#824ef2]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-slate-900 mb-1">Coming Soon: Full Timetable Management</p>
            <p>The ability to add, edit, and delete timetable slots with teacher conflict detection will be available soon. For now, you can view the current timetable structure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
