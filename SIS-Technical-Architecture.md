# SIS — Technical Architecture & Stack Decisions

**Product:** Stakeholder Intelligence System (SIS)
**Sources:** SIS PRD v1.2, SIS Epics & Stories backlog
**Stack:** Vercel (app hosting) · Supabase (Postgres database + Auth) · Brevo (email)
**Status:** Draft v1.0 — for engineering review

---

## 1. Stack at a glance

| Concern | Technology | Notes |
|---|---|---|
| Web app / hosting | **Vercel** | Next.js app; serverless/edge functions; preview deploys per PR |
| Database | **Supabase Postgres** | Single source of truth; the PRD §6 data model lives here |
| Auth / identity | **Supabase Auth** | Email + enterprise SSO (SAML 2.0) |
| Access control | **Postgres Row Level Security (RLS)** | Enforces the §8 permission matrix at the data layer |
| Scheduled jobs | **Vercel Cron** (or Supabase `pg_cron`) | Drives commitment reminder cadence |
| Transactional email | **Brevo** | Reminder and notification delivery via API |
| File/asset storage | **Supabase Storage** (if needed later) | Not required for v1 |

The shape of this stack is deliberately boring and well-trodden: a Next.js front end on Vercel talking to Supabase for data and auth, with RLS doing the heavy lifting on access control, and a scheduled job fanning reminder emails out through Brevo. Nothing here requires custom infrastructure.

---

## 2. Architecture overview

The app is a **Next.js application on Vercel**. Server components and route handlers (or server actions) talk to Supabase using the user's session, so every query runs *as that user* and is subject to their RLS policies. There is no separate backend service to build or operate — Supabase is the backend, and Vercel functions are the glue for anything Supabase can't do directly (e.g. calling Brevo).

Three planes:

1. **Request plane** — the user's browser → Vercel (Next.js) → Supabase, authenticated by the Supabase session. Reads and writes are scoped by RLS.
2. **Scheduled plane** — a cron trigger → a Vercel function (or a Supabase scheduled Edge Function) that finds due/overdue commitments and calls Brevo. This runs with a service role, bypassing RLS deliberately and safely because it's system-owned logic.
3. **Identity plane** — Supabase Auth handles sessions; enterprise users authenticate through the corporate IdP over SAML 2.0.

This collapses much of **Epic E0 (Platform Foundations)**: there's no bespoke persistence layer, auth service, or deploy rig to build — they're configuration on managed platforms.

---

## 3. Identity & access (maps to Epic E1)

### 3.1 Authentication

Supabase Auth provides the sign-in. For corporate SSO, Supabase supports SAML 2.0 against the common enterprise IdPs — Okta, Microsoft Entra ID (Azure AD), Google Workspace, and other SAML-compliant providers — via `supabase.auth.signInWithSSO()`.

**Load-bearing constraint:** SAML SSO is **disabled by default and is a paid-plan feature (Pro and above)**; end-user SSO into the app is enabled per-project via the dashboard/CLI and configured against your IdP at runtime. This means:

- **E1-1 (SSO sign-in)** carries a **commercial dependency**: budget for at least the Supabase Pro plan, and coordinate with whoever owns the corporate IdP (likely Entra ID in a Microsoft-heavy org) to register SIS as a service provider.
- For early development and the demo, use **email/password or magic-link** auth (free) and treat SSO as a configuration step layered in before production. The `signInWithSSO()` integration is small; the lead time is the IdP paperwork, so start that conversation early.

### 3.2 Authorisation — RLS *is* the RBAC matrix

The §8 permission matrix is not enforced in the UI or in app code as the primary control — it's enforced in **Postgres Row Level Security policies**. This is the single most important architectural decision in the build:

- Each user's role and function live in their profile (a `profiles` / `users` table keyed to the Supabase auth user).
- RLS policies read the current user's role/function via `auth.uid()` and gate every `select`/`insert`/`update`/`delete` on `stakeholders`, `engagements`, `escalations`, `commitments`, etc.
- Example intent: a Head can `select` stakeholders only where `function = their function`; Leadership can select all; a field user sees their owned records plus browse scope; only Admin can write to `taxonomy`.

This satisfies **E1-3 (server-side scope enforcement)** and **NFR-2** by construction — a field user cannot reach another function's data by editing a URL or hitting the API directly, because the database itself refuses. The UI scoping (E1-2 routing, E2-1 scoped lists) becomes a *convenience layer* on top of a guarantee, not the guarantee itself.

**Consequence for the backlog:** write RLS policies and their tests as first-class deliverables inside E1-3, and add a policy for every table as it's introduced. Treat "no RLS policy" as "table is closed," not "table is open."

---

## 4. Data layer (maps to Epic E0 + E2)

