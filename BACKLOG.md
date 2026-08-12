# Backlog — SIS

Ideas and requested work not yet scheduled into an epic. Each item should
graduate into a GitHub issue (epic/story) when picked up.

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
