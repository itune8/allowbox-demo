'use client';

import { GraduationCap, Users, Building2, Lock } from 'lucide-react';
import { ExperienceForm } from '../components/landing/ExperienceForm';

/**
 * Demo landing — a single, simple screen modelled on the attached reference:
 * a hero/value-prop on the left and the role + details form on the right.
 * Replaces the old dark-aurora portal-picker so the demo reads on-brand
 * (light surface, brand purple) and consistent with the dashboards it opens.
 *
 * We intentionally do NOT auto-redirect logged-in visitors — the entry screen
 * is always this page; they choose a role and enter explicitly.
 */

const HIGHLIGHTS = [
  { Icon: Building2, label: 'School Admin', blurb: 'Students, staff, fees & exams' },
  { Icon: GraduationCap, label: 'Teacher', blurb: 'Attendance, homework, marks' },
  { Icon: Users, label: 'Parent', blurb: "Follow your child's day" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f6f3ff] via-white to-[#f3f0fb]">
      {/* Soft brand accents — subtle, not the old heavy aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#824ef2]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[#824ef2]/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — hero */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#824ef2]/10 px-3 py-1 text-xs font-semibold text-[#824ef2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#824ef2]" />
              Live demo
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              AllowBox
            </h1>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Experience AllowBox
            </h2>
            <p className="mt-4 max-w-md text-base text-slate-600 sm:text-lg">
              Pick a role and explore the platform — no signup, no data saved,
              just tap and play.
            </p>

            <ul className="mt-8 grid max-w-md gap-3">
              {HIGHLIGHTS.map(({ Icon, label, blurb }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3"
                >
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-[#824ef2]/10 text-[#824ef2]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">
                      {label}
                    </span>
                    <span className="block text-xs text-slate-500">{blurb}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Demo mode · No signup · No data saved · Reset anytime
            </p>
          </div>

          {/* Right — form */}
          <div className="flex justify-center lg:justify-end">
            <ExperienceForm />
          </div>
        </div>
      </div>
    </main>
  );
}
