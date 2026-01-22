'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { userService, type User } from '@/lib/services/user.service';
import { attendanceService, type Attendance } from '@/lib/services/attendance.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';
import { timetableService, type TimetableSlot } from '@/lib/services/timetable.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { motion } from 'framer-motion';
import { GlassCard, AnimatedStatCard, Icon3D } from '@/components/ui';
import { ArrowLeft, User as UserIcon, Calendar, BookOpen, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[50vh]"
      >
        <div className="text-center space-y-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading student profile...</div>
        </div>
      </motion.div>
    );
  }

  if (!student) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <GlassCard className="p-8 bg-white/80 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Student not found</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => router.push('/parent/children')}>
              Back to Children
            </Button>
          </motion.div>
        </GlassCard>
      </motion.div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 sm:gap-4"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" onClick={() => router.push('/parent/children')} className="text-sm px-2 sm:px-3">
            <ArrowLeft className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-sky-500 text-white font-bold grid place-items-center text-lg sm:text-2xl flex-shrink-0 shadow-lg"
            >
              {student.firstName?.[0]}{student.lastName?.[0]}
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {typeof student.classId === 'object' && student.classId?.name
                  ? `${student.classId.name}${student.section ? ` - Section ${student.section}` : ''}`
                  : 'No class assigned'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="border-b border-gray-200 -mx-3 sm:mx-0 px-3 sm:px-0"
      >
        <nav className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-1 sm:mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && (
          <div className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-4 sm:p-6 bg-white/90">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Icon3D bgColor="bg-sky-500" size="md">
                    <UserIcon className="w-4 h-4" />
                  </Icon3D>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Student Information
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm text-gray-600">Student ID</label>
                  <p className="text-gray-900 font-medium">{student.studentId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-gray-900 font-medium">{student.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Date of Birth</label>
                  <p className="text-gray-900 font-medium">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Gender</label>
                  <p className="text-gray-900 font-medium capitalize">{student.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Blood Group</label>
                  <p className="text-gray-900 font-medium">{student.bloodGroup || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone Number</label>
                  <p className="text-gray-900 font-medium">{student.phoneNumber || 'N/A'}</p>
                </div>
                {teacher && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Class Teacher</label>
                    <p className="text-gray-900 font-medium">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                  </div>
                )}
                {student.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="text-gray-900 font-medium">{student.address}</p>
                  </div>
                )}
              </div>
              </GlassCard>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <AnimatedStatCard
                title="Attendance"
                value={`${attendanceStats.percentage}%`}
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                iconBgColor="bg-green-100"
                trend={{ value: `${attendanceStats.present} / ${attendanceStats.total} days`, isPositive: true }}
                delay={1}
              />
              <AnimatedStatCard
                title="Subjects"
                value={subjects.length}
                icon={<BookOpen className="w-5 h-5 text-blue-600" />}
                iconBgColor="bg-blue-100"
                delay={2}
              />
              <AnimatedStatCard
                title="Fees Paid"
                value={`$${feeStats.paid}`}
                icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
                iconBgColor="bg-emerald-100"
                trend={{ value: `of $${feeStats.total} total`, isPositive: true }}
                delay={3}
              />
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-4 sm:p-6 bg-white/90">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <Icon3D bgColor="bg-sky-500" size="md">
                    <Calendar className="w-4 h-4" />
                  </Icon3D>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Attendance ({new Date().getFullYear()})
                  </h2>
                </div>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{attendanceStats.present}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">{attendanceStats.absent}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">{attendanceStats.late}</span>
                </div>
              </div>
            </div>
            {attendance.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No attendance records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendance.slice(0, 50).map((record, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-700'
                                : record.status === 'absent'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {(record as any).remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'subjects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-4 sm:p-6 bg-white/90">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Icon3D bgColor="bg-sky-500" size="md">
                  <BookOpen className="w-4 h-4" />
                </Icon3D>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Enrolled Subjects</h2>
              </div>
            {subjects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No subjects assigned</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <GlassCard className="p-3 sm:p-4 bg-white/80 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">{subject.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{subject.code}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Max Marks: {subject.maxMarks}</span>
                        <span className="text-gray-500">Pass: {subject.passingMarks}</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'timetable' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-6 bg-white/90 overflow-x-auto">
              <div className="flex items-center gap-3 mb-6">
                <Icon3D bgColor="bg-sky-500" size="md">
                  <Clock className="w-4 h-4" />
                </Icon3D>
                <h2 className="text-lg font-semibold text-gray-900">Weekly Timetable</h2>
              </div>
            {timetable.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No timetable available</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 min-w-[100px]">Day</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                      <th key={period} className="py-3 px-4 min-w-[120px]">Period {period}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {weekDays.map(day => {
                    const daySlots = timetable.filter(slot => slot.day.toLowerCase() === day);
                    return (
                      <tr key={day} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium capitalize text-gray-900">{day}</td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(period => {
                          const slot = daySlots.find(s => s.period === period);
                          const subject = slot ? subjects.find(sub => sub._id === slot.subjectId) : null;
                          return (
                            <td key={period} className="py-3 px-4">
                              {slot && subject ? (
                                <div className="text-xs">
                                  <div className="font-medium text-gray-900">{subject.name}</div>
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
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'fees' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-4 sm:p-6 bg-white/90">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <Icon3D bgColor="bg-sky-500" size="md">
                    <DollarSign className="w-4 h-4" />
                  </Icon3D>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Fee Invoices</h2>
                </div>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div>
                  <span className="text-gray-600">Total: </span>
                  <span className="font-semibold text-gray-900">${feeStats.total}</span>
                </div>
                <div>
                  <span className="text-gray-600">Paid: </span>
                  <span className="font-semibold text-green-600">${feeStats.paid}</span>
                </div>
                <div>
                  <span className="text-gray-600">Due: </span>
                  <span className="font-semibold text-amber-600">${feeStats.pending}</span>
                </div>
              </div>
            </div>
            {invoices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No fee invoices found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map(invoice => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs">{invoice.invoiceNumber}</td>
                        <td className="py-3 px-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium">${invoice.totalAmount}</td>
                        <td className="py-3 px-4 text-green-600">${invoice.paidAmount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
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
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
