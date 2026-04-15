'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { ROLE_DASHBOARDS } from '@repo/config';
import { BackgroundEffects } from '../components/landing/BackgroundEffects';
import { LandingHero } from '../components/landing/LandingHero';
import { PortalPickerCards } from '../components/landing/PortalPickerCards';
import { TrustMarkers } from '../components/landing/trust-markers';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If a user is already logged in (e.g. they bookmarked a panel and came back via /),
  // send them straight to their dashboard. Otherwise show the landing.
  useEffect(() => {
    if (loading) return;
    if (user) {
      const primaryRole = user.roles?.[0] as keyof typeof ROLE_DASHBOARDS | undefined;
      const dashboardPath = (primaryRole && ROLE_DASHBOARDS[primaryRole]) || '/platform';
      router.replace(dashboardPath);
    }
  }, [user, loading, router]);

  // While auth context is hydrating, render the landing underneath — it's the right
  // background regardless, and the redirect will kick in if user exists.
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center gap-8 sm:gap-12 py-12">
      <BackgroundEffects />
      <LandingHero />
      <PortalPickerCards />
      <TrustMarkers />
    </main>
  );
}
