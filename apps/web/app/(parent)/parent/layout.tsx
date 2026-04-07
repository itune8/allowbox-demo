'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ProfessionalSidebar, type SidebarSection } from '@repo/ui/navigation';
import { DemoModeBar } from '../../../components/demo-mode-bar';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { ToastProvider } from '../../../components/school/toast';
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  CheckCircle,
  Calendar,
  FileText,
  GraduationCap,
  BarChart3,
  BookOpen,
  DollarSign,
  MessageSquare,
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
    title: 'Academics',
    items: [
      { key: 'attendance', label: 'Attendance', icon: <CheckCircle className="w-5 h-5" /> },
      { key: 'timetable', label: 'Timetable', icon: <Calendar className="w-5 h-5" /> },
      { key: 'homework', label: 'Homework & Assignments', icon: <FileText className="w-5 h-5" /> },
      { key: 'exams', label: 'Exams & Events', icon: <GraduationCap className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Performance',
    items: [
      { key: 'performance', label: 'Performance', icon: <BarChart3 className="w-5 h-5" /> },
      { key: 'materials', label: 'Study Materials', icon: <BookOpen className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { key: 'fees', label: 'Fees', icon: <DollarSign className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Communication',
    items: [
      { key: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ],
  },
];

const pageTitles: Record<string, string> = {
  dashboard: 'Parent Dashboard',
  attendance: 'Attendance',
  timetable: 'Timetable',
  homework: 'Homework & Assignments',
  exams: 'Exams & Events',
  performance: 'Performance',
  materials: 'Study Materials',
  fees: 'Fees',
  messages: 'Messages',
  settings: 'Settings',
};

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeItem = useMemo(() => {
    if (pathname === '/parent' || pathname === '/parent/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[1] || 'dashboard';
  }, [pathname]);

  const handleNavigation = (key: string) => {
    if (key === 'dashboard') {
      router.push('/parent');
    } else {
      router.push(`/parent/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Parent';

  return (
    <>
      <DemoModeBar />
      <div className="pt-10 sm:pt-11">
        <ProtectedRoute>
          <ToastProvider>
            <div className="min-h-screen bg-slate-50">
              <ProfessionalSidebar
                title="Parent Portal"
                subtitle="Family Hub"
                sections={sidebarSections}
                activeItem={activeItem}
                onItemClick={handleNavigation}
                defaultCollapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
                user={{
                  name: userName,
                  email: user?.email,
                  role: 'Parent',
                }}
                onLogout={logout}
              />

              <div
                className={`transition-all duration-300 ${
                  sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
              >
                <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">
                      {pageTitles[activeItem] || activeItem.charAt(0).toUpperCase() + activeItem.slice(1).replace(/-/g, ' ')}
                    </h1>
                    <p className="text-xs text-slate-500">
                      Parent Portal
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
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

                <main className="p-4 md:p-6 animate-fade-in">
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
