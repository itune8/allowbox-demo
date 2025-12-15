'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, type SidebarMenuItem } from '@repo/ui/sidebar';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useMemo, useState, useEffect } from 'react';

// Icons as components for cleaner code
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const TimetableIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const AttendanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const GradesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

const HomeworkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const DiaryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const LessonPlansIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const LeaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M9 16l2 2 4-4" />
  </svg>
);

const MessagesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const EventsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const sidebarMenu: SidebarMenuItem[] = [
  // Overview
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },

  // Schedule Section
  { key: 'section-schedule', label: 'Schedule', isSection: true },
  { key: 'timetable', label: 'My Timetable', icon: <TimetableIcon /> },
  { key: 'attendance', label: 'Attendance', icon: <AttendanceIcon /> },

  // Teaching Section
  { key: 'section-teaching', label: 'Teaching', isSection: true },
  { key: 'grades', label: 'Grades & Results', icon: <GradesIcon /> },
  { key: 'homework', label: 'Homework', icon: <HomeworkIcon /> },
  { key: 'diary', label: 'Daily Diary', icon: <DiaryIcon /> },
  { key: 'lesson-plans', label: 'Lesson Plans', icon: <LessonPlansIcon /> },

  // Personal Section
  { key: 'section-personal', label: 'Personal', isSection: true },
  { key: 'leave-requests', label: 'Leave Requests', icon: <LeaveIcon /> },

  // Communication Section
  { key: 'section-comms', label: 'Communication', isSection: true },
  { key: 'messages', label: 'Messages', icon: <MessagesIcon /> },
  { key: 'events', label: 'School Events', icon: <EventsIcon /> },

  // Reports Section
  { key: 'section-reports', label: 'Analytics', isSection: true },
  { key: 'reports', label: 'Reports', icon: <ReportsIcon /> },
];

// Bottom navigation items for mobile - most important features
const bottomNavItems: SidebarMenuItem[] = [
  { key: 'dashboard', label: 'Home', icon: <DashboardIcon /> },
  { key: 'attendance', label: 'Attendance', icon: <AttendanceIcon /> },
  { key: 'grades', label: 'Grades', icon: <GradesIcon /> },
  { key: 'homework', label: 'Homework', icon: <HomeworkIcon /> },
  { key: 'more', label: 'More', icon: <MoreIcon /> },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileApp, setIsMobileApp] = useState(false);

  // Detect if running inside mobile WebView
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobileApp = localStorage.getItem('isMobileApp') === 'true';
      setIsMobileApp(mobileApp);
    }
  }, []);

  // Determine active menu item from pathname
  const activeItem = useMemo(() => {
    if (pathname === '/teacher' || pathname === '/teacher/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'dashboard';
  }, [pathname]);

  const handleMenuClick = (key: string) => {
    if (key === 'more') {
      // Open mobile menu - handled by sidebar component
      return;
    }
    if (key === 'dashboard') {
      router.push('/teacher');
    } else {
      router.push(`/teacher/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Teacher';

  // If running in mobile app WebView, render simplified layout without sidebar/nav
  if (isMobileApp) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <main className="p-4 min-h-screen">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        <Sidebar
          title="Teacher Portal"
          subtitle="Manage your classes"
          menu={sidebarMenu}
          activeItem={activeItem}
          onItemClick={handleMenuClick}
          bottomNavItems={bottomNavItems}
          onCollapsedChange={setSidebarCollapsed}
          user={{
            name: userName,
            email: user?.email,
            role: 'Teacher',
          }}
          onLogout={logout}
        />

        {/* Main content */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between">
            <div className="ml-12">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                Teacher Portal
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Teacher Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage your classes and students
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-700"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick Actions */}
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                + New Assignment
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 md:p-6 pb-20 md:pb-6 min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
