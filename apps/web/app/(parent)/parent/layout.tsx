'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, type SidebarMenuItem } from '@repo/ui/sidebar';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useRef, useState, useEffect } from 'react';

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

  // My Children Section
  { key: 'section-children', label: 'My Children', isSection: true },
  {
    key: 'children',
    label: 'Children Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },

  // Academics Section
  { key: 'section-academics', label: 'Academics', isSection: true },
  {
    key: 'grades',
    label: 'Grades & Results',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
  {
    key: 'homework',
    label: 'Homework',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    key: 'diary',
    label: 'Daily Diary',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    key: 'lesson-plans',
    label: 'Lesson Plans',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },

  // Finance Section
  { key: 'section-finance', label: 'Finance', isSection: true },
  {
    key: 'fees',
    label: 'Fee Structure',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    key: 'payments',
    label: 'Payment History',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },

  // Services Section
  { key: 'section-services', label: 'Services', isSection: true },
  {
    key: 'health',
    label: 'Health Records',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    key: 'transport',
    label: 'Transport',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },

  // Communication Section
  { key: 'section-comms', label: 'Communication', isSection: true },
  {
    key: 'messages',
    label: 'Messages',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: 'events',
    label: 'School Events',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="15" r="2" />
      </svg>
    ),
  },

  // Support Section
  { key: 'section-support', label: 'Help', isSection: true },
  {
    key: 'support',
    label: 'Help & Support',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Determine active menu item from pathname
  const activeItem = (() => {
    if (pathname === '/parent' || pathname === '/parent/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'dashboard';
  })();

  // Close profile menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
        setShowNotif(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleMenuClick = (key: string) => {
    if (key === 'dashboard') {
      router.push('/parent');
    } else {
      router.push(`/parent/${key}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen transition-opacity duration-300 ease-in-out text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950">
        {/* Clean background - moved to parent */}

        {/* Sidebar */}
        <Sidebar
          title="Parent Portal"
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
                Parent Dashboard
              </h1>
              <div className="flex items-center gap-3 relative" ref={profileRef}>
                {/* Notifications */}
                <button
                  className="h-8 w-8 rounded-full grid place-items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                  onClick={() => setShowNotif((s) => !s)}
                  title="Notifications"
                >
                  🔔
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                </button>
                {showNotif && (
                  <div className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md p-3 space-y-2 animate-slide-in-bottom z-[9999]">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Latest updates</div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">📄 Your invoice receipt is ready.</div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      💬 Support replied to your ticket.
                    </div>
                  </div>
                )}

                <button
                  className="flex items-center gap-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ease-smooth px-2 py-1"
                  onClick={() => setShowProfileMenu((s) => !s)}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-100 font-semibold">
                    {user?.firstName?.[0] ?? 'P'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-[10px] text-gray-500">Parent</div>
                  </div>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg animate-zoom-in z-[9999]">
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
          <main className="mx-auto w-full p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)]">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
