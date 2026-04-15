# Personalized Demo with Admin-Controlled Portal Access

**Status:** Approved 2026-04-15.
**Repos:** `Allow_box_final_backend` (API), `Allow_box_final_frontend` (super-admin UI), `allowbox-demo` (public demo site).

## Summary

Public visitors scan a QR code and land on the demo site. They pick a portal (Parent / Teacher / School Admin / Super Admin), fill a short portal-specific form (captured as a sales lead), see a brief personalized animation, and are dropped into the auto-logged-in demo portal with a small "Hi, <name>" banner at the top. The super admin controls which portals are available — disabled ones appear locked.

## Goals

- Capture visitor contact info (name, phone, school) as leads in MongoDB.
- Give a personalized "this is *your* portal" first impression.
- Let super admin enable/disable each portal at runtime — no redeploy.
- Zero auth ceremony for the visitor; one form fill per portal per 24h.

## Non-goals

- Per-visitor sandbox tenants (all demos share one seeded demo tenant; already exists).
- Multi-user demo sessions (no collaborative features).
- Persisting visitor submissions beyond 365 days (TTL index).
- Analytics, CSV export, or editing submissions (only a read-only list for lead follow-up).

## Architecture

Three cooperating codebases:

1. **`Allow_box_final_backend`** (prod Fastify API) owns:
   - `DemoConfig` singleton document (per-portal enabled flag)
   - `DemoSubmission` collection (one row per form submit)
   - Public endpoints for the demo site
   - Super-admin endpoints for the platform panel
2. **`Allow_box_final_frontend`** (prod Next.js app) adds:
   - New sidebar entry "Demo" under Management → `/platform/demo`
   - Page with 4 portal toggles and a recent-submissions table
3. **`allowbox-demo`** (separate public Vercel site) adds:
   - `/` rebuilt as a 4-card picker driven by the public config endpoint
   - `/demo/form/[portal]` portal-specific form
   - `/demo/welcome/[portal]` animation then redirect into the portal shell
   - `<DemoNameBanner>` component mounted inside each existing portal shell
   - `localStorage` helper with 24h TTL

Both Vercel deployments call the same prod API, same MongoDB — one source of truth.

## Data model

**`DemoConfig`** (Mongoose collection: `democonfigs`, always exactly one doc)

```ts
{
  _id: 'demo-config', // fixed key — upsert only
  portals: {
    parent:   { enabled: boolean },
    teacher:  { enabled: boolean },
    school:   { enabled: boolean },
    platform: { enabled: boolean },
  },
  updatedAt: Date,
  updatedBy: ObjectId | null,
}
```

Defaults: all four enabled. Created on first read if missing.

**`DemoSubmission`** (collection: `demosubmissions`)

```ts
{
  _id: ObjectId,
  portal: 'parent' | 'teacher' | 'school' | 'platform',

  // Union of possible fields; different portals fill different ones.
  parentName?: string,
  childName?: string,
  teacherName?: string,
  schoolAdminName?: string,
  representative?: string,
  tenantName?: string,
  schoolName?: string,

  phone: string,     // always captured
  userAgent?: string,
  ipAddress?: string,

  createdAt: Date,
}
```

Indexes:
- `{ createdAt: -1 }` for listing (super admin view).
- TTL index on `createdAt` with `expireAfterSeconds: 31_536_000` (365 days).

## Endpoints

### Public (no auth, rate-limited)

**`GET /api/v1/demo/config`**

- Returns the `DemoConfig` portals block.
- Cached 60 seconds in memory (module-level cache) to soften load from repeated demo page hits.
- Response: `{ portals: { parent: {enabled: true}, ... } }`.

**`POST /api/v1/demo/submissions`**

- Rate limit: 5/min per IP, 30/hour per IP.
- Body validated by Zod: `portal` (enum), `phone` (required, min 6 chars), portal-specific fields (see below), optional user-agent already captured server-side.
- Portal-required field matrix (server-validated):
  - `parent`: `parentName`, `childName`, `schoolName`, `phone`
  - `teacher`: `teacherName`, `schoolName`, `phone`
  - `school`: `schoolName`, `schoolAdminName`, `representative`, `phone`
  - `platform`: `tenantName`, `representative` (the `your name` of the Super Admin rep), `phone`
- Server stores IP and user-agent alongside the submission.
- Response: `201 { id }` on success.

### Super admin (auth'd: `super_admin` role only)

**`GET /api/v1/superadmin/demo/config`** — same shape as public endpoint, no cache.

**`PATCH /api/v1/superadmin/demo/config`** — body `{ portals: { parent: {enabled}, ... } }`. Returns updated doc. Stamps `updatedBy = currentUser.id`.

**`GET /api/v1/superadmin/demo/submissions?limit=50&cursor=...`** — most recent first, 20/page default. Shape: `{ data: [...], nextCursor: string|null }`.

## Super admin UI (`/platform/demo`)

Sidebar link under Management, above or below "Users & Roles": label "Demo", icon `Sparkles` or `PlayCircle`.

