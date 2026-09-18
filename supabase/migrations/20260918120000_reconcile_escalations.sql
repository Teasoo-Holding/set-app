-- Reconcile escalations with current stakeholder state (#117).
--
-- The invariant (E6, sync_escalation trigger) is: a stakeholder that is High
-- risk OR flagged has an active escalation. The trigger keeps this true for
-- every change going forward, but rows that reached that state another way
-- (imported/seeded before the trigger existed, or an escalation resolved by
-- hand while the stakeholder stayed high/flagged) can leave the escalations
-- board out of sync with the directory — high-risk/flagged stakeholders that
-- show nothing under Escalations.
--
-- This one-off backfill opens the missing escalations. It is idempotent: the
-- NOT EXISTS guard (and the escalations_one_active_per_stakeholder unique index)
-- mean re-running it changes nothing. It only OPENS what should already exist;
-- it never resolves or closes anything.
insert into public.escalations (tenant_id, stakeholder_id, severity, source, summary, next_action_date)
select
  s.tenant_id,
  s.id,
  case when s.risk = 'high' and s.sentiment = 'resistant' then 'critical'::public.escalation_severity
       else 'elevated'::public.escalation_severity end,
  case when s.risk = 'high' then 'auto_risk'::public.escalation_source
       else 'manual_flag'::public.escalation_source end,
  coalesce(s.flag_reason, 'Reconciled: ' || s.risk::text || ' risk / ' || s.sentiment::text),
  current_date + 3
from public.stakeholders s
where (s.risk = 'high' or s.flagged)
  and not exists (
    select 1 from public.escalations e
    where e.stakeholder_id = s.id and e.status <> 'resolved'
  );
