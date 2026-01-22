'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ROLES } from '@repo/config';
import { AnimatedStatCard, GlassCard, Icon3D } from '@/components/ui';
import { userService, type User } from '@/lib/services/user.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';
import { attendanceService, type Attendance } from '@/lib/services/attendance.service';
import { timetableService, type TimetableSlot } from '@/lib/services/timetable.service';
import { subjectService, type Subject } from '@/lib/services/subject.service';
import { classService, type Class } from '@/lib/services/class.service';
import {
  Users,
  CreditCard,
  DollarSign,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full mx-auto"
          />
          <div className="text-gray-500">Loading dashboard...</div>
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
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          Dashboard Overview
          <Icon3D bgColor="bg-primary" size="sm">
            <Users className="w-3.5 h-3.5" />
          </Icon3D>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Welcome back, {user?.firstName}!{' '}
          <span className="hidden sm:inline">
            {currentUserData?.role === 'student'
              ? "Here's your class information and children's activities."
              : "Here's a summary of your children's activities."}
          </span>
        </p>
      </motion.div>

      {/* My Information (if logged in as student) */}
      {currentUserData?.role === 'student' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-4 sm:p-6 bg-primary-50 border-indigo-100" hover={false}>
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate flex items-center gap-2">
                  My Class Information
                  <Icon3D bgColor="bg-primary" size="sm">
                    <BookOpen className="w-3.5 h-3.5" />
                  </Icon3D>
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  {myClass?.name} - Section {currentUserData.section}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{attendancePercentage}%</div>
                <div className="text-xs sm:text-sm text-gray-600">Attendance</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* My Subjects */}
              <div className="bg-white/60 backdrop-blur rounded-lg p-3 sm:p-4 border border-gray-200">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base text-gray-900">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-primary" />
                  My Subjects ({mySubjects.length})
                </h3>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 max-h-28 sm:max-h-32 overflow-y-auto">
                  {mySubjects.map(subject => (
                    <div key={subject._id} className="text-xs bg-indigo-50 text-gray-700 rounded px-2 py-1 truncate border border-indigo-100">
                      {subject.name}
                    </div>
                  ))}
                  {mySubjects.length === 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 col-span-2">No subjects assigned</p>
                  )}
                </div>
              </div>

              {/* Today's Classes */}
              <div className="bg-white/60 backdrop-blur rounded-lg p-3 sm:p-4 border border-gray-200">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base text-gray-900">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-purple-600" />
                  Today's Classes ({todaysTimetable.length})
                </h3>
                <div className="space-y-1 max-h-28 sm:max-h-32 overflow-y-auto">
                  {todaysTimetable.map(slot => {
                    const subject = mySubjects.find(s => s._id === slot.subjectId);
                    return (
                      <div key={slot._id} className="text-xs bg-purple-50 rounded px-2 py-1 border border-purple-100">
                        <div className="font-medium truncate text-gray-900">Period {slot.period}: {subject?.name || 'Unknown'}</div>
                        {slot.startTime && slot.endTime && (
                          <div className="text-gray-600">{slot.startTime} - {slot.endTime}</div>
                        )}
                      </div>
                    );
                  })}
                  {todaysTimetable.length === 0 && (
                    <p className="text-xs sm:text-sm text-gray-500">No classes today</p>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Key Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4"
      >
        <AnimatedStatCard
          title="Children Linked"
          value={children.length}
          icon={<Users className="w-5 h-5 text-primary" />}
          iconBgColor="bg-indigo-50"
          delay={0}
        />
        <AnimatedStatCard
          title="Pending Invoices"
          value={pendingInvoices.length}
          icon={<CreditCard className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
          delay={1}
        />
        <AnimatedStatCard
          title="Paid This Month"
          value={`$${paidThisMonth.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-50"
          delay={2}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-4 sm:p-6 bg-white/90" hover={false}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            Quick Actions
            <Icon3D bgColor="bg-blue-500" size="sm">
              <TrendingUp className="w-3.5 h-3.5" />
            </Icon3D>
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/parent/children')}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group touch-manipulation"
            >
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-primary mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">Children</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/parent/fees')}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group touch-manipulation"
            >
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-green-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">Pay Fees</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/parent/payments')}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group touch-manipulation"
            >
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-blue-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">History</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/parent/support')}
              className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group touch-manipulation"
            >
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-purple-600 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight">Support</span>
            </motion.button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Fee Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-4 sm:p-6 bg-white/90" hover={false}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            Fee Overview
            <Icon3D bgColor="bg-emerald-500" size="sm">
              <DollarSign className="w-3.5 h-3.5" />
            </Icon3D>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2 order-2 sm:order-1">
              <div className="h-32 sm:h-40 flex items-end gap-4 sm:gap-3">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${feeTotals.total ? Math.round((feeTotals.paid / feeTotals.total) * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="flex-1"
                >
                  <div className="text-xs text-gray-600 mb-1 text-center">Paid</div>
                  <div
                    className="w-full bg-green-500 rounded-t transition-all"
                    style={{
                      height: '100%',
                      minHeight: feeTotals.paid > 0 ? '20px' : '0px',
                    }}
                    title={`Paid: $${feeTotals.paid.toLocaleString()}`}
                  />
                </motion.div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${feeTotals.total ? Math.round((feeTotals.pending / feeTotals.total) * 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="flex-1"
                >
                  <div className="text-xs text-gray-600 mb-1 text-center">Pending</div>
                  <div
                    className="w-full bg-amber-500 rounded-t transition-all"
                    style={{
                      height: '100%',
                      minHeight: feeTotals.pending > 0 ? '20px' : '0px',
                    }}
                    title={`Pending: $${feeTotals.pending.toLocaleString()}`}
                  />
                </motion.div>
              </div>
            </div>
            <div className="space-y-2 order-1 sm:order-2 flex sm:block gap-3 sm:gap-0 flex-wrap">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 flex-shrink-0" />
                <span>Paid: ${feeTotals.paid.toLocaleString()}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500 flex-shrink-0" />
                <span>Pending: ${feeTotals.pending.toLocaleString()}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-2 text-xs sm:text-sm text-gray-500"
              >
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span>Total: ${feeTotals.total.toLocaleString()}</span>
              </motion.div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassCard className="p-4 sm:p-6 bg-white/90" hover={false}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              Recent Invoices
              <Icon3D bgColor="bg-amber-500" size="sm">
                <CreditCard className="w-3.5 h-3.5" />
              </Icon3D>
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/parent/fees')}
              className="text-xs sm:text-sm text-primary hover:text-primary-dark font-medium touch-manipulation"
            >
              View All
            </motion.button>
          </div>
          {children.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 sm:py-12 text-gray-500"
            >
              <div className="text-3xl sm:text-4xl mb-3">🗂️</div>
              <p className="text-sm sm:text-base">No children linked to your account yet.</p>
            </motion.div>
          ) : recentInvoices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 sm:py-12 text-gray-500"
            >
              <div className="text-3xl sm:text-4xl mb-3">📋</div>
              <p className="text-sm sm:text-base">No invoices found.</p>
            </motion.div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {recentInvoices.map((inv, index) => {
                  const child = children.find(c => (c.id || c._id) === inv.studentId);
                  const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();

                  return (
                    <motion.div
                      key={inv._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50/50 rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {child ? `${child.firstName} ${child.lastName}` : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">{inv.invoiceNumber}</div>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                            inv.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : isOverdue
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {inv.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                        <span className="font-semibold text-gray-900">${inv.totalAmount.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="py-2">Invoice #</th>
                      <th className="py-2">Child Name</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Due Date</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentInvoices.map((inv, index) => {
                      const child = children.find(c => (c.id || c._id) === inv.studentId);
                      const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();

                      return (
                        <motion.tr
                          key={inv._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                          className="cursor-pointer"
                        >
                          <td className="py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                          <td className="py-3">{child ? `${child.firstName} ${child.lastName}` : 'N/A'}</td>
                          <td className="py-3 font-medium">${inv.totalAmount.toLocaleString()}</td>
                          <td className="py-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                inv.status === 'paid'
                                  ? 'bg-green-100 text-green-700'
                                  : isOverdue
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {inv.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
