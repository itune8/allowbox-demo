'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../../contexts/auth-context';
import {
  gradesService,
  Grade,
  ReportCard,
} from '../../../../lib/services/grades.service';
import { userService, User } from '../../../../lib/services/user.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import { GraduationCap, Trophy, Target, Award, X } from 'lucide-react';

interface Child extends User {
  classId?: { _id: string; name: string; grade?: string };
}

export default function ParentGradesPage() {
  const { user: authUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);

  useEffect(() => {
    if (authUser?.id) {
      loadChildren();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedChild) {
      loadGradesForChild(selectedChild._id || selectedChild.id);
    }
  }, [selectedChild]);

  async function loadChildren() {
    try {
      setLoading(true);
      setError(null);

      // First, get the parent's full user data to access children array
      const parentData = await userService.getUserById(authUser!.id);

      if (parentData?.children && parentData.children.length > 0) {
        // Children might be populated objects or just IDs
        const childrenData = await Promise.all(
          parentData.children.map((child: any) => {
            const childId = typeof child === 'string' ? child : (child._id || child.id);
            return userService.getUserById(childId);
          })
        );
        setChildren(childrenData as Child[]);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0] as Child);
        }
      } else {
        // Try to find children by parent email or parent ID
        const students = await userService.getStudents();
        const myChildren = students.filter(
          (s: User) => s.parents?.includes(parentData._id || parentData.id) || s.parentEmail === authUser?.email
        );
        setChildren(myChildren as Child[]);
        if (myChildren.length > 0) {
          setSelectedChild(myChildren[0] as Child);
        }
      }
    } catch (err) {
      console.error('Failed to load children:', err);
      setError('Failed to load children data');
    } finally {
      setLoading(false);
    }
  }

  async function loadGradesForChild(childId: string) {
    try {
      setLoading(true);
      const [gradesData, reportCardsData] = await Promise.all([
        gradesService.getStudentGrades(childId),
        gradesService.getStudentReportCards(childId),
      ]);
      setGrades(gradesData);
      setReportCards(reportCardsData);
    } catch (err) {
      console.error('Failed to load grades:', err);
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  }

  const gradeColors: Record<string, string> = {
    'A+': 'text-green-600',
    'A': 'text-green-600',
    'B+': 'text-blue-600',
    'B': 'text-blue-600',
    'C': 'text-yellow-600',
    'D': 'text-orange-600',
    'F': 'text-red-600',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading grades...</p>
        </motion.div>
      </div>
    );
  }

  if (children.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Icon3D gradient="from-amber-500 to-orange-500">
            <GraduationCap className="w-5 h-5" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grades & Report Cards</h1>
            <p className="text-sm text-gray-600 mt-1">
              View your child's academic performance
            </p>
          </div>
        </motion.div>
        <GlassCard className="p-8 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <h3 className="font-semibold text-gray-900 mb-2">No Children Linked</h3>
          <p className="text-gray-500">
            No children are linked to your account. Please contact the school administrator.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="min-w-0 flex items-center gap-3">
          <Icon3D gradient="from-amber-500 to-orange-500">
            <GraduationCap className="w-5 h-5" />
          </Icon3D>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Grades & Results</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              View your child's academic performance
            </p>
          </div>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-200 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900 min-w-0 max-w-[120px] sm:max-w-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
            value={selectedChild?._id || selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find((c) => (c._id || c.id) === e.target.value);
              setSelectedChild(child || null);
            }}
          >
            {children.map((child) => (
              <option key={child._id || child.id} value={child._id || child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        )}
      </motion.div>

      {selectedChild && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0">
                {selectedChild.firstName?.[0]}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {selectedChild.firstName} {selectedChild.lastName}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                  {selectedChild.classId?.name || 'No class assigned'}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {reportCards.length === 0 && grades.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">No Grades Yet</h3>
            <p className="text-gray-500">
              Your child's grades and report cards will appear here once published by the school.
            </p>
          </GlassCard>
        </motion.div>
      ) : (
        <>
          {reportCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard>
                <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-gray-900">Report Cards</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {reportCards.map((report, idx) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="p-4 hover:bg-amber-50/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {report.term} - {report.academicYear}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.classId?.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${gradeColors[report.overallGrade] || ''}`}>
                            {report.overallGrade}
                          </div>
                          <div className="text-sm text-gray-500">{report.percentage?.toFixed(1)}%</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {grades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard>
                <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Recent Grades</h2>
                </div>
                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {grades.map((grade, idx) => (
                    <motion.div
                      key={grade._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className="p-3 active:bg-amber-50/30 transition-colors"
                    >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {grade.assessmentName || grade.type}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{grade.subjectId?.name}</div>
                      </div>
                      <span className={`font-bold text-lg ml-2 ${gradeColors[grade.grade] || ''}`}>
                        {grade.grade}
                      </span>
                    </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Score: {grade.score}/{grade.maxScore}</span>
                        <span>{grade.assessmentDate ? new Date(grade.assessmentDate).toLocaleDateString() : '-'}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                      <tr className="text-left text-gray-500">
                        <th className="py-3 px-4">Assessment</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Grade</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {grades.map((grade, idx) => (
                        <motion.tr
                          key={grade._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          className="hover:bg-amber-50/30 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {grade.assessmentName || grade.type}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {grade.subjectId?.name}
                          </td>
                          <td className="py-3 px-4">
                            {grade.score}/{grade.maxScore}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${gradeColors[grade.grade] || ''}`}>
                              {grade.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {grade.assessmentDate
                              ? new Date(grade.assessmentDate).toLocaleDateString()
                              : '-'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </>
      )}

      {/* Report Card Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedReport(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Report Card
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedReport.term} - {selectedReport.academicYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Info */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border border-amber-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Student</div>
                    <div className="font-medium text-gray-900">{selectedReport.studentId?.firstName} {selectedReport.studentId?.lastName}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Class</div>
                    <div className="font-medium text-gray-900">{selectedReport.classId?.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Overall Grade</div>
                    <div className={`text-2xl font-bold ${gradeColors[selectedReport.overallGrade] || ''}`}>
                      {selectedReport.overallGrade}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Percentage</div>
                    <div className="text-2xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {selectedReport.percentage?.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

            {/* Subject Grades */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Subject-wise Grades</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-500">
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-3">Marks</th>
                      <th className="py-2 px-3">Percentage</th>
                      <th className="py-2 px-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedReport.subjects?.map((subject, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium">{subject.subjectId?.name || subject.subjectName}</td>
                        <td className="py-2 px-3">{subject.obtainedMarks}/{subject.maxMarks}</td>
                        <td className="py-2 px-3">{subject.percentage?.toFixed(1)}%</td>
                        <td className="py-2 px-3">
                          <span className={`font-bold ${gradeColors[subject.grade] || ''}`}>{subject.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td className="py-2 px-3">Total</td>
                      <td className="py-2 px-3">{selectedReport.totalObtained}/{selectedReport.totalMax}</td>
                      <td className="py-2 px-3">{selectedReport.percentage?.toFixed(1)}%</td>
                      <td className="py-2 px-3">
                        <span className={gradeColors[selectedReport.overallGrade] || ''}>{selectedReport.overallGrade}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {selectedReport.rank && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Class Rank</div>
                  <div className="font-bold text-yellow-600">#{selectedReport.rank}</div>
                </div>
              )}
              {selectedReport.attendance !== undefined && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Attendance</div>
                  <div className="font-bold text-blue-600">{selectedReport.attendance}%</div>
                </div>
              )}
              {selectedReport.conduct && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Conduct</div>
                  <div className="font-bold text-green-600">{selectedReport.conduct}</div>
                </div>
              )}
            </div>

            {/* Remarks */}
            {(selectedReport.teacherRemarks || selectedReport.principalRemarks) && (
              <div className="space-y-3 mb-6">
                {selectedReport.teacherRemarks && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Teacher's Remarks</div>
                    <p className="text-sm">{selectedReport.teacherRemarks}</p>
                  </div>
                )}
                {selectedReport.principalRemarks && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Principal's Remarks</div>
                    <p className="text-sm">{selectedReport.principalRemarks}</p>
                  </div>
                )}
              </div>
            )}

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
