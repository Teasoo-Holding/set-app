# Decision Log — SIS

Chronological record of consequential decisions. Newest first. Each entry:
what we decided, why, and what it affects.

---

## D-005 · Branching workflow: build on `staging`, promote to `main`

**2026-08-12** · New workflow: all feature work lands on the **`staging`**
branch first (Vercel gives it a preview URL), gets tested there, and is only
then promoted to **`main`** (production). CI runs on both branches. `main`
stays deployable/demo-ready at all times. **Affects:** every change from here on.

## D-004 · Stay on Next.js 14.2.x (React 18) for now; defer the Next 16 jump

**2026-08-11** · Two high-severity advisories remain in the prod tree
(Next.js internal Server-Function endpoint disclosure; transitive `postcss`
source-map reads). `npm audit` only clears them by installing `next@16`, a
breaking change that also forces React 19.

**Decision:** stay on `next@14.2.35` (which *does* patch the Dec-2025 critical),
because Fluent UI v9's SSR path is pinned to React 18 in our setup. The residual
highs are build-time (postcss) or unreachable today (we expose no Server Actions).
**Follow-up:** tracked security issue to move to Next 15/16 + React 19 and
re-verify Fluent v9 SSR before Phase 1 lock. Until then, no untrusted Server
Actions.

## D-003 · Access control lives in Postgres RLS, not app code

**2026-08-11** · Per the Technical Architecture, the §8 permission matrix is
enforced by Row Level Security. UI scoping is convenience, not the guarantee.
Escalation auto-open/severity (E6-1/2) and the audit log (E0-3) are **database
triggers** so they can't be bypassed by any client path. RLS baseline is
function-scoped deny-by-default (field/head see only their function).
**Affects:** E0-5, E1-3, E6. **To confirm:** exact §8 matrix against the PRD
before Phase 1 lock — current policies encode a defensible interpretation.

## D-002 · Design system = Fluent 2 via Fluent UI React v9

**2026-08-11** · The client-approved demo (`stakeholder-tracker`) is built in
Microsoft Fluent 2. We rebuild with `@fluentui/react-components` (v9) — SSR-safe
`FluentProvider` in the App Router, brand ramp tuned to the demo's blue.
**Affects:** all UI epics.

## D-001 · Stack: Next.js on Vercel + Supabase + Brevo

**2026-08-11** · Adopted from the Technical Architecture. Next.js app on Vercel;
Supabase for Postgres + Auth + RLS; Brevo for transactional email. Dev/demo auth
is email/magic-link; SAML SSO deferred (paid Supabase tier + corporate IdP
paperwork). **Note:** this is Supabase — distinct from the separate mowaa
project, which uses Neon.
