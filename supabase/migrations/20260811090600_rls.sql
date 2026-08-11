-- ─────────────────────────────────────────────────────────────
-- E0-5 / E1-3 · Row Level Security = the §8 permission matrix.
--
-- RLS is the AUTHORITATIVE access-control layer (Technical
-- Architecture §3.2). UI scoping is convenience, not security.
-- Rule of thumb: "no policy" == "table closed". Every table below
-- has RLS enabled and explicit policies.
--
-- Scope model (baseline — CONFIRM against PRD §8 before Phase 1 lock):
--   • admin       → full access.
--   • leadership  → read all; write via ownership/assignment paths.
--   • head        → their function only.
--   • field       → their function for reads (directory browse) and
--                   their OWNED records for writes; proposes new
--                   stakeholders via requests (never direct insert).
--
-- The function-scoping deny-by-default satisfies the E1 success
-- signal: a field/head user cannot retrieve another function's data
-- by URL or API — the database refuses.
-- ─────────────────────────────────────────────────────────────

-- ── Helper functions (SECURITY DEFINER to read profiles without
--    triggering profiles' own RLS → avoids recursion) ──────────
create or replace function public.current_role_name()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_function()
returns text
language sql stable security definer set search_path = public as $$
  select function from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() = 'admin', false);
$$;

create or replace function public.is_leadership_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('leadership', 'admin'), false);
$$;

-- Can the current user SEE this stakeholder's function?
create or replace function public.can_read_function(target_function text)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when public.current_role_name() in ('leadership', 'admin') then true
    when public.current_role_name() in ('head', 'field')
      then target_function = public.current_function()
    else false
  end;
$$;

-- ── Enable RLS everywhere ────────────────────────────────────
alter table public.profiles             enable row level security;
alter table public.taxonomy             enable row level security;
alter table public.stakeholders         enable row level security;
alter table public.engagements          enable row level security;
alter table public.commitments          enable row level security;
alter table public.escalations          enable row level security;
alter table public.stakeholder_requests enable row level security;
alter table public.audit_log            enable row level security;

-- ── profiles ─────────────────────────────────────────────────
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or public.is_leadership_or_admin()
    or (public.current_role_name() = 'head' and function = public.current_function())
  );
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ── taxonomy: everyone authenticated reads; only Admin writes ─
create policy taxonomy_select on public.taxonomy
  for select using (auth.uid() is not null);
create policy taxonomy_admin_write on public.taxonomy
  for all using (public.is_admin()) with check (public.is_admin());

-- ── stakeholders ─────────────────────────────────────────────
create policy stakeholders_select on public.stakeholders
  for select using (public.can_read_function(function));
-- Writes: owner, Head of the function, or Leadership/Admin. Field
-- users create via requests (E4-3), never direct insert.
create policy stakeholders_insert on public.stakeholders
  for insert with check (
    public.is_leadership_or_admin()
    or (public.current_role_name() = 'head' and function = public.current_function())
  );
create policy stakeholders_update on public.stakeholders
  for update using (
    owner_id = auth.uid()
    or public.is_leadership_or_admin()
    or (public.current_role_name() = 'head' and function = public.current_function())
  ) with check (
    owner_id = auth.uid()
    or public.is_leadership_or_admin()
    or (public.current_role_name() = 'head' and function = public.current_function())
  );
create policy stakeholders_delete on public.stakeholders
  for delete using (public.is_admin());

-- ── engagements: read within stakeholder scope; anyone in scope
--    may log (field capture) ────────────────────────────────────
create policy engagements_select on public.engagements
  for select using (
    exists (
      select 1 from public.stakeholders s
      where s.id = engagements.stakeholder_id
        and public.can_read_function(s.function)
    )
  );
create policy engagements_insert on public.engagements
  for insert with check (
    logged_by = auth.uid()
    and exists (
      select 1 from public.stakeholders s
      where s.id = engagements.stakeholder_id
        and public.can_read_function(s.function)
    )
  );

-- ── commitments: same scope as the stakeholder ───────────────
create policy commitments_select on public.commitments
  for select using (
    exists (
      select 1 from public.stakeholders s
      where s.id = commitments.stakeholder_id
        and public.can_read_function(s.function)
    )
  );
create policy commitments_write on public.commitments
  for all using (
    owner_id = auth.uid()
    or public.is_leadership_or_admin()
    or exists (
      select 1 from public.stakeholders s
      where s.id = commitments.stakeholder_id
        and public.current_role_name() = 'head'
        and s.function = public.current_function()
    )
  ) with check (
    owner_id = auth.uid()
    or public.is_leadership_or_admin()
    or exists (
      select 1 from public.stakeholders s
      where s.id = commitments.stakeholder_id
        and public.current_role_name() = 'head'
        and s.function = public.current_function()
    )
  );

-- ── escalations: read within scope; Head/Leadership/Admin work
--    the lifecycle. Auto-open/severity is done by a definer trigger,
--    so no INSERT policy is needed for the automatic path. ───────
create policy escalations_select on public.escalations
  for select using (
    exists (
      select 1 from public.stakeholders s
      where s.id = escalations.stakeholder_id
        and public.can_read_function(s.function)
    )
  );
create policy escalations_update on public.escalations
  for update using (
    public.is_leadership_or_admin()
    or exists (
      select 1 from public.stakeholders s
      where s.id = escalations.stakeholder_id
        and public.current_role_name() = 'head'
        and s.function = public.current_function()
    )
  ) with check (
    public.is_leadership_or_admin()
    or exists (
      select 1 from public.stakeholders s
      where s.id = escalations.stakeholder_id
        and public.current_role_name() = 'head'
        and s.function = public.current_function()
    )
  );

-- ── stakeholder_requests: requester sees own; Admin sees/acts all ─
create policy requests_select on public.stakeholder_requests
  for select using (requested_by = auth.uid() or public.is_admin());
create policy requests_insert on public.stakeholder_requests
  for insert with check (requested_by = auth.uid());
create policy requests_admin_update on public.stakeholder_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ── audit_log: Leadership/Admin may read; NO client writes ───
create policy audit_select on public.audit_log
  for select using (public.is_leadership_or_admin());
-- (No insert/update/delete policies ⇒ closed to clients. The
--  audit_row() trigger writes as SECURITY DEFINER, bypassing RLS.)
