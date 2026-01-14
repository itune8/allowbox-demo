'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D, gradients } from '@/components/ui';
import { BookOpen, Loader, Award, TrendingUp, BarChart3 } from 'lucide-react';
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
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading grades...</div>
        </div>
      </div>
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
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            Grades
            <Icon3D gradient={gradients.amber} size="sm">
              <Award className="w-3.5 h-3.5" />
            </Icon3D>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
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
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Class Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 sm:gap-4 items-center flex-wrap"
      >
        <label className="text-xs sm:text-sm font-medium text-gray-700">Select Class:</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white"
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.name} ({cls.grade})
            </option>
          ))}
        </select>
      </motion.div>

      {!selectedClassId ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50/40 border border-amber-100 rounded-xl p-8 text-center"
        >
          <BookOpen className="w-12 h-12 mx-auto text-amber-300 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Select a Class</h3>
          <p className="text-gray-500">
            Choose a class from the dropdown to view and manage grades.
          </p>
        </motion.div>
      ) : loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full mx-auto"
            />
            <div className="text-gray-500 text-sm">Loading grades...</div>
          </div>
        </motion.div>
      ) : grades.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50/40 border border-amber-100 rounded-xl p-8 text-center"
        >
          <BarChart3 className="w-12 h-12 mx-auto text-amber-300 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">No Grades Yet</h3>
          <p className="text-gray-500 mb-4">
            Start by adding grades for your students' assessments.
          </p>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>Add First Grade</Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-4 sm:p-6 bg-white/95 overflow-hidden" hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 border-b border-amber-200">
                  <tr className="text-left text-gray-700">
                    <th className="py-3 px-4 font-semibold">Student</th>
                    <th className="py-3 px-4 font-semibold">Assessment</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Score</th>
                    <th className="py-3 px-4 font-semibold">Grade</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {grades.map((grade, index) => (
                      <motion.tr
                        key={grade._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="hover:bg-amber-50/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {grade.studentId?.firstName} {grade.studentId?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{grade.classId?.name}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {grade.assessmentName || grade.type}
                        </td>
                        <td className="py-3 px-4">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`px-2 py-1 rounded text-xs ${typeColors[grade.type]}`}
                          >
                            {grade.type}
                          </motion.span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {grade.score}/{grade.maxScore}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-lg text-amber-600">{grade.grade}</span>
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
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(grade)}
                            >
                              Delete
                            </Button>
                          </motion.div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Add Grade Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Icon3D gradient={gradients.amber} size="sm">
                    <Award className="w-4 h-4" />
                  </Icon3D>
                  Add Grade
                </h3>
              </motion.div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
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
                  <label className="block text-sm text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
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
                  <label className="block text-sm text-gray-700 mb-1">
                    Subject ID *
                  </label>
                  <input
                    type="text"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="Enter subject ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as GradeType })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
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
                <label className="block text-sm text-gray-700 mb-1">
                  Assessment Name
                </label>
                <input
                  type="text"
                  value={formData.assessmentName}
                  onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  placeholder="e.g., Chapter 5 Quiz"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Score *
                  </label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Max Score *
                  </label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.assessmentDate}
                    onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  placeholder="Optional feedback for the student"
                />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end gap-3 pt-4"
              >
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Grade'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
