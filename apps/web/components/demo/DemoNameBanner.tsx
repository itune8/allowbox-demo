'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import {
  readPortalBlob,
  clearPortalBlob,
  type DemoPortalKey,
} from '../../lib/demo-storage';

/**
 * Sticky ribbon at the top of a demo portal page greeting the visitor by
 * the name they typed in the form. Mounted in each portal's layout.
 *
 * Behavior:
 *  - If a fresh (<24h) blob exists for this portal, render the banner.
 *  - If none exists, redirect back to the demo landing (no sneaky direct
 *    access to the portal without going through the demo flow).
 *  - "Change name" link clears the portal blob and re-routes to the form.
 */
export function DemoNameBanner({ portal }: { portal: DemoPortalKey }) {
  const router = useRouter();
  const { user, patchUser } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const blob = readPortalBlob(portal);
    if (!blob) {
      // No (or expired) personalization — bounce back to the portal picker.
      router.replace('/');
      return;
    }
    setName(blob.name);
    setReady(true);

    // Keep the logged-in user's firstName in sync with the demo name so every
    // dashboard greeting ("Welcome back, {firstName}!") reads as personalized.
    // Only patch if the current firstName doesn't already match — avoids a
    // re-render loop.
    const parts = blob.name.trim().split(/\s+/);
    const first = parts[0] || blob.name;
    const last = parts.slice(1).join(' ') || '';
    if (user && (user.firstName !== first || user.lastName !== last)) {
      patchUser({ firstName: first, lastName: last } as any);
    }
  }, [portal, router, user, patchUser]);

  if (!ready || !name) return null;

  const handleChange = () => {
    clearPortalBlob(portal);
    router.push(`/demo/form/${portal}`);
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#824ef2] to-[#6b3fd4] text-white text-xs sm:text-sm">
      <div className="mx-auto max-w-screen-2xl flex items-center gap-2 px-4 py-1.5">
        <Sparkles className="w-3.5 h-3.5 opacity-90 flex-shrink-0" />
        <span className="truncate">
          👋 Hi, <strong>{name}</strong> — this is a demo of the{' '}
          <span className="underline decoration-white/40">{portal}</span> portal.
        </span>
        <button
          type="button"
          onClick={handleChange}
          className="ml-auto text-[11px] underline decoration-white/40 hover:decoration-white transition-colors"
        >
          Change name
        </button>
      </div>
    </div>
  );
}
