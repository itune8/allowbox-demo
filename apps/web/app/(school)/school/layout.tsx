'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ProfessionalSidebar, type SidebarSection } from '@repo/ui/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { ToastProvider } from '../../../components/school/toast';
import { useMemo, useState, useEffect } from 'react';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  GraduationCap,
  FileText,
  DollarSign,
  HeartPulse,
  Bus,
  CalendarCheck,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
  ClipboardList,
  ArrowUpCircle,
} from 'lucide-react';

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    title: 'People',
    items: [
      { key: 'students', label: 'Students', icon: <Users className="w-5 h-5" /> },
      { key: 'staff', label: 'Staff & Teachers', icon: <UserPlus className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Academics',
    items: [
      { key: 'classes', label: 'Classes', icon: <BookOpen className="w-5 h-5" /> },
      { key: 'subjects', label: 'Subjects', icon: <ClipboardList className="w-5 h-5" /> },
      { key: 'grades', label: 'Exams & Results', icon: <GraduationCap className="w-5 h-5" /> },
      { key: 'promote', label: 'Promote', icon: <ArrowUpCircle className="w-5 h-5" /> },
      { key: 'homework', label: 'Assignments', icon: <FileText className="w-5 h-5" /> },
      { key: 'timetable', label: 'Timetable', icon: <Calendar className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { key: 'fees', label: 'Fees & Billing', icon: <DollarSign className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Services',
    items: [
      { key: 'health', label: 'Health Records', icon: <HeartPulse className="w-5 h-5" /> },
      { key: 'transport', label: 'Transport', icon: <Bus className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Administration',
    items: [
      { key: 'leave-management', label: 'Leave Requests', icon: <CalendarCheck className="w-5 h-5" /> },
      { key: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
    ],
  },
  {
    title: 'System',
    items: [
      { key: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
      { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
      { key: 'support', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
    ],
  },
];

const pageTitles: Record<string, string> = {
  dashboard: 'School Dashboard',
  students: 'Students Management',
  staff: 'Staff & Teachers',
  classes: 'Classes & Sections',
  subjects: 'Subjects',
  grades: 'Exams & Results',
  promote: 'Student Promotion',
  homework: 'Assignments',
  timetable: 'Timetable',
  fees: 'Fees & Billing',
  health: 'Health Records',
  transport: 'Transport',
  'leave-management': 'Leave Management',
  events: 'Events',
  reports: 'Reports',
  settings: 'Settings',
  support: 'Help & Support',
};

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeItem = useMemo(() => {
    if (pathname === '/school' || pathname === '/school/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[1] || 'dashboard';
  }, [pathname]);

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

  const handleNavigation = (key: string) => {
    if (key === 'dashboard') {
      router.push('/school');
    } else {
      router.push(`/school/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const schoolName = loadingTenant ? 'Loading...' : tenantData?.schoolName || 'School Admin';

  return (
    <ProtectedRoute>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50">
          <ProfessionalSidebar
            title={schoolName}
            subtitle="School Management"
            sections={sidebarSections}
            activeItem={activeItem}
            onItemClick={handleNavigation}
            defaultCollapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            user={{
              name: userName,
              email: user?.email,
              role: 'School Admin',
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
                  {schoolName}
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
  );
}
