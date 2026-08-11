-- ─────────────────────────────────────────────────────────────
-- E6-1 / E6-2 · Escalation auto-open + severity (DB trigger).
-- Placed at the data layer (Technical Architecture §4) so the rule
-- fires no matter which client caused the change — it cannot be
-- bypassed by a code path that forgot to call it.
--
-- Rules:
--   • Becoming High risk OR being flagged → an active escalation exists.
--   • Severity: High + Resistant → Critical; otherwise → Elevated.
--   • Dropping below High AND clearing the flag → resolve the auto item.
-- ─────────────────────────────────────────────────────────────

create or replace function public.sync_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_should_be_open boolean;
  v_severity public.escalation_severity;
  v_source   public.escalation_source;
begin
  v_should_be_open := (new.risk = 'high') or new.flagged;

  if v_should_be_open then
    v_severity := case
      when new.risk = 'high' and new.sentiment = 'resistant' then 'critical'
      else 'elevated'
    end;
    v_source := case when new.risk = 'high' then 'auto_risk' else 'manual_flag' end;

    -- Open one if none active; otherwise keep severity current.
    if exists (
      select 1 from public.escalations
      where stakeholder_id = new.id and status <> 'resolved'
    ) then
      update public.escalations
        set severity = v_severity
        where stakeholder_id = new.id and status <> 'resolved';
    else
      insert into public.escalations (stakeholder_id, severity, source, summary, next_action_date)
      values (
        new.id,
        v_severity,
        v_source,
        coalesce(new.flag_reason, 'Auto-opened: ' || new.risk::text || ' risk / ' || new.sentiment::text),
        current_date + 3
      );
    end if;
  else
    -- No longer high and not flagged → resolve the auto-opened item.
    update public.escalations
      set status = 'resolved', resolved_at = now()
      where stakeholder_id = new.id and status <> 'resolved';
  end if;

  return new;
end;
$$;

create trigger stakeholders_sync_escalation
  after insert or update of risk, sentiment, flagged on public.stakeholders
  for each row execute function public.sync_escalation();
