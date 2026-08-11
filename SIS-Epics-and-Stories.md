# SIS — Epics & User Stories (Delivery Backlog)

**Product:** Stakeholder Intelligence System (SIS)
**Source:** SIS PRD v1.2
**Purpose:** A build-ready backlog — epics broken into vertically-sliced stories with acceptance criteria, sizing, priority, dependencies, and a phased release plan.

---

## How to read this backlog

**Story format.** Every story is a thin vertical slice that delivers observable value: *As a [role], I want [capability], so that [outcome].* Acceptance criteria are written so QA and engineering can agree on "done" without re-litigating scope.

**Priority (delivery phase, not importance):**
- **P0 — MVP.** The smallest set that proves the core loop end-to-end: *field logs → record updates → risk surfaces → leadership sees it.* If a story isn't needed to demonstrate that loop with real value, it isn't P0.
- **P1 — Release 1.** Completes the daily-use product: full escalation workflow, commitments & reminders, full dashboards.
- **P2 — Release 2.** Governance/admin self-service, mobile polish, exports, hardening.

**Sizing (t-shirt → rough points):** XS≈1, S≈2, M≈3, L≈5, XL≈8. Sizes are relative and pre-refinement.

**Traceability.** Each story cites the PRD requirement(s) it satisfies.

**Definition of Ready / Done** are at the end, followed by the release plan and dependency map.

---

## Epic map

| # | Epic | Outcome it delivers | Phase focus |
|---|---|---|---|
| E0 | Platform Foundations | A deployable app with the real data model and audit trail | P0 |
| E1 | Identity & Access | The right person sees the right scope, enforced server-side | P0 |
| E2 | Stakeholder Directory & Records | One authoritative, searchable source of truth | P0 |
| E3 | Engagement Logging | Frictionless capture that keeps the record fresh | P0 |
| E4 | My Work (Field) | A field user's personal, low-noise workspace | P0 |
| E5 | Risk, Sentiment & Flagging | Human-set relationship health that drives everything downstream | P0 |
| E6 | Escalation Management | Risk becomes an ordered, workable queue before it's a crisis | P0→P1 |
| E7 | Commitments & Reminders | Promises don't get dropped | P1 |
| E8 | Function Head Dashboard | A Head sees their function's health and team at a glance | P0→P1 |
| E9 | Leadership Portfolio View | Cross-function risk and sentiment oversight | P1 |
| E10 | Governance & Admin | Admins run the system without touching code | P2 |
| E11 | Mobile / Phone Experience | Capture-first use in the field | P1→P2 |

---

## E0 — Platform Foundations

**Outcome:** A running, deployable application with the canonical data model, seed data, and an audit log — the substrate every other epic builds on.
**Success signal:** A developer can stand the app up, and every state change is attributable to a user and time.

- **E0-1 — Data model & persistence** · P0 · L
  *As the* engineering team, *I want* the core entities (Stakeholder, Engagement, Commitment, Escalation, User, Stakeholder Request, Taxonomy) persisted with the relationships from the PRD, *so that* every feature reads and writes one consistent schema.
  **AC:** all entities and attributes from PRD §6.1 exist; referential integrity between owner↔stakeholder, engagement↔stakeholder, escalation↔stakeholder enforced; migrations are reproducible.
  *(PRD §6.1)*

- **E0-2 — Seed / demo dataset** · P0 · S
  *As a* PM/stakeholder, *I want* the prototype's demo data (10 stakeholders, roles, escalations, commitments) loaded, *so that* every environment is demonstrable and testable against known-good data.
  **AC:** seeding is one command; data matches the prototype's names, tiers, risk, and sentiment.
  *(PRD §13)*

- **E0-3 — Audit log** · P0 · M
  *As* Leadership/Admin, *I want* engagements, escalation transitions, reassignments, flags, and approvals recorded with actor + timestamp, *so that* the system of record is trustworthy and reviewable.
  **AC:** each listed action writes an immutable log entry; entries are queryable by entity and by actor.
  *(PRD §9 auditability)*

