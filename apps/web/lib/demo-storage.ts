/**
 * Per-portal localStorage with a 24h TTL. Used by the personalized demo
 * to remember a visitor's name between visits without requiring login.
 *
 * Key shape:
 *   {
 *     parent?:   { name, ts },
 *     teacher?:  { name, ts },
 *     school?:   { name, ts },
 *     platform?: { name, ts },
 *   }
 */

export type DemoPortalKey = 'parent' | 'teacher' | 'school' | 'platform';

export interface DemoPortalBlob {
  name: string;
  ts: number;
}

const STORAGE_KEY = 'demoPortalData';
const TTL_MS = 24 * 60 * 60 * 1000;

function safeParse(raw: string | null): Partial<Record<DemoPortalKey, DemoPortalBlob>> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    /* corrupt — return empty */
  }
  return {};
}

export function readPortalBlob(portal: DemoPortalKey): DemoPortalBlob | null {
  if (typeof window === 'undefined') return null;
  const all = safeParse(window.localStorage.getItem(STORAGE_KEY));
  const entry = all[portal];
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    // Expired — clean up stale entry
    delete all[portal];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return null;
  }
  return entry;
}

export function writePortalBlob(portal: DemoPortalKey, name: string): void {
  if (typeof window === 'undefined') return;
  const all = safeParse(window.localStorage.getItem(STORAGE_KEY));
  all[portal] = { name, ts: Date.now() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function clearPortalBlob(portal: DemoPortalKey): void {
  if (typeof window === 'undefined') return;
  const all = safeParse(window.localStorage.getItem(STORAGE_KEY));
  delete all[portal];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function clearAllPortalBlobs(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export const portalLabels: Record<DemoPortalKey, string> = {
  parent: "Parent's",
  teacher: "Teacher's",
  school: "School Admin",
  platform: "Super Admin",
};

export const portalRoutes: Record<DemoPortalKey, string> = {
  parent: '/parent',
  teacher: '/teacher',
  school: '/school',
  platform: '/platform',
};
