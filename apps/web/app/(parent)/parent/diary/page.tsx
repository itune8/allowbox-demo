'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../../contexts/auth-context';
import {
  dailyDiaryService,
  DailyDiary,
  DiaryEntryType,
  AcknowledgementStatus,
} from '../../../../lib/services/daily-diary.service';
import { userService, User } from '../../../../lib/services/user.service';

interface Child extends User {
  classId?: { _id: string; name: string; grade?: string };
}

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (children.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Diary</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View daily updates from your child's teachers
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Diary</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            View daily updates from teachers
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

      {unacknowledged.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            {unacknowledged.length} entries need your acknowledgement
          </h3>
          <div className="space-y-2">
            {unacknowledged.map((diary) => (
              <div
                key={diary._id}
                className="bg-white dark:bg-gray-900 rounded-lg p-3 cursor-pointer hover:shadow-md transition"
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
              </div>
            ))}
          </div>
        </div>
      )}

      {diaries.length === 0 && unacknowledged.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">📓</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Diary Entries</h3>
          <p className="text-gray-500">
            Daily diary entries from your child's teachers will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Entries</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {diaries.map((diary) => (
              <div
                key={diary._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => setSelectedDiary(diary)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeIcons[diary.type]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{diary.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${typeColors[diary.type]}`}>
                        {diary.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {diary.content}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>
                        {diary.studentId?.firstName} {diary.studentId?.lastName}
                      </span>
                      <span>{new Date(diary.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDiary && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedDiary(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{typeIcons[selectedDiary.type]}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedDiary.title}</h3>
                <div className="text-sm text-gray-500">
                  {selectedDiary.studentId?.firstName} {selectedDiary.studentId?.lastName} •{' '}
                  {new Date(selectedDiary.date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedDiary.content}
              </p>
            </div>

            <div className="text-xs text-gray-500 mb-4">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 bg-white dark:bg-gray-900 dark:border-gray-700"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedDiary(null)}>Cancel</Button>
                  <Button onClick={handleAcknowledge}>Acknowledge</Button>
                </div>
              </>
            ) : (
              <>
                {selectedDiary.parentComment && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                    <div className="text-xs text-blue-600 mb-1">Your Comment</div>
                    <p className="text-sm">{selectedDiary.parentComment}</p>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedDiary(null)}>Close</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