- **E0-4 — Deploy pipeline & environments** · P0 · M
  *As the* team, *I want* a CI deploy to a hosted environment, *so that* stakeholders can review each increment.
  **AC:** merge to main deploys; environment config is externalised; no secrets in the repo.
  *(PRD §9)*

---

## E1 — Identity & Access

**Outcome:** Users authenticate with corporate identity and every screen is scoped by role, enforced on the server.
**Success signal:** A field user physically cannot retrieve another function's portfolio data, by URL or API.

- **E1-1 — SSO sign-in** · P0 · M
  *As a* user, *I want* to sign in with my corporate email via SSO, *so that* access matches my real identity.
  **AC:** valid corporate identity authenticates; non-provisioned users are refused; session established securely.
  *(PRD FR-1)*

- **E1-2 — Role-based landing & routing** · P0 · S
  *As a* user, *I want* to land on the experience for my role, *so that* I start where my work is.
  **AC:** Field→field home; Head→function dashboard; Leadership→portfolio; Admin→governance.
  *(PRD FR-2)*

- **E1-3 — Server-side scope enforcement (RBAC)** · P0 · L
  *As* the business, *I want* every read/write authorised against the role matrix, *so that* scope isn't merely hidden in the UI.
  **AC:** the §8 permission matrix is enforced at the API; out-of-scope requests return not-authorised; covered by automated tests per role.
  *(PRD §8, FR-2)*

- **E1-4 — Demo role switcher (non-prod)** · P1 · S
  *As a* presenter, *I want* to switch demo roles quickly in non-production, *so that* I can walk through all views.
  **AC:** switcher present only in demo builds; disabled/absent in production where view = role.
  *(PRD FR-3, FR-34)*

---

## E2 — Stakeholder Directory & Records

**Outcome:** One authoritative, searchable directory; each stakeholder a complete, tiered record.
**Success signal:** "How's our relationship with X?" has a single, current answer anyone in scope can find in seconds.

- **E2-1 — Directory list with role scope** · P0 · M
  *As a* user, *I want* to see the stakeholders in my scope with name, tier, category, owner, last contact, risk, and sentiment, *so that* I have the current picture.
  **AC:** rows show all listed fields; scope respects role (Leadership=all, Head=function, field browses); flagged rows show the flag indicator.
  *(PRD FR-7, FR-10, FR-11)*

- **E2-2 — Search** · P0 · S
  *As a* user, *I want* to search across names, notes, and owners, *so that* I can find a stakeholder fast.
  **AC:** partial matches across all three fields; results respect scope.
  *(PRD FR-7)*

- **E2-3 — Filter by category & tier** · P0 · S
  *As a* user, *I want* to filter by category and tier, *so that* I can narrow to what I care about.
  **AC:** Category (Regulator/Government/Community/Commercial) and Tier (1/2) filters combine; "All" resets.
  *(PRD FR-8)*

- **E2-4 — Sort (risk-first)** · P0 · XS
  *As a* user, *I want* to sort by risk high→low (and other keys), *so that* the most concerning surface first.
  **AC:** default sort risk high→low; secondary sorts available.
  *(PRD FR-9)*

- **E2-5 — Stakeholder profile** · P0 · M
  *As a* user, *I want* a full stakeholder profile with attributes, engagement history, commitments, and escalation state, *so that* I have context before acting.
  **AC:** profile shows all §6.1 attributes plus chronological engagements, open commitments, and current escalation/flag status.
  *(PRD §6.1)*

- **E2-6 — Tiering rubric & assignment** · P1 · M
  *As a* Head, *I want* tier proposed by the owner and confirmed by me under a defined rubric, *so that* importance is consistent, not arbitrary.
  **AC:** tier proposed at creation; Head can confirm/change; rubric (impact, power, escalation potential, cadence) surfaced as guidance; tier changes logged.
  *(PRD §6.3)*

---

## E3 — Engagement Logging

**Outcome:** Logging an engagement is fast enough that people actually do it; each log refreshes the record and feeds activity.
**Success signal:** Median time-to-log under ~60 seconds; last-contact dates stay current.

