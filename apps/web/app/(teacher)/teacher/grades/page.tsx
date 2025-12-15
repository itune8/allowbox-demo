'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import {
  gradesService,
  Grade,
  GradeType,
} from '../../../../lib/services/grades.service';
import { classService, Class } from '../../../../lib/services/class.service';
import { userService } from '../../../../lib/services/user.service';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Subject {
  _id: string;
  name: string;
  code?: string;
}

export default function TeacherGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    subjectId: '',
    type: GradeType.ASSIGNMENT,
    assessmentName: '',
    score: 0,
    maxScore: 100,
    assessmentDate: new Date().toISOString().split('T')[0] ?? '',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadGrades();
      loadStudents();
    }
  }, [selectedClassId]);

  async function loadClasses() {
    try {
      const classesData = await classService.getClasses();
      setClasses(classesData);
      if (classesData.length > 0 && !selectedClassId && classesData[0]) {
        setSelectedClassId(classesData[0]._id);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
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

  async function loadGrades() {
    if (!selectedClassId) return;
    try {
      setLoading(true);
      const data = await gradesService.getClassGrades(selectedClassId);
      setGrades(data);
    } catch (err) {
      setError('Failed to load grades');
      console.error(err);
    } finally {
      setLoading(false);
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

  function resetForm() {
    setFormData({
      studentId: '',
      classId: selectedClassId,
      subjectId: '',
      type: GradeType.ASSIGNMENT,
      assessmentName: '',
      score: 0,
      maxScore: 100,
      assessmentDate: new Date().toISOString().split('T')[0] ?? '',
      remarks: '',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.studentId || !formData.classId || !formData.subjectId) {
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
        score: formData.score,
        maxScore: formData.maxScore,
        assessmentDate: formData.assessmentDate,
        remarks: formData.remarks || undefined,
      });
      setShowAddModal(false);
      resetForm();
      await loadGrades();
    } catch (err) {
      setError('Failed to add grade');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(grade: Grade) {
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Grades</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Enter and manage student grades
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          disabled={!selectedClassId}
          className="text-xs sm:text-sm"
        >
          + <span className="hidden sm:inline">Add </span>Grade
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Class Selection */}
      <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
        <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Select Class:</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-900"
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name} ({cls.grade})
            </option>
          ))}
        </select>
      </div>

      {!selectedClassId ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Select a Class</h3>
          <p className="text-gray-500">
            Choose a class from the dropdown to view and manage grades.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : grades.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Grades Yet</h3>
          <p className="text-gray-500 mb-4">
            Start by adding grades for your students' assessments.
          </p>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>Add First Grade</Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="text-left text-gray-500">
                  <th className="py-3 px-4">Student</th>
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
                      <div className="text-xs text-gray-500">{grade.classId?.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {grade.assessmentName || grade.type}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${typeColors[grade.type]}`}>
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
                      <Button variant="outline" size="sm" onClick={() => handleDelete(grade)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Add Grade
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
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
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Subject ID *
                  </label>
                  <input
                    type="text"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    placeholder="Enter subject ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as GradeType })
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  >
                    {Object.values(GradeType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Assessment Name
                </label>
                <input
                  type="text"
                  value={formData.assessmentName}
                  onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  placeholder="e.g., Chapter 5 Quiz"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Score *
                  </label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Max Score *
                  </label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.assessmentDate}
                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  placeholder="Optional feedback for the student"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
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
    </div>
  );
}
