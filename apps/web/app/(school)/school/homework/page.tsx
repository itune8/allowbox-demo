'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  homeworkService,
  Homework,
  HomeworkStatus,
  HomeworkType,
  Submission,
} from '../../../../lib/services/homework.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { subjectService, Subject } from '../../../../lib/services/subject.service';

interface FormData {
  title: string;
  description: string;
  type: HomeworkType;
  classId: string;
  subjectId: string;
  dueDate: string;
  maxScore: number;
  instructions: string;
  allowLateSubmission: boolean;
  latePenaltyPercent: number;
  status: HomeworkStatus;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  type: HomeworkType.ASSIGNMENT,
  classId: '',
  subjectId: '',
  dueDate: '',
  maxScore: 100,
  instructions: '',
  allowLateSubmission: true,
  latePenaltyPercent: 10,
  status: HomeworkStatus.DRAFT,
};

export default function SchoolHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<HomeworkStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const [homeworkData, classesData, subjectsData] = await Promise.all([
        homeworkService.getAll({ status: statusFilter || undefined }),
        classService.getClasses(),
        subjectService.getSubjects(),
      ]);
      setHomework(homeworkData);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (err) {
      setError('Failed to load homework');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(hw: Homework) {
    setEditingHomework(hw);
    setFormData({
      title: hw.title,
      description: hw.description || '',
      type: hw.type,
      classId: hw.classId._id,
      subjectId: hw.subjectId._id,
      dueDate: hw.dueDate.split('T')[0] ?? '',
      maxScore: hw.maxScore || 100,
      instructions: hw.instructions || '',
      allowLateSubmission: hw.allowLateSubmission,
      latePenaltyPercent: hw.latePenaltyPercent || 10,
      status: hw.status,
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingHomework(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.classId || !formData.subjectId || !formData.dueDate) return;

    try {
      setSubmitting(true);
      if (editingHomework) {
        await homeworkService.update(editingHomework._id, formData);
      } else {
        await homeworkService.create(formData);
      }
      await loadData();
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save homework');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublish(hw: Homework) {
    try {
      await homeworkService.publish(hw._id);
      await loadData();
    } catch (err) {
      setError('Failed to publish homework');
    }
  }

  async function handleViewSubmissions(hw: Homework) {
    try {
      const subs = await homeworkService.getHomeworkSubmissions(hw._id);
      setSubmissions(subs);
      setSelectedHomework(hw);
      setShowSubmissions(true);
    } catch (err) {
      setError('Failed to load submissions');
    }
  }

  const statusColors: Record<HomeworkStatus, string> = {
    [HomeworkStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [HomeworkStatus.PUBLISHED]: 'bg-green-100 text-green-700',
    [HomeworkStatus.CLOSED]: 'bg-red-100 text-red-700',
  };

  const typeIcons: Record<HomeworkType, string> = {
    [HomeworkType.ASSIGNMENT]: '📝',
    [HomeworkType.PROJECT]: '🎯',
    [HomeworkType.HOMEWORK]: '📚',
    [HomeworkType.PRACTICE]: '✏️',
    [HomeworkType.READING]: '📖',
    [HomeworkType.RESEARCH]: '🔍',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Homework & Assignments</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage homework, assignments, and student submissions
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Create Assignment</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          All
        </button>
        {Object.values(HomeworkStatus).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {homework.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📝</div>
            <p>No homework found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {homework.map((hw) => (
              <div key={hw._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{typeIcons[hw.type]}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{hw.title}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {hw.classId?.name} • {hw.subjectId?.name}
                      </div>
                      {hw.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{hw.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColors[hw.status]}`}>
                      {hw.status}
                    </span>
                    <div className="text-sm text-gray-500 mt-2">
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </div>
                    {hw.maxScore && (
                      <div className="text-xs text-gray-400">Max Score: {hw.maxScore}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs text-gray-500">
                    By: {hw.teacherId?.firstName} {hw.teacherId?.lastName}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewSubmissions(hw)}>View Submissions</Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(hw)}>Edit</Button>
                    {hw.status === HomeworkStatus.DRAFT && (
                      <Button size="sm" onClick={() => handlePublish(hw)}>Publish</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => { setShowForm(false); resetForm(); }} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {editingHomework ? 'Edit Assignment' : 'Create Assignment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Assignment title..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Class *</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as HomeworkType })}
                  >
                    {Object.values(HomeworkType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Assignment description..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Instructions</label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Submission instructions..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Max Score</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                    min={0}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="allowLate"
                    checked={formData.allowLateSubmission}
                    onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                  />
                  <label htmlFor="allowLate" className="text-sm text-gray-700 dark:text-gray-300">Allow Late</label>
                </div>
                {formData.allowLateSubmission && (
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Late Penalty %</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      value={formData.latePenaltyPercent}
                      onChange={(e) => setFormData({ ...formData, latePenaltyPercent: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={100}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingHomework ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissions && selectedHomework && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowSubmissions(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Submissions: {selectedHomework.title}
            </h3>
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📝</div>
                <p>No submissions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-500">
                      <th className="py-2 px-3">Student</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Submitted</th>
                      <th className="py-2 px-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {submissions.map((sub) => (
                      <tr key={sub._id}>
                        <td className="py-2 px-3 font-medium">{sub.studentId?.firstName} {sub.studentId?.lastName}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            sub.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                            sub.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                            sub.status === 'LATE' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-500">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '-'}</td>
                        <td className="py-2 px-3">{sub.score !== undefined ? `${sub.score}/${sub.maxScore}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowSubmissions(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