- **E3-1 — Log an engagement (hero flow)** · P0 · L
  *As a* field user, *I want* to log an engagement (stakeholder, type, date, notes) in under ~60 seconds, *so that* capture never gets skipped.
  **AC:** reachable in one tap from home; ≤ the minimum required fields; saves and confirms quickly; updates stakeholder last-contact; appears in activity feeds.
  *(PRD FR-4, FR-5)*

- **E3-2 — Engagement type from taxonomy** · P0 · XS
  *As a* user, *I want* engagement type options driven by taxonomy, *so that* logging stays consistent and reportable.
  **AC:** type list sourced from taxonomy (Virtual/Physical Meeting, Call, Email, Site Visit, Event); adding a taxonomy option appears here without a deploy.
  *(PRD FR-5, §6.1)*

- **E3-3 — Update risk/sentiment during logging** · P1 · S
  *As a* user, *I want* to optionally update risk/sentiment while logging, *so that* the record reflects what I just learned.
  **AC:** optional risk/sentiment change inline; change logged; may trigger escalation rules (E5/E6).
  *(PRD §6.1, FR-35)*

- **E3-4 — Recent activity feed (all tiers)** · P0 · M
  *As a* Head/Leadership user, *I want* a reverse-chronological feed of recent engagements across all tiers in my scope, *so that* nothing is hidden by tier.
  **AC:** feed shows stakeholder, date, sentiment indicator, note excerpt; includes Tier 1 and Tier 2; scoped by role.
  *(PRD §6.2, FR-19, FR-24)*

---

## E4 — My Work (Field)

**Outcome:** A field user's personal, low-noise home: their stakeholders, their commitments, their capture button.
**Success signal:** A field user can do their whole job from one screen without wading through portfolio noise.

- **E4-1 — Field home** · P0 · M
  *As a* field user, *I want* a home with the log CTA, my-stakeholder count, request CTA, and my open commitments, *so that* my day's work is one glance away.
  **AC:** greeting + date; prominent "Log an engagement"; "N stakeholders"; "Request a stakeholder"; open commitments list with due date + priority.
  *(PRD §7.3 Field home, FR-4, FR-14)*

- **E4-2 — My Stakeholders view** · P0 · S
  *As a* user, *I want* a list of only stakeholders I own, with the same filter/sort/detail as the directory, *so that* I focus on mine.
  **AC:** lists owned records only; full row detail incl. risk/sentiment; filters/sort as directory.
  *(PRD FR-13, FR-10)*

- **E4-3 — Request a new stakeholder** · P0 · S
  *As a* field user, *I want* to propose a new stakeholder with a reason, *so that* it can be approved into the master directory.
  **AC:** submit name, category, reason; enters Admin approval queue; requester notified on decision.
  *(PRD FR-12, FR-31)*

---

## E5 — Risk, Sentiment & Flagging

**Outcome:** Human-set risk and sentiment on every stakeholder, plus a one-tap flag — the signals that drive rollups and escalations.
**Success signal:** Risk/sentiment are current and consistently drive colour, sort, and escalation eligibility.

- **E5-1 — Set risk & sentiment** · P0 · S
  *As* an owner/Head, *I want* to set a stakeholder's risk (High/Medium/Low) and sentiment (Supportive/Neutral/Resistant), *so that* health is explicit and machine-usable.
  **AC:** values editable in scope; changes logged; drive colour coding and sort; visible to field users on their own stakeholders.
  *(PRD FR-10, FR-35, §6.1)*

- **E5-2 — Flag from the directory row** · P0 · S
  *As* an owner/Head, *I want* to flag a stakeholder directly from its directory row (as well as from the profile), *so that* raising concern is frictionless.
  **AC:** flag control on the row within scope; flagging opens an escalation (E6); flag reflected on row and profile.
  *(PRD FR-12a)*

- **E5-3 — Multiple flag entry points** · P1 · XS
  *As* a user, *I want* to flag from the profile and escalation screen too, *so that* I can act wherever I am.
  **AC:** flag available on profile and escalation views; consistent behaviour with row flagging.
  *(PRD FR-12a)*

---

