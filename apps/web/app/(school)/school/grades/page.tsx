'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import {
  gradesService,
  Grade,
  ReportCard,
  GradeType,
  ReportCardStatus,
} from '../../../../lib/services/grades.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { subjectService, Subject } from '../../../../lib/services/subject.service';
import { userService } from '../../../../lib/services/user.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import { Portal } from '../../../../components/portal';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Plus,
  X,
  Filter,
  Trash2,
  Award,
  ClipboardList,
  Calendar,
  TrendingUp,
  User,
  Hash,
  FileQuestion,
  MessageSquare,
  Loader2,
  Sparkles,
} from 'lucide-react';

// Enhanced Input component with icon and animations
const FormInput = ({
  icon: IconComponent,
  label,
  required,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  delay?: number;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400
          hover:border-gray-300 transition-all duration-200
          placeholder:text-gray-400`}
      />
    </div>
  </motion.div>
);

// Enhanced Select component with icon and animations
const FormSelect = ({
  icon: IconComponent,
  label,
  required,
  children,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  delay?: number;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors z-10">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <select
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400
          hover:border-gray-300 transition-all duration-200 appearance-none cursor-pointer
          disabled:bg-gray-50 disabled:cursor-not-allowed`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </motion.div>
);

// Enhanced Textarea component with icon and animations
const FormTextarea = ({
  icon: IconComponent,
  label,
  required,
  delay = 0,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  delay?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {IconComponent && (
        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-amber-500 transition-colors">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <textarea
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white/80 backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400
          hover:border-gray-300 transition-all duration-200 resize-none
          placeholder:text-gray-400`}
      />
    </div>
  </motion.div>
);

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

interface GradeFormData {
  studentId: string;
  classId: string;
  subjectId: string;
  type: GradeType;
  assessmentName: string;
  score: number | '';
  maxScore: number;
  assessmentDate: string;
  remarks: string;
}

const initialFormData: GradeFormData = {
  studentId: '',
  classId: '',
  subjectId: '',
  type: GradeType.ASSIGNMENT,
  assessmentName: '',
  score: '',
  maxScore: 100,
  assessmentDate: new Date().toISOString().split('T')[0] ?? '',
  remarks: '',
};

export default function SchoolGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [activeTab, setActiveTab] = useState<'grades' | 'reports'>('grades');

  // Form state
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState<GradeFormData>(initialFormData);
  const [reportFormData, setReportFormData] = useState({
    classId: '',
    term: 'Term 1',
    academicYear: new Date().getFullYear().toString(),
  });
  const [submitting, setSubmitting] = useState(false);

  // Detail modal
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadGrades();
      loadStudents();
    }
  }, [selectedClassId, selectedSubjectId]);

  // Stats
  const stats = useMemo(() => {
    const totalGrades = grades.length;
    const avgScore = grades.length > 0
      ? Math.round(grades.reduce((acc, g) => acc + (g.percentage || 0), 0) / grades.length)
      : 0;
    const examCount = grades.filter(g => g.type === GradeType.EXAM || g.type === GradeType.FINAL || g.type === GradeType.MIDTERM).length;
    const assignmentCount = grades.filter(g => g.type === GradeType.ASSIGNMENT || g.type === GradeType.QUIZ).length;
    return { totalGrades, avgScore, examCount, assignmentCount };
  }, [grades]);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [classesData, subjectsData] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadGrades() {
    if (!selectedClassId) return;
    try {
      setLoading(true);
      const data = await gradesService.getClassGrades(selectedClassId);
      const filtered = selectedSubjectId
        ? data.filter(g => g.subjectId?._id === selectedSubjectId)
        : data;
      setGrades(filtered);
    } catch (err) {
      console.error('Failed to load grades:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    if (!selectedClassId) return;
    try {
      const usersData = await userService.getStudents();
      setStudents(usersData as Student[]);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  }

  const typeColors: Record<GradeType, string> = {
    [GradeType.EXAM]: 'bg-purple-100 text-purple-700',
    [GradeType.QUIZ]: 'bg-blue-100 text-blue-700',
    [GradeType.ASSIGNMENT]: 'bg-green-100 text-green-700',
    [GradeType.PROJECT]: 'bg-orange-100 text-orange-700',
    [GradeType.PRACTICAL]: 'bg-cyan-100 text-cyan-700',
    [GradeType.PARTICIPATION]: 'bg-pink-100 text-pink-700',
    [GradeType.MIDTERM]: 'bg-yellow-100 text-yellow-700',
    [GradeType.FINAL]: 'bg-red-100 text-red-700',
  };

  const statusColors: Record<ReportCardStatus, string> = {
    [ReportCardStatus.DRAFT]: 'bg-yellow-100 text-yellow-700',
    [ReportCardStatus.PUBLISHED]: 'bg-green-100 text-green-700',
    [ReportCardStatus.ARCHIVED]: 'bg-gray-100 text-gray-700',
  };

  function resetGradeForm() {
    setFormData({
      ...initialFormData,
      classId: selectedClassId,
    });
  }

  async function handleGradeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.studentId || !formData.classId || !formData.subjectId || formData.score === '') {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await gradesService.createGrade({
        studentId: formData.studentId,
        classId: formData.classId,
        subjectId: formData.subjectId,
        type: formData.type,
        assessmentName: formData.assessmentName || undefined,
        score: Number(formData.score),
        maxScore: formData.maxScore,
        assessmentDate: formData.assessmentDate,
        remarks: formData.remarks || undefined,
      });
      setShowGradeForm(false);
      resetGradeForm();
      setBanner('Grade saved successfully!');
      setTimeout(() => setBanner(null), 3000);
      await loadGrades();
    } catch (err) {
      console.error('Failed to save grade:', err);
      alert('Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateReportCards(e: React.FormEvent) {
    e.preventDefault();
    if (!reportFormData.classId) {
      alert('Please select a class');
      return;
    }

    setSubmitting(true);
    try {
      await gradesService.publishReportCards(
        reportFormData.classId,
        reportFormData.academicYear,
        reportFormData.term,
      );
      setShowReportForm(false);
      setBanner('Report cards published successfully!');
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      console.error('Failed to publish report cards:', err);
      alert('Failed to publish report cards');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteGrade(grade: Grade) {
    if (!confirm('Are you sure you want to delete this grade?')) return;
    try {
      await gradesService.deleteGrade(grade._id);
      setBanner('Grade deleted successfully!');
      setTimeout(() => setBanner(null), 3000);
      await loadGrades();
    } catch (err) {
      console.error('Failed to delete grade:', err);
      alert('Failed to delete grade');
    }
  }

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="glass-strong rounded-xl border border-green-200 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">{banner}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
          <Icon3D gradient="from-amber-500 to-orange-500" size="lg">
            <GraduationCap className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grades & Report Cards</h1>
            <p className="text-sm text-gray-500">Manage student grades and generate report cards</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={() => {
                resetGradeForm();
                setShowGradeForm(true);
              }}
              className="shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Enter Grade
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => setShowReportForm(true)} className="shadow-lg shadow-indigo-500/25">
              <FileText className="w-4 h-4 mr-2" />
              Publish Reports
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Grades"
          value={stats.totalGrades}
          icon={<ClipboardList className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Average Score"
          value={`${stats.avgScore}%`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Exams"
          value={stats.examCount}
          icon={<Award className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-50"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Assignments"
          value={stats.assignmentCount}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-50"
          delay={0.3}
        />
      </div>

      {/* Tabs */}
      <GlassCard hover={false} className="p-1">
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('grades')}
            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'grades'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Grades
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('reports')}
            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Report Cards
          </motion.button>
        </div>
      </GlassCard>

      {activeTab === 'grades' && (
        <>
          {/* Filters */}
          <GlassCard hover={false} className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-sm text-gray-600 mr-2">Class:</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-300 transition-all"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} ({cls.grade})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mr-2">Subject:</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-300 transition-all"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Grades List */}
          <GlassCard hover={false} className="overflow-hidden">
            {!selectedClassId ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <ClipboardList className="mx-auto w-16 h-16 text-gray-300" />
                </motion.div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Class</h3>
                <p className="mt-2 text-sm text-gray-500">Choose a class to view and manage grades.</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full"
                />
                <p className="mt-4 text-gray-500">Loading grades...</p>
              </div>
            ) : grades.length === 0 ? (
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <GraduationCap className="mx-auto w-16 h-16 text-gray-300" />
                </motion.div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No grades recorded</h3>
                <p className="mt-2 text-sm text-gray-500">Start by entering the first grade.</p>
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      resetGradeForm();
                      setShowGradeForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Enter First Grade
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
                    <tr className="text-left">
                      <th className="py-4 px-4 font-semibold text-gray-700">Student</th>
                      <th className="py-4 px-4 font-semibold text-gray-700">Subject</th>
                      <th className="py-4 px-4 font-semibold text-gray-700">Assessment</th>
                      <th className="py-4 px-4 font-semibold text-gray-700">Type</th>
                      <th className="py-4 px-4 font-semibold text-gray-700">Score</th>
                      <th className="py-4 px-4 font-semibold text-gray-700">Grade</th>
                      <th className="py-4 px-4 font-semibold text-gray-700">Date</th>
                      <th className="py-4 px-4 font-semibold text-gray-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grades.map((grade, index) => (
                      <motion.tr
                        key={grade._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                        className="group transition-all"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-amber-500/20">
                              {grade.studentId?.firstName?.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                              {grade.studentId?.firstName} {grade.studentId?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {grade.subjectId?.name || '-'}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {grade.assessmentName || grade.type}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${typeColors[grade.type]}`}>
                            {grade.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-900 font-medium">
                          {grade.score}/{grade.maxScore}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-amber-600">{grade.grade}</span>
                            <span className="text-xs text-gray-500">
                              ({grade.percentage?.toFixed(0)}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-500 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {grade.assessmentDate
                              ? new Date(grade.assessmentDate).toLocaleDateString()
                              : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete"
                            className="p-2 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteGrade(grade)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </>
      )}

      {activeTab === 'reports' && (
        <GlassCard hover={false} className="py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <FileText className="mx-auto w-16 h-16 text-gray-300" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Report Cards Coming Soon</h3>
          <p className="mt-2 text-sm text-gray-500">
            Use the "Publish Reports" button to generate report cards for a class.
          </p>
        </GlassCard>
      )}

      {/* Grade Entry Modal */}
      <AnimatePresence>
        {showGradeForm && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto pt-10 pb-10"
              onClick={() => setShowGradeForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gradient Header */}
                <div className="sticky top-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-5 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                      >
                        <Plus className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <motion.h2
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-xl font-bold text-white"
                        >
                          Enter Grade
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-white/80 text-sm"
                        >
                          Record student assessment results
                        </motion.p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowGradeForm(false)}
                      className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <form onSubmit={handleGradeSubmit} className="p-6">
                  {/* Section: Student & Class */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                        <User className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Student & Class</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                      <FormSelect
                        icon={BookOpen}
                        label="Class"
                        required
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        delay={0.1}
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name} ({cls.grade})
                          </option>
                        ))}
                      </FormSelect>
                      <FormSelect
                        icon={User}
                        label="Student"
                        required
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        delay={0.15}
                      >
                        <option value="">Select Student</option>
                        {students.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                  </motion.div>

                  {/* Section: Assessment Details */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-purple-500 to-pink-500" size="sm">
                        <ClipboardList className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Assessment Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                      <FormSelect
                        icon={BookOpen}
                        label="Subject"
                        required
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        delay={0.1}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </FormSelect>
                      <FormSelect
                        icon={FileQuestion}
                        label="Type"
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as GradeType })}
                        delay={0.15}
                      >
                        {Object.values(GradeType).map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </FormSelect>
                      <div className="md:col-span-2">
                        <FormInput
                          icon={FileText}
                          label="Assessment Name"
                          type="text"
                          value={formData.assessmentName}
                          onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
                          placeholder="e.g., Chapter 5 Quiz"
                          delay={0.2}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Section: Score */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-emerald-500 to-teal-500" size="sm">
                        <Award className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Score & Date</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-10">
                      <FormInput
                        icon={Hash}
                        label="Score"
                        type="number"
                        required
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: e.target.value ? Number(e.target.value) : '' })}
                        min={0}
                        delay={0.1}
                      />
                      <FormInput
                        icon={TrendingUp}
                        label="Max Score"
                        type="number"
                        required
                        value={formData.maxScore}
                        onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                        min={1}
                        delay={0.15}
                      />
                      <FormInput
                        icon={Calendar}
                        label="Date"
                        type="date"
                        value={formData.assessmentDate}
                        onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                        delay={0.2}
                      />
                    </div>
                  </motion.div>

                  {/* Section: Remarks */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-orange-500 to-amber-500" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Remarks</h3>
                    </div>
                    <div className="pl-10">
                      <FormTextarea
                        icon={MessageSquare}
                        label="Feedback"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        rows={2}
                        placeholder="Optional feedback for the student"
                        delay={0.1}
                      />
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-end gap-3 pt-4 border-t border-gray-100"
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowGradeForm(false)}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Save Grade
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Publish Report Cards Modal */}
      <AnimatePresence>
        {showReportForm && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto pt-10 pb-10"
              onClick={() => setShowReportForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gradient Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                      >
                        <FileText className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <motion.h2
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-xl font-bold text-white"
                        >
                          Publish Report Cards
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-white/80 text-sm"
                        >
                          Generate and publish report cards
                        </motion.p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowReportForm(false)}
                      className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <form onSubmit={handleGenerateReportCards} className="p-6">
                  {/* Section: Class Selection */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-blue-500 to-cyan-500" size="sm">
                        <BookOpen className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Class Selection</h3>
                    </div>
                    <div className="pl-10">
                      <FormSelect
                        icon={BookOpen}
                        label="Class"
                        required
                        value={reportFormData.classId}
                        onChange={(e) => setReportFormData({ ...reportFormData, classId: e.target.value })}
                        delay={0.1}
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name} ({cls.grade})
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                  </motion.div>

                  {/* Section: Term & Year */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon3D gradient="from-purple-500 to-pink-500" size="sm">
                        <Calendar className="w-4 h-4" />
                      </Icon3D>
                      <h3 className="font-semibold text-gray-900">Term & Academic Year</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 pl-10">
                      <FormSelect
                        icon={ClipboardList}
                        label="Term"
                        required
                        value={reportFormData.term}
                        onChange={(e) => setReportFormData({ ...reportFormData, term: e.target.value })}
                        delay={0.1}
                      >
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                        <option value="Annual">Annual</option>
                      </FormSelect>
                      <FormInput
                        icon={Calendar}
                        label="Academic Year"
                        type="text"
                        value={reportFormData.academicYear}
                        onChange={(e) => setReportFormData({ ...reportFormData, academicYear: e.target.value })}
                        placeholder="e.g., 2024-2025"
                        delay={0.15}
                      />
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-end gap-3 pt-4 border-t border-gray-100"
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReportForm(false)}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Publishing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Publish Reports
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
