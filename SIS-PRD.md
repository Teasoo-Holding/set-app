# Product Requirements Document — Stakeholder Intelligence System (SIS)

**Product:** Stakeholder Intelligence System ("SIS")
**Owner:** Corporate Affairs & Sustainability, Unilever Nigeria
**Status:** Draft v1.2 — all open decisions resolved
**Last updated:** 10 August 2026
**Related assets:** Working prototype (GitHub Pages demo), `Teasoo-Holding/stakeholder-tracker` repo, SIS Walkthrough deck

---

## 1. Summary

SIS is a role-based stakeholder relationship management tool for a Corporate Affairs function. Its tagline — *"one voice, one source of truth"* — captures the core bet: field staff log engagements in seconds, and that same data rolls up into risk visibility, sentiment trends, and an escalation workflow for function heads and leadership. What each user sees is decided by their role, so the field gets a frictionless capture surface while leadership gets portfolio-wide risk oversight, all reading from one directory.

The prototype demonstrates five distinct experiences — Field, Head, Leadership, Admin, and a Phone view — sharing a single stakeholder dataset. This document specifies the product those views imply: the roles, the data model, the permission rules, the feature set, and what a first shippable version should and should not include.

---

## 2. Background & problem

Corporate Affairs teams manage relationships with entities that can materially help or block the business: regulators (NAFDAC, FCCPC, Standards Org.), government bodies (Customs, Ministry of Trade, State Revenue, State Environment ministries), host communities, and commercial partners such as distributors. These relationships are typically tracked in scattered spreadsheets, personal inboxes, and individual memory.

That fragmentation creates four recurring failures:

- **Engagements go unlogged.** If capture is slow or bureaucratic, busy field staff skip it, so the record is incomplete and unreliable.
- **Risk surfaces too late.** A souring relationship (a resistant regulator, an agitated community) only becomes visible once it is already a crisis, because no one is watching sentiment trend across a portfolio.
- **Knowledge walks out the door.** When an employee leaves, the relationships and context they held are lost or orphaned.
- **No single version of the truth.** Leadership, function heads, and field staff each hold partial, inconsistent pictures, so "how is our relationship with X?" has no authoritative answer.

SIS exists to fix these by making logging trivial at the edge and making risk legible at the top, from one shared source.

---

## 3. Goals & non-goals

### Goals

1. Make logging an engagement fast enough that field staff actually do it ("under 60 seconds" is the design target shown in the prototype).
2. Give every stakeholder an authoritative record: category, tier, owner, last contact, risk level, and sentiment.
3. Surface risk proactively via a sentiment trend and an escalation board that orders the most urgent relationships first.
4. Provide a clean role-based experience so each user sees exactly the scope relevant to them — no more, no less.
5. Preserve institutional knowledge through ownership reassignment when people move or leave.
6. Let an administrator maintain the system (taxonomy, approvals, ownership) without touching code.

### Non-goals (for v1)

- Not a CRM for customers or a sales pipeline tool.
- Not a document management or contract repository.
- Not a public-facing or stakeholder-facing portal — it is internal only.
- Not an automated sentiment-analysis engine in v1; sentiment and risk are human-assigned.
- Not a replacement for email or messaging; it records that engagements happened, not the raw correspondence.

---

## 4. Success metrics

- **Logging adoption:** % of active field users who log at least one engagement per week; median time-to-log per engagement.
- **Coverage:** % of Tier 1 stakeholders with a logged contact in the last 30 days.
- **Early-warning value:** median time between a stakeholder flipping to "Resistant" / "High risk" and an escalation being opened.
- **Escalation throughput:** % of critical escalations that move Open → Intervened within target SLA.
- **Continuity:** % of stakeholders that remain owned (not orphaned) after a staff departure.
- **Trust in the source:** leadership self-reported confidence that SIS reflects the true state of relationships.

---

## 5. Roles & personas

SIS is fundamentally role-driven. The prototype defines four functional roles plus a responsive Phone view.

**Field / Standard User — "Chidi Okonkwo," Area Sales Manager.**
Owns a handful of stakeholders. Needs to capture engagements quickly, see his own stakeholders and open commitments, and request that new stakeholders be added. He is deliberately shielded from portfolio-wide risk analytics — his job is capture, not oversight.

