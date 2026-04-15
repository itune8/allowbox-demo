'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Building2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { fetchDemoConfig } from '../../lib/demo-api';
import type { DemoPortalKey } from '../../lib/demo-storage';

interface PortalConfig {
  key: DemoPortalKey;
  label: string;
  description: string;
  Icon: LucideIcon;
  stripeClass: string;
  iconClass: string;
}

const PORTALS: PortalConfig[] = [
  {
    key: 'parent',
    label: 'Parent',
    description: "Track attendance, fees, homework, and your child's progress.",
    Icon: Users,
    stripeClass: 'bg-amber-500',
    iconClass: 'text-amber-500',
  },
  {
    key: 'teacher',
    label: 'Teacher',
    description: 'Take attendance, assign homework, message parents.',
    Icon: GraduationCap,
    stripeClass: 'bg-emerald-500',
    iconClass: 'text-emerald-500',
  },
  {
    key: 'school',
    label: 'School Admin',
    description: 'Classes, staff, fees — the full school operations view.',
    Icon: Building2,
    stripeClass: 'bg-[#824ef2]',
    iconClass: 'text-[#824ef2]',
  },
  {
    key: 'platform',
    label: 'Super Admin',
    description: 'Platform panel — onboarding, fees, reports.',
    Icon: ShieldCheck,
    stripeClass: 'bg-rose-500',
    iconClass: 'text-rose-500',
  },
];

export function PortalPickerCards() {
  const [enabled, setEnabled] = useState<Partial<Record<DemoPortalKey, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setError(false);
    try {
      const cfg = await fetchDemoConfig();
      const map: Partial<Record<DemoPortalKey, boolean>> = {};
      for (const k of Object.keys(cfg.portals) as DemoPortalKey[]) {
        map[k] = !!cfg.portals[k].enabled;
      }
      setEnabled(map);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Poll every 10s so super-admin toggle flips propagate to anyone who
    // already has this page open — keeps the demo and admin panel in sync.
    // (On error, the same interval also naturally retries.)
    const id = setInterval(() => {
      load();
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-10 w-full max-w-5xl px-6">
      {error && (
        <p className="mb-4 text-center text-sm text-white/80">
          Demo temporarily unavailable. Retrying…
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {PORTALS.map((p, i) => {
          const isEnabled = !loading && enabled[p.key] === true;
          const isLocked = !loading && enabled[p.key] === false;
          const isLoadingCard = loading;

          const card = (
            <div
              className={[
                'group relative overflow-hidden w-full h-[220px] sm:h-[260px]',
                'bg-white rounded-2xl border border-black/5',
                'shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
                'transition-all duration-300 ease-out',
                isEnabled &&
                  'hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10),0_2px_4px_rgba(0,0,0,0.06)] active:scale-[0.98] cursor-pointer',
                (isLocked || isLoadingCard) && 'opacity-60 cursor-not-allowed',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* top stripe */}
              <div className={`h-1.5 ${p.stripeClass}`} />

              <div className="p-5 sm:p-6 flex flex-col h-[calc(100%-6px)]">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 grid place-items-center ${p.iconClass}`}>
                    <p.Icon className="w-6 h-6" />
                  </div>
                  {isLoadingCard && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  )}
                  {isLocked && (
                    <div className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>

                <h3 className="mt-4 text-lg sm:text-xl font-semibold text-slate-900">
                  {p.label}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-3">
                  {p.description}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  {isLocked ? (
                    <span className="text-xs text-slate-500 font-medium">
                      Currently disabled
                    </span>
                  ) : isEnabled ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                      Try now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Loading…</span>
                  )}
                </div>
              </div>
            </div>
          );

          const wrapper = (
            <div
              key={p.key}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
            >
              {card}
            </div>
          );

          if (isEnabled) {
            return (
              <Link
                key={p.key}
                href={`/demo/form/${p.key}`}
                aria-label={`Try ${p.label} demo`}
                className="block focus:outline-none focus:ring-2 focus:ring-white rounded-2xl"
              >
                {wrapper}
              </Link>
            );
          }

          return (
            <div key={p.key} aria-disabled>
              {wrapper}
            </div>
          );
        })}
      </div>
    </div>
  );
}
