'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TopNavigation, type TopNavItem } from '@repo/ui/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

const navItems: TopNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'classes', label: 'Classes', icon: <Users className="w-4 h-4" /> },
  { key: 'homework', label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
  { key: 'attendance', label: 'Attendance', icon: <CheckCircle className="w-4 h-4" /> },
  { key: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Determine active menu item from pathname
  const activeItem = useMemo(() => {
    if (pathname === '/teacher' || pathname === '/teacher/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'dashboard';

    // Map various paths to main nav items
    if (['grades', 'diary', 'lesson-plans'].includes(lastSegment)) {
      return 'classes'; // These fall under "Classes"
    }
    if (['messages', 'events'].includes(lastSegment)) {
      return 'messages'; // Communication items
    }

    return lastSegment;
  }, [pathname]);

  const handleNavClick = (key: string) => {
    if (key === 'dashboard') {
      router.push('/teacher');
    } else if (key === 'classes') {
      // TODO: Create classes page or redirect to appropriate page
      router.push('/teacher/grades');
    } else {
      router.push(`/teacher/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Teacher';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Top Navigation */}
        <TopNavigation
          title="EduConnect"
          items={navItems}
          activeItem={activeItem}
          onItemClick={handleNavClick}
          user={{
            name: userName,
            email: user?.email,
            role: 'Teacher',
          }}
          onLogout={logout}
          showNotifications={true}
          notificationCount={5}
        />

        {/* Main content */}
        <main className="pt-4 px-4 md:px-6 pb-20 md:pb-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
