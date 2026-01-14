'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, type SidebarMenuItem } from '@repo/ui/sidebar';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useMemo, useState, ReactNode } from 'react';
import {
  LayoutDashboard,
  Clock,
  CheckCircle,
  BarChart3,
  BookOpen,
  BookMarked,
  Calendar,
  Leaf,
  MessageSquare,
  Star,
  FileText,
  MoreHorizontal,
  Home,
} from 'lucide-react';
import { Icon3D } from '@repo/ui/icon-3d';

// Icon wrapper for standard icons (used in mobile bottom nav)
const IconWrapper = ({ children }: { children: ReactNode }) => (
  <div className="w-5 h-5 flex items-center justify-center">
    {children}
  </div>
);

const sidebarMenu: SidebarMenuItem[] = [
  // Overview
  { key: 'dashboard', label: 'Dashboard', icon: <Icon3D gradient="from-indigo-500 to-purple-600"><LayoutDashboard className="w-4 h-4" /></Icon3D> },

  // Schedule Section
  { key: 'section-schedule', label: 'Schedule', isSection: true },
  { key: 'timetable', label: 'Timetable', icon: <Icon3D gradient="from-violet-500 to-purple-500"><Clock className="w-4 h-4" /></Icon3D> },
  { key: 'attendance', label: 'Attendance', icon: <Icon3D gradient="from-blue-500 to-cyan-500"><CheckCircle className="w-4 h-4" /></Icon3D> },

  // Teaching Section
  { key: 'section-teaching', label: 'Teaching', isSection: true },
  { key: 'grades', label: 'Grades & Results', icon: <Icon3D gradient="from-amber-500 to-orange-500"><BarChart3 className="w-4 h-4" /></Icon3D> },
  { key: 'homework', label: 'Homework', icon: <Icon3D gradient="from-rose-500 to-pink-500"><FileText className="w-4 h-4" /></Icon3D> },
  { key: 'diary', label: 'Daily Diary', icon: <Icon3D gradient="from-sky-500 to-blue-500"><BookMarked className="w-4 h-4" /></Icon3D> },
  { key: 'lesson-plans', label: 'Lesson Plans', icon: <Icon3D gradient="from-purple-500 to-violet-500"><BookOpen className="w-4 h-4" /></Icon3D> },

  // Personal Section
  { key: 'section-personal', label: 'Personal', isSection: true },
  { key: 'leave-requests', label: 'Leave Requests', icon: <Icon3D gradient="from-green-500 to-emerald-500"><Leaf className="w-4 h-4" /></Icon3D> },

  // Communication Section
  { key: 'section-comms', label: 'Communication', isSection: true },
  { key: 'messages', label: 'Messages', icon: <Icon3D gradient="from-blue-500 to-indigo-500"><MessageSquare className="w-4 h-4" /></Icon3D> },
  { key: 'events', label: 'School Events', icon: <Icon3D gradient="from-fuchsia-500 to-pink-500"><Calendar className="w-4 h-4" /></Icon3D> },

  // Reports Section
  { key: 'section-reports', label: 'Reports', isSection: true },
  { key: 'reports', label: 'Reports', icon: <Icon3D gradient="from-purple-500 to-violet-500"><Star className="w-4 h-4" /></Icon3D> },
];

// Bottom navigation items for mobile - most important features
const bottomNavItems: SidebarMenuItem[] = [
  { key: 'dashboard', label: 'Home', icon: <IconWrapper><Home className="w-5 h-5" /></IconWrapper> },
  { key: 'attendance', label: 'Attendance', icon: <IconWrapper><CheckCircle className="w-5 h-5" /></IconWrapper> },
  { key: 'grades', label: 'Grades', icon: <IconWrapper><BarChart3 className="w-5 h-5" /></IconWrapper> },
  { key: 'homework', label: 'Homework', icon: <IconWrapper><FileText className="w-5 h-5" /></IconWrapper> },
  { key: 'more', label: 'More', icon: <IconWrapper><MoreHorizontal className="w-5 h-5" /></IconWrapper> },
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-gray-900">
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
          {/* Mobile Header - Enhanced for mobile app feel */}
          <header className="md:hidden sticky top-0 z-20 bg-white/95/95 backdrop-blur-md border-b border-gray-200 px-4 h-14 flex items-center justify-between safe-area-top">
            <div className="ml-12 flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900 truncate">
                Teacher Portal
              </h1>
            </div>
            <div className="flex items-center gap-1">
              {/* Mobile Search Button */}
              <button className="p-2.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all touch-manipulation">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
              {/* Notifications */}
              <button className="p-2.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all relative touch-manipulation">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-20 bg-white/80/80 backdrop-blur-md border-b border-gray-200 h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-xs text-gray-500">
                Manage your classes and students
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
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

          {/* Page content - Enhanced mobile spacing */}
          <main className="p-3 sm:p-4 md:p-6 pb-24 md:pb-6 min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] safe-area-bottom">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