- The PRD §6.1 entities become Postgres tables with foreign keys: `stakeholders`, `engagements`, `commitments`, `escalations`, `users/profiles`, `stakeholder_requests`, `taxonomy`.
- **Derived data** (portfolio counters, sentiment mix, activity-by-function, recent-activity feed) is computed with SQL **views** or Postgres **functions** rather than denormalised columns, so it can't drift from the underlying records. Heavy rollups can be materialised views refreshed on a schedule if needed.
- **Escalation auto-open (E6-1/2)** is a natural fit for a **database trigger**: when a stakeholder's risk crosses to High or a flag is set, a trigger opens/updates the escalation and derives severity (High+Resistant → Critical; High+Neutral/Supportive → Elevated). Putting this in the DB means it fires no matter which client caused the change — the rule can't be bypassed by a code path that forgot to call it.
- **Audit log (E0-3)** is an append-only `audit_log` table written by triggers on the audited tables, capturing actor (`auth.uid()`), action, entity, and timestamp.

---

## 5. Scheduling & email (maps to Epic E7)

Commitment reminders (**FR-14a**: T-3, T-0, then daily overdue) need a clock. Two viable patterns:

- **Vercel Cron** → a scheduled route handler that queries Supabase (service role) for commitments due at each offset and enqueues Brevo sends. Simple, lives with the app.
- **Supabase `pg_cron` / scheduled Edge Function** → keeps the logic next to the data. Good if you'd rather not run reminder logic in Vercel.

Either way, **Brevo** is the delivery mechanism: the job composes transactional emails (templated in Brevo) and calls the Brevo API. Recommendations:

- Use **Brevo transactional templates** so copy changes don't need a deploy.
- Send **idempotently** — key each send on `(commitment_id, reminder_type, date)` and record it, so a re-run of the cron (or an overlapping run) can't double-send.
- Route **Tier 1 overdue** items to the owning Head as well as the owner (**E7-3**) by resolving the reporting line at send time.
- Verify your **Brevo sending domain (SPF/DKIM)** early so corporate mail filters don't quarantine reminders — this is the usual cause of "the reminders don't arrive."

This makes **E7-2 (reminder cadence)** concretely a *cron job + idempotency table + Brevo template*, not an abstract "notification service."

---

## 6. What this changes in the backlog

The stack simplifies foundations and sharpens three epics. Suggested edits:

- **E0-1 (Data model)** — implement as Supabase migrations (SQL). Add: SQL views/functions for derived data; DB triggers for escalation auto-open and audit.
- **E0-3 (Audit log)** — implement as trigger-written append-only table.
- **E0-4 (Deploy)** — becomes "connect repo to Vercel + Supabase project + environment linking," largely configuration.
- **E1-1 (SSO)** — add commercial/IdP dependency (Supabase Pro + corporate IdP registration); allow email/magic-link auth for dev and demo.
- **E1-3 (RBAC)** — restate as "RLS policies per table + policy tests"; this is now a database deliverable, and the §8 matrix is its spec.
- **E6-1/E6-2 (Escalation auto-open + severity)** — implement as DB triggers so the rule is unbypassable.
- **E7-2 (Reminders)** — implement as Vercel Cron (or `pg_cron`) + Brevo transactional templates + an idempotency/sent-log table.

New foundational stories worth adding:

- **E0-5 — RLS policy framework & test harness** · P0 · M — a repeatable pattern and per-role test suite so every new table ships with policies and coverage.
- **E0-6 — Brevo integration & domain auth** · P1 · S — API wiring, templates, SPF/DKIM verification, idempotent send helper.
- **E1-5 — IdP onboarding (SAML)** · P1 · M — register SIS with the corporate IdP, attribute mapping to role/function, tested IdP- and SP-initiated flows. *(Blocked on Supabase Pro.)*

---

## 7. Environments & delivery

- **Vercel preview deployments** per pull request give reviewable increments for free — this is the "review environment" the Definition of Done refers to.
- Use a **separate Supabase project (or branch)** for staging vs production so seed/demo data and schema changes are isolated from real data.
- Keep all secrets (Supabase service role key, Brevo API key) in **Vercel environment variables**, never in the repo — the service role key in particular bypasses RLS and must be server-only.

---

## 8. Key decisions, risks & things to verify

**Decisions**
- RLS is the authoritative access-control layer; UI scoping is convenience, not security.
- Escalation triggering and audit are database-level, so they can't be bypassed by any client.
- Reminders are a scheduled job + Brevo transactional templates, sent idempotently.

**Risks / dependencies to confirm with current docs before committing**
- **Supabase plan & SSO tier** — confirm the current plan that unlocks end-user SAML SSO and its price; pricing/tier details change, so verify on Supabase's pricing page rather than trusting this doc.
- **Corporate IdP ownership & lead time** — registering a new SAML service provider in an enterprise IdP often needs IT tickets and approvals; this is usually the critical-path item for a production launch.
- **Cron cadence limits** — confirm Vercel Cron's minimum interval and count on your plan (or use `pg_cron`) suits a daily-overdue reminder job; verify current limits.
- **Brevo sending limits & deliverability** — confirm the plan's transactional volume covers your user base, and complete domain authentication early.
- **Service-role blast radius** — the scheduled/admin paths that bypass RLS must be tightly scoped and server-only; treat the service role key as the highest-value secret.

**Recommended verification pass:** before locking Phase 1, spend an afternoon confirming the four items above against live docs/pricing, since each is tier- or org-dependent and can move the plan.
