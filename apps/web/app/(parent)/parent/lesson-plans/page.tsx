'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/auth-context';
import {
  lessonPlanService,
  LessonPlan,
  LessonPlanStatus,
  ClassProgress,
} from '../../../../lib/services/lesson-plan.service';
import { userService, User } from '../../../../lib/services/user.service';
import { GlassCard, Icon3D } from '../../../../components/ui';
import { BookOpen, Calendar, X, Clock, CheckCircle } from 'lucide-react';

interface Child extends User {
  classId?: {
    _id: string;
    name: string;
    grade: string;
  };
  section?: string;
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

export default function ParentLessonPlansPage() {
  const { user: authUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [progress, setProgress] = useState<ClassProgress | null>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<LessonPlan[]>([]);
  const [recentLessons, setRecentLessons] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    if (authUser?.id) {
      loadChildren();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedChild?.classId?._id) {
      loadLessonData(selectedChild.classId._id, selectedChild.section);
    }
  }, [selectedChild]);

  async function loadChildren() {
    try {
      setLoading(true);

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

  async function loadLessonData(classId: string, section?: string) {
    try {
      const [plansData, progressData, upcomingData, recentData] = await Promise.all([
        lessonPlanService.getByClass(classId, section),
        lessonPlanService.getClassProgress(classId, section),
        lessonPlanService.getUpcomingLessons(classId, 5),
        lessonPlanService.getRecentCompletedLessons(classId, 5),
      ]);
      setLessonPlans(plansData);
      setProgress(progressData);
      setUpcomingLessons(upcomingData);
      setRecentLessons(recentData);
    } catch (err) {
      console.error('Failed to load lesson data:', err);
    }
  }

  const statusColors: Record<LessonPlanStatus, string> = {
    [LessonPlanStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [LessonPlanStatus.SCHEDULED]:
      'bg-blue-100 text-blue-700',
    [LessonPlanStatus.IN_PROGRESS]:
      'bg-yellow-100 text-yellow-700',
    [LessonPlanStatus.COMPLETED]:
      'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-8 w-8 border-b-2 border-purple-600"
        />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <Icon3D gradient="from-purple-500 to-violet-500" size="lg">
            <BookOpen className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lesson Plans</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track your child's learning progress
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-3">👨‍👩‍👧</div>
            <p className="text-gray-600">
              No children linked to your account yet. Please contact the school administrator.
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-purple-500 to-violet-500" size="lg">
            <BookOpen className="w-6 h-6" />
          </Icon3D>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lesson Plans</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Track your child's learning progress
            </p>
          </div>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900 min-w-0 max-w-[120px] sm:max-w-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 transition-all"
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

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {selectedChild && (
        <>
          {/* Child Info Card */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-3 sm:p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0 shadow-lg shadow-purple-500/20">
                  {selectedChild.firstName[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">
                    {selectedChild.classId?.name || 'No class assigned'}{' '}
                    {selectedChild.section ? `(Section ${selectedChild.section})` : ''}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Progress Stats */}
          {progress && (
            <motion.div variants={itemVariants}>
              <GlassCard className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  Learning Progress
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-gray-900">
                      {progress.total}
                    </div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">{progress.completed}</div>
                    <div className="text-xs text-gray-600">Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-yellow-600">{progress.inProgress}</div>
                    <div className="text-xs text-gray-600">Active</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-lg sm:text-2xl font-bold text-purple-600">{progress.scheduled}</div>
                    <div className="text-xs text-gray-600">Scheduled</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-lg sm:text-2xl font-bold text-violet-600">
                      {progress.completionPercentage}%
                    </div>
                    <div className="text-xs text-gray-600">Completion</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.completionPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-purple-500 to-violet-500 h-3 rounded-full"
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Two columns: Upcoming and Recent */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Upcoming Lessons */}
            <GlassCard className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Upcoming Lessons
              </h3>
              {upcomingLessons.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming lessons</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {upcomingLessons.map((lesson, index) => (
                    <motion.div
                      key={lesson._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: 'rgba(249, 250, 251, 0.8)',
                      }}
                      className="p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer transition-all"
                      onClick={() => setSelectedPlan(lesson)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-gray-900 text-sm">
                          {lesson.title}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${statusColors[lesson.status]}`}
                        >
                          {lesson.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {lesson.subjectId?.name} |{' '}
                        {new Date(lesson.scheduledDate).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Recent Completed */}
            <GlassCard className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Recently Completed
              </h3>
              {recentLessons.length === 0 ? (
                <p className="text-gray-500 text-sm">No completed lessons yet</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentLessons.map((lesson, index) => (
                    <motion.div
                      key={lesson._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: 'rgba(249, 250, 251, 0.8)',
                      }}
                      className="p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer transition-all"
                      onClick={() => setSelectedPlan(lesson)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-gray-900 text-sm">
                          {lesson.title}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {lesson.subjectId?.name} |{' '}
                        {lesson.completedDate
                          ? new Date(lesson.completedDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* All Lesson Plans */}
          <motion.div variants={itemVariants}>
            <GlassCard hover={false} className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                All Lessons ({lessonPlans.length})
              </h3>
              {lessonPlans.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No lesson plans available for this class yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {lessonPlans.map((plan, index) => (
                    <motion.div
                      key={plan._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      }}
                      className="p-3 sm:p-4 border border-gray-200 rounded-lg cursor-pointer transition-all"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {plan.title}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[plan.status]}`}>
                          {plan.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Subject: {plan.subjectId?.name || 'N/A'}</div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(plan.scheduledDate).toLocaleDateString()}
                        </div>
                        {plan.objectives && plan.objectives.length > 0 && (
                          <div>{plan.objectives.length} learning objectives</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </>
      )}

      {/* Lesson Detail Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/50"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon3D gradient="from-purple-500 to-violet-500" size="md">
                    <BookOpen className="w-4 h-4" />
                  </Icon3D>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedPlan.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedPlan.status]}`}>
                      {selectedPlan.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 text-gray-600">
                  <div>
                    <span className="font-medium">Subject:</span>{' '}
                    {selectedPlan.subjectId?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Teacher:</span>{' '}
                    {selectedPlan.teacherId?.firstName} {selectedPlan.teacherId?.lastName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Scheduled:</span>{' '}
                    {new Date(selectedPlan.scheduledDate).toLocaleDateString()}
                  </div>
                  {selectedPlan.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Duration:</span> {selectedPlan.duration} min
                    </div>
                  )}
                </div>

                {selectedPlan.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                    <p className="text-gray-600">{selectedPlan.description}</p>
                  </div>
                )}

                {selectedPlan.objectives && selectedPlan.objectives.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Learning Objectives
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {selectedPlan.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPlan.content && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Lesson Content
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-700 whitespace-pre-wrap">
                      {selectedPlan.content}
                    </div>
                  </div>
                )}

                {selectedPlan.resources && selectedPlan.resources.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Resources</h4>
                    <ul className="space-y-1">
                      {selectedPlan.resources.map((resource, i) => (
                        <li key={i}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                          >
                            {resource.title}
                          </a>
                          <span className="text-xs text-gray-500 ml-2">({resource.type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end p-6 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setSelectedPlan(null)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