**Function Head / Lead — "Funke Bello," Head of Regulatory Affairs.**
Sees everything within her function only. Manages a team (e.g. a Regulatory Affairs Officer and a Compliance Officer), watches her function's sentiment trend, works an escalation board scoped to her function, and tracks upcoming commitments and recent Tier 1 activity.

**Leadership — "Zainab Obagun," Corporate Affairs Lead.**
Full cross-function portfolio view. Sees aggregate high-risk counts, an activity-by-function breakdown, all escalations across every function, and organisation-wide sentiment.

**Admin / Superadmin — "Tobi Adeniyi," Managing Director.**
Governance and system maintenance: approve or reject new-stakeholder requests, edit taxonomy (categories, functions, engagement types), and bulk-reassign ownership when an employee departs.

**Phone view.**
A responsive, capture-first layout of the field experience for use in the field on mobile.

---

## 6. Core concepts & data model

### 6.1 Entities

**Stakeholder** — the central record. Attributes:

| Field | Description | Example values |
|---|---|---|
| Name | Organisation or entity name | "NAFDAC", "Agbara Host Community" |
| Category | Type of stakeholder (taxonomy-driven) | Regulator, Government, Community, Commercial |
| Function | Owning internal function | Regulatory Affairs, Community & Sustainability, Commercial, Legal & Compliance |
| Tier | Strategic importance | Tier 1, Tier 2 |
| Owner | Employee responsible | Bode Williams, Chidi Okonkwo |
| Risk level | Current relationship risk | High, Medium, Low |
| Sentiment | Current disposition toward the business | Supportive, Neutral, Resistant |
| Last contact | Date of most recent logged engagement | 19 Jun |
| Flagged | Manual escalation flag | true / false |

**Engagement** — a logged interaction with a stakeholder. Attributes: stakeholder, date, owner/author, engagement type (taxonomy-driven: Virtual Meeting, Physical Meeting, Call, Email, Site Visit, Event), free-text notes, and optionally a resulting sentiment/risk update. Engagements form the "Recent activity" feeds and set "last contact."

**Commitment** — a promised follow-up action tied to a stakeholder. Attributes: stakeholder, description, due date, priority (High / Low), owner, status. Commitments surface as "open commitments" (field), "due this week," and "upcoming commitments."

**Escalation** — a stakeholder relationship needing intervention because it is flagged or high-risk. Attributes: stakeholder, severity (Critical / Elevated), owner, opened date, summary, next-action date, and a status pipeline: **Open → Acknowledged → Assigned → Intervened** (with a Resolve action). Escalations are ordered most-urgent-first.

**User / Employee** — has a name, function, and role (Standard User, Function Lead, Leadership, Superadmin). Can own stakeholders and be reassigned.

**Stakeholder request** — a pending proposal from a field user to add a new stakeholder to the master directory, awaiting Admin approval/rejection.

**Taxonomy** — editable option sets for Category, Function, and Engagement Type, maintained by Admin.

### 6.2 Derived / rollup data

- **Portfolio sentiment trend** — sentiment mix over recent months (e.g. Apr/May/Jun) with a direction indicator (Declining / Improving) and a current mix breakdown (% Supportive / Neutral / Resistant).
- **Activity by function** (Leadership) — per-function counts of stakeholders, high-risk items, and open escalations.
- **Portfolio counters** — High risk count, Open escalations, Due this week, % Supportive.
- **Recent activity feed** — a reverse-chronological stream of the latest logged engagements across the user's scope (function for Heads, portfolio for Leadership), showing **all tiers**, not Tier 1 only. Each entry shows the stakeholder, date, sentiment indicator, and a note excerpt. (This replaces the prototype's "Recent Tier 1 activity" panel so nothing is hidden by tier.)

### 6.3 Tiering

Tier expresses strategic importance and sets the level of oversight and cadence a stakeholder warrants. Rather than leave it to gut feel, v1 uses a lightweight rubric across four dimensions:

- **Business impact** — how much revenue, operations, or licence-to-operate depends on this relationship.
- **Regulatory / decision power** — the stakeholder's authority to approve, block, sanction, or disrupt.
- **Escalation potential** — how quickly a souring relationship could become a public or operational crisis.
- **Engagement cadence** — how frequently and how senior the required contact is.

**Tier 1** — strategically critical: national regulators and key ministries whose decisions gate the business (e.g. NAFDAC, FCCPC, Standards Org., Fed. Min. of Trade). High on impact and power; foregrounded for leadership visibility.
**Tier 2** — important but more routine or locally scoped: state-level bodies, individual host communities, distributors (e.g. LIRS, Lagos Min. of Environment, Agbara Host Community, Artee Group).

