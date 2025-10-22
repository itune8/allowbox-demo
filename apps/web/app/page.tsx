'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { ROLE_DASHBOARDS } from '@repo/config';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const dashboardPath = useMemo(() => {
    const primaryRole = user?.roles?.[0] as keyof typeof ROLE_DASHBOARDS | undefined;
    return (primaryRole && ROLE_DASHBOARDS[primaryRole]) || '/platform';
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login
        router.replace('/auth/login');
      }
    }
  }, [user, loading, router, dashboardPath]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
        {/* Fallback link in case client navigation is blocked for any reason */}
        {/* Redirect handled above; nothing else to show here */}
      </div>
    </div>
  );
}
