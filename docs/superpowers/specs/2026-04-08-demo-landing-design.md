# Demo Landing Page & QR Entry Experience — Design Spec

**Date:** 2026-04-08
**Status:** Draft, awaiting user review
**Target repo:** `allowbox-demo` (deployed to `https://allowbox-demo.vercel.app`)

---

## 1. Goal

Replace the current QR-scan entry point (`/auth/login` with 4 quick-demo buttons) with a branded 2-card landing page that lets scanners enter the Parent or Teacher panel in one tap, with zero friction, and switch between roles without logging out.

The experience exists to let event/booth/flyer scanners *touch the product* in under 3 seconds.

## 2. Success criteria

A first-time QR scanner:
1. Sees the AllowBox brand and understands "this is a demo, tap to play" within 2 seconds of landing.
2. Is inside a Parent or Teacher dashboard within ~1 second of tapping a card.
3. Can switch to the other role with a single tap from inside the panel.
4. Can exit back to the landing to hand the phone to the next person with a single tap.
5. Never sees a login form, never types credentials, never sees a "demo token" or backend error.

A product operator (you):
1. Retains full access to the existing 4-role admin login via a hidden URL (`/auth/login`) — zero code change to that page.
2. Can regenerate the QR code artifact (PNG, SVG, PDF sheet) with a single `npm run qr` command.
3. Has a print-ready PDF sheet for events without needing a designer.

## 3. Scope

### In scope
- New root landing page at `/` replacing the current redirect-only page.
- Two animated role cards (Parent, Teacher) with auto-login on tap.
- Animated background effects (aurora blobs, dot grid, grain, cursor glow).
- Click-to-enter transition animation (~700ms).
- Persistent demo mode bar inside Parent and Teacher panels with Switch/Exit actions.
- QR code generation script producing PNG, SVG, and PDF sheet artifacts.
- Wiring the QR code target URL to the new landing (`/`, not `/auth/login`).

### Out of scope
- Any changes to `/auth/login`, which remains the hidden backdoor for admin roles.
- Any changes to Parent or Teacher dashboard internals (only their layout wrappers gain the demo bar).
- Changes to `(school)` or `platform` panels (accessed only via backdoor; they do not need the demo bar unless reached through a `demo-token-` login, which happens automatically by existing auth-context logic).
- Backend changes. There is no backend in this repo — all demo users are hardcoded in `contexts/auth-context.tsx`.
- Marketing copy tuning beyond what is specified in section 5.4.
- i18n / multilingual support.
- Analytics instrumentation.

## 4. Architectural decisions

### 4.1 Routing
- **`/`** — new 2-card landing. Replaces current `app/page.tsx` which is a redirect-only component.
- **`/auth/login`** — untouched. Existing 4-button quick-demo page remains as the hidden admin backdoor. Accessed by typing the URL directly; never linked from the new landing; never seen by QR scanners.
- QR code target: **`https://allowbox-demo.vercel.app/`** (root, not `/auth/login`).

### 4.2 File layout

```
apps/web/app/
├── page.tsx                          [REPLACED]  2-card landing (does not import page.module.css)
├── page.module.css                   [KEPT]      Not imported by new page; left in place to minimize diff noise
├── auth/login/page.tsx               [UNTOUCHED] Hidden backdoor
├── (parent)/parent/layout.tsx        [MODIFIED]  Inject demo mode bar
├── (teacher)/teacher/layout.tsx      [MODIFIED]  Inject demo mode bar
└── (school)/, platform/              [UNTOUCHED]

apps/web/components/
├── landing/                          [NEW]
│   ├── LandingHero.tsx               Logo + headline + value prop + trust markers
│   ├── RoleCards.tsx                 Grid container for the two cards
│   ├── RoleCard.tsx                  Single card (reusable for hidden cards later)
│   └── BackgroundEffects.tsx         Aurora blobs + dot grid + grain + cursor glow
└── demo-mode-bar.tsx                 [NEW]       Sticky top bar inside panels

apps/web/scripts/
└── generate-qr.mjs                   [NEW]       QR artifact generator

apps/web/public/
├── demo-qr.png                       [GENERATED] 1024×1024, ecc level H
├── demo-qr.svg                       [GENERATED] Vector
└── demo-qr-sheet.pdf                 [GENERATED] A4 + US-Letter print sheet
```

