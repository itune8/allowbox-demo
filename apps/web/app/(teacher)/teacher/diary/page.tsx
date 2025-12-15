'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  dailyDiaryService,
  DailyDiary,
  DiaryEntryType,
  AcknowledgementStatus,
} from '../../../../lib/services/daily-diary.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { userService } from '../../../../lib/services/user.service';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function TeacherDiaryPage() {
  const [diaries, setDiaries] = useState<DailyDiary[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DailyDiary | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    title: '',
    content: '',
    type: DiaryEntryType.DAILY_UPDATE,
    date: new Date().toISOString().split('T')[0] ?? '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadDiaries();
      loadStudents();
    }
  }, [selectedClassId]);

  async function loadClasses() {
    try {
      const classesData = await classService.getClasses();
      setClasses(classesData);
      if (classesData.length > 0 && !selectedClassId && classesData[0]) {
        setSelectedClassId(classesData[0]._id);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    if (!selectedClassId) return;
    try {
      const usersData = await userService.getStudents();
      setStudents(usersData as Student[]);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  }

  async function loadDiaries() {
    if (!selectedClassId) return;
    try {
      setLoading(true);
      const data = await dailyDiaryService.getClassStudentDiaries(selectedClassId);
      setDiaries(data);
    } catch (err) {
      setError('Failed to load diary entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const typeColors: Record<DiaryEntryType, string> = {
    [DiaryEntryType.DAILY_UPDATE]: 'bg-blue-100 text-blue-700',
    [DiaryEntryType.BEHAVIOR]: 'bg-purple-100 text-purple-700',
    [DiaryEntryType.ACHIEVEMENT]: 'bg-green-100 text-green-700',
    [DiaryEntryType.CONCERN]: 'bg-red-100 text-red-700',
    [DiaryEntryType.REMINDER]: 'bg-yellow-100 text-yellow-700',
    [DiaryEntryType.HEALTH]: 'bg-pink-100 text-pink-700',
    [DiaryEntryType.GENERAL]: 'bg-gray-100 text-gray-700',
  };

  const typeIcons: Record<DiaryEntryType, string> = {
    [DiaryEntryType.DAILY_UPDATE]: '📅',
    [DiaryEntryType.BEHAVIOR]: '🎭',
    [DiaryEntryType.ACHIEVEMENT]: '🏆',
    [DiaryEntryType.CONCERN]: '⚠️',
    [DiaryEntryType.REMINDER]: '🔔',
    [DiaryEntryType.HEALTH]: '💊',
    [DiaryEntryType.GENERAL]: '📝',
  };

  function resetForm() {
    setFormData({
      studentId: '',
      classId: selectedClassId,
      title: '',
      content: '',
      type: DiaryEntryType.DAILY_UPDATE,
      date: new Date().toISOString().split('T')[0] ?? '',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.studentId || !formData.classId || !formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await dailyDiaryService.createStudentDiary({
        studentId: formData.studentId,
        classId: formData.classId,
        date: formData.date,
        type: formData.type,
        title: formData.title,
        content: formData.content,
      });
      setShowAddModal(false);
      resetForm();
      await loadDiaries();
    } catch (err) {
      setError('Failed to create diary entry');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(diary: DailyDiary) {
    if (!confirm('Are you sure you want to delete this diary entry?')) return;
    try {
      await dailyDiaryService.deleteStudentDiary(diary._id);
      await loadDiaries();
      setSelectedDiary(null);
    } catch (err) {
      console.error('Failed to delete diary:', err);
      alert('Failed to delete diary entry');
    }
  }

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Stats
  const pendingAck = diaries.filter(
    (d) => d.acknowledgementStatus === AcknowledgementStatus.PENDING
  ).length;
  const acknowledged = diaries.filter(
    (d) => d.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED
  ).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Diary</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create diary entries for students
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          disabled={!selectedClassId}
          className="text-xs sm:text-sm"
        >
          + <span className="hidden sm:inline">New </span>Entry
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Class Selection */}
      <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Select Class:</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-900"
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name} ({cls.grade})
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {selectedClassId && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{diaries.length}</div>
            <div className="text-xs sm:text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700 p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendingAck}</div>
            <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700 p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">{acknowledged}</div>
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">Ack'd</div>
          </div>
        </div>
      )}

      {!selectedClassId ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">📓</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Select a Class</h3>
          <p className="text-gray-500">
            Choose a class from the dropdown to view and create diary entries.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : diaries.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">📓</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Diary Entries</h3>
          <p className="text-gray-500 mb-4">
            Create diary entries to communicate with parents about their children.
          </p>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>Create First Entry</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {diaries.map((diary) => (
            <div
              key={diary._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedDiary(diary)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{typeIcons[diary.type]}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {diary.title}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {diary.studentId?.firstName} {diary.studentId?.lastName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${typeColors[diary.type]}`}>
                        {diary.type.replace('_', ' ')}
                      </span>
                      {diary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                          Acknowledged
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {diary.content}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      {new Date(diary.date).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(diary)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Diary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                New Diary Entry
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} ({cls.grade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as DiaryEntryType })
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  >
                    {Object.values(DiaryEntryType).map((type) => (
                      <option key={type} value={type}>
                        {typeIcons[type]} {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  placeholder="e.g., Math Class Update"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  placeholder="Write your message to the parents..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Diary Modal */}
      {selectedDiary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeIcons[selectedDiary.type]}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedDiary.title}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {selectedDiary.studentId?.firstName} {selectedDiary.studentId?.lastName} •{' '}
                    {new Date(selectedDiary.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDiary(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedDiary.content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${typeColors[selectedDiary.type]}`}>
                  {selectedDiary.type.replace('_', ' ')}
                </span>
                {selectedDiary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED ? (
                  <div className="text-sm text-green-600">
                    Acknowledged on{' '}
                    {selectedDiary.acknowledgedAt &&
                      new Date(selectedDiary.acknowledgedAt).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-sm text-yellow-600">Awaiting parent acknowledgement</div>
                )}
              </div>

              {selectedDiary.parentComment && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="text-xs text-blue-600 mb-1">Parent Comment</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDiary.parentComment}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedDiary(null)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => { handleDelete(selectedDiary); }}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
