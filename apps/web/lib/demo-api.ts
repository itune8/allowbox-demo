/**
 * Thin client for the public demo endpoints on the prod API.
 * No auth required — the allowbox-demo site is entirely anonymous.
 */

import { env } from '@repo/config';
import type { DemoPortalKey } from './demo-storage';

const API_BASE = env.apiUrl || 'http://localhost:5004/api/v1';

export interface DemoConfig {
  portals: Record<DemoPortalKey, { enabled: boolean }>;
}

export interface SubmissionPayload {
  portal: DemoPortalKey;
  phone: string;
  // Portal-specific fields
  parentName?: string;
  childName?: string;
  teacherName?: string;
  schoolAdminName?: string;
  representative?: string;
  tenantName?: string;
  schoolName?: string;
}

export async function fetchDemoConfig(): Promise<DemoConfig> {
  const res = await fetch(`${API_BASE}/demo/config`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`config ${res.status}`);
  }
  return res.json();
}

export async function postSubmission(
  payload: SubmissionPayload,
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/demo/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (res.status === 429) {
    throw new Error('Too many attempts. Please wait a minute and try again.');
  }
  if (!res.ok) {
    let msg = 'Could not submit. Please check the form and try again.';
    try {
      const body = await res.json();
      const detail = body?.error?.details?.[0]?.message;
      if (detail) msg = detail;
      else if (body?.error?.message) msg = body.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}
