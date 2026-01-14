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
      <Icon3D gradient="from-indigo-500 to-purple-600">
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
      <Icon3D gradient="from-blue-500 to-cyan-500">
        <School size={20} />
      </Icon3D>
    ),
  },
  {
    key: 'users',
    label: 'Users & Roles',
    icon: (
      <Icon3D gradient="from-violet-500 to-purple-500">
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
      <Icon3D gradient="from-green-500 to-emerald-500">
        <DollarSign size={20} />
      </Icon3D>
    ),
  },
  {
    key: 'invoices',
    label: 'Invoices',
    icon: (
      <Icon3D gradient="from-amber-500 to-orange-500">
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
      <Icon3D gradient="from-rose-500 to-pink-500">
        <Bell size={20} />
      </Icon3D>
    ),
  },
  {
    key: 'support',
    label: 'Support Tickets',
    icon: (
      <Icon3D gradient="from-teal-500 to-cyan-500">
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
      <Icon3D gradient="from-purple-500 to-pink-500">
        <BarChart3 size={20} />
      </Icon3D>
    ),
  },
  {
    key: 'activity',
    label: 'Activity Logs',
    icon: (
      <Icon3D gradient="from-sky-500 to-blue-500">
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
      <Icon3D gradient="from-gray-500 to-slate-600">
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
      <div className="relative flex transition-opacity duration-300 ease-in-out text-gray-900 bg-white">
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
          <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200 animate-slide-in-top">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Platform Management
              </h1>
              <div className="flex items-center gap-3 relative" ref={profileRef}>
                <button
                  className="flex items-center gap-2 rounded-full hover:bg-gray-100 transition-colors ease-smooth px-2 py-1"
                  onClick={() => setShowProfileMenu((s) => !s)}
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {user?.firstName?.[0] ?? 'S'}{user?.lastName?.[0] ?? 'A'}
                  </div>
                  <span className="text-sm text-gray-900 hidden sm:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-md shadow-lg animate-zoom-in">
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-900 transition-colors"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/auth/forgot_password');
                      }}
                    >
                      Reset Password
                    </button>
                    <div className="h-px bg-gray-200" />
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600 transition-colors"
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