### 4.3 Authentication model
No changes. The landing page calls the existing `login()` from `contexts/auth-context.tsx`, which:
- Recognizes demo emails (`parent@example.com`, `teacher@example.com`, etc.).
- Bypasses the API entirely.
- Sets `localStorage.accessToken = 'demo-token-' + role`.
- Sets the user state synchronously.

The demo mode bar's visibility inside panels is gated on `localStorage.accessToken.startsWith('demo-token-')`. This means:
- Scanners entering via landing cards → bar visible.
- Operators entering via `/auth/login` quick-demo buttons → bar visible (same code path).
- Operators entering via `/auth/login` with real credentials (if they hit the real API) → bar hidden automatically.

### 4.4 Design language
Stay inside the existing brand vocabulary defined in `apps/web/app/globals.css` and `tailwind.config.cjs`:
- Existing Tailwind keyframes reused: `fadeInUp`, `slideInBottom`, `zoomIn`.
- Existing timing function reused: `ease-smooth` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Existing role colors reused from `/auth/login`: amber-500 (Parent), emerald-500 (Teacher).
- New additions to `tailwind.config.cjs`: three `blob-a`/`blob-b`/`blob-c` keyframes for aurora drift, one `float` keyframe for card idle motion.

The landing chooses a **light off-white theme** (`#fafaf9`) rather than the existing dark auth-layout hero. Rationale: it matches the *inside* of the panels users are about to enter, and the animated background effects provide the visual drama without needing darkness.

## 5. Landing page design

### 5.1 Viewport structure

Full viewport (100vh), no scroll on either mobile or desktop.

```
┌─────────────────────────────────────┐
│                                     │
│        [AllowBox logo]              │  ~60px from top, small
│                                     │
│      Experience AllowBox            │  headline, 36px mobile / 52px desktop
│                                     │
│   Pick a role and explore —         │  value prop, 16px, gray-600
│   no signup, no data saved.         │
│                                     │
│   ┌──────────┐   ┌──────────┐       │  cards: side-by-side desktop,
│   │  PARENT  │   │ TEACHER  │       │         stacked mobile
│   │  [icon]  │   │  [icon]  │       │
│   │  label   │   │  label   │       │
│   │  1-line  │   │  1-line  │       │
│   │  Tap to→ │   │  Tap to→ │       │
│   └──────────┘   └──────────┘       │
│                                     │
│   🔒 Demo mode · No signup ·        │  trust markers, 12px, gray-500
│      No data saved · Reset anytime  │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 Breakpoints
- **Mobile (<640px):** cards stack vertically, Parent on top, ~75% viewport width, ~200px tall each. Headline 32px.
- **Desktop (≥640px):** cards side-by-side, ~300px wide × 340px tall, 24px gap, max-width container 720px.

### 5.3 Card visual spec
- Background: `#ffffff`
- Border-radius: `16px`
- Shadow: `0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Border: `1px solid rgba(0,0,0,0.05)`
- Left accent stripe: 4px wide, full height, amber-500 (Parent) / emerald-500 (Teacher)
- Icon: Lucide `Users` (Parent) and `GraduationCap` (Teacher), 48px, stripe-colored
- Hover (desktop): lift 8px, shadow deepens, accent stripe glow intensifies
- Tap (mobile): scale to 0.98 for 80ms tactile feedback
- Idle: continuous ±4px vertical float on a 4s loop (pauses under `prefers-reduced-motion`)

### 5.4 Copy (final, locked)

| Element | Copy |
|---|---|
| Logo | `AllowBox` (existing text logo) |
| Headline | Experience AllowBox |
| Value prop | Pick a role and explore the platform — no signup, no data saved, just tap and play. |
| Parent card label | Parent |
| Parent card value prop | Track attendance, fees, homework, and your child's progress. |
| Teacher card label | Teacher |
| Teacher card value prop | Take attendance, assign homework, message parents. |
| Card CTA | Tap to enter → |
| Trust markers | Demo mode · No signup · No data saved · Reset anytime |

## 6. Background effects

All CSS + Tailwind, zero JS libraries. Built in `components/landing/BackgroundEffects.tsx` as a single component rendered once inside the landing page.

### 6.1 Layer stack (bottom to top)

| z | Layer | Description |
|---|---|---|
| 0 | Base | Fixed full-viewport div, `background: #fafaf9` |
| 1 | Aurora blobs | 3 blurred radial gradients, drifting on independent loops |
| 2 | Dot grid | CSS `radial-gradient` pattern, 24×24px tiles, 6% opacity |
| 3 | Grain | Inline SVG noise texture, 3% opacity |
| 4 | Cursor glow | Desktop-only, follows mouse, 400×400px soft indigo radial |
| 10 | Content | Logo, headline, cards, trust markers |

