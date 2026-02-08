'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { MinimalCard, StatCard } from '@repo/ui/cards';
import { Badge, PageHeader } from '@repo/ui/data-display';
import { userService, type User } from '@/lib/services/user.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';
import {
  Users,
  GraduationCap,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<User[]>([]);
  const [selectedChild, setSelectedChild] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentUser = await userService.getUserById(user?.id || '');
      setCurrentUserData(currentUser);

      if (currentUser.role === 'student') {
        // Student viewing as parent - show their own info
        setSelectedChild(currentUser);
      } else if (currentUser.role === 'parent' && currentUser.children) {
        // Parent with children
        const childrenData = await Promise.all(
          currentUser.children.map((childId: any) =>
            userService.getUserById(typeof childId === 'string' ? childId : childId._id)
          )
        );
        setChildren(childrenData);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0] || null);
        }
      }

      // Fetch invoices
      const allInvoices = await feeService.getInvoices();
      setInvoices(allInvoices);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
  const totalDues = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0);

  // Mock data for demo (replace with real API calls)
  const stats = {
    attendance: 96,
    pendingTasks: 3,
    averageGrade: 'A-',
    pendingDues: totalDues,
  };

  const upcomingHomework = [
    {
      id: 1,
      subject: 'Math Assignment',
      title: 'Chapter 5: Fractions and Decimals - Problems 1-20',
      teacher: 'Ms. Anderson',
      dueDate: 'Dec 28, 9:00 AM',
      status: 'Due Tomorrow',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      id: 2,
      subject: 'Science Project',
      title: 'Solar System Model - Complete and bring to class',
      teacher: 'Mr. Peterson',
      dueDate: 'Dec 30, 2:00 PM',
      status: 'Due in 3 days',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 3,
      subject: 'English Reading',
      title: 'Read Chapters 7-9 and answer comprehension questions',
      teacher: 'Mrs. Williams',
      dueDate: 'Jan 1, 11:00 AM',
      status: 'Due in 5 days',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  const attendanceWeek = [
    { day: 'Monday', status: 'present', color: 'text-green-600' },
    { day: 'Tuesday', status: 'present', color: 'text-green-600' },
    { day: 'Wednesday', status: 'present', color: 'text-green-600' },
    { day: 'Thursday', status: 'present', color: 'text-green-600' },
    { day: 'Friday', status: 'pending', color: 'text-slate-400' },
  ];

  const upcomingEvents = [
    { date: 'DEC\n30', title: 'Winter Break Begins', subtitle: 'School closes for holidays', color: 'bg-purple-100 text-purple-700' },
    { date: 'JAN\n08', title: 'Parent-Teacher Meet', subtitle: '3:00 PM - 5:00 PM', color: 'bg-orange-100 text-orange-700' },
    { date: 'JAN\n15', title: 'Science Fair', subtitle: 'All day event', color: 'bg-blue-100 text-blue-700' },
  ];

  const recentGrades = [
    { subject: 'Mathematics Test', date: 'Dec 20, 2024', grade: 'A', score: '92/100', color: 'text-green-600 bg-green-100' },
    { subject: 'Science Quiz', date: 'Dec 18, 2024', grade: 'A-', score: '88/100', color: 'text-green-600 bg-green-100' },
    { subject: 'English Essay', date: 'Dec 15, 2024', grade: 'B+', score: '85/100', color: 'text-orange-600 bg-orange-100' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      {selectedChild && (
        <MinimalCard padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {selectedChild.firstName?.[0]}{selectedChild.lastName?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </h2>
                  {children.length > 1 && (
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500">Grade 6B</p>
              </div>
            </div>
            {children.length > 0 && (
              <button className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                + Add Child
              </button>
            )}
          </div>
        </MinimalCard>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${stats.attendance}%`}
          subtitle="This Month"
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          trend={{ value: '+2%', isPositive: true }}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          subtitle="Due This Week"
          icon={<FileText className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="Average Grade"
          value={stats.averageGrade}
          subtitle="Last 4 Weeks"
          icon={<GraduationCap className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-100"
        />
        <StatCard
          title="Pending Dues"
          value={`$${stats.pendingDues}`}
          subtitle="Due by Dec 30"
          icon={<DollarSign className="w-5 h-5 text-yellow-600" />}
          iconBgColor="bg-yellow-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Homework */}
          <MinimalCard padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Homework</h3>
              <button className="text-sm text-primary hover:text-primary-dark font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {upcomingHomework.map((hw) => (
                <div key={hw.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">{hw.subject}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{hw.title}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {hw.teacher}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {hw.dueDate}
                          </span>
                        </div>
                      </div>
                      <Badge variant="warning" size="sm">{hw.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MinimalCard>

          {/* Recent Grades */}
          <MinimalCard padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Recent Grades</h3>
              <button className="text-sm text-primary hover:text-primary-dark font-medium">
                View Report Card
              </button>
            </div>
            <div className="space-y-3">
              {recentGrades.map((grade, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{grade.subject}</p>
                      <p className="text-xs text-slate-500">{grade.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold ${grade.color}`}>
                      {grade.grade}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{grade.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </MinimalCard>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Attendance This Week */}
          <MinimalCard padding="md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Attendance This Week</h3>
            <div className="space-y-2">
              {attendanceWeek.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-700">{day.day}</span>
                  <div className="flex items-center gap-2">
                    {day.status === 'present' ? (
                      <>
                        <CheckCircle className={`w-4 h-4 ${day.color}`} />
                        <span className={`text-sm font-medium ${day.color}`}>Present</span>
                      </>
                    ) : (
                      <>
                        <Clock className={`w-4 h-4 ${day.color}`} />
                        <span className={`text-sm ${day.color}`}>Pending</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </MinimalCard>

          {/* Upcoming Events */}
          <MinimalCard padding="md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`px-2 py-1 rounded-lg text-center ${event.color}`}>
                    <div className="text-xs font-bold whitespace-pre-line leading-tight">
                      {event.date}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">{event.title}</p>
                    <p className="text-xs text-slate-500">{event.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </MinimalCard>

          {/* Pending Dues */}
          <MinimalCard padding="md" className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">Pending Dues</h3>
              <span className="text-2xl font-bold text-yellow-600">${stats.pendingDues}</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">Tuition Fee</span>
                <span className="font-medium">$80.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">Activity Fee</span>
                <span className="font-medium">$25.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">Library Fee</span>
                <span className="font-medium">$20.00</span>
              </div>
            </div>
            <button className="w-full px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pay Now
            </button>
          </MinimalCard>
        </div>
      </div>

      {/* Help Button - Floating */}
      <button className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg items-center justify-center hover:bg-primary-dark transition-colors z-30">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}
