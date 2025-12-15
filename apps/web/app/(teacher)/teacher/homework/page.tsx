'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  getCurrentSchoolId,
  getEntities,
  setHomework,
  type Homework as HomeworkType,
} from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';

export default function HomeworkPage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities, setEntities] = useState(() => getEntities(schoolId));
  const [view, setView] = useState<HomeworkType | null>(null);

  const teacherEmail = user?.email || '';
  const assignedClassIds = useMemo(
    () => entities.teacherAssignments?.[teacherEmail] || [],
    [entities.teacherAssignments, teacherEmail]
  );

  const allowedClasses = useMemo(() => {
    const all = entities.classes || [];
    if (!assignedClassIds || assignedClassIds.length === 0) return all;
    return all.filter((c) => assignedClassIds.includes(c.id));
  }, [entities.classes, assignedClassIds]);

  const [classId, setClassId] = useState(() => allowedClasses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!classId && allowedClasses[0]) setClassId(allowedClasses[0].id);
  }, [allowedClasses, classId]);

  if (allowedClasses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No classes found. Classes are managed by the School Admin.
        </p>
      </div>
    );
  }

  const list: HomeworkType[] = entities.homework[classId] || [];
  const total = list.length;
  const completed = list.filter((h) => h.status === 'Completed').length;
  const pending = total - completed;

  function addHomework() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const item: HomeworkType = {
      id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmed,
      due,
      description: description.trim() || undefined,
      status: 'Pending',
    };
    setHomework(schoolId, classId, [item, ...list]);
    setEntities(getEntities(schoolId));
    setTitle('');
    setDescription('');
  }

  function removeHomework(id: string) {
    const next = list.filter((h) => h.id !== id);
    setHomework(schoolId, classId, next);
    setEntities(getEntities(schoolId));
  }

  function toggleComplete(id: string) {
    const next: HomeworkType[] = list.map((h) =>
      h.id === id
        ? { ...h, status: (h.status === 'Completed' ? 'Pending' : 'Completed') as 'Pending' | 'Completed' }
        : h
    );
    setHomework(schoolId, classId, next);
    setEntities(getEntities(schoolId));
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Homework</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Create and manage homework assignments</p>
      </div>

      {/* Add Homework Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Add New Homework</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Class</label>
            <select
              className="border border-gray-300 bg-white text-gray-900 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-full dark:bg-gray-900 dark:text-gray-100"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              {allowedClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <input
              className="peer border border-gray-300 bg-white text-gray-900 rounded-lg px-3 pt-5 pb-2 text-sm w-full placeholder-transparent focus:ring-2 focus:ring-indigo-400 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
            <label className="absolute left-3 top-2 text-xs text-gray-400 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:top-2 peer-focus:text-xs">
              Title
            </label>
          </div>
          <div className="relative">
            <input
              type="date"
              className="peer border border-gray-300 bg-white text-gray-900 rounded-lg px-3 pt-5 pb-2 text-sm w-full placeholder-transparent focus:ring-2 focus:ring-indigo-400 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="Due"
            />
            <label className="absolute left-3 top-2 text-xs text-gray-400">Due Date</label>
          </div>
          <div className="sm:col-span-3">
            <textarea
              className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or additional details…"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={addHomework} disabled={!title.trim()}>
            Add Homework
          </Button>
        </div>

        {/* Stats bar */}
        <div className="mt-6 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> Total: {total}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending: {pending}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Completed: {completed}
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {list.length === 0 && (
          <div className="col-span-full py-12 sm:py-16 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-3xl sm:text-4xl mb-3">📚</div>
            <p className="text-sm sm:text-base">No homework assignments yet for this class.</p>
          </div>
        )}
        {list.map((h) => (
          <div
            key={h.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 touch-manipulation"
            onClick={() => setView(h)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-gray-900 dark:text-gray-100 flex-1 pr-2">{h.title}</div>
              <span
                className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                  h.status === 'Completed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}
              >
                {h.status || 'Pending'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">Due: {h.due}</div>
            {h.description && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{h.description}</div>
            )}
            <div className="mt-4 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComplete(h.id);
                }}
              >
                {h.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this homework?')) removeHomework(h.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick view modal */}
      {view && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setView(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-4 sm:p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{view.title}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span className="font-medium">Due:</span> {view.due}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              <span className="font-medium">Status:</span>{' '}
              <span
                className={
                  view.status === 'Completed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                }
              >
                {view.status || 'Pending'}
              </span>
            </div>
            {view.description && (
              <div className="mt-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {view.description}
              </div>
            )}
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={() => setView(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
