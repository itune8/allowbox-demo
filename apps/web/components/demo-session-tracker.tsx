'use client';

/**
 * Anonymous session-duration telemetry for the public demo site.
 *
 * On initial mount we POST /api/v1/demo/sessions to open a stub row on the
 * backend and stash the returned `sessionId` in sessionStorage. On
 * `pagehide` (and on `visibilitychange` -> 'hidden' as an iOS-Safari
 * fallback that doesn't fire pagehide reliably) we fire a sendBeacon to
 * /api/v1/demo/sessions/<id>/end. sendBeacon survives the unload so the
 * end-stamp lands even when the visitor closes the tab.
 *
 * Failures are silent — the demo site must keep working even when the
 * telemetry API is down. The component intentionally renders nothing.
 */
import { useEffect } from 'react';
import { env } from '@repo/config';

const STORAGE_KEY = 'allowbox.demoSessionId';

function getApiBase(): string {
  return env.apiUrl || 'https://api.allowbox.in/api/v1';
}

async function openSession(): Promise<string | null> {
  try {
    const res = await fetch(`${getApiBase()}/demo/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // `portal` is required by the backend validator; the picker is the
      // canonical landing page so we tag the session as 'platform' (the
      // umbrella portal) until / unless the visitor picks a real one. We
      // intentionally don't try to read the path here because that's
      // already what the form submit captures — this row is just the
      // session-duration anchor.
      body: JSON.stringify({ portal: 'platform' }),
      keepalive: true,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { sessionId?: string };
    return body.sessionId || null;
  } catch {
    return null;
  }
}

function closeSession(sessionId: string): void {
  const url = `${getApiBase()}/demo/sessions/${encodeURIComponent(sessionId)}/end`;
  // navigator.sendBeacon survives page unload; fetch with keepalive is a
  // fallback for older browsers that lack sendBeacon.
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(url, '');
      return;
    }
  } catch {
    /* fall through */
  }
  try {
    void fetch(url, { method: 'POST', keepalive: true });
  } catch {
    /* swallow */
  }
}

export function DemoSessionTracker() {
  useEffect(() => {
    let cancelled = false;
    let sessionId: string | null = null;
    let beaconFired = false;

    // Reuse an existing id within the same tab so a soft client-side nav
    // (which re-mounts the layout) doesn't open a fresh row each time.
    try {
      sessionId = window.sessionStorage.getItem(STORAGE_KEY);
    } catch {
      /* sessionStorage blocked — proceed without persistence */
    }

    const ensureOpen = async () => {
      if (sessionId) return;
      const id = await openSession();
      if (cancelled) return;
      if (id) {
        sessionId = id;
        try {
          window.sessionStorage.setItem(STORAGE_KEY, id);
        } catch {
          /* ignore */
        }
      }
    };

    // Fire and forget — don't block render waiting for the ping.
    void ensureOpen();

    const fireBeacon = () => {
      if (beaconFired || !sessionId) return;
      beaconFired = true;
      closeSession(sessionId);
    };

    const onPageHide = () => fireBeacon();
    const onVisibilityChange = () => {
      // iOS Safari sometimes skips pagehide; treat the tab going hidden as
      // a session-end signal too. The end endpoint is idempotent so an
      // extra ping during a brief tab-switch is harmless.
      if (document.visibilityState === 'hidden') fireBeacon();
    };

    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}