Tier drives sort order, prominence, and oversight expectations, but **not** feed inclusion — the activity feed shows all tiers (see §6.2).

**Who decides:** tier is proposed by the owner when the stakeholder is created, confirmed by the **Function Head**, and finalised as part of the Admin approval of the new-stakeholder request. Tier changes thereafter are made by the Function Head or Admin.

### 6.4 Escalation triggers & severity

Escalations open automatically so risk is never missed, using rules consistent with the pattern already present in the prototype's data (High + Resistant reads as Critical; High + Neutral reads as Elevated):

- **Eligibility.** A stakeholder becomes an active escalation when it is rated **High risk** *or* is **manually flagged**. Medium/Low risk stakeholders do not auto-escalate but can be manually flagged.
- **Auto-open.** When a stakeholder crosses into High risk, SIS auto-opens an escalation at the derived severity and places it on the relevant boards.
- **Severity derivation:**
  - **Critical** — High risk **and** Resistant sentiment, *or* any manual flag raised as critical.
  - **Elevated** — High risk with Neutral or Supportive sentiment.
- **Ordering.** Boards list most-urgent-first (Critical above Elevated, then by age).
- **Manual flags.** Any owner or Function Head can raise a flag; a flag always opens an escalation and the flagger sets the initial severity.
- **Lifecycle.** Escalations move Open → Acknowledged → Assigned → Intervened, and are closed via Resolve; resolving or dropping the stakeholder below High risk (and clearing any flag) removes it from active boards.

### 6.5 Reporting lines & team structure

The Function Head's "team" view and the reporting-line relationships are driven by an org-structure model with a clear system of record:

- **Primary source of truth:** the corporate identity provider / HRIS directory (the same source behind SSO) supplies each user's manager and department. This keeps SIS in sync with real HR org changes without manual upkeep.
- **Functional override:** because Corporate Affairs functional teams don't always map 1:1 to HR line management, SIS stores a **function** and **functional manager** attribute per user that the **Admin** can maintain when it diverges from the HR line. The Head's team roster is built from this functional mapping.
- Ownership of stakeholders is tracked separately from reporting lines, so a person can own stakeholders across functions while still rolling up to one functional Head for team views.

---

## 7. Functional requirements

Requirements are grouped by capability. Each is tagged with the primary roles it serves.

### 7.1 Authentication & role entry

- **FR-1.** Users sign in with corporate email via SSO. *(All)*
- **FR-2.** The signed-in user's role determines their default landing experience and the scope of every subsequent screen. *(All)*
- **FR-3.** The prototype additionally offers "Continue as — Demo Roles" one-tap logins for demonstration; production must gate role assignment to real identity, not self-selection. *(All)*

### 7.2 Engagement logging *(Field, Head, Leadership)*

- **FR-4.** A prominent "Log an engagement" action is available from the home surface, designed to complete in under ~60 seconds.
- **FR-5.** Logging captures stakeholder, engagement type, date, and notes; on save it updates the stakeholder's "last contact" and appears in relevant activity feeds.
- **FR-6.** Logging is optimised for mobile in the Phone view.

### 7.3 Directory *(Field, Head, Leadership)*

- **FR-7.** A searchable master directory of stakeholders with search across names, notes, and owners.
- **FR-8.** Filter by Category (Regulator / Government / Community / Commercial) and by Tier (1 / 2).
- **FR-9.** Sort by risk (high → low) and other keys.
- **FR-10.** Each row shows name, tier, category, owner, last contact, risk level, sentiment, and a flag indicator when flagged. Risk and sentiment are visible to field/standard users on their own stakeholders — the field is not blind to relationship health, it simply lacks the portfolio-wide rollups and cross-function scope reserved for Heads and Leadership.
- **FR-11.** Directory scope respects role: Leadership sees all; Heads see their function; a "My Stakeholders" view scopes to the current user's owned records.
- **FR-12.** "Request new" lets a user propose a stakeholder for Admin approval.
- **FR-12a.** A stakeholder can be flagged (raising an escalation) directly from its directory row, in addition to from the stakeholder profile and the escalation screen. Flagging is available to the owner and to Heads/Leadership within scope.

### 7.4 My Stakeholders / My work *(Field, Head)*

