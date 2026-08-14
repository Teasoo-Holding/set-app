# Backlog — Teasoo SET

Ideas and requested work not yet scheduled into an epic. Each item should
graduate into a GitHub issue (epic/story) when picked up.

## Priority

- **Sign in with Microsoft** — the pilot org (Unilever) is a Microsoft shop, so
  the real production sign-in is **Microsoft Entra ID (Azure AD)**. Add a
  "Sign in with Microsoft" button on `/login`. Supabase's built-in **Azure
  (OIDC) provider** (`signInWithOAuth({ provider: 'azure' })`) avoids the paid
  SAML tier — needs an Azure app registration + redirect URLs + tenant config,
  and mapping the Entra identity to a profile (role/function). Supersedes the
  generic SSO placeholder currently on the login screen. _(Requested 2026-08-12.)_

## Marketing site

- **Request a demo form** (#95) — replace the landing-page mailto with a real
  form (name, work email, organisation, message). On submit: store the request
  in the DB (`demo_requests`, RLS-closed, platform-admin read) and email
  **info@teasooconsulting.com** + **efeosasere.okoro@teasooconsulting.com** via
  Brevo, with a "thanks, we'll be in touch" confirmation. Basic anti-spam.
  _(Requested 2026-08-14.)_

## Onboarding & Access

- **Invitation-based onboarding (hierarchical)** — people join by invitation from
  someone of higher privilege; no open sign-up. **Who can invite whom:** Admin →
  anyone; Leadership → Heads + Field; Head → Field (in their function); Field →
  no one. Invitee gets an **email invite** to accept and set up their account
  (maps to a profile with the assigned role/function). Pairs with #23 Microsoft
  sign-in (accept via Entra). _(Requested 2026-08-13.)_

## Notifications

- **In-app + email notifications** — a unifying notification system: an **in-app**
  centre/badge **and** **email** via Brevo, with per-user preferences. Respect RLS
  scope. Overlaps E7 (commitment reminders) and E8-5 (activity badge).
  **Events to cover** _(Requested 2026-08-12/13)_:
  - **Escalation routing** — a field-raised escalation notifies the **Head of the
    function**; a Head-raised escalation notifies **Leadership** (email + in-app).
  - **Field activity → Head** — any update logged by field staff notifies their
    **Head of department** (email + in-app).
  - **Stakeholder assigned** — when a stakeholder (or escalation) is assigned to
    someone, that assignee gets an **email + in-app** notification.
  - **Invite sent** — invitee gets an email (see Onboarding).
  - Existing: commitments due (E7), escalation assigned-to-me (E6).

## UX

- **Empty states everywhere** — design friendly, on-brand empty states for every
  list/section (directory, profile sections, escalations, dashboards, activity)
  with a clear next-step CTA. Users disengage from screens that look empty; never
  show a bare "nothing here". _(Requested 2026-08-12.)_

## Reporting / Export

- **Download reports (PDF + CSV), period-based** — export directory / portfolio /
  escalation / activity as a formatted **PDF** and raw **CSV**, over a chosen
  **date range (from X to Y)**. Everyone can export **what they can see** (RLS-
  scoped). _(Requested 2026-08-12/13.)_
- **Scheduled monthly reports** — automatically email a **monthly report** to each
  **Head of department** (their function) and to **Leadership** (portfolio-wide).
  Vercel Cron + Brevo; scope each recipient's report to what they may see.
  _(Requested 2026-08-13.)_

## Discoverability

- **LLM / AI SEO** — make the public marketing site (see Public/Marketing)
  discoverable by AI assistants: `llms.txt`, clean semantic HTML + structured
  data (schema.org Organization/Product), good metadata/OG tags, sitemap. Goal:
  the product surfaces when people ask AI about stakeholder-engagement tools.
  _(Requested 2026-08-13.)_

## Security

- **Comprehensive security audit (pre-production)** — run a full audit before the
  pilot goes live, covering the 5 high-frequency vibe-code gaps + OWASP-style
  checklist: (1) secrets/env (no hardcoded keys, service-role never `NEXT_PUBLIC_`,
  source maps off, startup env validation), (2) **RLS on every table** + `WITH
  CHECK` on insert/update + `auth.uid()` identity + SECURITY DEFINER review,
  (3) server-side validation (identity from session not request body; input
  validation; no `dangerouslySetInnerHTML`), (4) dependencies (`npm audit`, no
  hallucinated pkgs, lockfile, patch CVEs — see #7 Next upgrade), (5) auth
  middleware (default-deny, `getUser()` not `getSession()`), plus **rate
  limiting** (auth + expensive routes), CORS, and file-upload checks. Use the
  provided audit prompt; fix CRITICAL/HIGH before launch. _(Requested 2026-08-13.)_
  **Update 2026-08-13:** audit run; CRITICAL (profiles self-escalation) + all
  MEDIUM fixed (#58). Deferred code items filed as #80 (field-owner column
  scope) and #81 (rate limiting). Remaining low hardening below.

- **Tighten `anon` table grants** — post-audit LOW (defense-in-depth). `anon`
  currently has `SELECT` on every table (neutralised by RLS, which denies all
  rows to an anon user). Drop the blanket `anon` default-privilege grant and
  grant only what pre-auth pages actually need (today: nothing). _(2026-08-13.)_

- **Pin `NEXT_PUBLIC_SITE_URL` per environment** — post-audit LOW. `siteOrigin()`
  falls back to the `x-forwarded-host` header when the env var is unset; behind
  Vercel that header is trusted and Supabase validates the OAuth redirect
  allowlist, so risk is low — but setting `NEXT_PUBLIC_SITE_URL` in each
  deployment makes the origin deterministic and removes header reliance.
  Also: keep `NEXT_PUBLIC_DEMO_MODE` off for the real pilot. _(2026-08-13.)_

## Product enhancements

- **Audit-trail viewer** — a "History" tab per stakeholder over the existing
  `audit_log` (who changed what, when). Trust/compliance; useful for the pilot.
- **Risk/sentiment history** — snapshot risk/sentiment over time so the profile
  "relationship trajectory" chart (demo, deferred) and dashboard trends become
  real (not fabricated).
- **Stale-relationship alerts** — flag stakeholders with no contact in N days,
  Tier-aware (Tier 1 tighter). Serves "keep the record fresh."
- **SLA timers on escalations** — auto-nudge / auto-escalate if a Critical isn't
  acknowledged within X hours (Vercel Cron + notifications).
- **Bulk data import** — CSV/Excel import to seed real stakeholders at
  onboarding (needed for Unilever day one); validation + dedupe.
- **Duplicate detection** on new-stakeholder requests — warn on likely dupes
  before an Admin approves (avoid two "Ministry of Trade"s).
- **Global search / command palette** — ⌘K to jump to any stakeholder fast
  (RLS-scoped results).
- **Data retention / GDPR** — personal data on real people: right-to-be-
  forgotten, retention policy, export-my-data. Address before production.
- **Guided onboarding / empty-state tour** — first-run tour + helpful empty
  states (pairs with the Empty states item under UX).

_(All requested 2026-08-13.)_

## Architecture

- **Multi-tenant SaaS** — convert SIS so many organisations (tenants) can use
  one deployment, isolated from each other. **Not now:** the pilot is a single
  company (Unilever). Design current work so tenancy can be layered in later
  (e.g. a `tenant_id` on core tables + RLS by tenant, tenant-scoped auth). Until
  then, treat the whole dataset as one tenant. _(Requested 2026-08-12.)_

## Observability / Analytics

- **Sentry** — error monitoring + performance tracing for the Next.js app
  (client + server + edge). Wire DSN via env; source maps on Vercel builds.
  _(Requested 2026-08-12.)_
- **PostHog** — product analytics + session insight. Client SDK with an
  opt-in/consent gate (respect the Privacy Policy). _(Requested 2026-08-12.)_

## Public / Marketing

- **Marketing landing page + legal + contact** — a public-facing marketing
  landing page for SIS, plus **Terms of Service**, **Privacy Policy**, and a
  **Contact** page/route. Separate from the authenticated app (which now enters
  at `/login`). Should be reachable without sign-in. Tracked: see GitHub issue.
  _(Requested 2026-08-12.)_
