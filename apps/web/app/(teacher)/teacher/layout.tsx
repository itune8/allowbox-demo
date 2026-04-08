'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ProfessionalSidebar, type SidebarSection } from '@repo/ui/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { DemoModeBar } from '../../../components/demo-mode-bar';
import { ToastProvider } from '../../../components/school/toast';
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckCircle,
  GraduationCap,
  FileText,
  ClipboardList,
  FolderOpen,
  MessageSquare,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  BookOpenCheck,
  Settings,
} from 'lucide-react';

const sidebarSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Teaching',
    items: [
      { key: 'classes', label: 'My Classes', icon: <BookOpen className="w-5 h-5" /> },
      { key: 'timetable', label: 'My Schedule', icon: <Calendar className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Assessment',
    items: [
      { key: 'attendance', label: 'Attendance', icon: <CheckCircle className="w-5 h-5" /> },
      { key: 'grades', label: 'Exams & Marks', icon: <GraduationCap className="w-5 h-5" /> },
      { key: 'homework', label: 'Homework', icon: <FileText className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Resources',
    items: [
      { key: 'materials', label: 'Learning Materials', icon: <FolderOpen className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Communication',
    items: [
      { key: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
      { key: 'events', label: 'Events', icon: <CalendarDays className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Personal',
    items: [
      { key: 'leave-requests', label: 'Leave Requests', icon: <CalendarCheck className="w-5 h-5" /> },
      { key: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
      { key: 'diary', label: 'Daily Diary', icon: <BookOpenCheck className="w-5 h-5" /> },
      { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ],
  },
];

const pageTitles: Record<string, string> = {
  dashboard: 'Teacher Dashboard',
  classes: 'My Classes',
  timetable: 'My Schedule',
  attendance: 'Attendance',
  grades: 'Exams & Marks',
  homework: 'Homework',
  'lesson-plans': 'Lesson Plans',
  materials: 'Learning Materials',
  messages: 'Messages',
  events: 'Events',
  'leave-requests': 'Leave Requests',
  reports: 'Reports',
  diary: 'Daily Diary',
  settings: 'Settings',
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeItem = useMemo(() => {
    if (pathname === '/teacher' || pathname === '/teacher/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[1] || 'dashboard';
  }, [pathname]);

  const handleNavigation = (key: string) => {
    if (key === 'dashboard') {
      router.push('/teacher');
    } else {
      router.push(`/teacher/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Teacher';

  return (
    <>
      <DemoModeBar />
      <div className="pt-10 sm:pt-11">
        <ProtectedRoute>
          <ToastProvider>
            <div className="min-h-screen bg-slate-50">
              <ProfessionalSidebar
                title="Teacher Portal"
                subtitle="Teaching Hub"
                sections={sidebarSections}
                activeItem={activeItem}
                onItemClick={handleNavigation}
                defaultCollapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
                user={{
                  name: userName,
                  email: user?.email,
                  role: 'Teacher',
                }}
                onLogout={logout}
              />

              <div
                className={`transition-all duration-300 ${
                  sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
              >
                <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                      {pageTitles[activeItem] || activeItem.charAt(0).toUpperCase() + activeItem.slice(1).replace(/-/g, ' ')}
                    </h1>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Teacher Portal
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="relative hidden lg:block">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-64 pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] transition-all placeholder:text-slate-400"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    </div>

                    <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                  </div>
                </header>

                <main className="p-3 sm:p-4 md:p-6 pb-24 md:pb-6 animate-fade-in">
                  {children}
                </main>
              </div>
            </div>
          </ToastProvider>
        </ProtectedRoute>
      </div>
    </>
  );
}
