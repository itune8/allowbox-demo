# Demo Landing Page & QR Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the QR-scan entry point with a branded 2-card landing page (`/`) that lets scanners enter Parent or Teacher panels in one tap, add a persistent demo mode bar inside those panels for role switching, and generate PNG/SVG/PDF QR artifacts pointing at the new landing.

**Architecture:** Pure client-side React additions to the existing Next.js 15 app under `apps/web`. New root page at `/` composes four new landing components (hero, cards, background effects) over the existing `contexts/auth-context.tsx` demo-user mechanism — no new auth flows, no backend changes. Parent and Teacher route-group layouts gain a sticky top bar component whose visibility is gated on `localStorage.accessToken.startsWith('demo-token-')`. A Node script under `apps/web/scripts/` generates the QR artifacts into `apps/web/public/` using the `qrcode` and `pdfkit` npm packages (devDependencies, never shipped to the browser).

**Tech Stack:** Next.js 15.5 (app router), React 19, TypeScript 5.9, Tailwind 3.4, lucide-react (already installed). New devDeps: `qrcode`, `pdfkit`.

**Source spec:** `docs/superpowers/specs/2026-04-08-demo-landing-design.md`

---

## Quality gates (run after every task)

Each task ends with running these from `apps/web/`:

```bash
npm run check-types
npm run lint
```

A task is not "done" until both pass. `npm run build` is run only at the final verification task to avoid slowing iteration. Manual browser checks are specified explicitly where visual verification matters.

**Project context for the implementer:**
- No unit test runner is installed. Do not add one. Do not write jest/vitest files.
- Commit after every task using the message shown in the task.
- Work from the `apps/web/` directory unless a step says otherwise.
- The dev server is `npm run dev` from `apps/web/`. It runs on `http://localhost:3000`.
- The root page `app/page.tsx` is currently a redirect-only component. Replacing it is expected.
- Demo auth is fully client-side in `apps/web/contexts/auth-context.tsx`. The `login()` function detects demo emails (`parent@example.com`, `teacher@example.com`, etc.) and bypasses the API entirely, setting `localStorage.accessToken = 'demo-token-' + role`.

---

## File structure

New files this plan creates:

```
apps/web/
├── app/
│   └── page.tsx                                 [REPLACED]    New landing page entry
├── components/
│   ├── landing/
│   │   ├── BackgroundEffects.tsx                [NEW]         Aurora blobs + dot grid + grain + cursor glow
│   │   ├── LandingHero.tsx                      [NEW]         Logo + headline + value prop
│   │   ├── RoleCards.tsx                        [NEW]         Grid container + overlay state owner
│   │   ├── RoleCard.tsx                         [NEW]         Single interactive card
│   │   └── trust-markers.tsx                    [NEW]         Demo mode · No signup · etc.
│   └── demo-mode-bar.tsx                        [NEW]         Sticky top bar for panels
├── app/(parent)/parent/layout.tsx               [MODIFIED]    Inject demo mode bar
├── app/(teacher)/teacher/layout.tsx             [MODIFIED]    Inject demo mode bar
├── contexts/auth-context.tsx                    [MODIFIED]    Add atomic switchRole() method
├── tailwind.config.cjs                          [MODIFIED]    New blob-a/b/c + float keyframes
├── scripts/generate-qr.mjs                      [NEW]         QR artifact generator
├── package.json                                 [MODIFIED]    Add qr script + devDeps
└── public/
    ├── demo-qr.png                              [GENERATED]
    ├── demo-qr.svg                              [GENERATED]
    └── demo-qr-sheet.pdf                        [GENERATED]
```

Everything in `apps/web/app/auth/login/` is **untouched** — it remains the hidden backdoor. Everything in `(school)/` and `platform/` is **untouched**.

---

## Tasks

### Task 1: Create feature branch

**Files:** none (git operation only)

- [ ] **Step 1: Create and switch to feature branch**

Run from `/Users/mac/Developer/Allowbox/allowbox-demo`:

```bash
git checkout -b feat/demo-landing
git status
```

Expected output includes:
```
Switched to a new branch 'feat/demo-landing'
On branch feat/demo-landing
```

- [ ] **Step 2: Verify spec and plan are present**

Run:
```bash
ls docs/superpowers/specs/ docs/superpowers/plans/
```

Expected: both directories contain `2026-04-08-demo-landing-*.md` files.

- [ ] **Step 3: Stage and commit the spec + plan**

```bash
git add docs/
git commit -m "docs: add demo landing spec and implementation plan"
```

---

### Task 2: Add Tailwind keyframes for aurora and float animations

**Files:**
- Modify: `apps/web/tailwind.config.cjs`

- [ ] **Step 1: Open the config and add new keyframes**

Edit `apps/web/tailwind.config.cjs`. Inside `theme.extend.keyframes`, add these entries (preserve all existing keyframes):

