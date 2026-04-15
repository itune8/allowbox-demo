'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { postSubmission } from '../../../../lib/demo-api';
import {
  readPortalBlob,
  writePortalBlob,
  portalLabels,
  type DemoPortalKey,
} from '../../../../lib/demo-storage';

interface Field {
  name: string;
  label: string;
  required?: boolean;
  type?: 'tel' | 'text';
  placeholder?: string;
}

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
  platform: [
    { name: 'tenantName', label: 'Tenant / company name', required: true, placeholder: 'AllowBox Group' },
    { name: 'representative', label: 'Your name', required: true, placeholder: 'Sahil Kumar' },
    { name: 'phone', label: 'Phone number', required: true, type: 'tel', placeholder: '+91 ...' },
  ],
};

function greetingName(portal: DemoPortalKey, data: Record<string, string>): string {
  if (portal === 'parent') return data.parentName || '';
  if (portal === 'teacher') return data.teacherName || '';
  if (portal === 'school') return data.schoolAdminName || '';
  return data.representative || '';
}

export default function DemoFormPage() {
  const params = useParams();
  const router = useRouter();
  const portal = params?.portal as DemoPortalKey | undefined;

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const fields = useMemo<Field[]>(() => {
    if (!portal) return [];
    return FIELDS[portal] ?? [];
  }, [portal]);

  useEffect(() => {
    if (!portal || !FIELDS[portal]) {
      router.replace('/');
      return;
    }
    // Skip form if we already have a fresh blob (<24h).
    const blob = readPortalBlob(portal);
    if (blob) {
      router.replace(`/demo/welcome/${portal}?skip=1`);
    }
  }, [portal, router]);

  if (!portal || !FIELDS[portal]) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) {
        setErr(`Please fill in: ${f.label}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await postSubmission({
        portal,
        ...values,
      } as any);
      const name = greetingName(portal, values) || 'friend';
      writePortalBlob(portal, name);
      router.push(`/demo/welcome/${portal}`);
    } catch (e: any) {
      setErr(e?.message || 'Could not submit. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#1a0d3d] via-[#2d1464] to-[#1a0d3d] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to portals
        </Link>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {portalLabels[portal]} demo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A few details so we can personalize your tour.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {err && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {err}
              </div>
            )}

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
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium bg-[#824ef2] hover:bg-[#6b3fd4] disabled:opacity-50 transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Start my demo
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              We'll never share your details. This is just so we can say hi.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