### 6.2 Aurora blobs

Three absolutely-positioned divs, each ~600×600px, `filter: blur(80px)`, `pointer-events: none`.

| Blob | Color | Position | Animation |
|---|---|---|---|
| A | `rgba(251,191,36,0.35)` (amber) | `top: -10%, left: -10%` | `blobDriftA 20s ease-in-out infinite` |
| B | `rgba(99,102,241,0.30)` (indigo) | `bottom: -10%, right: -10%` | `blobDriftB 25s ease-in-out infinite` |
| C | `rgba(16,185,129,0.25)` (emerald) | `top: 30%, right: 20%` | `blobDriftC 30s ease-in-out infinite` |

Different durations ensure the blobs never sync → feels organic.

Example keyframe (to add to `tailwind.config.cjs` under `extend.keyframes`):
```js
blobDriftA: {
  '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
  '33%':      { transform: 'translate(40px, -30px) scale(1.1)' },
  '66%':      { transform: 'translate(-20px, 40px) scale(0.95)' },
}
```

Registered as `animation.blob-a`, `blob-b`, `blob-c` with the respective durations.

### 6.3 Dot grid
Single div, `position: fixed`, full viewport, `pointer-events: none`:
```css
background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
background-size: 24px 24px;
```

### 6.4 Grain overlay
Single div, `position: fixed`, full viewport, `pointer-events: none`, `opacity: 0.03`:
- Background-image is an inline base64 SVG noise texture (~2KB).
- Exact SVG: a 100×100 SVG with `<feTurbulence baseFrequency="0.9" numOctaves="2">` filter on a rect.

### 6.5 Cursor-reactive glow
Single div, `position: fixed`, 400×400px, `pointer-events: none`:
```css
background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
transform: translate(var(--cursor-x, 50%), var(--cursor-y, 50%));
```

JavaScript (embedded in `BackgroundEffects.tsx`, ~15 lines):
- Single `mousemove` listener on `window`.
- Debounced via `requestAnimationFrame`.
- Updates `--cursor-x` and `--cursor-y` CSS variables on the root element.
- Disabled at mount-time via `window.matchMedia('(pointer: coarse)')` check (returns early on touch devices).

### 6.6 Performance
- All animations use `transform` and `opacity` only → GPU-accelerated.
- Aurora blobs have `will-change: transform` on mount, removed via JS after 30 seconds (covers the longest blob cycle).
- Grain is a data URI → no network request.
- Total extra payload: ~3KB CSS + ~2KB inline SVG.
- On mobile, Blob C (emerald) is hidden via media query to save battery.

### 6.7 Reduced motion
Under `@media (prefers-reduced-motion: reduce)`:
- All aurora blob animations: `animation: none`.
- Card idle float: `animation: none`.
- Card enter/slide animations: still run (short, non-vestibular).
- Cursor glow: unaffected (not auto-animating).
- Click-to-enter transition: unchanged (user-initiated, brief).

## 7. Click-to-enter flow

### 7.1 Timeline (Parent card example, Teacher identical)

| Time | Event |
|---|---|
| T+0ms | User taps Parent card. |
| T+0ms | Card scales to 1.03 for 80ms (tactile micro-bounce). |
| T+80ms | Card scales back to 1.0, begins zoom expansion to 1.5 + opacity fade. |
| T+80ms | In parallel: `login('parent@example.com', 'demo123')` called. Sync, <5ms. |
| T+80ms | Full-page white overlay begins fading in (opacity 0 → 1 over 400ms). |
| T+480ms | Overlay fully opaque. `router.push('/parent')` called. |
| T+~700ms | Parent dashboard mounts, overlay fades out (opacity 1 → 0 over 300ms). |
| T+~1000ms | User is inside the parent panel with demo mode bar visible. |

### 7.2 Implementation sketch