```js
blobDriftA: {
  '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  '33%':      { transform: 'translate(40px, -30px) scale(1.1)' },
  '66%':      { transform: 'translate(-20px, 40px) scale(0.95)' },
},
blobDriftB: {
  '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  '33%':      { transform: 'translate(-30px, 20px) scale(1.08)' },
  '66%':      { transform: 'translate(25px, -35px) scale(0.97)' },
},
blobDriftC: {
  '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  '33%':      { transform: 'translate(20px, 30px) scale(1.05)' },
  '66%':      { transform: 'translate(-30px, -20px) scale(1.0)' },
},
cardFloat: {
  '0%, 100%': { transform: 'translateY(0)' },
  '50%':      { transform: 'translateY(-4px)' },
},
cardEnterZoom: {
  '0%':   { transform: 'scale(1)',     opacity: '1' },
  '100%': { transform: 'scale(1.5)',   opacity: '0' },
},
```

Inside `theme.extend.animation`, add:

```js
'blob-a': 'blobDriftA 20s ease-in-out infinite',
'blob-b': 'blobDriftB 25s ease-in-out infinite',
'blob-c': 'blobDriftC 30s ease-in-out infinite',
'card-float': 'cardFloat 4s ease-in-out infinite',
'card-enter': 'cardEnterZoom 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
```

- [ ] **Step 2: Run type check**

```bash
cd apps/web && npm run check-types
```

Expected: no errors (tailwind config is JS, not TS, so this should pass regardless).

- [ ] **Step 3: Run lint**

```bash
cd apps/web && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/tailwind.config.cjs
git commit -m "feat(landing): add aurora blob and card animation keyframes"
```

---

### Task 3: Create BackgroundEffects component

**Files:**
- Create: `apps/web/components/landing/BackgroundEffects.tsx`

- [ ] **Step 1: Create the file**

Create `apps/web/components/landing/BackgroundEffects.tsx` with this exact content:

```tsx
'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-viewport animated background for the landing page.
 * Layers (bottom to top): base -> aurora blobs -> dot grid -> grain -> cursor glow.
 * All CSS; the only JS is for the desktop-only cursor glow and will-change cleanup.
 */
export function BackgroundEffects() {
  const glowRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement>(null);

  // Cursor-reactive glow (desktop only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const el = glowRef.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
          raf = 0;
        });
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Remove will-change from blobs after 30s (longest animation cycle)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!blobsRef.current) return;
      blobsRef.current.querySelectorAll<HTMLElement>('[data-blob]').forEach((b) => {
        b.style.willChange = 'auto';
      });
    }, 30000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Layer 0: base */}
      <div className="fixed inset-0 z-0 bg-[#fafaf9]" aria-hidden />

      {/* Layer 1: aurora blobs */}
      <div ref={blobsRef} className="fixed inset-0 z-[1] overflow-hidden pointer-events-none" aria-hidden>
        <div
          data-blob
          className="absolute w-[600px] h-[600px] rounded-full animate-blob-a"
          style={{
            top: '-10%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
        <div
          data-blob
          className="absolute w-[600px] h-[600px] rounded-full animate-blob-b"
          style={{
            bottom: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.30) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
        <div
          data-blob
          className="absolute w-[600px] h-[600px] rounded-full animate-blob-c hidden sm:block"
          style={{
            top: '30%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Layer 2: dot grid */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Layer 3: grain overlay */}
      <div
        className="fixed inset-0 z-[3] pointer-events-none opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Layer 4: cursor-reactive glow (desktop only, hidden on touch) */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[400px] h-[400px] z-[4] pointer-events-none [@media(pointer:coarse)]:hidden"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          transform: 'translate(50%, 50%)',
          transition: 'transform 120ms linear',
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Run type check**

```bash
cd apps/web && npm run check-types
```

Expected: no errors.

- [ ] **Step 3: Run lint**

```bash
cd apps/web && npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/landing/BackgroundEffects.tsx
git commit -m "feat(landing): add animated background effects component"
```

---

### Task 4: Create LandingHero component

**Files:**
- Create: `apps/web/components/landing/LandingHero.tsx`

- [ ] **Step 1: Create the file**

Create `apps/web/components/landing/LandingHero.tsx`:

```tsx
'use client';

/**
 * Top of the landing page: logo, headline, value prop.
 * All entrance animations use existing Tailwind keyframes from tailwind.config.cjs.
 */
