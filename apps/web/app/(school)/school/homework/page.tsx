'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
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
  Sparkles,
  Users,
  ClipboardCheck,
  Star,
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

  // Stats
  const stats = useMemo(() => {
    const total = homework.length;
    const draft = homework.filter(h => h.status === HomeworkStatus.DRAFT).length;
    const published = homework.filter(h => h.status === HomeworkStatus.PUBLISHED).length;
    const closed = homework.filter(h => h.status === HomeworkStatus.CLOSED).length;
    return { total, draft, published, closed };
  }, [homework]);

  const statusColors: Record<HomeworkStatus, string> = {
    [HomeworkStatus.DRAFT]: 'bg-gray-100 text-gray-700 border-gray-200',
    [HomeworkStatus.PUBLISHED]: 'bg-green-100 text-green-700 border-green-200',
    [HomeworkStatus.CLOSED]: 'bg-red-100 text-red-700 border-red-200',
  };

  const typeIcons: Record<HomeworkType, string> = {
    [HomeworkType.ASSIGNMENT]: '📝',
    [HomeworkType.PROJECT]: '🎯',
    [HomeworkType.HOMEWORK]: '📚',
    [HomeworkType.PRACTICE]: '✏️',
    [HomeworkType.READING]: '📖',
    [HomeworkType.RESEARCH]: '🔍',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong rounded-xl border border-red-200 px-4 py-3 text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D gradient="from-rose-500 to-pink-500" size="lg">
            <FileText className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Homework & Assignments</h1>
            <p className="text-sm text-gray-500">Manage homework, assignments, and submissions</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="shadow-lg shadow-indigo-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total"
          value={stats.total}
          icon={<FileText className="w-5 h-5" />}
          gradient="from-rose-500 to-pink-500"
          delay={0}
        />
        <AnimatedStatCard
          title="Draft"
          value={stats.draft}
          icon={<Clock className="w-5 h-5" />}
          gradient="from-gray-500 to-slate-500"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Published"
          value={stats.published}
          icon={<CheckCircle className="w-5 h-5" />}
          gradient="from-green-500 to-emerald-500"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Closed"
          value={stats.closed}
          icon={<XCircle className="w-5 h-5" />}
          gradient="from-red-500 to-rose-500"
          delay={0.3}
        />
      </div>

      {/* Filter */}
      <GlassCard hover={false} className="p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Filter:</span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === ''
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </motion.button>
            {Object.values(HomeworkStatus).map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-white/60 text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status}
              </motion.button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Homework List */}
      <GlassCard hover={false} className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-gray-500">Loading homework...</p>
          </div>
        ) : homework.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <FileText className="w-16 h-16 mx-auto text-gray-300" />
            </motion.div>
            <p>No homework found</p>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Assignment
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {homework.map((hw, index) => (
              <motion.div
                key={hw._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                className="p-4 cursor-pointer group transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <motion.span
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="text-3xl"
                    >
                      {typeIcons[hw.type]}
                    </motion.span>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {hw.title}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {hw.classId?.name} • {hw.subjectId?.name}
                      </div>
                      {hw.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{hw.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[hw.status]}`}>
                      {hw.status}
                    </span>
                    <div className="text-sm text-gray-500 mt-2">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </div>
                    {hw.maxScore && (
                      <div className="text-xs text-gray-400 mt-1">Max Score: {hw.maxScore}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    By: {hw.teacherId?.firstName} {hw.teacherId?.lastName}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleViewSubmissions(hw); }}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Submissions
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleEdit(hw); }}
                      className="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </motion.button>
                    {hw.status === HomeworkStatus.DRAFT && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handlePublish(hw); }}
                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Publish
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => { setShowForm(false); resetForm(); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Gradient Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative px-6 py-5 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                }}
              >
                {/* Animated background particles */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    backgroundSize: '100% 100%',
                  }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30"
                        style={{
                          transform: 'perspective(100px) rotateX(5deg) rotateY(-5deg)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                        }}
                      >
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-1 rounded-2xl bg-white/20 blur-md -z-10"
                      />
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold text-white"
                      >
                        {editingHomework ? 'Edit Assignment' : 'Create New Assignment'}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-white/80"
                      >
                        {editingHomework ? 'Update assignment details' : 'Fill in the details below'}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all border border-white/30"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Form Content */}
              <div className="px-6 py-5 max-h-[calc(90vh-180px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-indigo-500 to-purple-500" size="sm">
                        <FileText className="w-4 h-4" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Type className="w-4 h-4 text-indigo-500" />
                          Title <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 hover:border-gray-300"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter assignment title..."
                            required
                          />
                          <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <GraduationCap className="w-4 h-4 text-indigo-500" />
                            Class <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm appearance-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 hover:border-gray-300"
                              style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                              }}
                              value={formData.classId}
                              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                              required
                            >
                              <option value="">Select Class</option>
                              {classes.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                              ))}
                            </select>
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm appearance-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 hover:border-gray-300"
                              style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                              }}
                              value={formData.subjectId}
                              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                              required
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((s) => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                              ))}
                            </select>
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <ListChecks className="w-4 h-4 text-indigo-500" />
                            Type
                          </label>
                          <div className="relative">
                            <select
                              className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm appearance-none transition-all duration-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 hover:border-gray-300"
                              style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                              }}
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as HomeworkType })}
                            >
                              {Object.values(HomeworkType).map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            <ListChecks className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            Due Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 hover:border-gray-300"
                              style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                              }}
                              value={formData.dueDate}
                              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                              required
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Details Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4 border-t border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                        <AlignLeft className="w-4 h-4" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Details</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <AlignLeft className="w-4 h-4 text-emerald-500" />
                          Description
                        </label>
                        <div className="relative">
                          <textarea
                            className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 hover:border-gray-300 resize-none"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }}
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter assignment description..."
                          />
                          <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <ListChecks className="w-4 h-4 text-emerald-500" />
                          Instructions
                        </label>
                        <div className="relative">
                          <textarea
                            className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 hover:border-gray-300 resize-none"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }}
                            rows={2}
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            placeholder="Enter submission instructions..."
                          />
                          <ListChecks className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Scoring Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 border-t border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-amber-500 to-orange-500" size="sm">
                        <Award className="w-4 h-4" />
                      </Icon3D>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Scoring & Late Policy</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Star className="w-4 h-4 text-amber-500" />
                          Max Score
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 hover:border-gray-300"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                            }}
                            value={formData.maxScore}
                            onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                            min={0}
                          />
                          <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="allowLate"
                            checked={formData.allowLateSubmission}
                            onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500"></div>
                          <span className="ms-3 text-sm font-medium text-gray-700 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            Allow Late
                          </span>
                        </label>
                      </div>
                      <AnimatePresence>
                        {formData.allowLateSubmission && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <Percent className="w-4 h-4 text-amber-500" />
                              Late Penalty %
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                className="w-full border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 hover:border-gray-300"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  backdropFilter: 'blur(10px)',
                                }}
                                value={formData.latePenaltyPercent}
                                onChange={(e) => setFormData({ ...formData, latePenaltyPercent: parseInt(e.target.value) || 0 })}
                                min={0}
                                max={100}
                              />
                              <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </form>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-6 py-4 border-t border-gray-100"
                style={{
                  background: 'rgba(249, 250, 251, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    {submitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingHomework ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingHomework ? 'Update Assignment' : 'Create Assignment'}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submissions Modal */}
      <AnimatePresence>
        {showSubmissions && selectedHomework && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowSubmissions(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Gradient Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative px-6 py-5 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
                }}
              >
                {/* Animated background particles */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                  style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    backgroundSize: '100% 100%',
                  }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30"
                        style={{
                          transform: 'perspective(100px) rotateX(5deg) rotateY(-5deg)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                        }}
                      >
                        <ClipboardCheck className="w-7 h-7 text-white" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-1 rounded-2xl bg-white/20 blur-md -z-10"
                      />
                    </motion.div>
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold text-white"
                      >
                        Student Submissions
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-white/80 line-clamp-1"
                      >
                        {selectedHomework.title}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSubmissions(false)}
                    className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all border border-white/30"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Content */}
              <div className="px-6 py-5 max-h-[calc(90vh-180px)] overflow-y-auto">
                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-3 gap-4 mb-6"
                >
                  <div className="p-4 rounded-xl border border-gray-100"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                        <p className="text-xs text-gray-500">Total Submissions</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{submissions.filter(s => s.status === 'GRADED').length}</p>
                        <p className="text-xs text-gray-500">Graded</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{submissions.filter(s => s.status === 'SUBMITTED').length}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Table Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                      <Users className="w-4 h-4" />
                    </Icon3D>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">All Submissions</h4>
                  </div>

                  {submissions.length === 0 ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-12 rounded-2xl border border-gray-100"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      >
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                          <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                      </motion.div>
                      <p className="text-gray-500 font-medium">No submissions yet</p>
                      <p className="text-sm text-gray-400 mt-1">Students haven't submitted their work</p>
                    </motion.div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-100"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left border-b border-gray-100"
                              style={{
                                background: 'rgba(249, 250, 251, 0.8)',
                              }}
                            >
                              <th className="py-4 px-4 font-semibold text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-emerald-500" />
                                  Student
                                </div>
                              </th>
                              <th className="py-4 px-4 font-semibold text-gray-700">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  Status
                                </div>
                              </th>
                              <th className="py-4 px-4 font-semibold text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-emerald-500" />
                                  Submitted
                                </div>
                              </th>
                              <th className="py-4 px-4 font-semibold text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-emerald-500" />
                                  Score
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {submissions.map((sub, index) => (
                              <motion.tr
                                key={sub._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                                className="transition-all"
                              >
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                      {sub.studentId?.firstName?.[0]}{sub.studentId?.lastName?.[0]}
                                    </div>
                                    <span className="font-medium text-gray-900">{sub.studentId?.firstName} {sub.studentId?.lastName}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                      sub.status === 'GRADED' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' :
                                      sub.status === 'SUBMITTED' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200' :
                                      sub.status === 'LATE' ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200' :
                                      'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200'
                                    }`}
                                  >
                                    {sub.status === 'GRADED' && <CheckCircle className="w-3.5 h-3.5" />}
                                    {sub.status === 'SUBMITTED' && <Send className="w-3.5 h-3.5" />}
                                    {sub.status === 'LATE' && <AlertCircle className="w-3.5 h-3.5" />}
                                    {sub.status}
                                  </motion.span>
                                </td>
                                <td className="py-4 px-4 text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '-'}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  {sub.score !== undefined ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(sub.score / (sub.maxScore || 100)) * 100}%` }}
                                          transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
                                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                        />
                                      </div>
                                      <span className="font-semibold text-gray-900">{sub.score}/{sub.maxScore}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-6 py-4 border-t border-gray-100"
                style={{
                  background: 'rgba(249, 250, 251, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSubmissions(false)}
                    className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <X className="w-4 h-4" />
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
