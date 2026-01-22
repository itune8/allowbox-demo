'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/auth-context';
import {
  getCurrentSchoolId,
  getEntities,
  setHomework,
  type Homework as HomeworkType,
} from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, SlideSheet } from '@/components/ui';
import { BookOpen, CheckCircle2, Clock, Trash2 } from 'lucide-react';

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <GlassCard className="p-6 bg-white text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm text-gray-600">
            No classes found. Classes are managed by the School Admin.
          </p>
        </GlassCard>
      </motion.div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          Homework Management
          <Icon3D bgColor="bg-rose-500" size="sm">
            <BookOpen className="w-3.5 h-3.5" />
          </Icon3D>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Create and manage homework assignments for your classes</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-2 sm:gap-4"
      >
        <AnimatedStatCard
          title="Total"
          value={total}
          icon={<BookOpen className="w-5 h-5 text-rose-600" />}
          iconBgColor="bg-rose-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Pending"
          value={pending}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          delay={1}
        />
        <AnimatedStatCard
          title="Completed"
          value={completed}
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-50"
          delay={2}
        />
      </motion.div>

      {/* Add Homework Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-4 sm:p-6 bg-white">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            Create New Assignment
            <Icon3D bgColor="bg-rose-500" size="sm">
              <BookOpen className="w-3 h-3" />
            </Icon3D>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Class</label>
              <select
                className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-rose-400 focus:outline-none"
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
                className="peer border border-gray-300 bg-white text-gray-900 rounded-lg px-3 pt-5 pb-2 text-sm w-full placeholder-transparent focus:ring-2 focus:ring-rose-400 focus:outline-none"
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
                className="peer border border-gray-300 bg-white text-gray-900 rounded-lg px-3 pt-5 pb-2 text-sm w-full placeholder-transparent focus:ring-2 focus:ring-rose-400 focus:outline-none"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                placeholder="Due"
              />
              <label className="absolute left-3 top-2 text-xs text-gray-400">Due Date</label>
            </div>
            <div className="sm:col-span-3">
              <textarea
                className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-rose-400 focus:outline-none"
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
        </GlassCard>
      </motion.div>

      {/* Homework List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {list.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full"
            >
              <GlassCard className="py-12 sm:py-16 text-center bg-white">
                <div className="text-3xl sm:text-4xl mb-3">📚</div>
                <p className="text-sm sm:text-base text-gray-500">No homework assignments yet for this class.</p>
              </GlassCard>
            </motion.div>
          )}
          <AnimatePresence>
            {list.map((h, index) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <GlassCard
                  className="p-4 sm:p-5 bg-white cursor-pointer h-full flex flex-col"
                  onClick={() => setView(h)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900 flex-1 pr-2">{h.title}</div>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`text-xs px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${
                        h.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {h.status || 'Pending'}
                    </motion.span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    Due: {h.due}
                  </div>
                  {h.description && (
                    <div className="text-sm text-gray-600 mt-2 mb-3 line-clamp-2 flex-1">{h.description}</div>
                  )}
                  <div className="mt-auto flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(h.id);
                        }}
                        className="w-full text-xs"
                      >
                        {h.status === 'Completed' ? 'Pending' : 'Complete'}
                      </Button>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this homework?')) removeHomework(h.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick view modal */}
      <SlideSheet
        isOpen={!!view}
        onClose={() => setView(null)}
        title={view?.title || ''}
        size="sm"
        footer={
          view ? (
            <div className="flex gap-2 justify-end">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggleComplete(view.id);
                    setView(null);
                  }}
                >
                  {view.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView(null)}
                >
                  Close
                </Button>
              </motion.div>
            </div>
          ) : undefined
        }
      >
        {view && (
          <>
            <div className="flex items-center gap-4 text-sm mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                view.status === 'Completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {view.status || 'Pending'}
              </span>
              <div className="text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Due: {view.due}
              </div>
            </div>
            {view.description && (
              <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap border border-gray-200">
                {view.description}
              </div>
            )}
          </>
        )}
      </SlideSheet>
    </div>
  );
}
