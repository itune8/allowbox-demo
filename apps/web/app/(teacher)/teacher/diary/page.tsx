'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, SlideSheet } from '@/components/ui';
import {
  dailyDiaryService,
  DailyDiary,
  DiaryEntryType,
  AcknowledgementStatus,
} from '../../../../lib/services/daily-diary.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { userService } from '../../../../lib/services/user.service';
import { BookOpen, CheckCircle2, Clock, Trash2, Plus } from 'lucide-react';

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
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-gray-200 border-t-sky-600 rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading diary entries...</div>
        </div>
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              Daily Diary
              <Icon3D bgColor="bg-sky-500" size="sm">
                <BookOpen className="w-3.5 h-3.5" />
              </Icon3D>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Create diary entries for students to share with parents
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              disabled={!selectedClassId}
              className="text-xs sm:text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New </span>Entry
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-4 bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Class Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
          <label className="text-xs sm:text-sm font-medium text-gray-700">Select Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.grade})
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Stats */}
      {selectedClassId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-3 gap-2 sm:gap-4"
        >
          <AnimatedStatCard
            title="Total"
            value={diaries.length}
            icon={<BookOpen className="w-5 h-5 text-sky-600" />}
            iconBgColor="bg-sky-50"
            delay={0}
          />
          <AnimatedStatCard
            title="Pending"
            value={pendingAck}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBgColor="bg-amber-50"
            delay={1}
          />
          <AnimatedStatCard
            title="Acknowledged"
            value={acknowledged}
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
            iconBgColor="bg-green-50"
            delay={2}
          />
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {!selectedClassId ? (
          <GlassCard className="p-8 bg-white text-center">
            <div className="text-4xl mb-3">📓</div>
            <h3 className="font-semibold text-gray-900 mb-2">Select a Class</h3>
            <p className="text-gray-500">
              Choose a class from the dropdown to view and create diary entries.
            </p>
          </GlassCard>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-gray-200 border-t-sky-600 rounded-full mx-auto"
              />
              <div className="text-gray-500">Loading entries...</div>
            </div>
          </div>
        ) : diaries.length === 0 ? (
          <GlassCard className="p-8 bg-white text-center">
            <div className="text-4xl mb-3">📓</div>
            <h3 className="font-semibold text-gray-900 mb-2">No Diary Entries</h3>
            <p className="text-gray-500 mb-4">
              Create diary entries to communicate with parents about their children.
            </p>
            <Button onClick={() => { resetForm(); setShowAddModal(true); }}>Create First Entry</Button>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {diaries.map((diary, index) => (
                <motion.div
                  key={diary._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    className="p-4 bg-white cursor-pointer hover:border-sky-200"
                    onClick={() => setSelectedDiary(diary)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{typeIcons[diary.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {diary.title}
                            </h3>
                            <div className="text-sm text-gray-500 truncate">
                              {diary.studentId?.firstName} {diary.studentId?.lastName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${typeColors[diary.type]}`}
                            >
                              {diary.type.replace('_', ' ')}
                            </motion.span>
                            {diary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED ? (
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 whitespace-nowrap"
                              >
                                Ack'd
                              </motion.span>
                            ) : (
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="px-2 py-1 rounded text-xs bg-sky-100 text-sky-700 whitespace-nowrap"
                              >
                                Pending
                              </motion.span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {diary.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(diary.date).toLocaleDateString()}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(diary);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Add Diary Modal */}
      <SlideSheet
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Diary Entry"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="submit" disabled={submitting} form="diary-form">
                {submitting ? 'Creating...' : 'Create Entry'}
              </Button>
            </motion.div>
          </div>
        }
      >
        <form id="diary-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Student *
                      </label>
                      <select
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
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
                      <label className="block text-sm text-gray-700 mb-1">
                        Class *
                      </label>
                      <select
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
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
                      <label className="block text-sm text-gray-700 mb-1">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as DiaryEntryType })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
                      >
                        {Object.values(DiaryEntryType).map((type) => (
                          <option key={type} value={type}>
                            {typeIcons[type]} {type.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
                      placeholder="e.g., Math Class Update"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
                      placeholder="Write your message to the parents..."
                      required
                    />
                  </div>
                </form>
      </SlideSheet>

      {/* View Diary Modal */}
      <SlideSheet
        isOpen={!!selectedDiary}
        onClose={() => setSelectedDiary(null)}
        title={selectedDiary?.title || ''}
        subtitle={selectedDiary ? `${selectedDiary.studentId?.firstName} ${selectedDiary.studentId?.lastName} • ${new Date(selectedDiary.date).toLocaleDateString()}` : ''}
        size="md"
        footer={
          selectedDiary ? (
            <div className="flex justify-end gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={() => setSelectedDiary(null)} size="sm">
                  Close
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={() => { handleDelete(selectedDiary); }} size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Delete
                </Button>
              </motion.div>
            </div>
          ) : undefined
        }
      >
        {selectedDiary && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{typeIcons[selectedDiary.type]}</span>
            </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedDiary.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[selectedDiary.type]}`}>
                      {selectedDiary.type.replace('_', ' ')}
                    </span>
                    {selectedDiary.acknowledgementStatus === AcknowledgementStatus.ACKNOWLEDGED ? (
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Acknowledged {selectedDiary.acknowledgedAt && `on ${new Date(selectedDiary.acknowledgedAt).toLocaleDateString()}`}
                      </div>
                    ) : (
                      <div className="text-sm text-sky-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Awaiting acknowledgement
                      </div>
                    )}
                  </div>

                  {selectedDiary.parentComment && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium mb-1">Parent Comment</div>
                      <p className="text-sm text-gray-700">{selectedDiary.parentComment}</p>
                    </div>
                  )}
                </div>
          </>
        )}
      </SlideSheet>
    </div>
  );
}