## E6 — Escalation Management

**Outcome:** Anything high-risk or flagged becomes an ordered, workable queue with a clear lifecycle — intervention before crisis.
**Success signal:** No high-risk stakeholder is off the board; critical items move through the pipeline within SLA.

- **E6-1 — Auto-open on trigger** · P0 · M
  *As* the system, *I want* to auto-open an escalation when a stakeholder becomes High risk or is flagged, *so that* risk is never missed.
  **AC:** crossing into High risk or a manual flag opens an active escalation; dropping below High + clearing flag removes it; resolving closes it.
  *(PRD §6.4)*

- **E6-2 — Severity derivation** · P0 · S
  *As* a user, *I want* severity derived consistently, *so that* urgency ordering is trustworthy.
  **AC:** High+Resistant = Critical; High+Neutral/Supportive = Elevated; manual critical flag = Critical; matches prototype data.
  *(PRD §6.4)*

- **E6-3 — Escalation board** · P0 · M
  *As* a Head/Leadership user, *I want* a board of all flagged/high-risk items ordered most-urgent-first, with counters (Critical / Elevated / Total active) and filters (All/Critical/High risk), *so that* I work the queue top-down.
  **AC:** ordered Critical→Elevated→age; counters accurate; filters work; scope respects role.
  *(PRD FR-25, FR-26, FR-27, FR-30)*

- **E6-4 — Escalation card detail** · P1 · S
  *As* a user, *I want* each escalation to show stakeholder, tier, function, owner, age, summary, risk/sentiment tags, and next-action date, *so that* I can triage without opening the profile.
  **AC:** all listed fields render; "View profile" deep-links.
  *(PRD FR-28)*

- **E6-5 — Lifecycle workflow** · P1 · M
  *As* a Head/Leadership user, *I want* to move an escalation Open→Acknowledged→Assigned→Intervened and Resolve it, *so that* intervention is tracked.
  **AC:** pipeline visible; Acknowledge/Assign/Resolve transitions enforced and logged; Assign sets an owner.
  *(PRD FR-29)*

---

## E7 — Commitments & Reminders

**Outcome:** Follow-through is tracked and nudged so promises to stakeholders aren't dropped.
**Success signal:** Overdue commitments trend down; Tier 1 overdue items reliably reach Heads.

- **E7-1 — Create & manage commitments** · P1 · M
  *As* an owner, *I want* to create a commitment (stakeholder, description, due date, priority), *so that* follow-ups are tracked against the relationship.
  **AC:** CRUD on commitments; priority High/Low; shown on profile, My Work, and dashboards.
  *(PRD §6.1, FR-14)*

- **E7-2 — Reminder cadence** · P1 · M
  *As* an owner, *I want* reminders at T-3 days, on the due date (T-0), then daily while overdue, *so that* nothing slips.
  **AC:** notifications fire on that exact cadence; stop on completion; delivered to the owner.
  *(PRD FR-14a)*

- **E7-3 — Tier 1 overdue surfacing to Head** · P1 · S
  *As* a Head, *I want* overdue commitments on Tier 1 stakeholders surfaced to me, *so that* critical follow-through has oversight.
  **AC:** Tier 1 overdue items notify the relevant Head and appear on the Head dashboard.
  *(PRD FR-14a)*

- **E7-4 — Due-this-week counters & feeds** · P1 · S
  *As* a user, *I want* due/overdue commitments reflected in "due this week" counters and upcoming-commitment feeds, *so that* they're visible in-app, not only via notification.
  **AC:** counters and feeds compute from commitment due dates and update on change.
  *(PRD FR-14b, FR-15, FR-24)*

---

## E8 — Function Head Dashboard

**Outcome:** A Head sees their function's health, team, escalations, and activity in one scoped view.
**Success signal:** A Head can run their weekly review entirely from this screen.

- **E8-1 — Function KPI cards** · P0 · S
  *As* a Head, *I want* High risk / Open escalations / Due this week / % Supportive for my function, *so that* I know the state at a glance.
  **AC:** four cards compute from function-scoped data; update on underlying change.
  *(PRD FR-15)*

