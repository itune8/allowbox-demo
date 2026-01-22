'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  BookMarked,
  Plus,
  X,
  Users,
  Calendar,
  Edit,
  Trash2,
  Megaphone,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
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

  // Sheet states
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [showBulkSheet, setShowBulkSheet] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Detail sheet
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
    [DiaryEntryType.DAILY_UPDATE]: 'bg-blue-50 text-blue-700 border-blue-200',
    [DiaryEntryType.BEHAVIOR]: 'bg-purple-50 text-purple-700 border-purple-200',
    [DiaryEntryType.ACHIEVEMENT]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [DiaryEntryType.CONCERN]: 'bg-red-50 text-red-700 border-red-200',
    [DiaryEntryType.REMINDER]: 'bg-amber-50 text-amber-700 border-amber-200',
    [DiaryEntryType.HEALTH]: 'bg-pink-50 text-pink-700 border-pink-200',
    [DiaryEntryType.GENERAL]: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const typeIconColors: Record<DiaryEntryType, string> = {
    [DiaryEntryType.DAILY_UPDATE]: 'bg-blue-100 text-blue-600',
    [DiaryEntryType.BEHAVIOR]: 'bg-purple-100 text-purple-600',
    [DiaryEntryType.ACHIEVEMENT]: 'bg-emerald-100 text-emerald-600',
    [DiaryEntryType.CONCERN]: 'bg-red-100 text-red-600',
    [DiaryEntryType.REMINDER]: 'bg-amber-100 text-amber-600',
    [DiaryEntryType.HEALTH]: 'bg-pink-100 text-pink-600',
    [DiaryEntryType.GENERAL]: 'bg-slate-100 text-slate-600',
  };

  const typeNames: Record<DiaryEntryType, string> = {
    [DiaryEntryType.DAILY_UPDATE]: 'Daily Update',
    [DiaryEntryType.BEHAVIOR]: 'Behavior',
    [DiaryEntryType.ACHIEVEMENT]: 'Achievement',
    [DiaryEntryType.CONCERN]: 'Concern',
    [DiaryEntryType.REMINDER]: 'Reminder',
    [DiaryEntryType.HEALTH]: 'Health',
    [DiaryEntryType.GENERAL]: 'General',
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
    setShowFormSheet(true);
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

      setShowFormSheet(false);
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

      setShowBulkSheet(false);
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
      setShowDetailsSheet(false);
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
        <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
            <BookMarked className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily Diary</h1>
            <p className="text-sm text-slate-600 mt-1">
              Send daily updates and communications to parents
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {activeTab === 'student' && selectedClassId && (
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setFormData(prev => ({ ...prev, classId: selectedClassId }));
                setShowBulkSheet(true);
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Bulk Entry
            </Button>
          )}
          <Button
            onClick={() => {
              resetForm();
              setFormData(prev => ({ ...prev, classId: selectedClassId }));
              setShowFormSheet(true);
            }}
            disabled={!selectedClassId}
            className="bg-primary hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'class' ? 'Class Announcement' : 'Student Entry'}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('class')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'class'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Class Announcements
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'student'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          Student Entries
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Select Class
          </h3>
          <div className="space-y-2">
            {classes.length === 0 ? (
              <p className="text-sm text-slate-500">No classes available</p>
            ) : (
              classes.map((cls) => (
                <button
                  key={cls._id}
                  onClick={() => setSelectedClassId(cls._id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    selectedClassId === cls._id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="font-medium">{cls.name} ({cls.grade})</span>
                  {selectedClassId === cls._id && (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>

          {activeTab === 'student' && (
            <>
              <h3 className="font-semibold text-slate-900 mb-4 mt-6 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                Filter by Type
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTypeFilter('')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedTypeFilter === ''
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  All Types
                </button>
                {Object.entries(typeNames).map(([type, name]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTypeFilter(type as DiaryEntryType)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                      selectedTypeFilter === type
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="font-medium">{name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              {activeTab === 'class' ? (
                <Megaphone className="w-5 h-5 text-blue-600" />
              ) : (
                <FileText className="w-5 h-5 text-blue-600" />
              )}
              {activeTab === 'class' ? 'Class Announcements' : 'Student Diary Entries'}
            </h3>
          </div>

          {!selectedClassId ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4">
                <BookMarked className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select a class to begin</h3>
              <p className="text-sm text-slate-600">
                {activeTab === 'class'
                  ? 'Class announcements are sent to all parents in a class.'
                  : 'Student entries are individual communications with parents.'}
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
            </div>
          ) : activeTab === 'class' ? (
            classDiaries.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No class announcements yet</h3>
                <p className="text-sm text-slate-600 mb-6">Create your first announcement to send to all parents</p>
                <Button
                  onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, classId: selectedClassId }));
                    setShowFormSheet(true);
                  }}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {classDiaries.map((diary) => (
                  <div
                    key={diary._id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all"
                    onClick={() => {
                      setSelectedDiary(diary);
                      setShowDetailsSheet(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">{diary.title}</h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0 ml-3">
                        <Clock className="w-3 h-3" />
                        {new Date(diary.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {diary.content}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        By {diary.createdBy.firstName} {diary.createdBy.lastName}
                      </span>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(diary)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(diary)}>
                          <Trash2 className="w-3 h-3 mr-1" />
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
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No student diary entries yet</h3>
                <p className="text-sm text-slate-600 mb-6">Create individual entries for student communications</p>
                <Button
                  onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, classId: selectedClassId }));
                    setShowFormSheet(true);
                  }}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {studentDiaries.map((diary) => (
                  <div
                    key={diary._id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all"
                    onClick={() => {
                      setSelectedDiary(diary);
                      setShowDetailsSheet(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${typeIconColors[diary.type]}`}>
                          {diary.type === DiaryEntryType.DAILY_UPDATE && <Calendar className="w-4 h-4" />}
                          {diary.type === DiaryEntryType.BEHAVIOR && <Users className="w-4 h-4" />}
                          {diary.type === DiaryEntryType.ACHIEVEMENT && <CheckCircle className="w-4 h-4" />}
                          {diary.type === DiaryEntryType.CONCERN && <AlertCircle className="w-4 h-4" />}
                          {diary.type === DiaryEntryType.REMINDER && <Clock className="w-4 h-4" />}
                          {diary.type === DiaryEntryType.HEALTH && <Plus className="w-4 h-4" />}
                          {diary.type === DiaryEntryType.GENERAL && <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{diary.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {diary.studentId.firstName} {diary.studentId.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${typeColors[diary.type]}`}>
                          {typeNames[diary.type]}
                        </span>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {new Date(diary.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {diary.content}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${
                        diary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {diary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {diary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED ? 'Acknowledged' : 'Pending'}
                      </span>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(diary)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(diary)}>
                          <Trash2 className="w-3 h-3 mr-1" />
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

      {/* Create/Edit Form Sheet */}
      <SlideSheet
        isOpen={showFormSheet}
        onClose={() => {
          setShowFormSheet(false);
          resetForm();
        }}
        title={editingDiary ? 'Edit Entry' : activeTab === 'class' ? 'New Class Announcement' : 'New Student Entry'}
        subtitle={activeTab === 'class' ? 'Send announcement to all parents in the class' : 'Create individual student diary entry'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowFormSheet(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              className="bg-primary hover:bg-primary-dark"
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingDiary ? 'Update' : 'Send to Parents'}</>
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <SheetSection title="Basic Information">
            <SheetField label="Class" required>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.grade})
                  </option>
                ))}
              </select>
            </SheetField>

            {activeTab === 'student' && (
              <>
                <SheetField label="Student" required>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </SheetField>

                <SheetField label="Entry Type" required>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DiaryEntryType })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    required
                  >
                    <option value="">Select Type</option>
                    {Object.entries(typeNames).map(([type, name]) => (
                      <option key={type} value={type}>
                        {name}
                      </option>
                    ))}
                  </select>
                </SheetField>
              </>
            )}

            <SheetField label="Date">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </SheetField>
          </SheetSection>

          <SheetSection title="Message Details">
            <SheetField label="Title" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Enter a clear, descriptive title"
                required
              />
            </SheetField>

            <SheetField label="Content" required>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                rows={4}
                placeholder="Write your message here..."
                required
              />
            </SheetField>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Bulk Entry Sheet */}
      <SlideSheet
        isOpen={showBulkSheet}
        onClose={() => {
          setShowBulkSheet(false);
          resetForm();
        }}
        title="Bulk Student Entry"
        subtitle="Send the same diary entry to multiple students"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowBulkSheet(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting || selectedStudents.length === 0}
              className="bg-primary hover:bg-primary-dark"
              onClick={handleBulkSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>{`Send to ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}</>
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleBulkSubmit} className="space-y-6">
          <SheetSection title="Basic Information">
            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Class" required>
                <select
                  value={formData.classId}
                  onChange={(e) => {
                    setFormData({ ...formData, classId: e.target.value });
                    setSelectedStudents([]);
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} ({cls.grade})
                    </option>
                  ))}
                </select>
              </SheetField>

              <SheetField label="Entry Type" required>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as DiaryEntryType })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  required
                >
                  <option value="">Select Type</option>
                  {Object.entries(typeNames).map(([type, name]) => (
                    <option key={type} value={type}>
                      {name}
                    </option>
                  ))}
                </select>
              </SheetField>
            </div>
          </SheetSection>

          <SheetSection title="Student Selection">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Select Students ({selectedStudents.length} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllStudents}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="border border-slate-300 rounded-lg max-h-40 overflow-y-auto bg-white">
                {students.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500 text-center">No students in selected class</p>
                ) : (
                  students.map((student) => (
                    <label
                      key={student._id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-900">
                        {student.firstName} {student.lastName}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </SheetSection>

          <SheetSection title="Message Details">
            <SheetField label="Title" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Enter a clear, descriptive title"
                required
              />
            </SheetField>

            <SheetField label="Content" required>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                rows={4}
                placeholder="Write your message here..."
                required
              />
            </SheetField>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Detail Sheet */}
      {selectedDiary && (
        <SlideSheet
          isOpen={showDetailsSheet}
          onClose={() => {
            setSelectedDiary(null);
            setShowDetailsSheet(false);
          }}
          title="Diary Entry Details"
          subtitle={'type' in selectedDiary ? `${typeNames[selectedDiary.type]} Entry` : 'Class Announcement'}
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDiary(null);
                  setShowDetailsSheet(false);
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleEdit(selectedDiary);
                  setSelectedDiary(null);
                  setShowDetailsSheet(false);
                }}
                className="bg-primary hover:bg-primary-dark"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {'type' in selectedDiary && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${typeIconColors[selectedDiary.type]}`}>
                  {selectedDiary.type === DiaryEntryType.DAILY_UPDATE && <Calendar className="w-4 h-4" />}
                  {selectedDiary.type === DiaryEntryType.BEHAVIOR && <Users className="w-4 h-4" />}
                  {selectedDiary.type === DiaryEntryType.ACHIEVEMENT && <CheckCircle className="w-4 h-4" />}
                  {selectedDiary.type === DiaryEntryType.CONCERN && <AlertCircle className="w-4 h-4" />}
                  {selectedDiary.type === DiaryEntryType.REMINDER && <Clock className="w-4 h-4" />}
                  {selectedDiary.type === DiaryEntryType.HEALTH && <Plus className="w-4 h-4" />}
                  {selectedDiary.type === DiaryEntryType.GENERAL && <FileText className="w-4 h-4" />}
                </div>
                <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${typeColors[selectedDiary.type]}`}>
                  {typeNames[selectedDiary.type]}
                </span>
              </div>
            )}

            <SheetSection title="Entry Information">
              <SheetDetailRow label="Title" value={selectedDiary.title} />
              <SheetDetailRow
                label="Date"
                value={new Date(selectedDiary.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              />
              {'studentId' in selectedDiary && (
                <SheetDetailRow
                  label="Student"
                  value={`${selectedDiary.studentId.firstName} ${selectedDiary.studentId.lastName}`}
                />
              )}
              <SheetDetailRow label="Class" value={selectedDiary.classId.name} />
            </SheetSection>

            <SheetSection title="Content">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {selectedDiary.content}
                </p>
              </div>
            </SheetSection>

            {'acknowledgementStatus' in selectedDiary && (
              <SheetSection title="Acknowledgement">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Status:</span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${
                      selectedDiary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {selectedDiary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {selectedDiary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED ? 'Acknowledged' : 'Pending'}
                    </span>
                  </div>
                  {selectedDiary.acknowledgedAt && (
                    <span className="text-xs text-slate-500">
                      on {new Date(selectedDiary.acknowledgedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </SheetSection>
            )}

            {'parentComment' in selectedDiary && selectedDiary.parentComment && (
              <SheetSection title="Parent Comment">
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {selectedDiary.parentComment}
                  </p>
                </div>
              </SheetSection>
            )}

            <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
              Created by {selectedDiary.createdBy.firstName} {selectedDiary.createdBy.lastName}
            </div>
          </div>
        </SlideSheet>
      )}
    </section>
  );
}
