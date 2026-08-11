# SIS — Stakeholder Intelligence System

One authoritative source of truth for stakeholder relationships: frictionless
field capture rolling up into risk visibility for leadership.

**Stack:** Next.js (App Router) on Vercel · Fluent UI v9 (Fluent 2) · Supabase
(Postgres + Auth + RLS) · Brevo (transactional email).

> Design contract: the client-approved [`stakeholder-tracker`](https://github.com/Teasoo-Holding/stakeholder-tracker)
> Fluent 2 deck. Access control follows [`DECISIONS.md`](./DECISIONS.md) — RLS is
> authoritative, not the UI.

---

## Status

**Epic E0 — Platform Foundations** is in place:

| Story | What |
|---|---|
| E0-1 | Core data model + referential integrity (`supabase/migrations`) |
| E0-3 | Append-only audit log, trigger-written |
| E0-2 | 10-stakeholder seed, one-command load (`supabase/seed.sql`) |
| E0-5 | RLS policies encoding the §8 matrix + pgTAP test harness |
| E0-4 | CI (typecheck · lint · build · DB tests) + externalised env config |

Also seeded at the DB layer: escalation auto-open/severity (E6-1/2) and derived
views (activity feed, function rollups, escalation board).

---

## Getting started

### 1. App

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # http://localhost:3000
```

### 2. Database (requires Docker + the Supabase CLI)

```bash
supabase start              # boots local Postgres/Auth/Studio
supabase db reset           # applies migrations + loads seed.sql
supabase test db            # runs the RLS / trigger test suite
```

`supabase db reset` is the reproducible path from zero to schema + demo data.

---

## Environment

Copy `.env.example` → `.env.local`. Never commit real values.

| Var | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client | project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | anon key; every query is RLS-scoped |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | bypasses RLS — highest-value secret; scheduled/admin jobs only |
| `BREVO_API_KEY` | server only | transactional email (E7 reminders) |

---

## Deploy (E0-4)

1. **Vercel** → import the repo. Framework auto-detects as Next.js; `vercel.json`
   enables production deploys on `main` and preview deploys per PR (the "review
   environment" the Definition of Done refers to).
2. **Supabase** → create a project (staging + prod separate). Run migrations with
   `supabase db push` (or link and `supabase migration up`).
3. Set the env vars above in Vercel project settings — **no secrets in the repo**.
   The service-role key is server-only and never `NEXT_PUBLIC_`.

CI (`.github/workflows/ci.yml`) runs on every PR: typecheck, lint, build, and the
database migration + RLS test suite.

---

## Layout

```
src/app/            App Router — layout, SSR Fluent provider, pages
src/components/      Shared UI (brand mark, …)
src/lib/theme.ts     Fluent 2 brand ramp + status colours
src/lib/supabase/    client (browser) · server (RLS) · admin (service-role)
supabase/migrations/ Schema — source of truth
supabase/seed.sql    Demo dataset (E0-2)
supabase/tests/      pgTAP RLS + trigger tests (E0-5 / NFR-2)
```
