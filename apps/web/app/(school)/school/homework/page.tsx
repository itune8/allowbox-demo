'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
import {
  FileText,
  Plus,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Edit,
  Send,
  Type,
  BookOpen,
  GraduationCap,
  Calendar,
  AlignLeft,
  ListChecks,
  Award,
  AlertCircle,
  Percent,
  Users,
  ClipboardCheck,
  Star,
  Loader2,
} from 'lucide-react';

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
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showSubmissionsSheet, setShowSubmissionsSheet] = useState(false);

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
    setShowFormSheet(true);
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
      setShowFormSheet(false);
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
      setShowSubmissionsSheet(true);
    } catch (err) {
      setError('Failed to load submissions');
    }
  }

  // Stats
  const stats = useMemo(() => {
    const total = homework.length;
    const draft = homework.filter(h => h.status === HomeworkStatus.DRAFT).length;
    const published = homework.filter(h => h.status === HomeworkStatus.PUBLISHED).length;
    const closed = homework.filter(h => h.status === HomeworkStatus.CLOSED).length;
    return { total, draft, published, closed };
  }, [homework]);

  const statusColors: Record<HomeworkStatus, string> = {
    [HomeworkStatus.DRAFT]: 'bg-slate-50 text-slate-700 border-slate-200',
    [HomeworkStatus.PUBLISHED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [HomeworkStatus.CLOSED]: 'bg-red-50 text-red-700 border-red-200',
  };

  const typeIcons: Record<HomeworkType, any> = {
    [HomeworkType.ASSIGNMENT]: FileText,
    [HomeworkType.PROJECT]: ClipboardCheck,
    [HomeworkType.HOMEWORK]: BookOpen,
    [HomeworkType.PRACTICE]: Edit,
    [HomeworkType.READING]: BookOpen,
    [HomeworkType.RESEARCH]: FileText,
  };

  return (
    <section className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-white rounded-xl border border-red-200 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Homework & Assignments</h1>
            <p className="text-sm text-slate-500">Manage homework, assignments, and submissions</p>
          </div>
        </div>
        <Button
          onClick={() => { resetForm(); setShowFormSheet(true); }}
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Draft</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.draft}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Published</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.published}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Closed</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.closed}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">Filter:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {Object.values(HomeworkStatus).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="mt-4 text-slate-500">Loading homework...</p>
          </div>
        ) : homework.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-4">
            <FileText className="w-16 h-16 mx-auto text-slate-300" />
            <p className="text-slate-600 font-medium">No homework found</p>
            <Button onClick={() => { resetForm(); setShowFormSheet(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Assignment
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {homework.map((hw) => {
              const TypeIcon = typeIcons[hw.type];
              return (
                <div
                  key={hw._id}
                  className="p-5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {hw.title}
                        </h3>
                        <div className="text-sm text-slate-600 mb-2">
                          {hw.classId?.name} • {hw.subjectId?.name}
                        </div>
                        {hw.description && (
                          <p className="text-sm text-slate-500 line-clamp-2">{hw.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border inline-block ${statusColors[hw.status]}`}>
                        {hw.status}
                      </span>
                      <div className="text-sm text-slate-500 mt-2 flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                      </div>
                      {hw.maxScore && (
                        <div className="text-xs text-slate-400 mt-1">Max Score: {hw.maxScore}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      By: {hw.teacherId?.firstName} {hw.teacherId?.lastName}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewSubmissions(hw); }}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Submissions
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(hw); }}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {hw.status === HomeworkStatus.DRAFT && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePublish(hw); }}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Form Sheet */}
      <SlideSheet
        isOpen={showFormSheet}
        onClose={() => { setShowFormSheet(false); resetForm(); }}
        title={editingHomework ? 'Edit Assignment' : 'Create New Assignment'}
        subtitle={editingHomework ? 'Update assignment details' : 'Fill in the details below'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setShowFormSheet(false); resetForm(); }}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingHomework ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingHomework ? 'Update Assignment' : 'Create Assignment'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <SheetSection title="Basic Information" icon={<FileText className="w-4 h-4" />}>
            <SheetField label="Title" icon={<Type className="w-4 h-4" />} required>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-colors"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter assignment title..."
                required
              />
            </SheetField>

            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Class" icon={<GraduationCap className="w-4 h-4" />} required>
                <select
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-colors"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </SheetField>
              <SheetField label="Subject" icon={<BookOpen className="w-4 h-4" />} required>
                <select
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-colors"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </SheetField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SheetField label="Type" icon={<ListChecks className="w-4 h-4" />}>
                <select
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-colors"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as HomeworkType })}
                >
                  {Object.values(HomeworkType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </SheetField>
              <SheetField label="Due Date" icon={<Calendar className="w-4 h-4" />} required>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300 transition-colors"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Details Section */}
          <SheetSection title="Details" icon={<AlignLeft className="w-4 h-4" />}>
            <SheetField label="Description" icon={<AlignLeft className="w-4 h-4" />}>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-300 transition-colors resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter assignment description..."
              />
            </SheetField>

            <SheetField label="Instructions" icon={<ListChecks className="w-4 h-4" />}>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-300 transition-colors resize-none"
                rows={2}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Enter submission instructions..."
              />
            </SheetField>
          </SheetSection>

          {/* Scoring Section */}
          <SheetSection title="Scoring & Late Policy" icon={<Award className="w-4 h-4" />}>
            <div className="grid grid-cols-3 gap-4">
              <SheetField label="Max Score" icon={<Star className="w-4 h-4" />}>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-slate-300 transition-colors"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                  min={0}
                />
              </SheetField>
              <div className="flex items-end pb-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="allowLate"
                    checked={formData.allowLateSubmission}
                    onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ms-3 text-sm font-medium text-slate-700 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Allow Late
                  </span>
                </label>
              </div>
              {formData.allowLateSubmission && (
                <SheetField label="Late Penalty %" icon={<Percent className="w-4 h-4" />}>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-slate-300 transition-colors"
                    value={formData.latePenaltyPercent}
                    onChange={(e) => setFormData({ ...formData, latePenaltyPercent: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={100}
                  />
                </SheetField>
              )}
            </div>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Submissions Sheet */}
      <SlideSheet
        isOpen={showSubmissionsSheet}
        onClose={() => setShowSubmissionsSheet(false)}
        title="Student Submissions"
        subtitle={selectedHomework?.title}
        size="xl"
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setShowSubmissionsSheet(false)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        }
      >
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{submissions.length}</p>
                <p className="text-xs text-slate-500">Total Submissions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{submissions.filter(s => s.status === 'GRADED').length}</p>
                <p className="text-xs text-slate-500">Graded</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{submissions.filter(s => s.status === 'SUBMITTED').length}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <SheetSection title="All Submissions" icon={<Users className="w-4 h-4" />}>
          {submissions.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-20 h-20 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No submissions yet</p>
              <p className="text-sm text-slate-500 mt-1">Students haven't submitted their work</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200 bg-slate-50">
                      <th className="py-4 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600" />
                          Student
                        </div>
                      </th>
                      <th className="py-4 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Status
                        </div>
                      </th>
                      <th className="py-4 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          Submitted
                        </div>
                      </th>
                      <th className="py-4 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-emerald-600" />
                          Score
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => (
                      <tr
                        key={sub._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-medium">
                              {sub.studentId?.firstName?.[0]}{sub.studentId?.lastName?.[0]}
                            </div>
                            <span className="font-medium text-slate-900">{sub.studentId?.firstName} {sub.studentId?.lastName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            sub.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            sub.status === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}>
                            {sub.status === 'GRADED' && <CheckCircle className="w-3.5 h-3.5" />}
                            {sub.status === 'SUBMITTED' && <Send className="w-3.5 h-3.5" />}
                            {sub.status === 'LATE' && <AlertCircle className="w-3.5 h-3.5" />}
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {sub.score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(sub.score / (sub.maxScore || 100)) * 100}%` }}
                                />
                              </div>
                              <span className="font-semibold text-slate-900">{sub.score}/{sub.maxScore}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SheetSection>
      </SlideSheet>
    </section>
  );
}
