'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../../contexts/auth-context';
import {
  gradesService,
  Grade,
  ReportCard,
} from '../../../../lib/services/grades.service';
import { userService, User } from '../../../../lib/services/user.service';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (children.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grades & Report Cards</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View your child's academic performance
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Children Linked</h3>
          <p className="text-gray-500">
            No children are linked to your account. Please contact the school administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Grades & Report Cards</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View your child's academic performance
          </p>
        </div>
        {children.length > 1 && (
          <select
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
      </div>

      {selectedChild && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
              {selectedChild.firstName?.[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {selectedChild.firstName} {selectedChild.lastName}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedChild.classId?.name || 'No class assigned'}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {reportCards.length === 0 && grades.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Grades Yet</h3>
          <p className="text-gray-500">
            Your child's grades and report cards will appear here once published by the school.
          </p>
        </div>
      ) : (
        <>
          {reportCards.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Report Cards</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {reportCards.map((report) => (
                  <div
                    key={report._id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {grades.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Grades</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-500">
                      <th className="py-3 px-4">Assessment</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {grades.map((grade) => (
                      <tr key={grade._id}>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {grade.assessmentName || grade.type}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Report Card Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setSelectedReport(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 animate-zoom-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Report Card
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedReport.term} - {selectedReport.academicYear}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Student</div>
                  <div className="font-medium">{selectedReport.studentId?.firstName} {selectedReport.studentId?.lastName}</div>
                </div>
                <div>
                  <div className="text-gray-500">Class</div>
                  <div className="font-medium">{selectedReport.classId?.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Overall Grade</div>
                  <div className={`text-2xl font-bold ${gradeColors[selectedReport.overallGrade] || ''}`}>
                    {selectedReport.overallGrade}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Percentage</div>
                  <div className="text-2xl font-bold text-indigo-600">{selectedReport.percentage?.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Subject Grades */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Subject-wise Grades</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-500">
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-3">Marks</th>
                      <th className="py-2 px-3">Percentage</th>
                      <th className="py-2 px-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
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
                  <tfoot className="bg-gray-100 dark:bg-gray-800 font-semibold">
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
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Class Rank</div>
                  <div className="font-bold text-yellow-600">#{selectedReport.rank}</div>
                </div>
              )}
              {selectedReport.attendance !== undefined && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Attendance</div>
                  <div className="font-bold text-blue-600">{selectedReport.attendance}%</div>
                </div>
              )}
              {selectedReport.conduct && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Conduct</div>
                  <div className="font-bold text-green-600">{selectedReport.conduct}</div>
                </div>
              )}
            </div>

            {/* Remarks */}
            {(selectedReport.teacherRemarks || selectedReport.principalRemarks) && (
              <div className="space-y-3 mb-6">
                {selectedReport.teacherRemarks && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Teacher's Remarks</div>
                    <p className="text-sm">{selectedReport.teacherRemarks}</p>
                  </div>
                )}
                {selectedReport.principalRemarks && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Principal's Remarks</div>
                    <p className="text-sm">{selectedReport.principalRemarks}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
