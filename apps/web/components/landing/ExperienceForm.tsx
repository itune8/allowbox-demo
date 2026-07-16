'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, ArrowRight, Lock } from 'lucide-react';
import { fetchDemoConfig, postSubmission } from '../../lib/demo-api';
import { writePortalBlob, type DemoPortalKey } from '../../lib/demo-storage';

/**
 * Single-screen demo entry: a role dropdown + the fields for that role +
 * phone, submitted straight into the personalized welcome flow. Replaces the
 * old two-step (portal cards -> separate form page) so the whole thing reads
 * like the attached reference — hero on the left, this card on the right.
 *
 * Super Admin is intentionally NOT offered here (product decision, 2026-07-16)
 * — only School Administrator / Teacher / Parent get a public demo.
 */

interface Field {
  name: string;
  label: string;
  required?: boolean;
  type?: 'tel' | 'text';
  placeholder?: string;
}

// Order matters — first enabled role becomes the default selection.
const ROLE_ORDER: DemoPortalKey[] = ['school', 'teacher', 'parent'];

const ROLE_LABELS: Record<DemoPortalKey, string> = {
  school: 'School Administrator',
  teacher: 'Teacher',
  parent: 'Parent',
  platform: 'Super Admin',
};

const FIELDS: Record<DemoPortalKey, Field[]> = {
  parent: [
    { name: 'parentName', label: 'Your name (parent)', required: true, placeholder: 'Sahil Kumar' },
    { name: 'childName', label: "Child's name", required: true, placeholder: 'Aarav Kumar' },
    { name: 'schoolName', label: "School's name", required: true, placeholder: 'Gulmohur High School' },
    { name: 'phone', label: 'Phone number', required: true, type: 'tel', placeholder: '+91 ...' },
  ],
  teacher: [
    { name: 'teacherName', label: 'Your name', required: true, placeholder: 'Sahil Kumar' },
    { name: 'schoolName', label: "School's name", required: true, placeholder: 'Gulmohur High School' },
    { name: 'phone', label: 'Phone number', required: true, type: 'tel', placeholder: '+91 ...' },
  ],
  school: [
    { name: 'schoolName', label: "School's name", required: true, placeholder: 'Gulmohur High School' },
    { name: 'schoolAdminName', label: 'Your name', required: true, placeholder: 'Sahil Kumar' },
    { name: 'representative', label: 'Your role / representative title', required: true, placeholder: 'Principal' },
    { name: 'phone', label: 'Phone number', required: true, type: 'tel', placeholder: '+91 ...' },
  ],
  platform: [],
};

function greetingName(portal: DemoPortalKey, data: Record<string, string>): string {
  if (portal === 'parent') return data.parentName || '';
  if (portal === 'teacher') return data.teacherName || '';
  if (portal === 'school') return data.schoolAdminName || '';
  return data.representative || '';
}

function orgName(portal: DemoPortalKey, data: Record<string, string>): string {
  if (portal === 'platform') return data.tenantName || '';
  return data.schoolName || '';
}

export function ExperienceForm() {
  const router = useRouter();

  const [enabledRoles, setEnabledRoles] = useState<DemoPortalKey[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState(false);

  const [role, setRole] = useState<DemoPortalKey | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setConfigError(false);
      try {
        const cfg = await fetchDemoConfig();
        if (cancelled) return;
        const roles = ROLE_ORDER.filter((k) => cfg.portals[k]?.enabled);
        setEnabledRoles(roles);
        setRole((prev) => prev ?? roles[0] ?? null);
      } catch {
        if (!cancelled) setConfigError(true);
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fields = useMemo<Field[]>(() => (role ? FIELDS[role] : []), [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setErr('');

    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) {
        setErr(`Please fill in: ${f.label}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await postSubmission({ portal: role, ...values } as never);
      const name = greetingName(role, values) || 'friend';
      const org = orgName(role, values);
      writePortalBlob(role, name, org || undefined);
      router.push(`/demo/welcome/${role}`);
    } catch (e) {
      setErr((e as Error)?.message || 'Could not submit. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200/80 shadow-[0_20px_60px_-24px_rgba(80,40,160,0.35)] p-6 sm:p-8 animate-fade-in-up">
      <h2 className="text-xl font-bold text-slate-900">Start your demo</h2>
      <p className="mt-1 text-sm text-slate-500">
        Pick a role and add a few details so we can personalize your tour.
      </p>

      {loadingConfig ? (
        <div className="mt-6 space-y-4" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-slate-100" />
              <div className="h-10 w-full rounded-lg bg-slate-100" />
            </div>
          ))}
          <div className="h-12 w-full rounded-xl bg-slate-100" />
        </div>
      ) : configError ? (
        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          The demo is temporarily unavailable. Please refresh in a moment.
        </div>
      ) : enabledRoles.length === 0 ? (
        <div className="mt-6 flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
          <span>The live demo is paused right now. Please check back shortly.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {err && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {err}
            </div>
          )}

          {/* Role dropdown */}
          <div>
            <label
              htmlFor="demo-role"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              I am a
            </label>
            <div className="relative">
              <select
                id="demo-role"
                value={role ?? ''}
                onChange={(e) => {
                  setRole(e.target.value as DemoPortalKey);
                  setValues({});
                  setErr('');
                }}
                className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              >
                {enabledRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {fields.map((f) => (
            <div key={f.name}>
              <label
                htmlFor={f.name}
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                {f.label}
                {f.required && <span className="text-rose-500"> *</span>}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={f.type || 'text'}
                inputMode={f.type === 'tel' ? 'tel' : 'text'}
                value={values[f.name] || ''}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [f.name]: e.target.value }))
                }
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2] placeholder:text-slate-400"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold bg-[#824ef2] hover:bg-[#6b3fd4] disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Start My Demo
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            We&apos;ll never share your details. This is just so we can say hi.
          </p>
        </form>
      )}
    </div>
  );
}
