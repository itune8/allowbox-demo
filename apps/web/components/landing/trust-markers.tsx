'use client';

import { Lock } from 'lucide-react';

/**
 * Small reassurance line at the bottom of the landing.
 * Clarifies the demo nature so first-time scanners aren't afraid to tap.
 */
export function TrustMarkers() {
  return (
    <div className="relative z-10 flex items-center justify-center gap-2 text-xs text-gray-500 px-6 animate-fade-in-700">
      <Lock className="w-3.5 h-3.5" aria-hidden />
      <span>Demo mode · No signup · No data saved · Reset anytime</span>
    </div>
  );
}