```tsx
// components/landing/RoleCard.tsx
'use client';
const handleEnter = async () => {
  if (isExpanding) return; // guard against double-tap
  onExpand(); // lifts state to page.tsx to show full-screen overlay
  await new Promise(r => setTimeout(r, 80));
  await login(role.email, 'demo123');
  await new Promise(r => setTimeout(r, 400));
  router.push(role.dashboardPath);
};
```

State flow:
- `page.tsx` owns an `expandingRole: 'parent' | 'teacher' | null` state.
- Passed down to `RoleCards` → `RoleCard` as `isExpanding` boolean and `onExpand` callback.
- When not `null`, a full-screen white overlay renders at top level of `page.tsx` with z-index 50.
- The expanding card itself applies a `scale-150 opacity-0` class via Tailwind transition for its own zoom effect.

### 7.3 Error handling
- `login()` for demo emails is synchronous and cannot fail (hardcoded `DEMO_USERS` map, no network).
- If `router.push()` somehow fails, the overlay would remain stuck. Guard: a 3-second safety timeout inside `page.tsx` that resets `expandingRole` to `null` and logs a console error. User sees the landing restored and can retry.

## 8. Demo mode bar

### 8.1 Placement
Rendered as the first child of:
- `app/(parent)/parent/layout.tsx`
- `app/(teacher)/teacher/layout.tsx`

Optional future: add to `(school)/layout.tsx` and `platform/layout.tsx` if demo flows through those panels are ever wanted. Not part of this spec.

### 8.2 Visual spec

```
┌──────────────────────────────────────────────────────────────────┐
│  🎭  Demo Mode   ·   You're viewing as Parent                    │
│                          [Switch to Teacher]    [Exit demo]      │
└──────────────────────────────────────────────────────────────────┘
```

- Position: `fixed top-0 left-0 right-0`, z-50.
- Height: 44px desktop, 40px mobile.
- Background: `bg-gray-900/95 backdrop-blur-sm`.
- Text: `text-white text-sm font-medium`.
- Left: emoji + "Demo Mode · You're viewing as [Role]".
- Right: two buttons.
  - Primary: "Switch to [other role]" — white border, transparent bg, hover lightens.
  - Secondary: "Exit demo" — plain white text.
- Mobile collapse: left becomes just `🎭 Demo · Parent`. Buttons become icon-only (swap icon, exit icon).

### 8.3 Visibility rule
The bar component renders `null` unless:
```ts
typeof window !== 'undefined' &&
localStorage.getItem('accessToken')?.startsWith('demo-token-')
```

This check runs on mount and is recomputed via the `useAuth()` user dependency.

### 8.4 Actions

**Switch to [other role]:**
```ts
await logout();
await login(OTHER_ROLE_EMAIL, 'demo123');
router.push(OTHER_ROLE_PATH);
```
No overlay, no transition — instant swap, same 80ms micro-bounce for feedback.

Known risk: between `logout()` and `login()`, the `user` state in `auth-context` is briefly `null`, which could cause child components to flash an unauthenticated state. Mitigation during implementation: either (a) add a short 150ms transition overlay on the bar that covers the swap, or (b) add a `switchRole()` method to `auth-context` that updates `user` atomically without passing through `null`. Decision deferred to implementation plan — both are small changes.

**Exit demo:**
```ts
await logout();
router.push('/');
```
User lands back on the 2-card landing, fully signed out.

### 8.5 Panel layout adjustment
Both `(parent)/parent/layout.tsx` and `(teacher)/teacher/layout.tsx` need their content pushed down by the bar height when the bar is visible. Implementation: wrap existing layout content in a div with conditional `pt-11` (44px) / `pt-10` (40px) based on viewport width, applied only when the bar visibility check passes.

## 9. QR code generation

### 9.1 Artifacts

| File | Format | Purpose |
|---|---|---|
| `apps/web/public/demo-qr.png` | PNG, 1024×1024 | Digital sharing, embedding |
| `apps/web/public/demo-qr.svg` | SVG | Infinite-scale print, design tools |
| `apps/web/public/demo-qr-sheet.pdf` | PDF, A4 + US-Letter | Print-ready event sheet |

All three are committed to the repo so they deploy with the site and are downloadable at:
- `https://allowbox-demo.vercel.app/demo-qr.png`
- `https://allowbox-demo.vercel.app/demo-qr.svg`
- `https://allowbox-demo.vercel.app/demo-qr-sheet.pdf`

### 9.2 Script: `apps/web/scripts/generate-qr.mjs`

