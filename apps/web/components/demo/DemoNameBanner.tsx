'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { readPortalBlob, type DemoPortalKey } from '../../lib/demo-storage';

const PORTAL_LABELS: Record<DemoPortalKey, string> = {
  parent: 'parent',
  teacher: 'teacher',
  school: 'school admin',
  platform: 'super admin',
};

/**
 * Sticky ribbon at the top of a demo portal page greeting the visitor by
 * the name + org they typed in the form. Mounted in each portal's layout.
 *
 * Behavior:
 *  - If a fresh (<24h) blob exists for this portal, render the banner.
 *  - If none exists, redirect back to the demo landing (no sneaky direct
 *    access to the portal without going through the demo flow).
 */
export function DemoNameBanner({ portal }: { portal: DemoPortalKey }) {
  const router = useRouter();
  const { user, patchUser } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Keep latest patchUser + user in refs so the main effect only depends on
  // portal and router. Including them in deps caused the effect to fire on
  // every auth re-render, which (combined with polling) caused runaway
  // requests.
  const patchRef = useRef(patchUser);
  patchRef.current = patchUser;
  const userFirstRef = useRef(user?.firstName);
  const userLastRef = useRef(user?.lastName);
  userFirstRef.current = user?.firstName;
  userLastRef.current = user?.lastName;

  useEffect(() => {
    const blob = readPortalBlob(portal);
    if (!blob) {
      // No (or expired) personalization — bounce back to the portal picker.
      router.replace('/');
      return;
    }
    setName(blob.name);
    setOrgName(blob.orgName || null);
    setReady(true);

    // Overlay the visitor's typed name onto the logged-in user's first/last
    // name so dashboards greet them correctly.
    const parts = blob.name.trim().split(/\s+/);
    const first = parts[0] || blob.name;
    const last = parts.slice(1).join(' ') || '';
    if (userFirstRef.current !== first || userLastRef.current !== last) {
      patchRef.current({ firstName: first, lastName: last } as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portal]);

  if (!ready || !name) return null;

  const portalLabel = PORTAL_LABELS[portal];

  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#824ef2] to-[#6b3fd4] text-white text-xs sm:text-sm">
      <div className="mx-auto max-w-screen-2xl flex items-center gap-2 px-4 py-1.5">
        <Sparkles className="w-3.5 h-3.5 opacity-90 flex-shrink-0" />
        <span className="truncate">
          👋 Hi, <strong>{name}</strong>
          {orgName && (
            <>
              {' from '}
              <strong>{orgName}</strong>
            </>
          )}
          {' '}— this is a demo of the{' '}
          <span className="underline decoration-white/40">{portalLabel}</span> portal.
        </span>
      </div>
    </div>
  );
}
