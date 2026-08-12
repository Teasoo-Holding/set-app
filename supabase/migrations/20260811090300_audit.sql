-- ─────────────────────────────────────────────────────────────
-- E0-3 · Audit log — append-only, trigger-written.
-- Captures actor (auth.uid()), action, entity, timestamp, and a
-- diff so the system of record is trustworthy and reviewable
-- (PRD §9 auditability). Writing is done only by triggers running
-- as definer; no client may insert/update/delete audit rows.
-- ─────────────────────────────────────────────────────────────

create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,                       -- auth.uid(); null for system/cron
  action      text not null,              -- INSERT | UPDATE | DELETE
  entity_type text not null,              -- table name
  entity_id   uuid,
  changed_at  timestamptz not null default now(),
  old_data    jsonb,
  new_data    jsonb
);
comment on table public.audit_log is 'Immutable audit trail (E0-3). Trigger-written only.';

create index audit_log_entity_idx on public.audit_log (entity_type, entity_id, changed_at desc);
create index audit_log_actor_idx  on public.audit_log (actor_id, changed_at desc);

-- Generic audit trigger. SECURITY DEFINER so it can always write the
-- log regardless of the acting user's table privileges/RLS.
create or replace function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity_id uuid;
begin
  -- old/new are record types; convert to jsonb before using ->>.
  v_entity_id := (to_jsonb(case when tg_op = 'DELETE' then old else new end) ->> 'id')::uuid;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, old_data, new_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    v_entity_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE', 'INSERT') then to_jsonb(new) else null end
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- Attach to every audited table (engagements, flags, escalation
-- transitions, reassignments, approvals all flow through these).
create trigger audit_stakeholders
  after insert or update or delete on public.stakeholders
  for each row execute function public.audit_row();
create trigger audit_engagements
  after insert or update or delete on public.engagements
  for each row execute function public.audit_row();
create trigger audit_commitments
  after insert or update or delete on public.commitments
  for each row execute function public.audit_row();
create trigger audit_escalations
  after insert or update or delete on public.escalations
  for each row execute function public.audit_row();
create trigger audit_stakeholder_requests
  after insert or update or delete on public.stakeholder_requests
  for each row execute function public.audit_row();
create trigger audit_taxonomy
  after insert or update or delete on public.taxonomy
  for each row execute function public.audit_row();
create trigger audit_profiles
  after insert or update or delete on public.profiles
  for each row execute function public.audit_row();
