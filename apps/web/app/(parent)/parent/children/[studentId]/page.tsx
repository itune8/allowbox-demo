'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { userService, type User } from '@/lib/services/user.service';
import { attendanceService, type Attendance } from '@/lib/services/attendance.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';
import { timetableService, type TimetableSlot } from '@/lib/services/timetable.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';

type TabType = 'details' | 'attendance' | 'subjects' | 'timetable' | 'fees';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [teacher, setTeacher] = useState<User | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Fetch student details
      const studentData = await userService.getUserById(studentId);
      setStudent(studentData);

      // Fetch attendance for current academic year
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      try {
        const attendanceData = await attendanceService.getAttendanceByStudent(
          studentId,
          startDate,
          endDate
        );
        setAttendance(attendanceData);
      } catch (err) {
        console.warn('Failed to fetch attendance');
      }

      // Fetch subjects
      if (studentData.classId) {
        try {
          const classIdStr = typeof studentData.classId === 'string'
            ? studentData.classId
            : studentData.classId._id || studentData.classId.toString();

          const allSubjects = await subjectService.getSubjects();
          const classSubjects = allSubjects.filter(subject =>
            !subject.classes ||
            subject.classes.length === 0 ||
            subject.classes.includes(classIdStr)
          );
          setSubjects(classSubjects);

          // Fetch timetable
          if (studentData.section) {
            const timetableData = await timetableService.getSlotsByClass(classIdStr, studentData.section);
            setTimetable(timetableData);

            // Fetch teacher from timetable
            if (timetableData.length > 0) {
              const teacherId = timetableData[0]?.teacherId;
              const allUsers = await userService.getUsers();
              const teacherData = allUsers.find(u => (u.id || u._id) === teacherId && u.role === 'teacher');
              if (teacherData) setTeacher(teacherData);
            }
          }
        } catch (err) {
          console.warn('Failed to fetch class data');
        }
      }

      // Fetch invoices
      try {
        const invoiceData = await feeService.getInvoices({ studentId });
        setInvoices(invoiceData);
      } catch (err) {
        console.warn('Failed to fetch invoices');
      }
    } catch (err) {
      console.error('Failed to fetch student data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <div className="text-gray-500">Loading student profile...</div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <Button onClick={() => router.push('/parent/children')} className="mt-4">
          Back to Children
        </Button>
      </div>
    );
  }

  const attendanceStats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    percentage: attendance.length > 0
      ? Math.round((attendance.filter(a => a.status === 'present' || a.status === 'late').length / attendance.length) * 100)
      : 0,
  };

  const feeStats = {
    total: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.paidAmount, 0),
    pending: invoices.filter(i => i.status !== 'paid').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
  };

  const tabs = [
    { id: 'details' as TabType, label: 'Details', icon: '👤' },
    { id: 'attendance' as TabType, label: 'Attendance', icon: '📅' },
    { id: 'subjects' as TabType, label: 'Subjects', icon: '📚' },
    { id: 'timetable' as TabType, label: 'Timetable', icon: '🕐' },
    { id: 'fees' as TabType, label: 'Fees', icon: '💰' },
  ];

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="outline" onClick={() => router.push('/parent/children')} className="text-sm px-2 sm:px-3">
          ← <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold grid place-items-center text-lg sm:text-2xl flex-shrink-0">
              {student.firstName?.[0]}{student.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {typeof student.classId === 'object' && student.classId?.name
                  ? `${student.classId.name}${student.section ? ` - Section ${student.section}` : ''}`
                  : 'No class assigned'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 -mx-3 sm:mx-0 px-3 sm:px-0">
        <nav className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="mr-1 sm:mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Student Information
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Student ID</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{student.studentId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{student.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Gender</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">{student.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Blood Group</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{student.bloodGroup || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Phone Number</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{student.phoneNumber || 'N/A'}</p>
                </div>
                {teacher && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Class Teacher</label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                  </div>
                )}
                {student.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Address</label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">{student.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Attendance</div>
                <div className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                  {attendanceStats.percentage}%
                </div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {attendanceStats.present} / {attendanceStats.total} days
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Subjects</div>
                <div className="text-xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {subjects.length}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-6">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Fees Paid</div>
                <div className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${feeStats.paid}
                </div>
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                  of ${feeStats.total} total
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Attendance ({new Date().getFullYear()})
              </h2>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{attendanceStats.present}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{attendanceStats.absent}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{attendanceStats.late}</span>
                </div>
              </div>
            </div>
            {attendance.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No attendance records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {attendance.slice(0, 50).map((record, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : record.status === 'absent'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {(record as any).remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Enrolled Subjects</h2>
            {subjects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No subjects assigned</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {subjects.map(subject => (
                  <div
                    key={subject._id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{subject.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{subject.code}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Max Marks: {subject.maxMarks}</span>
                      <span className="text-gray-500">Pass: {subject.passingMarks}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Weekly Timetable</h2>
            {timetable.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No timetable available</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4 min-w-[100px]">Day</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                      <th key={period} className="py-3 px-4 min-w-[120px]">Period {period}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {weekDays.map(day => {
                    const daySlots = timetable.filter(slot => slot.day.toLowerCase() === day);
                    return (
                      <tr key={day} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 font-medium capitalize text-gray-900 dark:text-gray-100">{day}</td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(period => {
                          const slot = daySlots.find(s => s.period === period);
                          const subject = slot ? subjects.find(sub => sub._id === slot.subjectId) : null;
                          return (
                            <td key={period} className="py-3 px-4">
                              {slot && subject ? (
                                <div className="text-xs">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</div>
                                  <div className="text-gray-500">
                                    {slot.startTime} - {slot.endTime}
                                  </div>
                                  {slot.roomNumber && (
                                    <div className="text-gray-400">Room: {slot.roomNumber}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Fee Invoices</h2>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total: </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">${feeStats.total}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Paid: </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">${feeStats.paid}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Due: </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">${feeStats.pending}</span>
                </div>
              </div>
            </div>
            {invoices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No fee invoices found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {invoices.map(invoice => (
                      <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs">{invoice.invoiceNumber}</td>
                        <td className="py-3 px-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium">${invoice.totalAmount}</td>
                        <td className="py-3 px-4 text-green-600 dark:text-green-400">${invoice.paidAmount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
