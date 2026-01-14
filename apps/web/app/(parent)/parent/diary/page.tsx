'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../../contexts/auth-context';
import {
  dailyDiaryService,
  DailyDiary,
  DiaryEntryType,
  AcknowledgementStatus,
} from '../../../../lib/services/daily-diary.service';
import { userService, User } from '../../../../lib/services/user.service';
import { GlassCard, Icon3D } from '../../../../components/ui';
import { BookOpen, Calendar, X, CheckCircle, Clock } from 'lucide-react';

interface Child extends User {
  classId?: { _id: string; name: string; grade?: string };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function ParentDiaryPage() {
  const { user: authUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [diaries, setDiaries] = useState<DailyDiary[]>([]);
  const [unacknowledged, setUnacknowledged] = useState<DailyDiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDiary, setSelectedDiary] = useState<DailyDiary | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (authUser?.id) {
      loadChildren();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedChild) {
      loadDiariesForChild(selectedChild._id || selectedChild.id);
    }
  }, [selectedChild]);

  async function loadChildren() {
    try {
      setLoading(true);
      setError(null);

      const parentData = await userService.getUserById(authUser!.id);

      if (parentData?.children && parentData.children.length > 0) {
        // Children might be populated objects or just IDs
        const childrenData = await Promise.all(
          parentData.children.map((child: any) => {
            const childId = typeof child === 'string' ? child : (child._id || child.id);
            return userService.getUserById(childId);
          })
        );
        setChildren(childrenData as Child[]);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0] as Child);
        }
      } else {
        const students = await userService.getStudents();
        const myChildren = students.filter(
          (s: User) => s.parents?.includes(parentData._id || parentData.id) || s.parentEmail === authUser?.email
        );
        setChildren(myChildren as Child[]);
        if (myChildren.length > 0) {
          setSelectedChild(myChildren[0] as Child);
        }
      }
    } catch (err) {
      console.error('Failed to load children:', err);
      setError('Failed to load children data');
    } finally {
      setLoading(false);
    }
  }

  async function loadDiariesForChild(childId: string) {
    try {
      setLoading(true);
      const [diariesData, unacknowledgedData] = await Promise.all([
        dailyDiaryService.getStudentDiaries(childId),
        dailyDiaryService.getUnacknowledgedDiaries(childId),
      ]);
      setDiaries(diariesData);
      setUnacknowledged(unacknowledgedData);
    } catch (err) {
      console.error('Failed to load diaries:', err);
      setError('Failed to load diary entries');
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

  async function handleAcknowledge() {
    if (!selectedDiary || !selectedChild) return;
    try {
      await dailyDiaryService.acknowledgeDiary(selectedDiary._id, comment);
      setSelectedDiary(null);
      setComment('');
      loadDiariesForChild(selectedChild._id || selectedChild.id);
    } catch (err) {
      setError('Failed to acknowledge diary');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-8 w-8 border-b-2 border-sky-600"
        />
      </div>
    );
  }

  if (children.length === 0 && !loading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <Icon3D gradient="from-sky-500 to-blue-500" size="lg">
            <BookOpen className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Diary</h1>
            <p className="text-sm text-gray-600 mt-1">
              View daily updates from your child's teachers
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-3">👨‍👩‍👧</div>
            <h3 className="font-semibold text-gray-900 mb-2">No Children Linked</h3>
            <p className="text-gray-500">
              No children are linked to your account. Please contact the school administrator.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-sky-500 to-blue-500" size="lg">
            <BookOpen className="w-6 h-6" />
          </Icon3D>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Daily Diary</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              View daily updates from teachers
            </p>
          </div>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900 min-w-0 max-w-[120px] sm:max-w-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-300 transition-all"
            value={selectedChild?._id || selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => (c._id || c.id) === e.target.value);
              setSelectedChild(child || null);
            }}
          >
            {children.map((child) => (
              <option key={child._id || child.id} value={child._id || child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        )}
      </motion.div>

      {selectedChild && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0 shadow-lg shadow-sky-500/20">
                {selectedChild.firstName?.[0]}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {selectedChild.firstName} {selectedChild.lastName}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                  {selectedChild.classId?.name || 'No class assigned'}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {unacknowledged.length > 0 && (
        <motion.div variants={itemVariants}>
          <GlassCard className="bg-yellow-50 border border-yellow-200 p-4">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {unacknowledged.length} entries need your acknowledgement
            </h3>
            <div className="space-y-2">
              {unacknowledged.map((diary, index) => (
                <motion.div
                  key={diary._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    scale: 1.01,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  }}
                  className="bg-white rounded-lg p-3 cursor-pointer transition-all"
                  onClick={() => setSelectedDiary(diary)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{typeIcons[diary.type]}</span>
                      <span className="font-medium">{diary.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(diary.date).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {diaries.length === 0 && unacknowledged.length === 0 ? (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-3">📓</div>
            <h3 className="font-semibold text-gray-900 mb-2">No Diary Entries</h3>
            <p className="text-gray-500">
              Daily diary entries from your child's teachers will appear here.
            </p>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <GlassCard hover={false} className="overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Recent Entries</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {diaries.map((diary, index) => (
                <motion.div
                  key={diary._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    scale: 1.01,
                    backgroundColor: 'rgba(249, 250, 251, 0.5)',
                  }}
                  className="p-4 cursor-pointer transition-colors"
                  onClick={() => setSelectedDiary(diary)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{typeIcons[diary.type]}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{diary.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${typeColors[diary.type]}`}>
                          {diary.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {diary.content}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>
                          {diary.studentId?.firstName} {diary.studentId?.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(diary.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedDiary && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/50"
            onClick={() => setSelectedDiary(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon3D gradient="from-sky-500 to-blue-500" size="md">
                    <BookOpen className="w-4 h-4" />
                  </Icon3D>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedDiary.title}</h3>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      {selectedDiary.studentId?.firstName} {selectedDiary.studentId?.lastName} •{' '}
                      {new Date(selectedDiary.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDiary(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{typeIcons[selectedDiary.type]}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${typeColors[selectedDiary.type]}`}>
                    {selectedDiary.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedDiary.content}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  From: {selectedDiary.createdBy?.firstName} {selectedDiary.createdBy?.lastName}
                  {selectedDiary.createdBy?.role && ` (${selectedDiary.createdBy.role})`}
                </div>

                {selectedDiary.acknowledgementStatus === AcknowledgementStatus.PENDING ? (
                  <>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment (optional)"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-sky-500/50 focus:border-sky-300 transition-all"
                    />
                    <div className="flex justify-end gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" onClick={() => setSelectedDiary(null)}>Cancel</Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={handleAcknowledge}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Acknowledge
                        </Button>
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <>
                    {selectedDiary.parentComment && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-600 mb-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Your Comment
                        </div>
                        <p className="text-sm">{selectedDiary.parentComment}</p>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" onClick={() => setSelectedDiary(null)}>Close</Button>
                      </motion.div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
