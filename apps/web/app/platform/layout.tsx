'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ProfessionalSidebar, type SidebarSection } from '@repo/ui/navigation';
import { useAuth } from '../../contexts/auth-context';
import { ProtectedRoute } from '../../components/protected-route';
import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  School,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Bell,
  Activity,
  HelpCircle,
  Settings,
} from 'lucide-react';

const sidebarSections: SidebarSection[] = [
  {
    title: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Management',
    items: [
      { key: 'schools', label: 'Schools', icon: <School className="w-5 h-5" /> },
      { key: 'users', label: 'Users & Roles', icon: <Users className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { key: 'finance', label: 'Finance & Billing', icon: <DollarSign className="w-5 h-5" /> },
      { key: 'invoices', label: 'Invoices', icon: <FileText className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Communication',
    items: [
      { key: 'announcements', label: 'Announcements', icon: <Bell className="w-5 h-5" /> },
      { key: 'support', label: 'Support Tickets', icon: <HelpCircle className="w-5 h-5" /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { key: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
      { key: 'activity', label: 'Activity Logs', icon: <Activity className="w-5 h-5" /> },
    ],
  },
  {
    title: 'System',
    items: [
      { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ],
  },
];

export default function PlatformLayout({
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
    if (pathname === '/platform' || pathname === '/platform/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'dashboard';
  }, [pathname]);

  const handleNavigation = (key: string) => {
    if (key === 'dashboard') {
      router.push('/platform/dashboard');
    } else {
      router.push(`/platform/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Super Admin';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Professional Sidebar */}
        <ProfessionalSidebar
          title="EduConnect"
          subtitle="Platform Owner"
          sections={sidebarSections}
          activeItem={activeItem}
          onItemClick={handleNavigation}
          defaultCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          user={{
            name: userName,
            email: user?.email,
            role: 'Super Admin',
          }}
          onLogout={logout}
        />

        {/* Main content area */}
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          {/* Top bar with page info */}
          <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {activeItem === 'dashboard' ? 'Platform Overview' : activeItem.charAt(0).toUpperCase() + activeItem.slice(1).replace('-', ' ')}
              </h1>
              <p className="text-xs text-slate-500">
                Manage all schools and users
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden lg:block">
                <input
                  type="text"
                  placeholder="Search schools, users..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick action */}
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors">
                Add School
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 md:p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
