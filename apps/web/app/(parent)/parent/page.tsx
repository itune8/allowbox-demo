'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { ROLES } from '@repo/config';
import { StatCard } from '@/components/dashboard/stat-card';
import { userService, type User } from '@/lib/services/user.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';
import { attendanceService, type Attendance } from '@/lib/services/attendance.service';
import { timetableService, type TimetableSlot } from '@/lib/services/timetable.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { classService, type Class } from '@/lib/services/class.service';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [myClass, setMyClass] = useState<Class | null>(null);
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [myTimetable, setMyTimetable] = useState<TimetableSlot[]>([]);
  const [myAttendance, setMyAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch current user with populated children field
      const currentUser = await userService.getUserById(user?.id || '');
      setCurrentUserData(currentUser);

      // If current user is a student, fetch their own information
      if (currentUser.role === 'student') {
        // Fetch class info
        if (currentUser.classId) {
          const classIdStr = typeof currentUser.classId === 'string'
            ? currentUser.classId
            : currentUser.classId._id || currentUser.classId.toString();
          const classData = await classService.getClassById(classIdStr);
          setMyClass(classData);

          // Fetch subjects for their class
          const allSubjects = await subjectService.getSubjects();
          const classSubjects = allSubjects.filter(subject =>
            !subject.classes ||
            subject.classes.length === 0 ||
            subject.classes.includes(classIdStr)
          );
          setMySubjects(classSubjects);

          // Fetch timetable if they have section
          if (currentUser.section) {
            const timetable = await timetableService.getSlotsByClass(classIdStr, currentUser.section);
            setMyTimetable(timetable);
          }
        }

        // Fetch their attendance (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        const attendance = await attendanceService.getAttendanceByStudent(
          currentUser.id || currentUser._id || '',
          startDate.toISOString().split('T')[0] ?? '',
          endDate.toISOString().split('T')[0] ?? ''
        );
        setMyAttendance(attendance);
      }

      // Get children from the user's children array
      const childrenIds = currentUser.children || [];

      // Fetch all children details
      const myChildren: User[] = [];
      if (childrenIds.length > 0) {
        const allUsers = await userService.getUsers();
        childrenIds.forEach(childId => {
          const child = allUsers.find(u =>
            (u.id || u._id) === (typeof childId === 'string' ? childId : childId.toString())
          );
          if (child) {
            myChildren.push(child);
          }
        });
      }
      setChildren(myChildren);

      // Fetch invoices for all children
      const allInvoices: Invoice[] = [];
      for (const child of myChildren) {
        const childInvoices = await feeService.getInvoices({ studentId: child.id || child._id });
        allInvoices.push(...childInvoices);
      }
      setInvoices(allInvoices);

    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'partial');

  const paidThisMonth = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    return invoices
      .filter(inv =>
        inv.status === 'paid' &&
        inv.paidDate &&
        inv.paidDate >= thisMonthStart &&
        inv.paidDate <= thisMonthEnd
      )
      .reduce((sum, inv) => sum + inv.paidAmount, 0);
  }, [invoices]);

  const feeTotals = useMemo(() => {
    const paid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.paidAmount, 0);

    const pending = invoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

    return { paid, pending, total: paid + pending };
  }, [invoices]);

  const attendancePercentage = useMemo(() => {
    if (myAttendance.length === 0) return 0;
    const presentDays = myAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    return Math.round((presentDays / myAttendance.length) * 100);
  }, [myAttendance]);

  const todaysTimetable = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return myTimetable
      .filter(slot => slot.day === today)
      .sort((a, b) => a.period - b.period);
  }, [myTimetable]);

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user?.firstName}!{' '}
          <span className="hidden sm:inline">
            {currentUserData?.role === 'student'
              ? "Here's your class information and children's activities."
              : "Here's a summary of your children's activities."}
          </span>
        </p>
      </div>

      {/* My Information (if logged in as student) */}
      {currentUserData?.role === 'student' && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">My Class Information</h2>
              <p className="text-indigo-100 text-xs sm:text-sm truncate">
                {myClass?.name} - Section {currentUserData.section}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl sm:text-3xl font-bold">{attendancePercentage}%</div>
              <div className="text-xs sm:text-sm text-indigo-100">Attendance</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* My Subjects */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                My Subjects ({mySubjects.length})
              </h3>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 max-h-28 sm:max-h-32 overflow-y-auto">
                {mySubjects.map(subject => (
                  <div key={subject._id} className="text-xs bg-white/20 rounded px-2 py-1 truncate">
                    {subject.name}
                  </div>
                ))}
                {mySubjects.length === 0 && (
                  <p className="text-xs sm:text-sm text-indigo-100 col-span-2">No subjects assigned</p>
                )}
              </div>
            </div>

            {/* Today's Classes */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Today's Classes ({todaysTimetable.length})
              </h3>
              <div className="space-y-1 max-h-28 sm:max-h-32 overflow-y-auto">
                {todaysTimetable.map(slot => {
                  const subject = mySubjects.find(s => s._id === slot.subjectId);
                  return (
                    <div key={slot._id} className="text-xs bg-white/20 rounded px-2 py-1">
                      <div className="font-medium truncate">Period {slot.period}: {subject?.name || 'Unknown'}</div>
                      {slot.startTime && slot.endTime && (
                        <div className="text-indigo-100">{slot.startTime} - {slot.endTime}</div>
                      )}
                    </div>
                  );
                })}
                {todaysTimetable.length === 0 && (
                  <p className="text-xs sm:text-sm text-indigo-100">No classes today</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          title="Children Linked"
          value={children.length}
          icon={
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
          iconBgColor="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices.length}
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
          }
          iconBgColor="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          title="Paid This Month"
          value={`$${paidThisMonth.toLocaleString()}`}
          icon={
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
          }
          iconBgColor="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/parent/children')}
            className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95 transition-all group touch-manipulation"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1 sm:mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">Children</span>
          </button>

          <button
            onClick={() => router.push('/parent/fees')}
            className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 active:scale-95 transition-all group touch-manipulation"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 mb-1 sm:mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">Pay Fees</span>
          </button>

          <button
            onClick={() => router.push('/parent/payments')}
            className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 transition-all group touch-manipulation"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1 sm:mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">History</span>
          </button>

          <button
            onClick={() => router.push('/parent/support')}
            className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 active:scale-95 transition-all group touch-manipulation"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 mb-1 sm:mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">Support</span>
          </button>
        </div>
      </div>

      {/* Fee Overview */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Fee Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2 order-2 sm:order-1">
            <div className="h-32 sm:h-40 flex items-end gap-4 sm:gap-3">
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 text-center">Paid</div>
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all"
                  style={{
                    height: `${feeTotals.total ? Math.round((feeTotals.paid / feeTotals.total) * 100) : 0}%`,
                    minHeight: feeTotals.paid > 0 ? '20px' : '0px',
                  }}
                  title={`Paid: $${feeTotals.paid.toLocaleString()}`}
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 text-center">Pending</div>
                <div
                  className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t transition-all"
                  style={{
                    height: `${feeTotals.total ? Math.round((feeTotals.pending / feeTotals.total) * 100) : 0}%`,
                    minHeight: feeTotals.pending > 0 ? '20px' : '0px',
                  }}
                  title={`Pending: $${feeTotals.pending.toLocaleString()}`}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2 order-1 sm:order-2 flex sm:block gap-3 sm:gap-0 flex-wrap">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 flex-shrink-0" />
              <span>Paid: ${feeTotals.paid.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 flex-shrink-0" />
              <span>Pending: ${feeTotals.pending.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span>Total: ${feeTotals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Invoices</h3>
          <button
            onClick={() => router.push('/parent/fees')}
            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline active:opacity-70 touch-manipulation"
          >
            View All
          </button>
        </div>
        {children.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
            <div className="text-3xl sm:text-4xl mb-3">🗂️</div>
            <p className="text-sm sm:text-base">No children linked to your account yet.</p>
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
            <div className="text-3xl sm:text-4xl mb-3">📋</div>
            <p className="text-sm sm:text-base">No invoices found.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {recentInvoices.map((inv) => {
                const child = children.find(c => (c.id || c._id) === inv.studentId);
                const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();

                return (
                  <div key={inv._id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-800 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {child ? `${child.firstName} ${child.lastName}` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{inv.invoiceNumber}</div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                          inv.status === 'paid'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : isOverdue
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}
                      >
                        {inv.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">${inv.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-2">Invoice #</th>
                    <th className="py-2">Child Name</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Due Date</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentInvoices.map((inv) => {
                    const child = children.find(c => (c.id || c._id) === inv.studentId);
                    const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();

                    return (
                      <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        <td className="py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                        <td className="py-3">{child ? `${child.firstName} ${child.lastName}` : 'N/A'}</td>
                        <td className="py-3 font-medium">${inv.totalAmount.toLocaleString()}</td>
                        <td className="py-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              inv.status === 'paid'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : isOverdue
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}
                          >
                            {inv.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