- **E8-2 — Function sentiment trend** · P1 · M
  *As* a Head, *I want* my function's sentiment trend over recent months with direction and current mix, *so that* I see health moving, not just today's snapshot.
  **AC:** trend across months; direction indicator (Declining/Improving); mix % Supportive/Neutral/Resistant.
  *(PRD FR-16)*

- **E8-3 — Team roster** · P1 · M
  *As* a Head, *I want* my reporting team with each member's stakeholder and open-escalation counts, *so that* I see where load and risk sit.
  **AC:** roster from functional reporting model (E10-4/§6.5); per-member counts accurate.
  *(PRD FR-17, §6.5)*

- **E8-4 — Function escalation board & activity** · P0 · S
  *As* a Head, *I want* my function's escalation board plus upcoming commitments and all-tier recent activity, *so that* I act on what's urgent.
  **AC:** reuses E6-3 scoped to function; commitments + all-tier activity feed present.
  *(PRD FR-18, FR-19)*

- **E8-5 — Activity notification indicator** · P1 · XS
  *As* a Head, *I want* an activity badge, *so that* I notice new items needing attention.
  **AC:** badge reflects unseen relevant activity; clears on view.
  *(PRD FR-20)*

---

## E9 — Leadership Portfolio View

**Outcome:** Cross-function risk and sentiment oversight for the whole portfolio.
**Success signal:** Leadership can answer "where is our biggest relationship risk right now?" in one screen.

- **E9-1 — Portfolio KPI cards** · P1 · S
  *As* Leadership, *I want* portfolio-wide High risk / Open escalations / Due this week / % Supportive, *so that* I see the whole picture.
  **AC:** cards aggregate across all functions; update on change.
  *(PRD FR-21)*

- **E9-2 — Org-wide sentiment trend** · P1 · S
  *As* Leadership, *I want* organisation-wide sentiment trend and mix, *so that* I track overall relationship health.
  **AC:** trend + direction + mix across the full portfolio.
  *(PRD FR-22)*

- **E9-3 — Activity by function (click-to-filter)** · P1 · M
  *As* Leadership, *I want* a per-function table of stakeholders / high-risk / escalations, where clicking a function filters the directory, *so that* I can drill from summary to detail.
  **AC:** counts per function correct; row click navigates to filtered directory.
  *(PRD FR-23)*

- **E9-4 — Cross-function escalation board & feeds** · P1 · S
  *As* Leadership, *I want* the escalation board and commitment/activity feeds across all functions, *so that* nothing falls between functions.
  **AC:** E6-3 unscoped (all functions); all-tier activity + full commitments feed.
  *(PRD FR-24)*

---

## E10 — Governance & Admin

**Outcome:** Admins keep the directory clean and the system configured without engineering.
**Success signal:** A departure, a new taxonomy value, or a new stakeholder is handled entirely in-app.

- **E10-1 — Stakeholder request queue (approve/reject)** · P2 · M
  *As* an Admin, *I want* to review new-stakeholder requests with requester and reason and approve/reject, *so that* the master directory stays clean.
  **AC:** queue shows requester, category, reason; approve creates the record; reject notifies requester; both logged.
  *(PRD FR-31)*

- **E10-2 — Taxonomy editor (Admin-only)** · P2 · M
  *As* an Admin, *I want* to add/remove Category, Function, and Engagement Type options, *so that* the system evolves without a deploy.
  **AC:** edits apply live to dependent dropdowns; removal handles in-use values safely; Admin-only.
  *(PRD FR-32)*

- **E10-3 — Ownership reassignment (scoped, logged)** · P2 · L
  *As* a Head/Leadership/Admin, *I want* to bulk-reassign stakeholders from a departing owner to a replacement with a preview count, *so that* nothing is orphaned when someone leaves.
  **AC:** preview shows count moving; Head limited to own function, Leadership cross-function, Admin global; no secondary sign-off required; atomic + logged.
  *(PRD FR-33, §8)*

