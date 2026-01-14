'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../../contexts/auth-context';
import {
  homeworkService,
  Homework,
  Submission,
  HomeworkType,
  SubmissionStatus,
} from '../../../../lib/services/homework.service';
import { userService, User } from '../../../../lib/services/user.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import { BookOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Child extends User {
  classId?: { _id: string; name: string; grade?: string };
}

export default function ParentHomeworkPage() {
  const { user: authUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.id) {
      loadChildren();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedChild) {
      loadHomeworkForChild(selectedChild);
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

  async function loadHomeworkForChild(child: Child) {
    try {
      setLoading(true);
      const childId = child._id || child.id;
      const classId = child.classId?._id;

      const [homeworkData, submissionsData] = await Promise.all([
        classId ? homeworkService.getClassHomework(classId) : Promise.resolve([]),
        homeworkService.getStudentSubmissions(childId),
      ]);

      setHomework(homeworkData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Failed to load homework:', err);
      setError('Failed to load homework');
    } finally {
      setLoading(false);
    }
  }

  const typeIcons: Record<HomeworkType, string> = {
    [HomeworkType.ASSIGNMENT]: '📝',
    [HomeworkType.PROJECT]: '🎯',
    [HomeworkType.HOMEWORK]: '📚',
    [HomeworkType.PRACTICE]: '✏️',
    [HomeworkType.READING]: '📖',
    [HomeworkType.RESEARCH]: '🔍',
  };

  const submissionStatusColors: Record<SubmissionStatus, string> = {
    [SubmissionStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
    [SubmissionStatus.SUBMITTED]: 'bg-blue-100 text-blue-700',
    [SubmissionStatus.LATE]: 'bg-orange-100 text-orange-700',
    [SubmissionStatus.GRADED]: 'bg-green-100 text-green-700',
    [SubmissionStatus.RETURNED]: 'bg-purple-100 text-purple-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading homework...</p>
        </motion.div>
      </div>
    );
  }

  if (children.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Icon3D gradient="from-rose-500 to-pink-500">
            <BookOpen className="w-5 h-5" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
            <p className="text-sm text-gray-600 mt-1">
              View and track your child's homework assignments
            </p>
          </div>
        </motion.div>
        <GlassCard className="p-8 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <h3 className="font-semibold text-gray-900 mb-2">No Children Linked</h3>
          <p className="text-gray-500">
            No children are linked to your account. Please contact the school administrator.
          </p>
        </GlassCard>
      </div>
    );
  }

  // Calculate stats
  const pendingHomework = homework.filter(hw => {
    const submission = submissions.find(s => s.homeworkId._id === hw._id);
    const isPastDue = new Date(hw.dueDate) < new Date();
    return !submission || (submission.status === SubmissionStatus.PENDING && !isPastDue);
  }).length;

  const overdueHomework = homework.filter(hw => {
    const submission = submissions.find(s => s.homeworkId._id === hw._id);
    const isPastDue = new Date(hw.dueDate) < new Date();
    return !submission && isPastDue;
  }).length;

  const completedHomework = submissions.filter(s =>
    s.status === SubmissionStatus.SUBMITTED ||
    s.status === SubmissionStatus.GRADED ||
    s.status === SubmissionStatus.RETURNED
  ).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="min-w-0 flex items-center gap-3">
          <Icon3D gradient="from-rose-500 to-pink-500">
            <BookOpen className="w-5 h-5" />
          </Icon3D>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Homework</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              View and track your child's homework
            </p>
          </div>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-200 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900 min-w-0 max-w-[120px] sm:max-w-none focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0">
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

      {/* Stats Cards */}
      {homework.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 sm:gap-4"
        >
          <AnimatedStatCard
            title="Pending"
            value={pendingHomework}
            icon={<Clock className="w-5 h-5 text-white" />}
            gradient="from-blue-500 to-cyan-500"
            delay={0}
          />
          <AnimatedStatCard
            title="Overdue"
            value={overdueHomework}
            icon={<AlertCircle className="w-5 h-5 text-white" />}
            gradient="from-red-500 to-orange-500"
            delay={0.1}
          />
          <AnimatedStatCard
            title="Completed"
            value={completedHomework}
            icon={<CheckCircle2 className="w-5 h-5 text-white" />}
            gradient="from-green-500 to-emerald-500"
            delay={0.2}
          />
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {homework.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 sm:p-8 text-center">
            <div className="text-3xl sm:text-4xl mb-3">📝</div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">No Homework</h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              Your child's homework assignments will appear here once assigned by teachers.
            </p>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {homework.map((hw, idx) => {
            const submission = submissions.find(s => s.homeworkId._id === hw._id);
            const isPastDue = new Date(hw.dueDate) < new Date();

            return (
              <motion.div
                key={hw._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (0.05 * idx) }}
              >
                <GlassCard className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{typeIcons[hw.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{hw.title}</h3>
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                          {hw.subjectId?.name} • {hw.classId?.name}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {submission ? (
                          <span className={`px-2 py-0.5 sm:py-1 rounded text-xs ${submissionStatusColors[submission.status]}`}>
                            {submission.status}
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 sm:py-1 rounded text-xs ${isPastDue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {isPastDue ? 'Overdue' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>

                    {hw.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{hw.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 gap-2">
                      <div className="text-xs sm:text-sm text-gray-500 truncate">
                        Due: {new Date(hw.dueDate).toLocaleDateString()}<span className="hidden sm:inline"> at{' '}
                        {new Date(hw.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {submission?.status === SubmissionStatus.GRADED && (
                        <div className="text-xs sm:text-sm font-medium flex-shrink-0">
                          Score: {submission.score}/{submission.maxScore}
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