export function LandingHero() {
  return (
    <div className="relative z-10 text-center px-6 animate-fade-in-up">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3">
        AllowBox
      </h1>
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
        Experience AllowBox
      </h2>
      <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
        Pick a role and explore the platform — no signup, no data saved, just tap and play.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass with no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/landing/LandingHero.tsx
git commit -m "feat(landing): add hero component with logo and headline"
```

---

### Task 5: Create trust markers component

**Files:**
- Create: `apps/web/components/landing/trust-markers.tsx`

- [ ] **Step 1: Create the file**

Create `apps/web/components/landing/trust-markers.tsx`:

```tsx
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
```

- [ ] **Step 2: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/landing/trust-markers.tsx
git commit -m "feat(landing): add trust markers component"
```

---

### Task 6: Create RoleCard component (static visual)

**Files:**
- Create: `apps/web/components/landing/RoleCard.tsx`

This task creates the card's visual shell and props contract. The click-to-enter logic is wired up in the next task via the parent component.

- [ ] **Step 1: Create the file**

Create `apps/web/components/landing/RoleCard.tsx`:

```tsx
'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export interface RoleCardProps {
  label: string;
  description: string;
  Icon: LucideIcon;
  /** 'amber' (Parent) or 'emerald' (Teacher). Tailwind color family name. */
  accentColor: 'amber' | 'emerald';
  /** True while this card is mid-transition to its panel. Drives the zoom-out animation. */
  isExpanding: boolean;
  /** True if a sibling card is expanding. Used to fade this card out while the other takes the stage. */
  siblingIsExpanding: boolean;
  onEnter: () => void;
}

const STRIPE_CLASSES: Record<RoleCardProps['accentColor'], string> = {
  amber:   'bg-amber-500',
  emerald: 'bg-emerald-500',
};

const ICON_CLASSES: Record<RoleCardProps['accentColor'], string> = {
  amber:   'text-amber-500',
  emerald: 'text-emerald-500',
};

export function RoleCard({
  label,
  description,
  Icon,
  accentColor,
  isExpanding,
  siblingIsExpanding,
  onEnter,
}: RoleCardProps) {
  const disabled = isExpanding || siblingIsExpanding;

  return (
    <button
      type="button"
      onClick={onEnter}
      disabled={disabled}
      aria-label={`Enter ${label} demo`}
      className={[
        'group relative overflow-hidden',
        'w-full sm:w-[300px] h-[200px] sm:h-[340px]',
        'bg-white rounded-2xl',
        'border border-black/5',
        'shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
        'text-left',
        'transition-all duration-300 ease-smooth',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900',
        !disabled && 'hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10),0_2px_4px_rgba(0,0,0,0.06)] active:scale-[0.98]',
        !disabled && 'animate-card-float',
        isExpanding && 'animate-card-enter',
        siblingIsExpanding && 'opacity-0 transition-opacity duration-300',
      ].filter(Boolean).join(' ')}
    >
      {/* Accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${STRIPE_CLASSES[accentColor]}`} aria-hidden />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 pl-8">
        <div>
          <Icon className={`w-12 h-12 ${ICON_CLASSES[accentColor]} mb-4`} aria-hidden />
          <div className="text-2xl font-bold text-gray-900 mb-2">{label}</div>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
          <span>Tap to enter</span>
          <ArrowRight className="w-4 h-4" aria-hidden />
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/landing/RoleCard.tsx
git commit -m "feat(landing): add RoleCard presentational component"
```

---

### Task 7: Create RoleCards container with auto-login orchestration

**Files:**
- Create: `apps/web/components/landing/RoleCards.tsx`

This component owns the expansion state, calls `login()` with the demo email, and routes the user to the correct panel. It also renders the full-screen white overlay during the transition.

- [ ] **Step 1: Verify the auth-context login signature**

Read `apps/web/contexts/auth-context.tsx` lines 173-208 to confirm `login(email: string, password: string, remember?: boolean) => Promise<void>` is the signature and that demo emails `parent@example.com` / `teacher@example.com` are recognized in `DEMO_USERS`. They are — the spec depends on this.

- [ ] **Step 2: Create the file**

Create `apps/web/components/landing/RoleCards.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { RoleCard } from './RoleCard';

type RoleKey = 'parent' | 'teacher';

interface RoleConfig {
  key: RoleKey;
  label: string;
  description: string;
  email: string;
  dashboardPath: string;
  Icon: typeof Users;
  accentColor: 'amber' | 'emerald';
}

const ROLES: RoleConfig[] = [
  {
    key: 'parent',
    label: 'Parent',
    description: "Track attendance, fees, homework, and your child's progress.",
    email: 'parent@example.com',
    dashboardPath: '/parent',
    Icon: Users,
    accentColor: 'amber',
  },
  {
    key: 'teacher',
    label: 'Teacher',
    description: 'Take attendance, assign homework, message parents.',
    email: 'teacher@example.com',
    dashboardPath: '/teacher',
    Icon: GraduationCap,
    accentColor: 'emerald',
  },
];

export function RoleCards() {
  const { login } = useAuth();
  const router = useRouter();
  const [expanding, setExpanding] = useState<RoleKey | null>(null);

  const handleEnter = async (role: RoleConfig) => {
    if (expanding) return;
    setExpanding(role.key);

    // Safety timeout: if anything hangs, reset landing after 3s
    const safety = setTimeout(() => {
      console.error('[landing] transition safety timeout fired');
      setExpanding(null);
    }, 3000);

    try {
      // 80ms micro-bounce delay (handled by CSS animate-card-enter),
      // but we kick off login immediately so state is ready by the time we route.
      await login(role.email, 'demo123');
      // Wait for the zoom-fade to complete visually before routing.
      await new Promise((r) => setTimeout(r, 480));
      router.push(role.dashboardPath);
    } finally {
      clearTimeout(safety);
    }
  };

  return (
    <>
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-6">
        {ROLES.map((role, i) => (
          <div
            key={role.key}
            className="animate-slide-in-bottom"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards' }}
          >
            <RoleCard
              label={role.label}
              description={role.description}
              Icon={role.Icon}
              accentColor={role.accentColor}
              isExpanding={expanding === role.key}
              siblingIsExpanding={expanding !== null && expanding !== role.key}
              onEnter={() => handleEnter(role)}
            />
          </div>
        ))}
      </div>

      {/* Full-screen white transition overlay */}
      {expanding && (
        <div
          className="fixed inset-0 z-50 bg-white pointer-events-none animate-fade-in-700"
          aria-hidden
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/landing/RoleCards.tsx
git commit -m "feat(landing): add RoleCards container with auto-login transition"
```

---

### Task 8: Replace root page with new landing

**Files:**
- Modify: `apps/web/app/page.tsx` (full replacement)

- [ ] **Step 1: Replace the file**

Replace the entire contents of `apps/web/app/page.tsx` with:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';
import { ROLE_DASHBOARDS } from '@repo/config';
import { BackgroundEffects } from '../components/landing/BackgroundEffects';
import { LandingHero } from '../components/landing/LandingHero';
import { RoleCards } from '../components/landing/RoleCards';
import { TrustMarkers } from '../components/landing/trust-markers';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If a user is already logged in (e.g. they bookmarked a panel and came back via /),
  // send them straight to their dashboard. Otherwise show the landing.
  useEffect(() => {
    if (loading) return;
    if (user) {
      const primaryRole = user.roles?.[0] as keyof typeof ROLE_DASHBOARDS | undefined;
      const dashboardPath = (primaryRole && ROLE_DASHBOARDS[primaryRole]) || '/platform';
      router.replace(dashboardPath);
    }
  }, [user, loading, router]);

  // While auth context is hydrating, render the landing underneath — it's the right
  // background regardless, and the redirect will kick in if user exists.
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center gap-8 sm:gap-12 py-12">
      <BackgroundEffects />
      <LandingHero />
      <RoleCards />
      <TrustMarkers />
    </main>
  );
}
```

- [ ] **Step 2: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(landing): replace root page with new 2-card landing"
```

---

### Task 9: Manual browser verification of landing

**Files:** none (manual test)

- [ ] **Step 1: Start the dev server**

From `apps/web/`:

```bash
npm run dev
```

Wait for `Ready in ...` output. Open `http://localhost:3000` in a desktop browser.

- [ ] **Step 2: Desktop verification checklist**

Confirm ALL of the following. If any fail, fix before committing:

1. ☐ Page loads without console errors.
2. ☐ Off-white background visible. Aurora blobs (amber, indigo, emerald) are visible and slowly drifting.
3. ☐ Dot grid overlay visible (very subtle).
4. ☐ AllowBox logo centered at top, followed by "Experience AllowBox" headline and value prop.
5. ☐ Two cards side-by-side: Parent (amber stripe) on the left, Teacher (emerald stripe) on the right.
6. ☐ Each card has: icon (Users / GraduationCap), label, description, "Tap to enter →" row.
7. ☐ Cards have subtle continuous float animation.
8. ☐ Hovering a card lifts it ~8px and deepens the shadow.
9. ☐ Moving the mouse across the page: a soft indigo glow follows the cursor.
10. ☐ Trust markers line at the bottom: lock icon + "Demo mode · No signup · No data saved · Reset anytime".
11. ☐ No vertical scroll on a 1440×900 desktop viewport.

- [ ] **Step 3: Mobile verification (DevTools)**

In Chrome DevTools, toggle device mode and select an iPhone 14 Pro (or similar ~390px width). Confirm:

1. ☐ Cards stack vertically, Parent on top.
2. ☐ Cards are ~75% viewport width and shorter (~200px each).
3. ☐ Emerald (third) blob is hidden (via `hidden sm:block`).
4. ☐ Cursor glow is not visible.
5. ☐ No horizontal scroll.
6. ☐ Trust markers wrap gracefully.

- [ ] **Step 4: Click Parent card**

Click the Parent card. Confirm:

1. ☐ Card zooms/fades out (~500ms).
2. ☐ Page fades to white (~700ms).
3. ☐ Browser navigates to `/parent` and the parent dashboard renders.
4. ☐ No console errors.
5. ☐ `localStorage.accessToken` in DevTools starts with `demo-token-parent`.

- [ ] **Step 5: Navigate back to landing and click Teacher**

Navigate manually to `http://localhost:3000/` (or use browser back to landing). Click the Teacher card. Confirm:

1. ☐ Transition plays as before.
2. ☐ Lands on `/teacher` with teacher dashboard rendered.
3. ☐ `localStorage.accessToken` starts with `demo-token-teacher`.

- [ ] **Step 6: Stop dev server**

Ctrl+C in the terminal running `npm run dev`.

- [ ] **Step 7: If any check failed, fix and recommit**

If a check failed, make the minimum fix, run `npm run check-types && npm run lint`, and commit with a descriptive message like `fix(landing): resolve <specific issue>`. Then re-run the relevant verification.

- [ ] **Step 8: If all checks passed, continue to Task 10**

No commit needed if everything passed — this task is verification only.

---

### Task 10: Add atomic switchRole method to auth context

**Files:**
- Modify: `apps/web/contexts/auth-context.tsx`

This mitigates the switch-role flicker risk documented in spec section 8.4 by updating `user` state atomically without passing through `null`.

- [ ] **Step 1: Read the current auth-context**

Read `apps/web/contexts/auth-context.tsx`. Find:
- The `DEMO_USERS` map (~line 146).
- The `login` function (~line 173).
- The `AuthContextType` interface (~line 9).
- The final `AuthContext.Provider` value (~line 243).

- [ ] **Step 2: Add switchRole to the interface**

In the `AuthContextType` interface, add:

```ts
switchRole: (email: string) => void;
```

It should appear between `logout` and `refreshUser`.

- [ ] **Step 3: Add switchRole implementation**

After the `logout` function and before the `useEffect` that calls `refreshUser`, add:

```ts
const switchRole = (email: string) => {
  const demoUser = DEMO_USERS[email.toLowerCase()];
  if (!demoUser) {
    console.warn('[switchRole] unknown demo email:', email);
    return;
  }
  // Atomic swap: overwrite localStorage and user state in one pass,
  // never passing through null — prevents UI flicker in the demo mode bar.
  localStorage.setItem('accessToken', 'demo-token-' + demoUser.roles[0]);
  localStorage.setItem('refreshToken', 'demo-refresh-token');
  localStorage.setItem('user', JSON.stringify({
    id: demoUser.id, email: demoUser.email,
    firstName: demoUser.firstName, lastName: demoUser.lastName,
    tenantId: demoUser.tenantId, role: demoUser.roles[0],
    permissions: demoUser.permissions,
  }));
  setUser(demoUser);
};
```

- [ ] **Step 4: Export switchRole in the provider value**

Update the `AuthContext.Provider` value object to include `switchRole`:

```tsx
<AuthContext.Provider value={{ user, loading, login, signup, logout, switchRole, refreshUser }}>
```

- [ ] **Step 5: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass. If TypeScript complains about `DEMO_USERS` being defined inside the component and used before declaration, move the `switchRole` definition below `DEMO_USERS` (it's defined around line 146 of the current file). `login` already uses `DEMO_USERS` from the same scope, so this is safe.

- [ ] **Step 6: Commit**

```bash
git add apps/web/contexts/auth-context.tsx
git commit -m "feat(auth): add atomic switchRole for demo mode swapping"
```

---

### Task 11: Create DemoModeBar component

**Files:**
- Create: `apps/web/components/demo-mode-bar.tsx`

- [ ] **Step 1: Create the file**

Create `apps/web/components/demo-mode-bar.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';

/**
 * Sticky top bar shown inside Parent/Teacher panels while the user is in demo mode.
 * Visibility rule: localStorage accessToken starts with 'demo-token-'.
 * Provides one-tap role switching and exit to the landing page.
 */
export function DemoModeBar() {
  const { user, switchRole, logout } = useAuth();
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    setIsDemo(Boolean(token?.startsWith('demo-token-')));
  }, [user]);

  if (!isDemo || !user) return null;

  const currentRole = user.roles?.[0];
  const isParent = currentRole === 'parent';
  const isTeacher = currentRole === 'teacher';

  // Only Parent and Teacher are shown as swap targets from the bar.
  // Other roles (super_admin, tenant_admin) accessed via backdoor do not
  // need swap buttons — the bar will just show "Exit demo".
  const otherRoleLabel = isParent ? 'Teacher' : isTeacher ? 'Parent' : null;
  const otherRoleEmail = isParent ? 'teacher@example.com' : isTeacher ? 'parent@example.com' : null;
  const otherRoleDashboard = isParent ? '/teacher' : isTeacher ? '/parent' : null;

  const displayRole = isParent ? 'Parent' : isTeacher ? 'Teacher'
    : currentRole === 'tenant_admin' ? 'School Admin'
    : currentRole === 'super_admin' ? 'Super Admin'
    : 'Demo User';

  const handleSwitch = () => {
    if (!otherRoleEmail || !otherRoleDashboard) return;
    switchRole(otherRoleEmail);
    router.push(otherRoleDashboard);
  };

  const handleExit = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-10 sm:h-11 bg-gray-900/95 backdrop-blur-sm text-white"
      role="region"
      aria-label="Demo mode controls"
    >
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <span aria-hidden>🎭</span>
          <span className="hidden sm:inline">Demo Mode · You&apos;re viewing as {displayRole}</span>
          <span className="sm:hidden">Demo · {displayRole}</span>
        </div>

        <div className="flex items-center gap-2">
          {otherRoleLabel && (
            <button
              type="button"
              onClick={handleSwitch}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm border border-white/30 rounded-md hover:bg-white/10 transition-colors"
              aria-label={`Switch to ${otherRoleLabel}`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden />
              <span className="hidden sm:inline">Switch to {otherRoleLabel}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 text-xs sm:text-sm text-white/80 hover:text-white transition-colors"
            aria-label="Exit demo"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden />
            <span className="hidden sm:inline">Exit demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/demo-mode-bar.tsx
git commit -m "feat(demo): add sticky demo mode bar component"
```

---

### Task 12: Inject demo mode bar into Parent layout

**Files:**
- Modify: `apps/web/app/(parent)/parent/layout.tsx`

- [ ] **Step 1: Read the current layout**

Read `apps/web/app/(parent)/parent/layout.tsx` to understand its structure before modifying.

- [ ] **Step 2: Add DemoModeBar import and render**

At the top of the file, add the import (below existing imports):

```tsx
import { DemoModeBar } from '../../../components/demo-mode-bar';
```

Then, in the layout component's returned JSX, wrap or prepend the existing content so that `DemoModeBar` renders as the first child and the main content has top padding to clear the bar. The minimal change:

- Find the outermost returned element (typically a `<div>` or fragment).
- Make it a fragment or flex container.
- Render `<DemoModeBar />` first.
- Wrap the existing content in a `<div className="pt-10 sm:pt-11">` so it sits below the bar.

Example transformation (conceptual — use the actual current structure):

```tsx
// Before:
return (
  <div className="parent-layout">
    {children}
  </div>
);

// After:
return (
  <>
    <DemoModeBar />
    <div className="pt-10 sm:pt-11">
      <div className="parent-layout">
        {children}
      </div>
    </div>
  </>
);
```

If the current layout already returns a fragment or multiple siblings, preserve the structure and add the bar as the first sibling with the padding wrapper around the rest.

- [ ] **Step 3: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(parent\)/parent/layout.tsx
git commit -m "feat(demo): inject demo mode bar into parent layout"
```

---

### Task 13: Inject demo mode bar into Teacher layout

**Files:**
- Modify: `apps/web/app/(teacher)/teacher/layout.tsx`

- [ ] **Step 1: Read the current layout**

Read `apps/web/app/(teacher)/teacher/layout.tsx`.

- [ ] **Step 2: Apply the same transformation as Task 12**

Add the import:

```tsx
import { DemoModeBar } from '../../../components/demo-mode-bar';
```

Render `<DemoModeBar />` as the first child of the returned JSX, and wrap the existing content in `<div className="pt-10 sm:pt-11">`. Same pattern as Task 12 Step 2.

- [ ] **Step 3: Run type check and lint**

```bash
cd apps/web && npm run check-types && npm run lint
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(teacher\)/teacher/layout.tsx
git commit -m "feat(demo): inject demo mode bar into teacher layout"
```

---

### Task 14: Manual browser verification of demo mode bar and switch flow

**Files:** none (manual test)

- [ ] **Step 1: Start the dev server**

```bash
cd apps/web && npm run dev
```

- [ ] **Step 2: End-to-end demo flow test**

Open `http://localhost:3000/` and confirm:

1. ☐ Landing page renders as in Task 9.
2. ☐ Click Parent card → zoom/fade → lands on `/parent`.
3. ☐ Demo mode bar visible at the top of the parent panel, dark background, shows "Demo Mode · You're viewing as Parent".
4. ☐ Parent dashboard content is not hidden by the bar (top padding is correct).
5. ☐ "Switch to Teacher" button visible on the right of the bar.
6. ☐ Click "Switch to Teacher" → instantly lands on `/teacher`, bar updates to "Demo Mode · You're viewing as Teacher" and button now says "Switch to Parent".
7. ☐ No visible flicker during the swap (thanks to atomic `switchRole`).
8. ☐ Click "Switch to Parent" → instantly back on `/parent`, bar updates again.
9. ☐ Click "Exit demo" → lands on `/` (the landing page), logged out, demo bar no longer shown on the landing.

- [ ] **Step 3: Mobile breakpoint check**

Switch DevTools to mobile device view (~390px). Confirm:

1. ☐ Demo bar is slightly shorter (40px vs 44px).
2. ☐ Left side shows compact label: "Demo · Parent" (or Teacher).
3. ☐ Buttons become icon-only on the right.
4. ☐ Switch still works.
5. ☐ Exit still works.

- [ ] **Step 4: Backdoor check (verify untouched login still works)**

Navigate directly to `http://localhost:3000/auth/login`. Confirm:

1. ☐ Original 4-button quick-login page still renders unchanged.
2. ☐ Click any of the 4 buttons → credentials prefill → click Login → lands on the right dashboard.
3. ☐ Demo mode bar still appears on parent/teacher when entered this way (because quick-login uses demo tokens).
4. ☐ On school admin or super admin panels, demo mode bar does NOT appear if the visibility logic correctly distinguishes — or DOES appear because quick-login still uses demo tokens. Either is acceptable per the spec; note which behavior you see.

- [ ] **Step 5: Stop dev server**

Ctrl+C.

- [ ] **Step 6: Fix any failures**

Any failed check → minimum fix → `npm run check-types && npm run lint` → commit with `fix(demo): ...`.

- [ ] **Step 7: If all passed, no commit needed**

---

### Task 15: Install qrcode devDependency

**Files:**
- Modify: `apps/web/package.json` (auto-modified by npm)
- Modify: `apps/web/package-lock.json` (or root `package-lock.json`)

- [ ] **Step 1: Install qrcode**

From `apps/web/`:

```bash
npm install --save-dev qrcode @types/qrcode
```

Expected: `added N packages` output, no errors.

- [ ] **Step 2: Verify install**

```bash
grep -E '"qrcode"|"@types/qrcode"' package.json
```

Expected output includes both entries under `devDependencies`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json ../../package-lock.json
git commit -m "chore(deps): add qrcode devDependency for QR generation"
```

Note: `package-lock.json` lives at the monorepo root for npm workspaces. If `git status` shows it elsewhere, add whatever path it shows.

---

### Task 16: Create QR generation script (PNG + SVG only)

**Files:**
- Create: `apps/web/scripts/generate-qr.mjs`

- [ ] **Step 1: Create the scripts directory and file**

```bash
mkdir -p apps/web/scripts
```

Create `apps/web/scripts/generate-qr.mjs`:

```js
#!/usr/bin/env node
/**
 * Generate QR code artifacts for the demo landing page.
 *
 * Outputs:
 *  - public/demo-qr.png  (1024x1024, error correction H)
 *  - public/demo-qr.svg  (vector, error correction H)
 *  - public/demo-qr-sheet.pdf  (A4 printable sheet)   [added in task 18]
 *
 * Run from apps/web/ via `npm run qr`.
 */

import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET = 'https://allowbox-demo.vercel.app/';
const OUT = path.resolve(__dirname, '..', 'public');

async function main() {
  if (!fs.existsSync(OUT)) {
    fs.mkdirSync(OUT, { recursive: true });
  }

  // PNG — 1024x1024, highest error correction so print scuffs don't break scanning
  await QRCode.toFile(path.join(OUT, 'demo-qr.png'), TARGET, {
    width: 1024,
    errorCorrectionLevel: 'H',
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
  });
  console.log('✓ Generated demo-qr.png (1024x1024)');

  // SVG — vector, scales infinitely
  const svg = await QRCode.toString(TARGET, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
  });
  fs.writeFileSync(path.join(OUT, 'demo-qr.svg'), svg);
  console.log('✓ Generated demo-qr.svg');

  console.log(`\nQR target URL: ${TARGET}`);
}

main().catch((err) => {
  console.error('QR generation failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add npm script to package.json**

Edit `apps/web/package.json`. In the `scripts` block, add:

```json
"qr": "node scripts/generate-qr.mjs"
```

So the full scripts block becomes:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint --max-warnings 0",
  "check-types": "tsc --noEmit",
  "qr": "node scripts/generate-qr.mjs"
}
```

- [ ] **Step 3: Run the script**

```bash
cd apps/web && npm run qr
```

Expected output:
```
✓ Generated demo-qr.png (1024x1024)
✓ Generated demo-qr.svg

QR target URL: https://allowbox-demo.vercel.app/
```

- [ ] **Step 4: Verify the files exist**

```bash
ls -la apps/web/public/demo-qr.png apps/web/public/demo-qr.svg
```

Expected: both files present, PNG is several KB, SVG is a few KB.

- [ ] **Step 5: Open the PNG to visually verify**

Open `apps/web/public/demo-qr.png` in a file viewer. Confirm it looks like a valid QR code (square pattern with three corner markers).

- [ ] **Step 6: Scan with a phone**

Point a phone camera at the PNG on screen. Confirm the phone recognizes it as `https://allowbox-demo.vercel.app/` and offers to open the URL.

- [ ] **Step 7: Commit**

```bash
git add apps/web/scripts/generate-qr.mjs apps/web/package.json apps/web/public/demo-qr.png apps/web/public/demo-qr.svg
git commit -m "feat(qr): add PNG and SVG QR generation script"
```

---

### Task 17: Install pdfkit devDependency

**Files:**
- Modify: `apps/web/package.json`
- Modify: monorepo root `package-lock.json`

- [ ] **Step 1: Install pdfkit**

```bash
cd apps/web && npm install --save-dev pdfkit @types/pdfkit
```

Expected: `added N packages`, no errors.

- [ ] **Step 2: Verify install**

```bash
grep -E '"pdfkit"|"@types/pdfkit"' package.json
```

Expected: both under `devDependencies`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json ../../package-lock.json
git commit -m "chore(deps): add pdfkit devDependency for QR sheet PDF"
```

---

### Task 18: Extend QR script with PDF sheet generation

**Files:**
- Modify: `apps/web/scripts/generate-qr.mjs`

- [ ] **Step 1: Add PDF generation to the script**

Open `apps/web/scripts/generate-qr.mjs` and add the PDF block inside `main()`, after the SVG block and before the final `console.log(TARGET)`:

```js
  // PDF sheet — A4 printable with AllowBox branding + centered QR + caption
  const PDFDocument = (await import('pdfkit')).default;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const pdfPath = path.join(OUT, 'demo-qr-sheet.pdf');
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // Page dimensions: A4 is 595 x 842 points
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Brand title
  doc.fontSize(48)
     .fillColor('#111827')
     .text('AllowBox', 0, 100, { align: 'center', width: pageWidth });

  // Subtitle
  doc.fontSize(20)
     .fillColor('#6b7280')
     .text('Scan to experience the platform', 0, 170, { align: 'center', width: pageWidth });

  // QR image — centered, 320x320
  const qrSize = 320;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 240;
  doc.image(path.join(OUT, 'demo-qr.png'), qrX, qrY, { width: qrSize, height: qrSize });

  // URL below QR
  doc.fontSize(14)
     .fillColor('#374151')
     .text(TARGET, 0, qrY + qrSize + 30, { align: 'center', width: pageWidth });

  // Footer trust line
  doc.fontSize(12)
     .fillColor('#9ca3af')
     .text(
       'No signup · No data saved · Just tap and play',
       0,
       pageHeight - 80,
       { align: 'center', width: pageWidth },
     );

  doc.end();

  // Wait for the stream to finish writing before logging success
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  console.log('✓ Generated demo-qr-sheet.pdf (A4)');
```

The PDFKit import is done dynamically (`await import`) so the script still runs (minus the PDF step) if someone hasn't installed pdfkit yet — but since we install it in Task 17, this is just a belt-and-suspenders guard.

- [ ] **Step 2: Run the script**

```bash
cd apps/web && npm run qr
```

Expected output:
```
✓ Generated demo-qr.png (1024x1024)
✓ Generated demo-qr.svg
✓ Generated demo-qr-sheet.pdf (A4)

QR target URL: https://allowbox-demo.vercel.app/
```

- [ ] **Step 3: Verify the PDF**

```bash
ls -la apps/web/public/demo-qr-sheet.pdf
```

Expected: file exists, several KB to low hundreds of KB.

Open `apps/web/public/demo-qr-sheet.pdf` in a PDF reader (Preview on macOS). Visually confirm:

1. ☐ A4 page size.
2. ☐ "AllowBox" title near the top.
3. ☐ "Scan to experience the platform" subtitle below it.
4. ☐ QR code centered in the middle, large and scannable.
5. ☐ URL printed below the QR.
6. ☐ Trust line near the bottom.

If layout looks unbalanced, tweak the Y coordinates in the script (lines 100, 170, 240, `pageHeight - 80`) and re-run. Iterate until visually balanced.

- [ ] **Step 4: Scan the PDF QR with a phone**

Open the PDF on screen, point a phone camera at the QR. Confirm it resolves to `https://allowbox-demo.vercel.app/`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/scripts/generate-qr.mjs apps/web/public/demo-qr-sheet.pdf
git commit -m "feat(qr): add A4 printable PDF sheet to QR generator"
```

---

### Task 19: Final full-build verification

**Files:** none (verification)

- [ ] **Step 1: Run the full quality gate**

From `apps/web/`:

```bash
npm run check-types
npm run lint
npm run build
```

Expected: all three complete without errors. `build` may produce warnings for unrelated existing files; only new/modified files this plan touches should be warning-free.

- [ ] **Step 2: Start the production preview**

```bash
npm run start
```

Open `http://localhost:3000/`. Confirm the landing renders and animations work. Click Parent → Teacher → Exit. The flow should match the dev-mode behavior verified in Tasks 9 and 14.

- [ ] **Step 3: Stop the server**

Ctrl+C.

- [ ] **Step 4: If any build errors occurred**

Fix them. Re-run the gate. Commit with `fix(build): resolve <specific issue>`. Repeat until clean.

- [ ] **Step 5: No commit needed if clean**

---

### Task 20: Review the diff and push

**Files:** none (git)

- [ ] **Step 1: Review the full diff against main**

From the repo root:

```bash
git log --oneline main..HEAD
git diff main..HEAD --stat
```

Expected: a clean list of 15-18 commits with clear feat/chore/fix prefixes, affecting only files listed in the File Structure section of this plan.

- [ ] **Step 2: Check for stray files**

```bash
git status
```

Expected: working tree clean.

- [ ] **Step 3: Ask the user whether to push and open a PR**

Stop here. Do not push or open a PR without explicit user instruction — the user may want to review locally first. When given the go-ahead, push with:

```bash
git push -u origin feat/demo-landing
```

And either open a PR via the Vercel dashboard auto-deploy, or via `gh pr create` if GitHub CLI is authenticated for this repo.

---

## Done criteria

All of the following must be true before declaring this plan complete:

1. Root URL `/` shows the new 2-card landing with background effects.
2. Clicking Parent or Teacher auto-logs in and lands in the correct panel.
3. Demo mode bar visible inside Parent and Teacher panels with working Switch and Exit buttons.
4. `/auth/login` still works exactly as before (untouched).
5. `apps/web/public/demo-qr.png`, `demo-qr.svg`, `demo-qr-sheet.pdf` exist and scan to the landing.
6. `npm run check-types && npm run lint && npm run build` all pass.
7. All changes committed on branch `feat/demo-landing` with conventional-commit messages.

---

## Self-review notes

**Spec coverage:** Every section of the spec (routing, file layout, landing structure, copy, card visual spec, background effects layers, click flow, demo bar, QR artifacts, rollback) has a corresponding task. Task 9 and Task 14 map the spec's manual QA checklist items. Task 10 addresses the deferred flicker risk from spec section 8.4. Task 19 covers the build/type/lint gates from spec section 10.3 (Lighthouse targets are not measured in this plan — they're recommended post-deploy, not a blocker).

**Placeholder scan:** Every code block is complete. No TBD/TODO. Task 12 and Task 13 describe a conceptual JSX transformation because the current layout files are not yet read — the implementer reads them in Step 1 and applies the pattern. This is intentional: the exact code depends on what the current layout looks like, and forcing a copy-paste block would break if the current layout differs from assumptions.

**Type consistency:** `RoleCardProps`, `RoleCard`, `RoleCards`, `DemoModeBar`, `switchRole(email: string)` are consistent across tasks. The `expanding` state type (`'parent' | 'teacher' | null`) and the `RoleKey` type match. Import paths use relative imports (no `@/` aliases) matching the style already present in `apps/web/app/auth/login/page.tsx`.