- **E10-4 — Reporting-line sync & functional override** · P1 · M
  *As* the system/Admin, *I want* reporting lines sourced from HRIS/identity with an Admin functional-team override, *so that* Head team views are correct even when functional ≠ HR lines.
  **AC:** HRIS supplies manager/department; Admin can set a functional manager that overrides for team views; changes logged.
  *(PRD §6.5)*

---

## E11 — Mobile / Phone Experience

**Outcome:** Capture-first mobile use so field staff log in the moment.
**Success signal:** Engagements are logged from phones in the field, not typed up later at a desk.

- **E11-1 — Responsive phone layout** · P1 · M
  *As* a field user, *I want* a phone-optimised, capture-first layout, *so that* I can log on the go.
  **AC:** field home + log flow usable on a phone viewport; primary action reachable one-handed.
  *(PRD FR-6, §5 Phone view)*

- **E11-2 — Offline-tolerant capture** · P2 · L
  *As* a field user, *I want* to log with poor/no connectivity and have it sync later, *so that* fieldwork isn't blocked by signal.
  **AC:** engagement captured offline persists locally and syncs on reconnect without loss or duplication.
  *(PRD §9 mobile)*

---

## Cross-cutting (non-functional) stories

- **NFR-1 — Colour-independent status** · P0 · XS — risk/sentiment conveyed by text label, not colour alone. *(PRD §9 accessibility)*
- **NFR-2 — Scope enforcement test suite** · P0 · M — automated per-role authorisation tests. *(PRD §8, §9)*
- **NFR-3 — Capture performance budget** · P1 · S — log-engagement round-trip meets a defined latency target. *(PRD §9)*
- **NFR-4 — Reassignment atomicity** · P1 · S — bulk reassignment is transactional and reversible via log. *(PRD §9)*

---

## Definition of Ready

A story is ready when: it has a clear user/outcome, testable acceptance criteria, a size, a priority, identified dependencies, and any design/taxonomy inputs attached. No "TBD" in the acceptance criteria.

## Definition of Done

A story is done when: acceptance criteria pass; scope enforced and covered by tests where applicable; state changes audited; works on target viewports; accessible (text labels, keyboard); deployed to the review environment; PM-accepted against the PRD requirement it cites.

---

## Release plan

**Phase 0 — Walking skeleton (internal).**
E0-1, E0-2, E0-4, plus a single stakeholder list and E3-1 wired end-to-end. Proves the core loop technically. Not user-facing.

**Phase 1 — MVP (demoable, delivers the core value hypothesis).**
E0 (all), E1-1/2/3, E2-1..5, E3-1/2/4, E4-1/2/3, E5-1/2, E6-1/2/3, E8-1/4, NFR-1/2.
*Cut line rationale:* this is the thinnest slice that shows **frictionless field capture rolling up into risk visibility** — the whole reason SIS exists. It includes real auth/scoping, the directory as source of truth, the hero logging flow, human-set risk/sentiment with flagging, auto-opening escalations on an ordered board, and a Head view that sees them. It deliberately excludes reminders, full lifecycle, portfolio analytics, and admin self-service — valuable, but not needed to prove the loop.

**Phase 2 — Release 1 (daily-use product).**
E2-6, E3-3, E5-3, E6-4/5, E7 (all), E8-2/3/5, E9 (all), E10-4, E11-1, NFR-3/4.
Completes escalation workflow, commitments & reminders, full Head + Leadership dashboards, and reporting-line sync.

**Phase 3 — Release 2 (self-service & scale).**
E10-1/2/3, E11-2, plus roadmap items from PRD §11 (stale-relationship alerts, board-pack exports, configurable SLAs).

---

## Dependency map (key edges)

- Everything depends on **E0-1** (data model) and **E1-3** (scope enforcement).
- **E6** (escalations) depends on **E5** (risk/sentiment + flag) — no signal, no queue.
- **E8/E9** dashboards depend on **E2, E3-4, E5, E6** feeding them data.
- **E7** reminders depend on **E7-1** commitments and the notification mechanism.
- **E8-3** team roster depends on **E10-4** reporting-line model.
- **E10-1** approvals close the loop opened by **E4-3** requests.
