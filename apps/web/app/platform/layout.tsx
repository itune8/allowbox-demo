'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, type SidebarMenuItem } from '@repo/ui/sidebar';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../contexts/auth-context';
import { ProtectedRoute } from '../../components/protected-route';
import { useMemo, useRef, useState, useEffect } from 'react';

const sidebarMenu: SidebarMenuItem[] = [
  // Overview
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },

  // Management Section
  { key: 'section-management', label: 'Management', isSection: true },
  {
    key: 'schools',
    label: 'Schools',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'users',
    label: 'Users & Roles',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },

  // Finance Section
  { key: 'section-finance', label: 'Finance', isSection: true },
  {
    key: 'finance',
    label: 'Finance & Billing',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },

  // Communication Section
  { key: 'section-comms', label: 'Communication', isSection: true },
  {
    key: 'announcements',
    label: 'Announcements',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z" />
        <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
      </svg>
    ),
  },
  {
    key: 'support',
    label: 'Support Tickets',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },

  // Analytics Section
  { key: 'section-analytics', label: 'Analytics', isSection: true },
  {
    key: 'reports',
    label: 'Reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    ),
  },
  {
    key: 'activity',
    label: 'Activity Logs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },

  // System Section
  { key: 'section-system', label: 'System', isSection: true },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Determine active menu item from pathname
  const activeItem = useMemo(() => {
    if (pathname === '/platform' || pathname === '/platform/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'dashboard';
  }, [pathname]);

  // Close profile menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleMenuClick = (key: string) => {
    if (key === 'dashboard') {
      router.push('/platform/dashboard');
    } else {
      router.push(`/platform/${key}`);
    }
  };

  // Check if user has platform access (super_admin, sales, support, finance)
  const platformRoles = ['super_admin', 'sales', 'support', 'finance'];
  const hasplatformAccess = user?.roles?.some(role => platformRoles.includes(role));

  if (user && !hasplatformAccess) {
    router.push('/school');
    return null;
  }

  // Get user's primary role for platform
  const userRole = user?.roles?.find(role => platformRoles.includes(role)) || 'super_admin';

  return (
    <ProtectedRoute>
      <div className="relative flex transition-opacity duration-300 ease-in-out text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <Sidebar
          title="SuperAdmin Portal"
          menu={sidebarMenu}
          activeItem={activeItem}
          onItemClick={handleMenuClick}
          footer={
            <Button variant="outline" size="sm" onClick={logout} className="w-full">
              Logout
            </Button>
          }
        />

        {/* Main content - add left margin to account for fixed sidebar */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Topbar */}
          <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 animate-slide-in-top">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Platform Management
              </h1>
              <div className="flex items-center gap-3 relative" ref={profileRef}>
                <button
                  className="flex items-center gap-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ease-smooth px-2 py-1"
                  onClick={() => setShowProfileMenu((s) => !s)}
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                    {user?.firstName?.[0] ?? 'S'}{user?.lastName?.[0] ?? 'A'}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100 hidden sm:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg animate-zoom-in">
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 transition-colors"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/auth/forgot_password');
                      }}
                    >
                      Reset Password
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm text-red-600 transition-colors"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto w-full p-4 sm:p-6 lg:p-8 h-[calc(100vh-64px)] overflow-y-auto animate-slide-in-bottom">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
