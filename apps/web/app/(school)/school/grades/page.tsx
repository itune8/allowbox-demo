'use client';

import { useState, useEffect } from 'react';
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
      alert('Report cards published successfully!');
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
      await loadGrades();
    } catch (err) {
      console.error('Failed to delete grade:', err);
      alert('Failed to delete grade');
    }
  }

  if (loading && classes.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grades & Report Cards</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage student grades and generate report cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetGradeForm();
              setShowGradeForm(true);
            }}
          >
            + Enter Grade
          </Button>
          <Button onClick={() => setShowReportForm(true)}>
            Publish Report Cards
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('grades')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'grades'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Grades
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Report Cards
        </button>
      </div>

      {activeTab === 'grades' && (
        <>
          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Class:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
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
              <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Subject:</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900"
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

          {/* Grades List */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            {!selectedClassId ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-3">📊</div>
                <p>Select a class to view grades.</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : grades.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-3">📝</div>
                <p>No grades recorded yet.</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    resetGradeForm();
                    setShowGradeForm(true);
                  }}
                >
                  + Enter First Grade
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-500">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Assessment</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {grades.map((grade) => (
                      <tr key={grade._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {grade.studentId?.firstName} {grade.studentId?.lastName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {grade.subjectId?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          {grade.assessmentName || grade.type}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${typeColors[grade.type]}`}>
                            {grade.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          {grade.score}/{grade.maxScore}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-lg">{grade.grade}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({grade.percentage?.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {grade.assessmentDate
                            ? new Date(grade.assessmentDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" onClick={() => handleDeleteGrade(grade)}>
                            Delete
                          </Button>
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
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500">
          <div className="text-4xl mb-3">📄</div>
          <p>Report cards feature coming soon.</p>
          <p className="text-sm mt-2">Use the "Generate Report Cards" button to create report cards for a class.</p>
        </div>
      )}

      {/* Grade Entry Modal */}
      {showGradeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Enter Grade</h2>
            </div>
            <form onSubmit={handleGradeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    required
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as GradeType })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  >
                    {Object.values(GradeType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assessment Name
                </label>
                <input
                  type="text"
                  value={formData.assessmentName}
                  onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  placeholder="e.g., Chapter 5 Quiz"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Score *
                  </label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Score *
                  </label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.assessmentDate}
                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  rows={2}
                  placeholder="Optional feedback"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGradeForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Grade'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Report Cards Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Publish Report Cards</h2>
            </div>
            <form onSubmit={handleGenerateReportCards} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class *
                </label>
                <select
                  value={reportFormData.classId}
                  onChange={(e) => setReportFormData({ ...reportFormData, classId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  required
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Term *
                </label>
                <select
                  value={reportFormData.term}
                  onChange={(e) => setReportFormData({ ...reportFormData, term: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={reportFormData.academicYear}
                  onChange={(e) => setReportFormData({ ...reportFormData, academicYear: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReportForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
