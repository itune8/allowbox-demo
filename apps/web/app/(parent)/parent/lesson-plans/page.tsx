'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  lessonPlanService,
  LessonPlan,
  LessonPlanStatus,
  ClassProgress,
} from '../../../../lib/services/lesson-plan.service';
import { userService, User } from '../../../../lib/services/user.service';

interface Child extends User {
  classId?: {
    _id: string;
    name: string;
    grade: string;
  };
  section?: string;
}

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
    [LessonPlanStatus.DRAFT]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [LessonPlanStatus.SCHEDULED]:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [LessonPlanStatus.IN_PROGRESS]:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    [LessonPlanStatus.COMPLETED]:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lesson Plans</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your child's learning progress
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <p className="text-gray-600 dark:text-gray-400">
            No children linked to your account yet. Please contact the school administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Lesson Plans</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your child's learning progress
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {selectedChild && (
        <>
          {/* Child Info Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-base sm:text-lg flex-shrink-0">
                {selectedChild.firstName[0]}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                  {selectedChild.firstName} {selectedChild.lastName}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {selectedChild.classId?.name || 'No class assigned'}{' '}
                  {selectedChild.section ? `(Section ${selectedChild.section})` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          {progress && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Learning Progress
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {progress.total}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">{progress.completed}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Done</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">{progress.inProgress}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">{progress.scheduled}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Scheduled</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-lg sm:text-2xl font-bold text-indigo-600">
                    {progress.completionPercentage}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Completion</div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Two columns: Upcoming and Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Upcoming Lessons */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Upcoming Lessons
              </h3>
              {upcomingLessons.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming lessons</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {upcomingLessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors touch-manipulation"
                      onClick={() => setSelectedPlan(lesson)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {lesson.title}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${statusColors[lesson.status]}`}
                        >
                          {lesson.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {lesson.subjectId?.name} |{' '}
                        {new Date(lesson.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Completed */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Recently Completed
              </h3>
              {recentLessons.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No completed lessons yet</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentLessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors touch-manipulation"
                      onClick={() => setSelectedPlan(lesson)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {lesson.title}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Completed
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {lesson.subjectId?.name} |{' '}
                        {lesson.completedDate
                          ? new Date(lesson.completedDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All Lesson Plans */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              All Lessons ({lessonPlans.length})
            </h3>
            {lessonPlans.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                No lesson plans available for this class yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {lessonPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:shadow-md active:bg-gray-50 dark:active:bg-gray-800 transition-all touch-manipulation"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                        {plan.title}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[plan.status]}`}>
                        {plan.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>Subject: {plan.subjectId?.name || 'N/A'}</div>
                      <div>Date: {new Date(plan.scheduledDate).toLocaleDateString()}</div>
                      {plan.objectives && plan.objectives.length > 0 && (
                        <div>{plan.objectives.length} learning objectives</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Lesson Detail Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setSelectedPlan(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-zoom-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedPlan.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedPlan.status]}`}>
                {selectedPlan.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
                <div>
                  <span className="font-medium">Subject:</span>{' '}
                  {selectedPlan.subjectId?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Teacher:</span>{' '}
                  {selectedPlan.teacherId?.firstName} {selectedPlan.teacherId?.lastName}
                </div>
                <div>
                  <span className="font-medium">Scheduled:</span>{' '}
                  {new Date(selectedPlan.scheduledDate).toLocaleDateString()}
                </div>
                {selectedPlan.duration && (
                  <div>
                    <span className="font-medium">Duration:</span> {selectedPlan.duration} min
                  </div>
                )}
              </div>

              {selectedPlan.description && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedPlan.description}</p>
                </div>
              )}

              {selectedPlan.objectives && selectedPlan.objectives.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Learning Objectives
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                    {selectedPlan.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPlan.content && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Lesson Content
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedPlan.content}
                  </div>
                </div>
              )}

              {selectedPlan.resources && selectedPlan.resources.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Resources</h4>
                  <ul className="space-y-1">
                    {selectedPlan.resources.map((resource, i) => (
                      <li key={i}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
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

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setSelectedPlan(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