The code below is an illustrative sketch for the implementation plan — exact pdfkit layout measurements (moveDown values, font sizes) will be tuned during build to produce a visually balanced A4 page.

```js
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';

const TARGET = 'https://allowbox-demo.vercel.app/';
const OUT = path.resolve('public');

// PNG
await QRCode.toFile(path.join(OUT, 'demo-qr.png'), TARGET, {
  width: 1024, errorCorrectionLevel: 'H', margin: 4,
});

// SVG
const svg = await QRCode.toString(TARGET, {
  type: 'svg', errorCorrectionLevel: 'H', margin: 4,
});
fs.writeFileSync(path.join(OUT, 'demo-qr.svg'), svg);

// PDF sheet (A4 with AllowBox branding, centered QR, caption)
const doc = new PDFDocument({ size: 'A4', margin: 50 });
doc.pipe(fs.createWriteStream(path.join(OUT, 'demo-qr-sheet.pdf')));
doc.fontSize(36).text('AllowBox', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(18).fillColor('#6b7280')
   .text('Scan to experience the platform', { align: 'center' });
doc.moveDown(2);
// Embed QR PNG (already generated above)
doc.image(path.join(OUT, 'demo-qr.png'), {
  fit: [300, 300], align: 'center', valign: 'center',
});
doc.moveDown(15);
doc.fontSize(12).fillColor('#9ca3af')
   .text('No signup · No data saved · Just tap and play', { align: 'center' });
doc.end();

console.log('✓ Generated demo-qr.png, demo-qr.svg, demo-qr-sheet.pdf');
```

### 9.3 npm script

Add to `apps/web/package.json`:
```json
"scripts": {
  ...
  "qr": "node scripts/generate-qr.mjs"
}
```

### 9.4 Dependencies

Added to `apps/web/package.json` under `devDependencies`:
- `qrcode` — ~50KB, MIT, zero runtime deps beyond itself.
- `pdfkit` — ~1MB, MIT, used only for PDF generation.

Neither ships to the browser. Both only run under Node during `npm run qr`.

### 9.5 Regeneration policy
The script is run manually (`npm run qr`) whenever:
- The target URL changes.
- The brand logo or sheet copy changes.
- A one-time regeneration is needed for a print run.

It is **not** part of the build pipeline. The artifacts are committed to git, so deploys pick them up automatically without running the script.

## 10. Testing plan

### 10.1 Manual QA checklist
1. Visit `/` on desktop → landing renders, background effects visible, cards visible.
2. Visit `/` on mobile (or narrow browser) → cards stack, cursor glow is absent, Blob C hidden.
3. Hover Parent card (desktop) → lift + shadow + stripe glow.
4. Tap Parent card → micro-bounce → zoom-fade → inside `/parent` within ~1s.
5. Inside `/parent` → demo mode bar visible at top with "Switch to Teacher" and "Exit demo".
6. Tap "Switch to Teacher" → instant swap to `/teacher`, bar updates to "Switch to Parent".
7. Tap "Exit demo" → back on `/` landing, no residual state.
8. Visit `/auth/login` directly → unchanged, 4 buttons still work.
9. Enable `prefers-reduced-motion` → blob drift pauses, card float pauses, click transitions still work.
10. Run `npm run qr` → three files appear in `public/`, PNG is 1024×1024, PDF opens in a reader.
11. Scan `demo-qr.png` with a phone camera → opens `https://allowbox-demo.vercel.app/` → lands on new page.

### 10.2 Browser targets
- Safari iOS (latest 2 versions)
- Chrome Android (latest 2 versions)
- Chrome / Safari / Firefox desktop (latest)

### 10.3 Lighthouse targets (landing page)
- Performance: ≥ 90 mobile
- Accessibility: ≥ 95
- Best Practices: ≥ 95

## 11. Rollback plan

All changes are additive except `apps/web/app/page.tsx` which is replaced.

To roll back:
1. `git revert` the commit(s) that touched `page.tsx`, layouts, and new components.
2. The QR code still points to `/`, which returns to its original redirect-to-login behavior.
3. No backend, no database, no state to unwind.

Risk is effectively zero.

## 12. Open questions (none)

All design decisions have been locked in during brainstorming. No TBD items remain.

---

**Next step:** Review this spec. On approval, invoke the `writing-plans` skill to produce the step-by-step implementation plan.
