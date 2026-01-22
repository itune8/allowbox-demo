'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';
import { studentService } from '../../../lib/services/student.service';
import { userService, type User } from '../../../lib/services/user.service';
import { classService, type Class } from '../../../lib/services/class.service';
import {
  Users,
  UserPlus,
  GraduationCap,
  DollarSign,
  Calendar,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';

// Professional Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  href?: string;
}) {
  const router = useRouter();

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-6 ${href ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all' : ''}`}
      onClick={() => href && router.push(href)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {changeType === 'positive' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
              {changeType === 'negative' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
              <span className={`text-sm font-medium ${
                changeType === 'positive' ? 'text-emerald-600' :
                changeType === 'negative' ? 'text-red-600' : 'text-slate-500'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-slate-100 rounded-lg">
          <Icon className="w-6 h-6 text-slate-600" />
        </div>
      </div>
    </div>
  );
}

// Professional Table Row
function RecentActivityRow({
  icon: Icon,
  iconBg,
  title,
  description,
  time,
  status,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'info';
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 truncate">{description}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400">{time}</p>
        {status && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
            status === 'success' ? 'bg-emerald-50 text-emerald-700' :
            status === 'warning' ? 'bg-amber-50 text-amber-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {status === 'success' ? 'Completed' : status === 'warning' ? 'Pending' : 'Info'}
          </span>
        )}
      </div>
    </div>
  );
}

// Quick Action Button
function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all text-left w-full"
    >
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
    </button>
  );
}

export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [students, setStudents] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch tenant data
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const data = await tenantService.getCurrentTenant();
        setTenantData(data);
      } catch (error) {
        console.error('Failed to fetch tenant data:', error);
      } finally {
        setLoadingTenant(false);
      }
    };

    if (user?.tenantId) {
      fetchTenantData();
    } else {
      setLoadingTenant(false);
    }
  }, [user]);

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [studentsData, staffData, classesData] = await Promise.all([
          userService.getUsers().then(users => users.filter(u => u.role === 'student')),
          userService.getUsers().then(users => users.filter(u => ['teacher', 'tenant_admin', 'accountant'].includes(u.role))),
          classService.getClasses(),
        ]);
        setStudents(studentsData);
        setStaff(staffData);
        setClasses(classesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Computed stats
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const totalStaff = staff.length;
    const teachers = staff.filter(s => s.role === 'teacher').length;
    const totalClasses = classes.length;
    const activeClasses = classes.filter(c => c.isActive).length;

    return {
      students: { total: totalStudents, active: activeStudents },
      staff: { total: totalStaff, teachers },
      classes: { total: totalClasses, active: activeClasses },
    };
  }, [students, staff, classes]);

  // Recent activities (sample data)
  const recentActivities = [
    { icon: UserPlus, iconBg: 'bg-emerald-500', title: 'New Student Enrolled', description: 'Sarah Johnson joined Grade 10A', time: '2 hours ago', status: 'success' as const },
    { icon: DollarSign, iconBg: 'bg-blue-500', title: 'Payment Received', description: 'Fee payment of $1,500 from Grade 10A', time: '4 hours ago', status: 'success' as const },
    { icon: Users, iconBg: 'bg-purple-500', title: 'New Teacher Onboarded', description: 'Mr. David Lee joined as Math Teacher', time: '1 day ago', status: 'info' as const },
    { icon: AlertCircle, iconBg: 'bg-amber-500', title: 'Attendance Alert', description: 'Low attendance in Grade 7B today', time: '1 day ago', status: 'warning' as const },
  ];

  // Upcoming events
  const upcomingEvents = [
    { title: 'Parent-Teacher Meeting', date: 'Tomorrow', time: '10:00 AM' },
    { title: 'Mid-term Examinations', date: 'Dec 15, 2024', time: 'All Day' },
    { title: 'Sports Day', date: 'Dec 20, 2024', time: '9:00 AM' },
    { title: 'Winter Break', date: 'Dec 23, 2024', time: 'All Day' },
  ];

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back, {user?.firstName || 'Admin'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening at {tenantData?.schoolName || 'your school'} today.
          </p>
        </div>
        <button
          onClick={() => router.push('/school/students')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.students.total.toLocaleString()}
          change={`${stats.students.active} active`}
          changeType="positive"
          icon={Users}
          href="/school/students"
        />
        <StatCard
          title="Total Staff"
          value={stats.staff.total.toLocaleString()}
          change={`${stats.staff.teachers} teachers`}
          changeType="neutral"
          icon={UserPlus}
          href="/school/staff"
        />
        <StatCard
          title="Active Classes"
          value={stats.classes.active}
          change={`of ${stats.classes.total} total`}
          changeType="neutral"
          icon={BookOpen}
          href="/school/classes"
        />
        <StatCard
          title="Attendance Today"
          value="92%"
          change="+3% from yesterday"
          changeType="positive"
          icon={CheckCircle}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
            <button className="text-sm text-primary hover:text-primary-dark font-medium">
              View all
            </button>
          </div>
          <div className="px-6">
            {recentActivities.map((activity, index) => (
              <RecentActivityRow key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Upcoming Events</h2>
            <button
              onClick={() => router.push('/school/events')}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              View all
            </button>
          </div>
          <div className="p-4 space-y-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500">{event.date} • {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={UserPlus}
            label="Add New Student"
            onClick={() => router.push('/school/students')}
          />
          <QuickAction
            icon={Users}
            label="Manage Staff"
            onClick={() => router.push('/school/staff')}
          />
          <QuickAction
            icon={DollarSign}
            label="Collect Fees"
            onClick={() => router.push('/school/fees')}
          />
          <QuickAction
            icon={GraduationCap}
            label="View Grades"
            onClick={() => router.push('/school/grades')}
          />
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Attendance Overview</h2>
            <p className="text-sm text-slate-500 mt-1">This week's attendance statistics</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-slate-900">92%</p>
                <p className="text-xs text-slate-500 mt-1">Present</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-amber-600">5%</p>
                <p className="text-xs text-slate-500 mt-1">Late</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-red-600">3%</p>
                <p className="text-xs text-slate-500 mt-1">Absent</p>
              </div>
            </div>
            <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="w-[92%] bg-emerald-500" />
              <div className="w-[5%] bg-amber-500" />
              <div className="w-[3%] bg-red-500" />
            </div>
          </div>
        </div>

        {/* Fee Collection */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Fee Collection</h2>
            <p className="text-sm text-slate-500 mt-1">Current term status</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Collected</p>
                <p className="text-2xl font-semibold text-emerald-600 mt-1">$45,230</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-semibold text-amber-600 mt-1">$12,450</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Collection Rate</span>
                <span className="font-medium text-slate-900">78%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[78%] h-full bg-primary rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
