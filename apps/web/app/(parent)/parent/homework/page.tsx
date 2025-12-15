'use client';

import { useState, useEffect } from 'react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (children.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Homework</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and track your child's homework assignments
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Children Linked</h3>
          <p className="text-gray-500">
            No children are linked to your account. Please contact the school administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Homework</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and track your child's homework
          </p>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-w-0 max-w-[120px] sm:max-w-none"
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
      </div>

      {selectedChild && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-base sm:text-lg flex-shrink-0">
              {selectedChild.firstName?.[0]}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                {selectedChild.firstName} {selectedChild.lastName}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {selectedChild.classId?.name || 'No class assigned'}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {homework.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 text-center">
          <div className="text-3xl sm:text-4xl mb-3">📝</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">No Homework</h3>
          <p className="text-gray-500 text-xs sm:text-sm">
            Your child's homework assignments will appear here once assigned by teachers.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {homework.map((hw) => {
            const submission = submissions.find(s => s.homeworkId._id === hw._id);
            const isPastDue = new Date(hw.dueDate) < new Date();

            return (
              <div
                key={hw._id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{typeIcons[hw.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{hw.title}</h3>
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
                          <span className={`px-2 py-0.5 sm:py-1 rounded text-xs ${isPastDue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                            {isPastDue ? 'Overdue' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>

                    {hw.description && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{hw.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-800 gap-2">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
