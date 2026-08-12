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

## Notifications

- **In-app + email notifications** — a notification system with (a) an **in-app**
  centre/badge (new activity, escalations assigned to me, commitments due) and
  (b) **email** delivery via Brevo. Overlaps E7 (commitment reminders) and E8-5
  (activity badge); this is the unifying capability + preferences. Respect RLS
  scope in what each user is notified about. _(Requested 2026-08-12.)_

## UX

- **Empty states everywhere** — design friendly, on-brand empty states for every
  list/section (directory, profile sections, escalations, dashboards, activity)
  with a clear next-step CTA. Users disengage from screens that look empty; never
  show a bare "nothing here". _(Requested 2026-08-12.)_

## Reporting / Export

- **Download reports (PDF + CSV)** — export directory / portfolio / escalation
  views as a formatted **PDF** report and raw **CSV**. Must respect the viewer's
  RLS scope (export only what they can see). _(Requested 2026-08-12.)_

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
