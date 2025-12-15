'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, type SidebarMenuItem } from '@repo/ui/sidebar';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useMemo, useState, useEffect } from 'react';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';

// Icons as components for cleaner code
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const StudentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const StaffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const ClassesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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

const FeesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const HealthIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const TransportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const InventoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
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

const EventsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);

const MessagesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SupportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
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

  // People Section
  { key: 'section-people', label: 'People', isSection: true },
  { key: 'students', label: 'Students', icon: <StudentsIcon /> },
  { key: 'staff', label: 'Staff & Teachers', icon: <StaffIcon /> },

  // Academics Section
  { key: 'section-academics', label: 'Academics', isSection: true },
  { key: 'classes', label: 'Classes', icon: <ClassesIcon /> },
  { key: 'grades', label: 'Grades & Results', icon: <GradesIcon /> },
  { key: 'homework', label: 'Homework', icon: <HomeworkIcon /> },
  { key: 'diary', label: 'Daily Diary', icon: <DiaryIcon /> },

  // Finance Section
  { key: 'section-finance', label: 'Finance', isSection: true },
  { key: 'fees', label: 'Fees & Billing', icon: <FeesIcon /> },

  // Student Services Section
  { key: 'section-services', label: 'Student Services', isSection: true },
  { key: 'health', label: 'Health Records', icon: <HealthIcon /> },
  { key: 'transport', label: 'Transport', icon: <TransportIcon /> },

  // Administration Section
  { key: 'section-admin', label: 'Administration', isSection: true },
  { key: 'inventory', label: 'Inventory', icon: <InventoryIcon /> },
  { key: 'leave-management', label: 'Leave Requests', icon: <LeaveIcon /> },
  { key: 'events', label: 'Events', icon: <EventsIcon /> },

  // Communication Section
  { key: 'section-comms', label: 'Communication', isSection: true },
  { key: 'messages', label: 'Messages', icon: <MessagesIcon /> },

  // Settings Section
  { key: 'section-settings', label: 'System', isSection: true },
  { key: 'reports', label: 'Reports', icon: <ReportsIcon /> },
  { key: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  { key: 'support', label: 'Help & Support', icon: <SupportIcon /> },
];

// Bottom navigation items for mobile - most important features
const bottomNavItems: SidebarMenuItem[] = [
  { key: 'dashboard', label: 'Home', icon: <DashboardIcon /> },
  { key: 'students', label: 'Students', icon: <StudentsIcon /> },
  { key: 'grades', label: 'Grades', icon: <GradesIcon /> },
  { key: 'fees', label: 'Fees', icon: <FeesIcon /> },
  { key: 'more', label: 'More', icon: <MoreIcon /> },
];

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
  const [isMobileApp, setIsMobileApp] = useState(false);

  // Check if running inside mobile WebView - must have ReactNativeWebView object
  useEffect(() => {
    const hasReactNativeWebView = !!(window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView;
    setIsMobileApp(hasReactNativeWebView);
  }, []);

  // Determine active menu item from pathname
  const activeItem = useMemo(() => {
    if (pathname === '/school' || pathname === '/school/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'dashboard';
  }, [pathname]);

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

  const handleMenuClick = (key: string) => {
    if (key === 'more') {
      // Open mobile menu - handled by sidebar component
      return;
    }
    if (key === 'dashboard') {
      router.push('/school');
    } else {
      router.push(`/school/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

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
          title={loadingTenant ? 'Loading...' : tenantData?.schoolName || 'AllowBox School'}
          subtitle="School Management"
          menu={sidebarMenu}
          activeItem={activeItem}
          onItemClick={handleMenuClick}
          bottomNavItems={bottomNavItems}
          onCollapsedChange={setSidebarCollapsed}
          user={{
            name: userName,
            email: user?.email,
            role: 'School Admin',
          }}
          onLogout={logout}
        />

        {/* Main content */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between">
            <div className="ml-12">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {loadingTenant ? 'Loading...' : tenantData?.schoolName || 'AllowBox'}
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
                School Admin Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage your school efficiently
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
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
                + Add New
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
