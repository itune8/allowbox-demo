'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TopNavigation, type TopNavItem } from '@repo/ui/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { ProtectedRoute } from '../../../components/protected-route';
import { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
} from 'lucide-react';

const navItems: TopNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'children', label: 'My Child', icon: <Users className="w-4 h-4" /> },
  { key: 'fees', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
  { key: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Determine active menu item from pathname
  const activeItem = useMemo(() => {
    if (pathname === '/parent' || pathname === '/parent/') return 'dashboard';
    const segments = pathname.split('/').filter(Boolean);
    // Map paths to top nav items
    const lastSegment = segments[segments.length - 1] || 'dashboard';

    // Map various paths to main nav items
    if (['grades', 'homework', 'diary', 'lesson-plans'].includes(lastSegment)) {
      return 'children'; // These fall under "My Child"
    }
    if (['fees', 'payments'].includes(lastSegment)) {
      return 'fees'; // Both under "Payments"
    }
    if (['messages', 'events'].includes(lastSegment)) {
      return 'messages'; // Communication items
    }

    return lastSegment;
  }, [pathname]);

  const handleNavClick = (key: string) => {
    if (key === 'dashboard') {
      router.push('/parent');
    } else if (key === 'children') {
      router.push('/parent/children');
    } else if (key === 'fees') {
      router.push('/parent/fees');
    } else {
      router.push(`/parent/${key}`);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Parent';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Top Navigation */}
        <TopNavigation
          title="SchoolHub"
          items={navItems}
          activeItem={activeItem}
          onItemClick={handleNavClick}
          user={{
            name: userName,
            email: user?.email,
            role: 'Parent',
          }}
          onLogout={logout}
          showNotifications={true}
          notificationCount={3}
        />

        {/* Main content */}
        <main className="pt-4 px-4 md:px-6 pb-20 md:pb-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
