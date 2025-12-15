'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  dailyDiaryService,
  DailyDiary,
  ClassDiary,
  DiaryEntryType,
  AcknowledgementStatus,
} from '../../../../lib/services/daily-diary.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { userService } from '../../../../lib/services/user.service';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
}

interface FormData {
  classId: string;
  studentId: string;
  type: DiaryEntryType | '';
  title: string;
  content: string;
  date: string;
}

const initialFormData: FormData = {
  classId: '',
  studentId: '',
  type: DiaryEntryType.DAILY_UPDATE,
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0] ?? '',
};

export default function SchoolDiaryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'class'>('class');

  // Data
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classDiaries, setClassDiaries] = useState<ClassDiary[]>([]);
  const [studentDiaries, setStudentDiaries] = useState<DailyDiary[]>([]);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<DiaryEntryType | ''>('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Detail modal
  const [selectedDiary, setSelectedDiary] = useState<DailyDiary | ClassDiary | null>(null);
  const [editingDiary, setEditingDiary] = useState<DailyDiary | ClassDiary | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadDiaries();
      loadStudents();
    }
  }, [selectedClassId, activeTab, selectedTypeFilter]);

  async function loadClasses() {
    try {
      const classesData = await classService.getClasses();
      setClasses(classesData);
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
      if (activeTab === 'class') {
        const data = await dailyDiaryService.getClassAnnouncements(selectedClassId);
        setClassDiaries(data);
      } else {
        const data = await dailyDiaryService.getClassStudentDiaries(selectedClassId);
        const filtered = selectedTypeFilter
          ? data.filter(d => d.type === selectedTypeFilter)
          : data;
        setStudentDiaries(filtered);
      }
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
      ...initialFormData,
      classId: selectedClassId,
    });
    setSelectedStudents([]);
    setEditingDiary(null);
  }

  function handleEdit(diary: DailyDiary | ClassDiary) {
    setEditingDiary(diary);
    setFormData({
      classId: diary.classId._id,
      studentId: 'studentId' in diary ? diary.studentId._id : '',
      type: 'type' in diary ? diary.type : DiaryEntryType.GENERAL,
      title: diary.title,
      content: diary.content,
      date: diary.date.split('T')[0] ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.classId) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === 'class') {
        if (editingDiary) {
          await dailyDiaryService.updateClassDiary(editingDiary._id, {
            title: formData.title,
            content: formData.content,
          });
        } else {
          await dailyDiaryService.createClassDiary({
            classId: formData.classId,
            date: formData.date,
            title: formData.title,
            content: formData.content,
          });
        }
      } else {
        if (!formData.studentId || !formData.type) {
          alert('Please select a student and entry type');
          setSubmitting(false);
          return;
        }
        if (editingDiary) {
          await dailyDiaryService.updateStudentDiary(editingDiary._id, {
            title: formData.title,
            content: formData.content,
            type: formData.type as DiaryEntryType,
          });
        } else {
          await dailyDiaryService.createStudentDiary({
            studentId: formData.studentId,
            classId: formData.classId,
            date: formData.date,
            type: formData.type as DiaryEntryType,
            title: formData.title,
            content: formData.content,
          });
        }
      }

      setShowForm(false);
      resetForm();
      await loadDiaries();
    } catch (err) {
      console.error('Failed to save diary entry:', err);
      alert('Failed to save diary entry');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.classId || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    setSubmitting(true);
    try {
      await dailyDiaryService.createBulkStudentDiary({
        classId: formData.classId,
        studentIds: selectedStudents,
        date: formData.date,
        type: formData.type as DiaryEntryType,
        title: formData.title,
        content: formData.content,
      });

      setShowBulkForm(false);
      resetForm();
      await loadDiaries();
    } catch (err) {
      console.error('Failed to create bulk entries:', err);
      alert('Failed to create bulk entries');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(diary: DailyDiary | ClassDiary) {
    if (!confirm('Are you sure you want to delete this diary entry?')) return;
    try {
      if ('studentId' in diary) {
        await dailyDiaryService.deleteStudentDiary(diary._id);
      } else {
        await dailyDiaryService.deleteClassDiary(diary._id);
      }
      await loadDiaries();
      setSelectedDiary(null);
    } catch (err) {
      console.error('Failed to delete diary:', err);
      alert('Failed to delete diary entry');
    }
  }

  function toggleStudentSelection(studentId: string) {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  }

  function selectAllStudents() {
    setSelectedStudents(students.map(s => s._id));
  }

  function deselectAllStudents() {
    setSelectedStudents([]);
  }

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Diary</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Send daily updates and communications to parents
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'student' && selectedClassId && (
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setFormData(prev => ({ ...prev, classId: selectedClassId }));
                setShowBulkForm(true);
              }}
            >
              Bulk Entry
            </Button>
          )}
          <Button
            onClick={() => {
              resetForm();
              setFormData(prev => ({ ...prev, classId: selectedClassId }));
              setShowForm(true);
            }}
            disabled={!selectedClassId}
          >
            {activeTab === 'class' ? '+ Class Announcement' : '+ Student Entry'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('class')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'class'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Class Announcements
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'student'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Student Entries
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Select Class</h3>
          <div className="space-y-2">
            {classes.length === 0 ? (
              <p className="text-sm text-gray-500">No classes available</p>
            ) : (
              classes.map((cls) => (
                <button
                  key={cls._id}
                  onClick={() => setSelectedClassId(cls._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                    selectedClassId === cls._id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>📚</span>
                  <span>{cls.name} ({cls.grade})</span>
                </button>
              ))
            )}
          </div>

          {activeTab === 'student' && (
            <>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">Filter by Type</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTypeFilter('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedTypeFilter === ''
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  All Types
                </button>
                {Object.entries(typeIcons).map(([type, icon]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTypeFilter(type as DiaryEntryType)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      selectedTypeFilter === type
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{type.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {activeTab === 'class' ? 'Class Announcements' : 'Student Diary Entries'}
            </h3>
          </div>

          {!selectedClassId ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">📓</div>
              <p>Select a class to view diary entries.</p>
              <p className="text-sm mt-2">
                {activeTab === 'class'
                  ? 'Class announcements are sent to all parents in a class.'
                  : 'Student entries are individual communications with parents.'}
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : activeTab === 'class' ? (
            classDiaries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📢</div>
                <p>No class announcements yet.</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, classId: selectedClassId }));
                    setShowForm(true);
                  }}
                >
                  + Create Announcement
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {classDiaries.map((diary) => (
                  <div
                    key={diary._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedDiary(diary)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{diary.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {diary.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(diary.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        By {diary.createdBy.firstName} {diary.createdBy.lastName}
                      </span>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(diary)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(diary)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            studentDiaries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📝</div>
                <p>No student diary entries yet.</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, classId: selectedClassId }));
                    setShowForm(true);
                  }}
                >
                  + Create Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {studentDiaries.map((diary) => (
                  <div
                    key={diary._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedDiary(diary)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span>{typeIcons[diary.type]}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{diary.title}</h4>
                          <p className="text-xs text-gray-500">
                            {diary.studentId.firstName} {diary.studentId.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-xs ${typeColors[diary.type]}`}>
                          {diary.type.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(diary.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {diary.content}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        diary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {diary.acknowledgementStatus}
                      </span>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(diary)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(diary)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingDiary ? 'Edit Entry' : activeTab === 'class' ? 'New Class Announcement' : 'New Student Entry'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class *
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
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

              {activeTab === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student *
                    </label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Entry Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as DiaryEntryType })}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                      required
                    >
                      <option value="">Select Type</option>
                      {Object.values(DiaryEntryType).map((type) => (
                        <option key={type} value={type}>
                          {typeIcons[type]} {type.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingDiary ? 'Update' : 'Send to Parents'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Entry Modal */}
      {showBulkForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Bulk Student Entry
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Send the same diary entry to multiple students
              </p>
            </div>
            <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      setFormData({ ...formData, classId: e.target.value });
                      setSelectedStudents([]);
                    }}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Entry Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DiaryEntryType })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="">Select Type</option>
                    {Object.values(DiaryEntryType).map((type) => (
                      <option key={type} value={type}>
                        {typeIcons[type]} {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Students * ({selectedStudents.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllStudents}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500">No students in selected class</p>
                  ) : (
                    students.map((student) => (
                      <label
                        key={student._id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => toggleStudentSelection(student._id)}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {student.firstName} {student.lastName}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBulkForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : `Send to ${selectedStudents.length} Students`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDiary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Diary Entry</h2>
              <button
                onClick={() => setSelectedDiary(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {'type' in selectedDiary && (
                <div className="flex items-center gap-2">
                  <span>{typeIcons[selectedDiary.type]}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${typeColors[selectedDiary.type]}`}>
                    {selectedDiary.type.replace('_', ' ')}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedDiary.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedDiary.date).toLocaleDateString()}
                </p>
              </div>
              {'studentId' in selectedDiary && (
                <div className="text-sm">
                  <span className="text-gray-500">Student:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {selectedDiary.studentId.firstName} {selectedDiary.studentId.lastName}
                  </span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-gray-500">Class:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">
                  {selectedDiary.classId.name}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedDiary.content}
                </p>
              </div>
              {'acknowledgementStatus' in selectedDiary && (
                <div className="text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                    selectedDiary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedDiary.acknowledgementStatus}
                  </span>
                  {selectedDiary.acknowledgedAt && (
                    <span className="ml-2 text-gray-500">
                      on {new Date(selectedDiary.acknowledgedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
              {'parentComment' in selectedDiary && selectedDiary.parentComment && (
                <div>
                  <span className="text-sm text-gray-500">Parent Comment:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    {selectedDiary.parentComment}
                  </p>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Created by {selectedDiary.createdBy.firstName} {selectedDiary.createdBy.lastName}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedDiary(null)}>
                  Close
                </Button>
                <Button onClick={() => { handleEdit(selectedDiary); setSelectedDiary(null); }}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
