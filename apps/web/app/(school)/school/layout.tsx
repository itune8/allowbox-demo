'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useMemo, useState, useEffect, ReactNode } from 'react';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  GraduationCap,
  FileText,
  BookMarked,
  DollarSign,
  HeartPulse,
  Bus,
  Package,
  CalendarCheck,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Home,
  ChevronDown,
} from 'lucide-react';

// Professional menu structure
interface MenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  section?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
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
      { key: 'grades', label: 'Grades & Results', icon: <GraduationCap className="w-5 h-5" /> },
      { key: 'homework', label: 'Homework', icon: <FileText className="w-5 h-5" /> },
      { key: 'diary', label: 'Daily Diary', icon: <BookMarked className="w-5 h-5" /> },
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
      { key: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
      { key: 'leave-management', label: 'Leave Requests', icon: <CalendarCheck className="w-5 h-5" /> },
      { key: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
      { key: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
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

// Mobile bottom navigation
const mobileNavItems = [
  { key: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { key: 'students', label: 'Students', icon: <Users className="w-5 h-5" /> },
  { key: 'grades', label: 'Grades', icon: <GraduationCap className="w-5 h-5" /> },
  { key: 'fees', label: 'Fees', icon: <DollarSign className="w-5 h-5" /> },
  { key: 'menu', label: 'Menu', icon: <Menu className="w-5 h-5" /> },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeItem = useMemo(() => {
    if (pathname === '/school' || pathname === '/school/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    return segments[segments.length - 1] || 'dashboard';
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
    if (key === 'menu') {
      setMobileMenuOpen(true);
      return;
    }
    if (key === 'dashboard') {
      router.push('/school');
    } else {
      router.push(`/school/${key}`);
    }
    setMobileMenuOpen(false);
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Professional Sidebar - Desktop */}
        <aside
          className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 transition-all duration-300 ${
            sidebarCollapsed ? 'w-[72px]' : 'w-64'
          }`}
        >
          {/* Logo / Brand */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="overflow-hidden">
                  <h1 className="text-sm font-semibold text-slate-900 truncate">
                    {loadingTenant ? 'Loading...' : tenantData?.schoolName || 'AllowBox'}
                  </h1>
                  <p className="text-xs text-slate-500">School Management</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">A</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
                {!sidebarCollapsed && (
                  <h3 className="px-3 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = activeItem === item.key;
                    return (
                      <li key={item.key}>
                        <button
                          onClick={() => handleNavigation(item.key)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-white'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          } ${sidebarCollapsed ? 'justify-center' : ''}`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <span className={isActive ? 'text-white' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Collapse Toggle */}
          <div className="p-3 border-t border-slate-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
              <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {tenantData?.schoolName || 'AllowBox'}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="overflow-y-auto py-4 px-3 h-[calc(100%-56px)]">
                {menuSections.map((section, sectionIndex) => (
                  <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
                    <h3 className="px-3 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = activeItem === item.key;
                        return (
                          <li key={item.key}>
                            <button
                              onClick={() => handleNavigation(item.key)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                  ? 'bg-primary text-white'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <span className={isActive ? 'text-white' : 'text-slate-400'}>
                                {item.icon}
                              </span>
                              <span>{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'
          }`}
        >
          {/* Professional Header */}
          <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Page Title - Desktop */}
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-slate-900">
                  {activeItem === 'dashboard' ? 'Dashboard' :
                   menuSections.flatMap(s => s.items).find(i => i.key === activeItem)?.label || 'Dashboard'}
                </h1>
              </div>

              {/* Mobile Title */}
              <div className="md:hidden flex-1 text-center">
                <h1 className="text-base font-semibold text-slate-900">
                  {tenantData?.schoolName || 'AllowBox'}
                </h1>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 md:gap-4">
                {/* Search - Desktop */}
                <div className="hidden lg:flex items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{userInitials}</span>
                    </div>
                    <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-medium text-slate-900">{userName}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            router.push('/school/settings');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 md:p-6 pb-24 md:pb-6 min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200 safe-area-bottom">
          <div className="flex items-center justify-around h-16">
            {mobileNavItems.map((item) => {
              const isActive = activeItem === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.key)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] ${
                    isActive ? 'text-primary' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