Page structure:
- Header: "Demo Control" + subtitle "Choose which portals the demo site offers".
- **Portal Toggles card** — 4 rows, each with portal name + description + a toggle. Changes PATCH instantly; on success shows a toast "Parent portal enabled" (or disabled).
- **Recent Submissions card** — table (Name / Phone / Portal / School / When) with cursor pagination. Phone displayed in full for outbound lead work.

No delete, no CSV export.

## Demo site flow

### 1. `/` — picker

- Loads `GET /demo/config` on mount. While loading, show shimmer. On failure, show all cards locked with "Demo temporarily unavailable" + retry every 30s.
- Renders four portal cards in a 2×2 grid (responsive → single column on mobile):
  - **Enabled** card: portal icon + name + one-line tagline + "Try now →" CTA. Click navigates to `/demo/form/[portal]`.
  - **Disabled** card: same layout, grayed out (50% opacity), a lock icon overlay, aria-disabled, not clickable. Tooltip "Currently disabled".

### 2. `/demo/form/[portal]`

- On mount, check `localStorage.demoPortalData[portal]`:
  - If present and `ts` within 24h → skip to `/demo/welcome/[portal]?skip=1`.
- Render portal-specific form fields (see data model).
- Submit:
  1. `POST /demo/submissions` with body.
  2. On success: write `localStorage.demoPortalData[portal] = { name, ts: Date.now() }`. "Name" means `parentName` for parent, `teacherName` for teacher, `schoolAdminName` for school, `representative` for platform — the human first name the banner should greet.
  3. Navigate to `/demo/welcome/[portal]`.
- On validation error or rate-limit (429): inline error, no navigation.

### 3. `/demo/welcome/[portal]`

- Reads localStorage (must exist). If missing → push back to `/`.
- 2.5s Framer Motion animation:
  - Fade in the sentence "Hey **{name}**, welcome to your **{portal label}** portal".
  - Small glyph / confetti mote.
- After 2.5s: `router.replace('/parent' | '/teacher' | '/school' | '/platform')` — the existing auto-login card flows already handle logging into the seeded demo user on those routes.

### 4. Inside portal shells (`(parent)`, `(teacher)`, `(school)`, `platform`)

- Each portal layout mounts `<DemoNameBanner portal="parent" />`.
- Banner reads `localStorage.demoPortalData[portal]`:
  - If fresh (<24h) → render a small sticky ribbon at the top: "👋 Hi, **{name}**" + tiny "Change name" link which clears that portal's blob and redirects to `/demo/form/[portal]`.
  - If missing or expired → redirect to `/`.

## `localStorage` schema

```ts
// Key: 'demoPortalData'
{
  parent?:   { name: string, ts: number }, // ms epoch
  teacher?:  { name: string, ts: number },
  school?:   { name: string, ts: number },
  platform?: { name: string, ts: number },
}
```

Reader helper `readPortalBlob(portal)` returns `null` if entry missing or `Date.now() - ts > 24h`. Stale entries are cleared on read.

## Edge cases

- **Config endpoint down**: picker shows everything locked + "Temporarily unavailable".
- **Deep link to `/parent` directly**: banner hook sees no blob → redirects to `/`.
- **Deep link to enabled-then-disabled portal**: picker won't show it; if user has the URL they're redirected to `/` with toast "This demo is currently unavailable".
- **Rate limit**: 429 from submissions → form inline message "Too many attempts, wait a minute".
- **Multiple people same device**: each submit is a distinct row in `DemoSubmission`; only latest blob per portal cached locally.
- **Config toggled OFF while inside**: session stays; next page load on `/` blocks re-entry.

## Testing plan

### Backend unit tests
- `DemoConfig` upsert creates defaults on first read.
- `PATCH` updates only portals provided, preserves others.
- Submission validation rejects missing required fields per portal.
- Rate limit returns 429.
- TTL index exists.

### API smoke tests (curl)
- Public `GET /demo/config` returns 200 without auth.
- Public `POST /demo/submissions` with valid parent body returns 201.
- `POST /demo/submissions` without required field returns 400.
- Super-admin `PATCH /superadmin/demo/config` with non-super-admin token returns 403.
- Super-admin `PATCH` flips a toggle; subsequent `GET /demo/config` reflects new state (after cache TTL).

### Frontend smoke (manual + Playwright where easy)
- Super admin toggles Parent off → demo site picker renders Parent as locked within 60s.
- Click enabled card → fills form → submits → animation plays → lands in portal with banner.
- Reload same portal within 24h → skips form, goes straight to animation.
- Clear localStorage → picker reloads, requires form again.

## Security

- Public routes on the prod backend accept no auth. They must:
  - Rate limit aggressively (5/min/IP + 30/hour/IP).
  - Validate every field via Zod.
  - Never log full phone numbers at info level (redact middle digits in logs).
- Super admin routes reuse existing `authenticate + authorize('super_admin')` guard.
- No PII in the demo's localStorage beyond the first name the visitor typed.

## Out of scope / future

- Admin-editable portal taglines/banners.
- Analytics dashboard on the demo section.
- Per-visitor snapshot of what they clicked inside the portal.
- "Send me a real demo" button from inside the portal banner.
