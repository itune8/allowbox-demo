'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, type SidebarMenuItem } from '@repo/ui/sidebar';
import { Button } from '@repo/ui/button';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useRef, useState, useEffect } from 'react';

const sidebarMenu: SidebarMenuItem[] = [
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
  {
    key: 'children',
    label: 'Children',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'fees',
    label: 'Fees',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    key: 'support',
    label: 'Support',
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
      <div className="relative flex transition-opacity duration-300 ease-in-out text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950">
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
          <main className="mx-auto w-full p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
