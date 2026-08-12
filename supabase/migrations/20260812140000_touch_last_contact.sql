-- ─────────────────────────────────────────────────────────────
-- E3-1 · Keep stakeholders.last_contact_at fresh automatically when an
-- engagement is logged. SECURITY DEFINER so a field user who can log an
-- engagement (but may not directly UPDATE the stakeholder) still refreshes
-- last-contact. The rule fires no matter which client logged the engagement.
-- ─────────────────────────────────────────────────────────────
create or replace function public.touch_last_contact()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stakeholders
    set last_contact_at = greatest(coalesce(last_contact_at, new.occurred_on), new.occurred_on)
    where id = new.stakeholder_id;
  return new;
end;
$$;

create trigger engagements_touch_last_contact
  after insert on public.engagements
  for each row execute function public.touch_last_contact();