- **FR-13.** A personal view listing only stakeholders owned by the current user, with the same filter/sort/row detail as the directory.
- **FR-14.** A personal "open commitments" list showing description, due date, and priority.
- **FR-14a.** Commitments generate reminders on a fixed cadence: a heads-up at **T-3 days**, a reminder on the **due date (T-0)**, then a **daily overdue** notification until resolved. Notifications reach the commitment's owner, and overdue items on Tier 1 stakeholders also surface to the relevant Function Head.
- **FR-14b.** Due and overdue commitments are reflected in the "due this week" counters and upcoming-commitments feeds so they are visible in-app as well as via notification.

### 7.5 Function Head dashboard *(Head)*

- **FR-15.** Function-scoped KPI cards: High risk, Open escalations, Due this week, % Supportive.
- **FR-16.** Portfolio sentiment trend for the function, with trend direction and current mix.
- **FR-17.** Team roster ("people reporting to you") with each member's stakeholder count and open-escalation count.
- **FR-18.** A function-scoped escalation board (high-risk & flagged).
- **FR-19.** Upcoming commitments and a **recent activity feed covering all tiers** (not Tier 1 only), scoped to the function.
- **FR-20.** An activity notification indicator.

### 7.6 Leadership dashboard *(Leadership)*

- **FR-21.** Cross-function KPI cards spanning the whole portfolio.
- **FR-22.** Organisation-wide sentiment trend and mix.
- **FR-23.** "Activity by function" table with per-function stakeholder, high-risk, and escalation counts; clicking a function filters the directory.
- **FR-24.** A cross-function escalation board and full upcoming-commitments and **all-tier recent activity** feeds.

### 7.7 Escalations *(Head, Leadership)*

- **FR-25.** A dedicated Escalations screen listing everything flagged or rated high-risk, ordered most-urgent-first.
- **FR-26.** Summary counters: Critical, Elevated risk, Total active.
- **FR-27.** Filters: All / Critical / High risk.
- **FR-28.** Each escalation shows stakeholder, tier, function, owner, age, a summary, risk and sentiment tags, and a next-action date.
- **FR-29.** A visible status pipeline (Open → Acknowledged → Assigned → Intervened) with actions: View profile, Acknowledge, Assign, Resolve.
- **FR-30.** Escalation scope respects role (Head = own function; Leadership = all functions).

### 7.8 Governance / Admin *(Admin)*

- **FR-31.** Review queue for new-stakeholder requests with Approve / Reject, showing who requested and why.
- **FR-32.** Taxonomy editor to add/remove options for Category, Function, and Engagement Type without code changes. **Taxonomy editing is strictly Admin/Superadmin.**
- **FR-33.** Ownership reassignment: select a departing owner and a replacement, preview how many stakeholders will move, and bulk-reassign. Reassignment is not Admin-exclusive — it can be performed by **Admin** (any owner, any function), **Leadership** (across functions), and a **Function Head** (within their own function). Every reassignment is logged with actor, timestamp, and the set of stakeholders moved.

### 7.9 Cross-cutting

- **FR-34.** A view switcher exists in the prototype for demo purposes; in production, view = role and is not freely switchable.
- **FR-35.** Risk and sentiment are human-set on the stakeholder and drive rollups, colour coding, and escalation eligibility.

---

## 8. Permissions matrix (RBAC)

| Capability | Field / Standard | Function Head | Leadership | Admin / Superadmin |
|---|---|---|---|---|
| Log engagement | ✅ (own) | ✅ | ✅ | ✅ |
| View directory | Own + browse | Own function | All functions | All |
| My Stakeholders | ✅ | ✅ | ✅ | ✅ |
| Request new stakeholder | ✅ | ✅ | ✅ | ✅ |
| Approve/reject requests | ❌ | ❌ | ❌ | ✅ |
| Function dashboard | ❌ | ✅ (own function) | ✅ (all) | View |
| Portfolio / cross-function view | ❌ | ❌ | ✅ | ✅ |
| Escalation board | ❌ | ✅ (own function) | ✅ (all) | View |
| Act on escalations (ack/assign/resolve) | ❌ | ✅ | ✅ | ✅ |
| Edit taxonomy | ❌ | ❌ | ❌ | ✅ |
| Reassign ownership | ❌ | ✅ (own function) | ✅ (all functions) | ✅ (all) |

*Taxonomy editing is Admin-only. Ownership reassignment is available to Heads (within their function), Leadership (cross-function), and Admin (global); all reassignments are logged.*

