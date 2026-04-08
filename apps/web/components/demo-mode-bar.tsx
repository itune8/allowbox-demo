'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';

/**
 * Sticky top bar shown inside Parent/Teacher panels while the user is in demo mode.
 * Visibility rule: localStorage accessToken starts with 'demo-token-'.
 * Provides one-tap role switching and exit to the landing page.
 */
export function DemoModeBar() {
  const { user, switchRole, logout } = useAuth();
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    setIsDemo(Boolean(token?.startsWith('demo-token-')));
  }, [user]);

  // Toggle a body data attribute so global CSS can push fixed-position
  // siblings (like the layout sidebar) below the bar.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDemo && user) {
      document.body.dataset.demoMode = 'true';
    } else {
      delete document.body.dataset.demoMode;
    }
    return () => {
      if (typeof document !== 'undefined') {
        delete document.body.dataset.demoMode;
      }
    };
  }, [isDemo, user]);

  if (!isDemo || !user) return null;

  const currentRole = user.roles?.[0];
  const isParent = currentRole === 'parent';
  const isTeacher = currentRole === 'teacher';

  // Only Parent and Teacher are shown as swap targets from the bar.
  // Other roles (super_admin, tenant_admin) accessed via backdoor do not
  // need swap buttons — the bar will just show "Exit demo".
  const otherRoleLabel = isParent ? 'Teacher' : isTeacher ? 'Parent' : null;
  const otherRoleEmail = isParent ? 'teacher@example.com' : isTeacher ? 'parent@example.com' : null;
  const otherRoleDashboard = isParent ? '/teacher' : isTeacher ? '/parent' : null;

  const displayRole = isParent ? 'Parent' : isTeacher ? 'Teacher'
    : currentRole === 'tenant_admin' ? 'School Admin'
    : currentRole === 'super_admin' ? 'Super Admin'
    : 'Demo User';

  const handleSwitch = () => {
    if (!otherRoleEmail || !otherRoleDashboard) return;
    switchRole(otherRoleEmail);
    router.push(otherRoleDashboard);
  };

  const handleExit = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-10 sm:h-11 bg-gray-900/95 backdrop-blur-sm text-white"
      role="region"
      aria-label="Demo mode controls"
    >
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <span aria-hidden>🎭</span>
          <span className="hidden sm:inline">Demo Mode · You&apos;re viewing as {displayRole}</span>
          <span className="sm:hidden">Demo · {displayRole}</span>
        </div>

        <div className="flex items-center gap-2">
          {otherRoleLabel && (
            <button
              type="button"
              onClick={handleSwitch}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-white/30 rounded-md hover:bg-white/10 transition-colors"
              aria-label={`Switch to ${otherRoleLabel}`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden />
              <span className="hidden sm:inline">Switch to {otherRoleLabel}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm text-white/80 hover:text-white transition-colors"
            aria-label="Exit demo"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden />
            <span className="hidden sm:inline">Exit demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
