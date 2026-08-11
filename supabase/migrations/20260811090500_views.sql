-- ─────────────────────────────────────────────────────────────
-- Derived data as views (Technical Architecture §4) — computed from
-- the underlying records so counters/mixes can't drift. Views run
-- with the querying user's privileges, so RLS on the base tables
-- still scopes every read (security_invoker).
-- ─────────────────────────────────────────────────────────────

-- Recent activity feed across all tiers (E3-4).
create view public.recent_activity
with (security_invoker = true) as
select
  e.id,
  e.stakeholder_id,
  s.name        as stakeholder_name,
  s.function    as function,
  s.tier        as tier,
  s.sentiment   as sentiment,
  e.type        as engagement_type,
  e.occurred_on,
  left(coalesce(e.notes, ''), 160) as note_excerpt,
  e.logged_by,
  e.created_at
from public.engagements e
join public.stakeholders s on s.id = e.stakeholder_id
order by e.occurred_on desc, e.created_at desc;

-- Per-function rollup for Head/Leadership KPI cards (E8-1, E9-1, E9-3).
create view public.function_summary
with (security_invoker = true) as
select
  s.function,
  count(*)                                              as stakeholders,
  count(*) filter (where s.risk = 'high')               as high_risk,
  count(*) filter (where s.sentiment = 'supportive')    as supportive,
  count(*) filter (where s.sentiment = 'neutral')       as neutral,
  count(*) filter (where s.sentiment = 'resistant')     as resistant,
  count(esc.id) filter (where esc.status <> 'resolved') as open_escalations
from public.stakeholders s
left join public.escalations esc
  on esc.stakeholder_id = s.id and esc.status <> 'resolved'
group by s.function;

-- Escalation board rows with the fields the card needs (E6-3/E6-4).
create view public.escalation_board
with (security_invoker = true) as
select
  esc.id,
  esc.stakeholder_id,
  s.name       as stakeholder_name,
  s.tier,
  s.function,
  s.owner_id,
  s.risk,
  s.sentiment,
  esc.status,
  esc.severity,
  esc.source,
  esc.summary,
  esc.opened_at,
  esc.next_action_date,
  esc.assigned_to,
  (current_date - esc.opened_at::date) as age_days
from public.escalations esc
join public.stakeholders s on s.id = esc.stakeholder_id
where esc.status <> 'resolved'
order by
  case esc.severity when 'critical' then 0 else 1 end,
  esc.opened_at asc;
