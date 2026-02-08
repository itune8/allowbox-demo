'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, type SidebarMenuItem } from '@repo/ui/sidebar';
import { Icon3D } from '@/components/ui';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useMemo, useState, ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  BookMarked,
  BookOpen,
  CreditCard,
  DollarSign,
  HeartPulse,
  Bus,
  MessageSquare,
  Calendar,
  HelpCircle,
  MoreHorizontal,
  Home,
} from 'lucide-react';

// Icon wrapper for standard icons
const IconWrapper = ({ children }: { children: ReactNode }) => (
  <div className="w-5 h-5 flex items-center justify-center">
    {children}
  </div>
);

const sidebarMenu: SidebarMenuItem[] = [
  // Overview
  { key: 'dashboard', label: 'Dashboard', icon: <Icon3D bgColor="bg-primary"><LayoutDashboard className="w-4 h-4" /></Icon3D> },

  // My Children Section
  { key: 'section-children', label: 'My Children', isSection: true },
  { key: 'children', label: 'Children Profile', icon: <Icon3D bgColor="bg-sky-500"><Users className="w-4 h-4" /></Icon3D> },

  // Academics Section
  { key: 'section-academics', label: 'Academics', isSection: true },
  { key: 'grades', label: 'Grades & Results', icon: <Icon3D bgColor="bg-amber-500"><GraduationCap className="w-4 h-4" /></Icon3D> },
  { key: 'homework', label: 'Homework', icon: <Icon3D bgColor="bg-pink-500"><FileText className="w-4 h-4" /></Icon3D> },
  { key: 'diary', label: 'Daily Diary', icon: <Icon3D bgColor="bg-cyan-500"><BookMarked className="w-4 h-4" /></Icon3D> },
  { key: 'lesson-plans', label: 'Lesson Plans', icon: <Icon3D bgColor="bg-purple-500"><BookOpen className="w-4 h-4" /></Icon3D> },

  // Finance Section
  { key: 'section-finance', label: 'Finance', isSection: true },
  { key: 'fees', label: 'Fee Structure', icon: <Icon3D bgColor="bg-yellow-500"><CreditCard className="w-4 h-4" /></Icon3D> },
  { key: 'payments', label: 'Payment History', icon: <Icon3D bgColor="bg-green-500"><DollarSign className="w-4 h-4" /></Icon3D> },

  // Services Section
  { key: 'section-services', label: 'Services', isSection: true },
  { key: 'health', label: 'Health Records', icon: <Icon3D bgColor="bg-red-500"><HeartPulse className="w-4 h-4" /></Icon3D> },
  { key: 'transport', label: 'Transport', icon: <Icon3D bgColor="bg-slate-500"><Bus className="w-4 h-4" /></Icon3D> },

  // Communication Section
  { key: 'section-comms', label: 'Communication', isSection: true },
  { key: 'messages', label: 'Messages', icon: <Icon3D bgColor="bg-blue-500"><MessageSquare className="w-4 h-4" /></Icon3D> },
  { key: 'events', label: 'School Events', icon: <Icon3D bgColor="bg-fuchsia-500"><Calendar className="w-4 h-4" /></Icon3D> },

  // Support Section
  { key: 'section-support', label: 'Help', isSection: true },
  { key: 'support', label: 'Help & Support', icon: <Icon3D bgColor="bg-orange-500"><HelpCircle className="w-4 h-4" /></Icon3D> },
];

// Bottom navigation items for mobile - most important features
const bottomNavItems: SidebarMenuItem[] = [
  { key: 'dashboard', label: 'Home', icon: <IconWrapper><Home className="w-5 h-5" /></IconWrapper> },
  { key: 'children', label: 'Children', icon: <IconWrapper><Users className="w-5 h-5" /></IconWrapper> },
  { key: 'grades', label: 'Grades', icon: <IconWrapper><GraduationCap className="w-5 h-5" /></IconWrapper> },
  { key: 'fees', label: 'Fees', icon: <IconWrapper><CreditCard className="w-5 h-5" /></IconWrapper> },
  { key: 'more', label: 'More', icon: <IconWrapper><MoreHorizontal className="w-5 h-5" /></IconWrapper> },
];

export default function ParentLayout({
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
    if (pathname === '/parent' || pathname === '/parent/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'dashboard';
  }, [pathname]);

  const handleMenuClick = (key: string) => {
    if (key === 'more') {
      // Open mobile menu - handled by sidebar component
      return;
    }
    if (key === 'dashboard') {
      router.push('/parent');
    } else {
      router.push(`/parent/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Parent';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Sidebar */}
        <Sidebar
          title="Parent Portal"
          subtitle="Track your child's progress"
          menu={sidebarMenu}
          activeItem={activeItem}
          onItemClick={handleMenuClick}
          bottomNavItems={bottomNavItems}
          onCollapsedChange={setSidebarCollapsed}
          user={{
            name: userName,
            email: user?.email,
            role: 'Parent',
          }}
          onLogout={logout}
        />

        {/* Main content */}
        <div className={`transition-all duration-300 ease-smooth ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
          {/* Mobile Header */}
          <header className="md:hidden sticky top-0 z-20 glass-strong px-4 h-14 flex items-center justify-between safe-area-top">
            <div className="ml-12 flex-1 min-w-0">
              <h1 className="text-base font-semibold text-gray-900 truncate">
                Parent Portal
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 rounded-xl hover:bg-gray-100/80 active:scale-95 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </div>
          </header>

          {/* Desktop Header with Glassmorphism */}
          <header className="hidden md:flex sticky top-0 z-20 glass-strong h-16 items-center justify-between px-6 border-b border-white/20">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                Parent Dashboard
              </h1>
              <p className="text-xs text-gray-500">
                Track your child's academic progress
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search with glass effect */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2.5 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:bg-white focus:border-indigo-300 transition-all placeholder:text-gray-400"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>

              {/* Notifications with animation */}
              <button className="relative p-2.5 rounded-xl hover:bg-white/60 transition-all duration-200 group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
              </button>

              {/* Quick Actions with gradient */}
              <button className="px-5 py-2.5 text-sm font-medium text-white bg-gray-50 hover:from-indigo-700 hover:to-indigo-800 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]">
                Pay Fees
              </button>
            </div>
          </header>

          {/* Page content with smooth transitions */}
          <main className="p-4 md:p-6 pb-20 md:pb-6 min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
