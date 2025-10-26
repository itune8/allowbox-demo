'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { ROLES } from '@repo/config';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';
import { CreateStudentModal, type StudentFormData } from '../../../components/modals/create-student-modal';
import { CreateUserModal, type UserFormData } from '../../../components/modals/create-user-modal';
import { studentService } from '../../../lib/services/student.service';
import { userService, type User } from '../../../lib/services/user.service';
import { classService, type Class } from '../../../lib/services/class.service';
import { StatCard } from '@/components/dashboard/stat-card';

export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [banner, setBanner] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Real data states
  const [students, setStudents] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Computed stats from real data
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.isActive).length;
    const totalStaff = staff.length;
    const teachers = staff.filter(s => s.role === 'teacher').length;
    const admins = staff.filter(s => s.role === 'tenant_admin').length;
    const totalClasses = classes.length;
    const activeClasses = classes.filter(c => c.isActive).length;

    // Calculate average class size
    const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const avgSize = totalClasses > 0 ? Math.round(totalCapacity / totalClasses) : 0;

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        trend: { value: `${activeStudents} active`, isPositive: true },
      },
      staff: {
        total: totalStaff,
        teachers,
        admin: admins,
        trend: { value: `${teachers} teachers`, isPositive: true },
      },
      classes: {
        total: totalClasses,
        active: activeClasses,
        avgSize,
      },
      fees: {
        pending: 0,
        collected: 0,
        total: 0,
        trend: { value: 'N/A', isPositive: true },
      },
      attendance: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      },
    };
  }, [students, staff, classes]);

  // Recent activities
  const recentActivities = [
    { id: 1, type: 'student', message: 'New student enrolled: Sarah Johnson', time: '2 hours ago', icon: '👤' },
    { id: 2, type: 'fee', message: 'Payment received: $1,500 from Grade 10A', time: '4 hours ago', icon: '💰' },
    { id: 3, type: 'staff', message: 'New teacher onboarded: Mr. David Lee', time: '1 day ago', icon: '👨‍🏫' },
    { id: 4, type: 'alert', message: 'Low attendance alert for Grade 7B', time: '1 day ago', icon: '⚠️' },
  ];

  // Upcoming events
  const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Meeting', date: 'Tomorrow, 10:00 AM', color: 'bg-blue-500' },
    { id: 2, title: 'Mid-term Examinations Begin', date: 'Dec 15, 2024', color: 'bg-purple-500' },
    { id: 3, title: 'Sports Day', date: 'Dec 20, 2024', color: 'bg-green-500' },
    { id: 4, title: 'Winter Break Starts', date: 'Dec 23, 2024', color: 'bg-orange-500' },
  ];

  // Use real user role from authentication
  const isSchoolAdmin = useMemo(() => {
    const hasRole =
      (user?.roles || []).includes(ROLES.SCHOOL_ADMIN) || (user?.roles || []).includes(ROLES.TENANT_ADMIN);
    return hasRole;
  }, [user?.roles]);

  // Fetch all data from backend
  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingData(true);
      try {
        const [tenantData, usersData, classesData] = await Promise.all([
          tenantService.getCurrentTenant(),
          userService.getUsers(),
          classService.getClasses(),
        ]);

        setTenantData(tenantData);

        // Filter students and staff
        const studentsList = usersData.filter(u => u.role === 'student');
        const staffList = usersData.filter(u =>
          u.role === 'teacher' || u.role === 'tenant_admin' || u.role === 'accountant'
        );

        setStudents(studentsList);
        setStaff(staffList);
        setClasses(classesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoadingTenant(false);
        setLoadingData(false);
      }
    };

    if (user?.tenantId) {
      fetchAllData();
    } else {
      setLoadingTenant(false);
      setLoadingData(false);
    }
  }, [user]);

  // Backend handlers for creating students and staff
  const handleCreateStudent = async (studentData: StudentFormData) => {
    try {
      await studentService.createStudent(studentData);
      setBanner('Student created successfully!');
      setTimeout(() => setBanner(null), 3000);
      setIsStudentModalOpen(false);

      // Refresh data
      const usersData = await userService.getUsers();
      const studentsList = usersData.filter(u => u.role === 'student');
      setStudents(studentsList);
    } catch (error) {
      console.error('Failed to create student:', error);
      throw error;
    }
  };

  const handleCreateStaff = async (userData: UserFormData) => {
    try {
      await userService.createUser(userData);
      setBanner('Staff member created successfully!');
      setTimeout(() => setBanner(null), 3000);
      setIsStaffModalOpen(false);

      // Refresh data
      const usersData = await userService.getUsers();
      const staffList = usersData.filter(u =>
        u.role === 'teacher' || u.role === 'tenant_admin' || u.role === 'accountant'
      );
      setStaff(staffList);
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  };

  if (!isSchoolAdmin) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      {banner && (
        <div className="animate-fade-in">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {banner}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.firstName}! Here's what's happening today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsStudentModalOpen(true)}>
              + Add Student
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsStaffModalOpen(true)}>
              + Add Staff
            </Button>
          </div>
        </div>
      </div>

      {/* School Information Card */}
      {tenantData && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{tenantData.schoolName}</h2>
              <div className="space-y-1 text-indigo-100">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {tenantData.contactEmail || 'N/A'}
                </p>
                {tenantData.contactPhone && (
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {tenantData.contactPhone}
                  </p>
                )}
                {tenantData.address && (
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {tenantData.address}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{stats.students.total}</div>
              <div className="text-sm text-indigo-100">Total Students</div>
            </div>
          </div>
        </div>
      )}

      {/* Key Stats Grid */}
      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.students.total}
            icon={
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            }
            trend={stats.students.trend}
            iconBgColor="bg-indigo-50 dark:bg-indigo-900/20"
          />
        <StatCard
          title="Active Staff"
          value={stats.staff.total}
          icon={
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          }
          trend={stats.staff.trend}
          iconBgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          title="Total Classes"
          value={stats.classes.total}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          }
          iconBgColor="bg-blue-50 dark:bg-blue-900/20"
        />
          <StatCard
            title="Fee Collection"
            value={stats.fees.total > 0 ? `${Math.round((stats.fees.collected / stats.fees.total) * 100)}%` : 'N/A'}
            icon={
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
            }
            trend={stats.fees.trend}
            iconBgColor="bg-amber-50 dark:bg-amber-900/20"
          />
        </div>
      )}

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Attendance</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.attendance.today}%</div>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Week: {stats.attendance.thisWeek}%</span>
            <span>Month: {stats.attendance.thisMonth}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Fees</h3>
            <span className="text-2xl">💳</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ${(stats.fees.pending / 1000).toFixed(0)}K
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            ${(stats.fees.collected / 1000).toFixed(0)}K collected this month
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Class Size</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.classes.avgSize}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {stats.classes.total} active classes
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <svg
                className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Student</span>
            </button>

            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <svg
                className="w-8 h-8 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Staff</span>
            </button>

            <button
              onClick={() => router.push('/school/classes')}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <svg
                className="w-8 h-8 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Classes</span>
            </button>

            <button
              onClick={() => router.push('/school/fees')}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group"
            >
              <svg
                className="w-8 h-8 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fee Management</span>
            </button>

            <button
              onClick={() => router.push('/school/reports')}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
            >
              <svg
                className="w-8 h-8 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Reports</span>
            </button>

            <button
              onClick={() => router.push('/school/support')}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
            >
              <svg
                className="w-8 h-8 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Get Support</span>
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <div className={`w-2 h-2 rounded-full ${event.color} mt-2`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
            View All Events →
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSubmit={handleCreateStudent}
      />
      <CreateUserModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleCreateStaff}
      />
    </div>
  );
}
