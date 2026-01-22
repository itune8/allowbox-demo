'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { classService, type Class } from '@/lib/services/class.service';
import { timetableService, type TimetableSlot, DayOfWeek } from '@/lib/services/timetable.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { userService, type User } from '@/lib/services/user.service';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'];

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
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{ day: DayOfWeek; period: number } | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [classId]);

  useEffect(() => {
    if (selectedSection) {
      fetchTimetable();
    }
  }, [selectedSection]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-gray-500">Loading timetable...</div>
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
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className="animate-fade-in">
          <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {classData.name} - Timetable
            </h1>
            <p className="text-sm text-gray-600">Grade {classData.grade}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {classData.sections?.map((section) => (
              <option key={section} value={section}>Section {section}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200 w-32">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {PERIODS.map((periodLabel, periodIndex) => (
                <tr key={periodLabel} className="hover:bg-gray-50/50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-200 bg-gray-50">
                    {periodLabel}
                  </td>
                  {DAYS.map((day) => {
                    const slot = getTimetableSlot(day, periodIndex + 1);
                    return (
                      <td
                        key={`${day}-${periodIndex}`}
                        className="px-3 py-4 text-sm border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-primary-50 transition-colors"
                        onClick={() => setEditingSlot({ day, period: periodIndex + 1 })}
                      >
                        {slot ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900">
                              {getSubjectName(slot.subjectId)}
                            </div>
                            <div className="text-xs text-gray-600">
                              {getTeacherName(slot.teacherId)}
                            </div>
                            {slot.roomNumber && (
                              <div className="text-xs text-gray-500">
                                Room: {slot.roomNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-xs">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Total Slots</div>
          <div className="text-2xl font-bold text-gray-900">
            {timetableSlots.filter(s => s.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Subjects</div>
          <div className="text-2xl font-bold text-gray-900">
            {new Set(timetableSlots.filter(s => s.isActive).map(s => s.subjectId)).size}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-600 mb-1">Teachers</div>
          <div className="text-2xl font-bold text-gray-900">
            {new Set(timetableSlots.filter(s => s.isActive).map(s => s.teacherId)).size}
          </div>
        </div>
      </div>

      {/* Info Box */}
      {timetableSlots.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Timetable Created Yet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Start building your timetable by clicking on any time slot above.
          </p>
          <p className="text-xs text-gray-500">
            Tip: Assign subjects and teachers to each period for section {selectedSection}
          </p>
        </div>
      )}

      {/* Note about timetable management */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-gray-900 mb-1">Coming Soon: Full Timetable Management</p>
            <p>The ability to add, edit, and delete timetable slots with teacher conflict detection will be available soon. For now, you can view the current timetable structure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
