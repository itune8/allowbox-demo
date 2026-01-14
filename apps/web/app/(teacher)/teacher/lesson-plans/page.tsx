'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D } from '@/components/ui';
import { BookOpen, Clock, CheckCircle, AlertCircle, Eye, Trash2 } from 'lucide-react';
import {
  lessonPlanService,
  LessonPlan,
  LessonPlanStatus,
  CreateLessonPlanDto,
} from '../../../../lib/services/lesson-plan.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { subjectService, Subject } from '../../../../lib/services/subject.service';

export default function LessonPlansPage() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [filterStatus, setFilterStatus] = useState<LessonPlanStatus | ''>('');

  // Form state
  const [formData, setFormData] = useState({
    subjectId: '',
    classId: '',
    title: '',
    description: '',
    objectives: [] as string[],
    content: '',
    scheduledDate: new Date().toISOString().split('T')[0] ?? '',
    duration: 45 as number | undefined,
    status: LessonPlanStatus.DRAFT,
    teacherNotes: '',
  });
  const [objectiveInput, setObjectiveInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [plansData, classesData, subjectsData] = await Promise.all([
        lessonPlanService.getMyPlans(),
        classService.getClasses(),
        subjectService.getSubjects(),
      ]);
      setLessonPlans(plansData);
      setClasses(classesData);
      setSubjects(subjectsData);
      if (classesData.length > 0) {
        setFormData((prev) => ({ ...prev, classId: classesData[0]?._id || '' }));
      }
      if (subjectsData.length > 0) {
        setFormData((prev) => ({ ...prev, subjectId: subjectsData[0]?._id || '' }));
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subjectId || !formData.classId || !formData.scheduledDate) return;

    try {
      setSubmitting(true);
      await lessonPlanService.create({
        ...formData,
        scheduledDate: formData.scheduledDate,
      });
      await loadData();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError('Failed to create lesson plan');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id: string, status: LessonPlanStatus) {
    try {
      await lessonPlanService.updateStatus(id, status);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this lesson plan?')) return;
    try {
      await lessonPlanService.delete(id);
      await loadData();
      setSelectedPlan(null);
    } catch (err) {
      console.error(err);
    }
  }

  function addObjective() {
    if (!objectiveInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      objectives: [...(prev.objectives || []), objectiveInput.trim()],
    }));
    setObjectiveInput('');
  }

  function removeObjective(index: number) {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives?.filter((_, i) => i !== index) || [],
    }));
  }

  function resetForm() {
    setFormData({
      subjectId: subjects[0]?._id || '',
      classId: classes[0]?._id || '',
      title: '',
      description: '',
      objectives: [],
      content: '',
      scheduledDate: new Date().toISOString().split('T')[0] ?? '',
      duration: 45,
      status: LessonPlanStatus.DRAFT,
      teacherNotes: '',
    });
    setObjectiveInput('');
  }

  const filteredPlans = filterStatus
    ? lessonPlans.filter((p) => p.status === filterStatus)
    : lessonPlans;

  const statusColors: Record<LessonPlanStatus, string> = {
    [LessonPlanStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [LessonPlanStatus.SCHEDULED]: 'bg-blue-100 text-blue-700',
    [LessonPlanStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-700',
    [LessonPlanStatus.COMPLETED]: 'bg-green-100 text-green-700',
  };

  const stats = {
    total: lessonPlans.length,
    draft: lessonPlans.filter((p) => p.status === LessonPlanStatus.DRAFT).length,
    scheduled: lessonPlans.filter((p) => p.status === LessonPlanStatus.SCHEDULED).length,
    inProgress: lessonPlans.filter((p) => p.status === LessonPlanStatus.IN_PROGRESS).length,
    completed: lessonPlans.filter((p) => p.status === LessonPlanStatus.COMPLETED).length,
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[50vh]"
      >
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading lesson plans...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-purple-500 to-violet-500" size="lg">
            <BookOpen className="w-6 h-6" />
          </Icon3D>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lesson Plans</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Create and manage lesson plans
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setShowForm(true)} className="text-xs sm:text-sm">+ <span className="hidden sm:inline">New </span>Plan</Button>
        </motion.div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
        >
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 * 0.1 }}
        >
          <AnimatedStatCard
            title="Total"
            value={stats.total}
            icon={<BookOpen className="w-5 h-5 text-white" />}
            gradient="from-purple-500 to-violet-500"
            delay={0}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 * 0.1 }}
        >
          <AnimatedStatCard
            title="Draft"
            value={stats.draft}
            icon={<AlertCircle className="w-5 h-5 text-gray-600" />}
            iconBgColor="bg-gray-100"
            delay={1}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 * 0.1 }}
        >
          <AnimatedStatCard
            title="Scheduled"
            value={stats.scheduled}
            icon={<Clock className="w-5 h-5 text-white" />}
            gradient="from-blue-500 to-cyan-500"
            delay={2}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 * 0.1 }}
          className="hidden sm:block"
        >
          <AnimatedStatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock className="w-5 h-5 text-white" />}
            gradient="from-amber-500 to-orange-500"
            delay={3}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4 * 0.1 }}
          className="hidden sm:block"
        >
          <AnimatedStatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="w-5 h-5 text-white" />}
            gradient="from-emerald-500 to-teal-500"
            delay={4}
          />
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Filter:</span>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as LessonPlanStatus | '')}
        >
          <option value="">All</option>
          <option value={LessonPlanStatus.DRAFT}>Draft</option>
          <option value={LessonPlanStatus.SCHEDULED}>Scheduled</option>
          <option value={LessonPlanStatus.IN_PROGRESS}>In Progress</option>
          <option value={LessonPlanStatus.COMPLETED}>Completed</option>
        </select>
      </div>

      {/* Lesson Plans List */}
      <AnimatePresence>
        {filteredPlans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-8 sm:p-12 text-center bg-white/80">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl mb-3"
              >
                📖
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No lesson plans yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Create your first lesson plan to get started
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredPlans.map((plan, idx) => (
              <motion.div
                key={plan.id || plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <GlassCard
                  className="p-4 sm:p-5 bg-white/90 cursor-pointer h-full"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-semibold text-gray-900 flex-1 pr-2 line-clamp-2">
                      {plan.title}
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ml-2 ${statusColors[plan.status]}`}
                    >
                      {plan.status.replace('_', ' ')}
                    </motion.span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1.5 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Subject:</span>
                      <span>{plan.subjectId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Class:</span>
                      <span>{plan.classId?.name || 'N/A'} {plan.section ? `(${plan.section})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Date:</span>
                      <span>{new Date(plan.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    {plan.duration && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span>{plan.duration} min</span>
                      </div>
                    )}
                  </div>
                  {plan.objectives && plan.objectives.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-4 py-2 px-3 bg-purple-50 rounded-lg"
                    >
                      <div className="text-xs text-purple-700 font-medium">
                        {plan.objectives.length} objective{plan.objectives.length > 1 ? 's' : ''}
                      </div>
                    </motion.div>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(plan);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />View
                      </Button>
                    </motion.div>
                    {plan.status !== LessonPlanStatus.COMPLETED && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button
                          size="sm"
                          className="w-full text-xs bg-purple-600 hover:bg-purple-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus =
                              plan.status === LessonPlanStatus.DRAFT
                                ? LessonPlanStatus.SCHEDULED
                                : plan.status === LessonPlanStatus.SCHEDULED
                                ? LessonPlanStatus.IN_PROGRESS
                                : LessonPlanStatus.COMPLETED;
                            handleStatusChange(plan.id || plan._id, nextStatus);
                          }}
                        >
                          {plan.status === LessonPlanStatus.DRAFT
                            ? 'Schedule'
                            : plan.status === LessonPlanStatus.SCHEDULED
                            ? 'Start'
                            : 'Complete'}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Create Lesson Plan
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Algebra"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the lesson..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Learning Objectives
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={objectiveInput}
                    onChange={(e) => setObjectiveInput(e.target.value)}
                    placeholder="Add an objective..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addObjective();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addObjective}>
                    Add
                  </Button>
                </div>
                {formData.objectives && formData.objectives.length > 0 && (
                  <ul className="space-y-1">
                    {formData.objectives.map((obj, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">{obj}</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeObjective(i)}
                        >
                          x
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Lesson Content
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed lesson content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                    value={formData.duration || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })
                    }
                    min={1}
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Teacher Notes
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                  rows={2}
                  value={formData.teacherNotes}
                  onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
                  placeholder="Private notes for yourself..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Lesson Plan'}
                </Button>
              </div>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedPlan(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPlan.title}
              </h3>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedPlan.status]}`}>
                {selectedPlan.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 text-gray-600">
                <div>
                  <span className="font-medium">Subject:</span>{' '}
                  {selectedPlan.subjectId?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Class:</span> {selectedPlan.classId?.name || 'N/A'}{' '}
                  {selectedPlan.section ? `(${selectedPlan.section})` : ''}
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
                {selectedPlan.completedDate && (
                  <div>
                    <span className="font-medium">Completed:</span>{' '}
                    {new Date(selectedPlan.completedDate).toLocaleDateString()}
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
                  <ul className="list-disc list-inside text-gray-600">
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

              {selectedPlan.teacherNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Teacher Notes
                  </h4>
                  <p className="text-gray-600 italic">
                    {selectedPlan.teacherNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => handleDelete(selectedPlan.id || selectedPlan._id)}
                className="text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
              <div className="flex gap-2">
                {selectedPlan.status !== LessonPlanStatus.COMPLETED && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextStatus =
                        selectedPlan.status === LessonPlanStatus.DRAFT
                          ? LessonPlanStatus.SCHEDULED
                          : selectedPlan.status === LessonPlanStatus.SCHEDULED
                          ? LessonPlanStatus.IN_PROGRESS
                          : LessonPlanStatus.COMPLETED;
                      handleStatusChange(selectedPlan.id || selectedPlan._id, nextStatus);
                      setSelectedPlan(null);
                    }}
                  >
                    {selectedPlan.status === LessonPlanStatus.DRAFT
                      ? 'Schedule'
                      : selectedPlan.status === LessonPlanStatus.SCHEDULED
                      ? 'Start Lesson'
                      : 'Mark Complete'}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                  Close
                </Button>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
