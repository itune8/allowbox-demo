'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
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
    [LessonPlanStatus.DRAFT]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [LessonPlanStatus.SCHEDULED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    [LessonPlanStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    [LessonPlanStatus.COMPLETED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lesson Plans</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your lesson plans
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ New Lesson Plan</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Draft</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
        <select
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-4xl mb-3">📖</div>
            <p>No lesson plans yet. Create your first one!</p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div
              key={plan.id || plan._id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-gray-900 dark:text-gray-100 flex-1 pr-2 line-clamp-1">
                  {plan.title}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${statusColors[plan.status]}`}>
                  {plan.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>Subject: {plan.subjectId?.name || 'N/A'}</div>
                <div>Class: {plan.classId?.name || 'N/A'} {plan.section ? `(${plan.section})` : ''}</div>
                <div>Date: {new Date(plan.scheduledDate).toLocaleDateString()}</div>
                {plan.duration && <div>Duration: {plan.duration} min</div>}
              </div>
              {plan.objectives && plan.objectives.length > 0 && (
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                  {plan.objectives.length} objective{plan.objectives.length > 1 ? 's' : ''}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.status !== LessonPlanStatus.COMPLETED && (
                  <Button
                    size="sm"
                    variant="outline"
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
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Create Lesson Plan
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Class *
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Subject *
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Algebra"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the lesson..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Learning Objectives
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{obj}</span>
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
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Lesson Content
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed lesson content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Teacher Notes
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setSelectedPlan(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
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

              {selectedPlan.teacherNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Teacher Notes
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 italic">
                    {selectedPlan.teacherNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => handleDelete(selectedPlan.id || selectedPlan._id)}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
          </div>
        </div>
      )}
    </div>
  );
}
