# Decision Log — SIS

Chronological record of consequential decisions. Newest first. Each entry:
what we decided, why, and what it affects.

---

## D-008 · Multi-tenant SaaS with database-enforced tenant isolation

**2026-08-14** · Teasoo SET became a multi-tenant SaaS (E12). One shared
database; every business table carries a `tenant_id`. **Isolation is enforced in
the database, not the app**: (1) structurally — `NOT NULL tenant_id` + composite
tenant-scoped FKs (taxonomy and child→stakeholder), so a row can't reference
another tenant's data; (2) by RLS — `tenant_id = current_tenant()` AND-ed into
every policy; (3) `tenant_id` is immutable via trigger. Proven by pgTAP
cross-tenant tests in CI. **Roles:** `platform_admin` (cross-tenant, manages
tenants, **no business-data access**), `admin` (tenant admin), plus
leadership/head/field scoped to their tenant. **Onboarding is invite-only** —
platform admin provisions a tenant + first admin; everyone joins via a hashed,
single-use, expiring email token; open sign-up was removed. **One tenant per
user.** Cutover is a fresh reseed (a demo tenant + a platform admin). **Affects:**
the whole schema, RLS, auth/onboarding, and every screen (now tenant-scoped).

## D-007 · Column-immutability enforced by trigger, not RLS, on `profiles`

**2026-08-13** · The #58 audit found a CRITICAL: `profiles_update_self` +
table-wide `UPDATE` for `authenticated` let any user set their own
`role='admin'`, because RLS `WITH CHECK` cannot compare OLD vs NEW and so can't
express "these columns are immutable to yourself". **Decision:** enforce
privileged-column immutability (`role`, `function`, `manager_id`,
`functional_manager_id`) with a `BEFORE UPDATE` trigger
(`guard_profile_privileged_columns`); admins and no-JWT service/migration
contexts pass through. This trigger pattern is the standard tool for
column-level authorization here (RLS handles row-level). Also hardened: cron
fails closed without `CRON_SECRET`, middleware default-denies `/api`, and a
pgTAP assertion now fails CI if any `public` table ships without RLS.
**Affects:** `profiles`, cron route, middleware, RLS test harness. **Note:**
migrations are **not** auto-applied to the hosted DB — the fix must be pushed
to Supabase manually to protect the live database.

## D-006 · Governance is an Admin-only tab, not the Admin's home

**2026-08-13** · E10 shipped `/governance` as the Admin's landing page, which
made the nav rail highlight **Home** while the page read **Governance**. We split
them: the Admin's **Home** is now the org-wide **`/portfolio`** overview (Admins
see everything, like Leadership), and **Governance** is a dedicated Admin-only
nav item. `/governance` access is a straight role check, not a landing rule.
**Affects:** E10, `getLandingPath("admin")`, `AppShell` nav.

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
