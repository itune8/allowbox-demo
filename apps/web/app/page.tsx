'use client';

import { BackgroundEffects } from '../components/landing/BackgroundEffects';
import { LandingHero } from '../components/landing/LandingHero';
import { PortalPickerCards } from '../components/landing/PortalPickerCards';
import { TrustMarkers } from '../components/landing/trust-markers';

export default function Home() {
  // The picker is the canonical landing for visitors. We intentionally do
  // NOT auto-redirect logged-in users to their role's dashboard — that
  // caused a ping-pong loop when the demo banner (inside the portal) bounced
  // unauthorized visitors back to '/'. The visitor should always land here
  // and explicitly choose a portal to enter.
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center gap-8 sm:gap-12 py-12">
      <BackgroundEffects />
      <LandingHero />
      <PortalPickerCards />
      <TrustMarkers />
    </main>
  );
}
