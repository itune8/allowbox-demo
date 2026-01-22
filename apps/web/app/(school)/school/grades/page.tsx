'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { SlideSheet, SheetSection, SheetField, SheetDetailRow } from '@/components/ui';
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
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Professional Input component
const FormInput = ({
  icon: IconComponent,
  label,
  required,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <input
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-slate-300 transition-colors
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          placeholder:text-slate-400`}
      />
    </div>
  </div>
);

// Professional Select component
const FormSelect = ({
  icon: IconComponent,
  label,
  required,
  children,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <select
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-3'} pr-10 py-2.5 border border-slate-200 rounded-lg text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-slate-300 transition-colors appearance-none cursor-pointer
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

// Professional Textarea component
const FormTextarea = ({
  icon: IconComponent,
  label,
  required,
  ...props
}: {
  icon?: any;
  label: string;
  required?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {IconComponent && (
        <div className="absolute left-3 top-3 text-slate-400">
          <IconComponent className="w-4 h-4" />
        </div>
      )}
      <textarea
        {...props}
        className={`w-full ${IconComponent ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-slate-300 transition-colors resize-none
          placeholder:text-slate-400`}
      />
    </div>
  </div>
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
  const [showGradeSheet, setShowGradeSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [formData, setFormData] = useState<GradeFormData>(initialFormData);
  const [reportFormData, setReportFormData] = useState({
    classId: '',
    term: 'Term 1',
    academicYear: new Date().getFullYear().toString(),
  });
  const [submitting, setSubmitting] = useState(false);

  // Detail sheet
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
    [GradeType.ASSIGNMENT]: 'bg-emerald-100 text-emerald-700',
    [GradeType.PROJECT]: 'bg-amber-100 text-amber-700',
    [GradeType.PRACTICAL]: 'bg-cyan-100 text-cyan-700',
    [GradeType.PARTICIPATION]: 'bg-pink-100 text-pink-700',
    [GradeType.MIDTERM]: 'bg-yellow-100 text-yellow-700',
    [GradeType.FINAL]: 'bg-red-100 text-red-700',
  };

  const statusColors: Record<ReportCardStatus, string> = {
    [ReportCardStatus.DRAFT]: 'bg-amber-100 text-amber-700',
    [ReportCardStatus.PUBLISHED]: 'bg-emerald-100 text-emerald-700',
    [ReportCardStatus.ARCHIVED]: 'bg-slate-100 text-slate-700',
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
      setShowGradeSheet(false);
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
      setShowReportSheet(false);
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
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Success Banner */}
      {banner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-emerald-800 font-medium text-sm">{banner}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-red-800 font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Grades & Report Cards</h1>
            <p className="text-sm text-slate-600">Manage student grades and generate report cards</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetGradeForm();
              setShowGradeSheet(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Enter Grade
          </Button>
          <Button onClick={() => setShowReportSheet(true)} className="bg-primary hover:bg-primary-dark">
            <FileText className="w-4 h-4 mr-2" />
            Publish Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Total Grades</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalGrades}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Average Score</p>
              <p className="text-2xl font-bold text-slate-900">{stats.avgScore}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Exams</p>
              <p className="text-2xl font-bold text-slate-900">{stats.examCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Assignments</p>
              <p className="text-2xl font-bold text-slate-900">{stats.assignmentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'grades'
                ? 'bg-blue-500 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Grades
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-blue-500 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Report Cards
          </button>
        </div>
      </div>

      {activeTab === 'grades' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-sm text-slate-600 mr-2">Class:</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  <label className="text-sm text-slate-600 mr-2">Subject:</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
          </div>

          {/* Grades List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {!selectedClassId ? (
              <div className="p-12 text-center">
                <ClipboardList className="mx-auto w-16 h-16 text-slate-300" />
                <h3 className="mt-4 text-lg font-medium text-slate-900">Select a Class</h3>
                <p className="mt-2 text-sm text-slate-500">Choose a class to view and manage grades.</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="mt-4 text-slate-500">Loading grades...</p>
              </div>
            ) : grades.length === 0 ? (
              <div className="p-12 text-center">
                <GraduationCap className="mx-auto w-16 h-16 text-slate-300" />
                <h3 className="mt-4 text-lg font-medium text-slate-900">No grades recorded</h3>
                <p className="mt-2 text-sm text-slate-500">Start by entering the first grade.</p>
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      resetGradeForm();
                      setShowGradeSheet(true);
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
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left">
                      <th className="py-3 px-4 font-semibold text-slate-700">Student</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Subject</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Assessment</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Type</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Score</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Grade</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Date</th>
                      <th className="py-3 px-4 font-semibold text-slate-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grades.map((grade) => (
                      <tr
                        key={grade._id}
                        className="group hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {grade.studentId?.firstName?.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-900">
                              {grade.studentId?.firstName} {grade.studentId?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {grade.subjectId?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-900">
                          {grade.assessmentName || grade.type}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${typeColors[grade.type]}`}>
                            {grade.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-medium">
                          {grade.score}/{grade.maxScore}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-blue-600">{grade.grade}</span>
                            <span className="text-xs text-slate-500">
                              ({grade.percentage?.toFixed(0)}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {grade.assessmentDate
                              ? new Date(grade.assessmentDate).toLocaleDateString()
                              : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            title="Delete"
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteGrade(grade)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <FileText className="mx-auto w-16 h-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Report Cards Coming Soon</h3>
          <p className="mt-2 text-sm text-slate-500">
            Use the "Publish Reports" button to generate report cards for a class.
          </p>
        </div>
      )}

      {/* Grade Entry Sheet */}
      <SlideSheet
        isOpen={showGradeSheet}
        onClose={() => setShowGradeSheet(false)}
        title="Enter Grade"
        subtitle="Record student assessment results"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGradeSheet(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 bg-primary hover:bg-primary-dark"
              onClick={handleGradeSubmit}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Save Grade
                </span>
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGradeSubmit} className="space-y-6">
          {/* Section: Student & Class */}
          <SheetSection icon={<User className="w-4 h-4 text-slate-500" />} title="Student & Class">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SheetField label="Class" required>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} ({cls.grade})
                    </option>
                  ))}
                </select>
              </SheetField>
              <SheetField label="Student" required>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </SheetField>
            </div>
          </SheetSection>

          {/* Section: Assessment Details */}
          <SheetSection icon={<ClipboardList className="w-4 h-4 text-slate-500" />} title="Assessment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SheetField label="Subject" required>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </SheetField>
              <SheetField label="Type" required>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as GradeType })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors"
                  required
                >
                  {Object.values(GradeType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </SheetField>
              <div className="md:col-span-2">
                <SheetField label="Assessment Name">
                  <input
                    type="text"
                    value={formData.assessmentName}
                    onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
                    placeholder="e.g., Chapter 5 Quiz"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      hover:border-slate-300 transition-colors placeholder:text-slate-400"
                  />
                </SheetField>
              </div>
            </div>
          </SheetSection>

          {/* Section: Score */}
          <SheetSection icon={<Award className="w-4 h-4 text-slate-500" />} title="Score & Date">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SheetField label="Score" required>
                <input
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value ? Number(e.target.value) : '' })}
                  min={0}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors"
                  required
                />
              </SheetField>
              <SheetField label="Max Score" required>
                <input
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                  min={1}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors"
                  required
                />
              </SheetField>
              <SheetField label="Date">
                <input
                  type="date"
                  value={formData.assessmentDate}
                  onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors"
                />
              </SheetField>
            </div>
          </SheetSection>

          {/* Section: Remarks */}
          <SheetSection icon={<MessageSquare className="w-4 h-4 text-slate-500" />} title="Remarks">
            <SheetField label="Feedback">
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={2}
                placeholder="Optional feedback for the student"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  hover:border-slate-300 transition-colors resize-none placeholder:text-slate-400"
              />
            </SheetField>
          </SheetSection>
        </form>
      </SlideSheet>

      {/* Publish Report Cards Sheet */}
      <SlideSheet
        isOpen={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        title="Publish Report Cards"
        subtitle="Generate and publish report cards"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReportSheet(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 bg-primary hover:bg-primary-dark"
              onClick={handleGenerateReportCards}
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
          </div>
        }
      >
        <form onSubmit={handleGenerateReportCards} className="space-y-6">
          {/* Section: Class Selection */}
          <SheetSection icon={<BookOpen className="w-4 h-4 text-slate-500" />} title="Class Selection">
            <SheetField label="Class" required>
              <select
                value={reportFormData.classId}
                onChange={(e) => setReportFormData({ ...reportFormData, classId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  hover:border-slate-300 transition-colors"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.grade})
                  </option>
                ))}
              </select>
            </SheetField>
          </SheetSection>

          {/* Section: Term & Year */}
          <SheetSection icon={<Calendar className="w-4 h-4 text-slate-500" />} title="Term & Academic Year">
            <div className="space-y-4">
              <SheetField label="Term" required>
                <select
                  value={reportFormData.term}
                  onChange={(e) => setReportFormData({ ...reportFormData, term: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors"
                  required
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                  <option value="Annual">Annual</option>
                </select>
              </SheetField>
              <SheetField label="Academic Year">
                <input
                  type="text"
                  value={reportFormData.academicYear}
                  onChange={(e) => setReportFormData({ ...reportFormData, academicYear: e.target.value })}
                  placeholder="e.g., 2024-2025"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    hover:border-slate-300 transition-colors placeholder:text-slate-400"
                />
              </SheetField>
            </div>
          </SheetSection>
        </form>
      </SlideSheet>
    </section>
  );
}