---

## 9. Non-functional requirements

- **Speed of capture.** Logging must feel near-instant; the field experience is the adoption linchpin.
- **Mobile.** The Phone view must support real field use on a phone, offline-tolerant capture is desirable.
- **Security & access control.** Role-scoped data access enforced server-side, not just hidden in the UI. SSO / corporate identity integration.
- **Auditability.** Engagements, escalation status changes, ownership reassignments, and approvals should be traceable to a user and timestamp.
- **Data integrity on reassignment.** Bulk reassignment must be atomic and reversible/logged so no stakeholder is orphaned or silently lost.
- **Accessibility.** Colour-coded risk/sentiment must also be conveyed by text labels (already true in the prototype) for colour-blind users.
- **Scalability.** Should handle the full stakeholder portfolio and multiple functions without material slowdown.

---

## 10. Assumptions & dependencies

- Users have corporate email and an SSO identity provider is available.
- Roles and reporting lines derive from the corporate identity provider / HRIS directory, with a functional-team mapping that Admin can override in SIS (see §6.5).
- Sentiment and risk are assigned by humans in v1; there is no automated inference.
- The organisational structure (functions, reporting lines) is known and maintained.
- The prototype is a static front-end; a production build requires a backend, persistent datastore, and auth service.

---

## 11. Out of scope for v1 / future roadmap

- Automated sentiment/risk scoring from engagement text or external signals.
- Integration with email/calendar to auto-log engagements.
- Stakeholder-facing communications or portal.
- Advanced analytics (predictive risk, influence mapping, relationship graphs).
- Notifications for *stale* Tier 1 relationships (no contact in N days) — commitment reminders are already in v1 scope; this extends the same mechanism to inactivity.
- Reporting exports (PDF/board packs) generated from the portfolio view.
- Configurable escalation SLAs and automated severity promotion.

---

## 12. Decisions log

All open questions from prior reviews are now resolved. No blocking questions remain for v1 scope.

- **Taxonomy & reassignment rights** — Taxonomy editing is **Admin-only**. Ownership reassignment: **Head** (own function), **Leadership** (cross-function), **Admin** (global). A Head's reassignment needs **no secondary sign-off** — Heads manage their own people; the audit log is sufficient. *(§7.8, §8)*
- **Commitment reminders** — In scope for v1, fixed cadence: **T-3 days, T-0 (due date), then daily while overdue**. *(FR-14a/b)*
- **Field visibility of risk/sentiment** — Field/standard users **see** risk and sentiment on their own stakeholders; they lack only the portfolio rollups and cross-function scope. *(FR-10)*
- **Reporting-line source of truth** — HRIS/identity directory is system of record, with an Admin-maintained functional-team override where functional teams diverge from HR lines. *(§6.5)*
- **Tier definition & owner** — Four-dimension rubric (business impact, regulatory power, escalation potential, cadence); tier proposed by owner, confirmed by Head, finalised at Admin approval. Tier affects prominence/oversight, not feed inclusion. *(§6.3)*
- **Escalation trigger** — Auto-open on High risk **or** manual flag; severity derived (High + Resistant = Critical; High + Neutral/Supportive = Elevated), consistent with the prototype's existing data. *(§6.4)*
- **Flagging entry points** — A stakeholder can be flagged directly from its **directory row**, as well as from the profile and escalation screen. *(FR-12a)*
- **Recent activity feed** — The prototype's "Recent Tier 1 activity" panel becomes an **all-tier "Recent activity"** feed for both Heads and Leadership, so nothing is hidden by tier. *(§6.2, FR-19, FR-24)*

---

## 13. Appendix — screens in the prototype

1. **Sign-in** — SSO email entry plus demo-role quick logins.
2. **Field home** — greeting, log-engagement CTA, my-stakeholder count, request CTA, open commitments.
3. **Directory** — searchable, filterable, sortable master list with risk/sentiment.
4. **My Stakeholders** — personal scoped list.
5. **Head home** — function KPIs, sentiment trend, team roster, escalation board, commitments, all-tier recent activity.
6. **Escalations (Head)** — function-scoped escalation workflow.
7. **Leadership home** — portfolio KPIs, activity-by-function, cross-function escalation board and feeds.
8. **Escalations (Leadership)** — all-function escalation workflow.
9. **Governance (Admin)** — request approvals, taxonomy editor, ownership reassignment.
