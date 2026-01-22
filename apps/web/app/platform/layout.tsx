'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, type SidebarMenuItem } from '@repo/ui/sidebar';
import { Button } from '@repo/ui/button';
import { Icon3D } from '@repo/ui/icon-3d';
import { useAuth } from '../../contexts/auth-context';
import { ProtectedRoute } from '../../components/protected-route';
import { useMemo, useRef, useState, useEffect } from 'react';
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

const sidebarMenu: SidebarMenuItem[] = [
  // Overview
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <Icon3D bgColor="bg-primary">
        <LayoutDashboard size={20} />
      </Icon3D>
    ),
  },

  // Management Section
  { key: 'section-management', label: 'Management', isSection: true },
  {
    key: 'schools',
    label: 'Schools',
    icon: (
      <Icon3D bgColor="bg-sky-500">
        <School size={20} />
      </Icon3D>
    ),
  },
  {
    key: 'users',
    label: 'Users & Roles',
    icon: (
      <Icon3D bgColor="bg-violet-500">
        <Users size={20} />
      </Icon3D>
    ),
  },

  // Finance Section
  { key: 'section-finance', label: 'Finance', isSection: true },
  {
    key: 'finance',
    label: 'Finance & Billing',
    icon: (
      <Icon3D bgColor="bg-green-500">
        <DollarSign size={20} />
      </Icon3D>
    ),
  },
  {
    key: 'invoices',
    label: 'Invoices',
    icon: (
      <Icon3D bgColor="bg-amber-500">
        <FileText size={20} />
      </Icon3D>
    ),
  },

  // Communication Section
  { key: 'section-comms', label: 'Communication', isSection: true },
  {
    key: 'announcements',
    label: 'Announcements',
    icon: (
      <Icon3D bgColor="bg-pink-500">
        <Bell size={20} />
      </Icon3D>
    ),
  },
  {
    key: 'support',
    label: 'Support Tickets',
    icon: (
      <Icon3D bgColor="bg-teal-500">
        <HelpCircle size={20} />
      </Icon3D>
    ),
  },

  // Analytics Section
  { key: 'section-analytics', label: 'Analytics', isSection: true },
  {
    key: 'reports',
    label: 'Reports',
    icon: (
      <Icon3D bgColor="bg-purple-500">
        <BarChart3 size={20} />
      </Icon3D>
    ),
  },
  {
    key: 'activity',
    label: 'Activity Logs',
    icon: (
      <Icon3D bgColor="bg-cyan-500">
        <Activity size={20} />
      </Icon3D>
    ),
  },

  // System Section
  { key: 'section-system', label: 'System', isSection: true },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <Icon3D bgColor="bg-gray-500">
        <Settings size={20} />
      </Icon3D>
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
      <div className="relative flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          title="Allowbox Platform"
          subtitle="Super Admin"
          menu={sidebarMenu}
          activeItem={activeItem}
          onItemClick={handleMenuClick}
          user={{
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
            role: userRole,
          }}
          onLogout={logout}
        />

        {/* Main content - add left margin to account for fixed sidebar */}
        <div className="flex-1 flex flex-col md:ml-64">
          {/* Topbar */}
          <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
            <div className="container-padding h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Platform Management
                </h1>
                <span className="hidden md:inline-flex px-3 py-1 bg-primary-50 text-primary text-xs font-semibold rounded-full">
                  {userRole.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Desktop Profile */}
              <div className="hidden md:flex items-center gap-3 relative" ref={profileRef}>
                <button
                  className="flex items-center gap-3 rounded-xl hover:bg-gray-50 transition-colors px-3 py-2"
                  onClick={() => setShowProfileMenu((s) => !s)}
                >
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl animate-zoom-in overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account</p>
                    </div>
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-900 transition-colors flex items-center gap-2"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/auth/forgot_password');
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      Reset Password
                    </button>
                    <div className="h-px bg-gray-200" />
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors flex items-center gap-2"
                      onClick={logout}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 container-padding py-6 md:py-8 overflow-y-auto pb-20 md:pb-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
