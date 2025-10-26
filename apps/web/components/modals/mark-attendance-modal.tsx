'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { attendanceService, type AttendanceStatus } from '@/lib/services/attendance.service';
import { userService, type User } from '@/lib/services/user.service';
import { Portal } from '../portal';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  section?: string;
  onSuccess?: () => void;
}

interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  status: AttendanceStatus;
  remarks?: string;
}

export function MarkAttendanceModal({ isOpen, onClose, classId, section, onSuccess }: MarkAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<number | undefined>(undefined);
  const [students, setStudents] = useState<StudentAttendance[]>([]);

  useEffect(() => {
    if (isOpen && classId) {
      fetchStudents();
    }
  }, [isOpen, classId, section]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    setError('');
    try {
      const allUsers = await userService.getUsers();
      // Filter students by class and section
      const classStudents = allUsers.filter(
        user => user.role === 'student' && user.classId === classId && (!section || user.section === section)
      );

      setStudents(
        classStudents.map(student => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentIdNumber: student.studentId || '',
          status: 'present' as AttendanceStatus,
          remarks: '',
        }))
      );
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents(prev =>
      prev.map(s => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudents(prev =>
      prev.map(s => (s.studentId === studentId ? { ...s, remarks } : s))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await attendanceService.bulkMarkAttendance({
        classId,
        section,
        date: date + (period ? `|${period}` : ''),
        period,
        attendanceRecords: students.map(s => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks,
        })),
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const statusCounts = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    late: students.filter(s => s.status === 'late').length,
    excused: students.filter(s => s.status === 'excused').length,
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] overflow-y-auto pt-20 pb-20">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
            {section && <p className="text-sm text-gray-600">Section {section}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Date and Period Selection */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period (Optional)
              </label>
              <input
                type="number"
                value={period || ''}
                onChange={(e) => setPeriod(e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
                max="10"
                placeholder="Leave empty for full day"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Mark all as:</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleMarkAll('present')}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Present
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleMarkAll('absent')}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Absent
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleMarkAll('late')}
              className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
            >
              Late
            </Button>
          </div>

          {/* Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg flex flex-wrap gap-4 text-sm">
            <div>Total: <span className="font-semibold">{students.length}</span></div>
            <div className="text-green-600">Present: <span className="font-semibold">{statusCounts.present}</span></div>
            <div className="text-red-600">Absent: <span className="font-semibold">{statusCounts.absent}</span></div>
            <div className="text-yellow-600">Late: <span className="font-semibold">{statusCounts.late}</span></div>
            <div className="text-blue-600">Excused: <span className="font-semibold">{statusCounts.excused}</span></div>
          </div>

          {/* Students List */}
          {loadingStudents ? (
            <div className="text-center py-8 text-gray-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No students found in this class/section</div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-xs text-gray-500">{student.studentIdNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={student.status}
                          onChange={(e) => handleStatusChange(student.studentId, e.target.value as AttendanceStatus)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="excused">Excused</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                          placeholder="Optional remarks"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || students.length === 0}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Saving...' : `Mark Attendance (${students.length})`}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
