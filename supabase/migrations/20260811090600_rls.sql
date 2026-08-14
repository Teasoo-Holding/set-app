-- ─────────────────────────────────────────────────────────────
-- E0-5 + E12-2 · Row Level Security — the enforcement layer (§8),
-- now TENANT-ISOLATED.
--
-- Two guarantees stack on every business table:
--   1. Tenant isolation: tenant_id = current_tenant() is AND-ed into every
--      policy. A user can only ever touch rows in their own tenant, by any
--      path. current_tenant() is null for platform admins, so `= null` is
--      never true and they read ZERO business rows.
--   2. Role/function scope (§8) within the tenant, exactly as before.
--
-- Helper functions are SECURITY DEFINER so they can read profiles without
-- tripping profiles' own RLS (avoids recursion). They key off auth.uid()
-- and the profiles row — never JWT/user_metadata — so they can't be spoofed.
-- ─────────────────────────────────────────────────────────────

-- ── Helper functions ─────────────────────────────────────────
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

-- The caller's tenant. NULL for platform admins (and for anyone with no
-- profile), which makes `tenant_id = current_tenant()` false → no rows.
create or replace function public.current_tenant()
returns uuid
language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() = 'admin', false);
$$;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() = 'platform_admin', false);
$$;

create or replace function public.is_leadership_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('leadership', 'admin'), false);
$$;

-- Can the current user SEE this stakeholder's function? (tenant scope is
-- applied separately by each policy.)
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
alter table public.tenants              enable row level security;
alter table public.invitations          enable row level security;
alter table public.profiles             enable row level security;
alter table public.taxonomy             enable row level security;
alter table public.stakeholders         enable row level security;
alter table public.engagements          enable row level security;
alter table public.commitments          enable row level security;
alter table public.escalations          enable row level security;
alter table public.stakeholder_requests enable row level security;
alter table public.audit_log            enable row level security;

-- ── tenants: platform admin manages; a member reads their own ─
create policy tenants_select on public.tenants
  for select using (public.is_platform_admin() or id = public.current_tenant());
create policy tenants_platform_write on public.tenants
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ── invitations: platform admin (provisioning) or the tenant's
--    own Admin. The accept-by-token path runs via the service role,
--    which bypasses RLS, so no anonymous policy is needed. ───────
create policy invitations_manage on public.invitations
  for all using (
    public.is_platform_admin()
    or (public.is_admin() and tenant_id = public.current_tenant())
  ) with check (
    public.is_platform_admin()
    or (public.is_admin() and tenant_id = public.current_tenant())
  );

-- ── profiles ─────────────────────────────────────────────────
-- (profiles_select is refined in the profiles_read_scope migration.)
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or public.is_platform_admin()
    or (tenant_id = public.current_tenant()
        and (public.is_leadership_or_admin() or public.can_read_function(function)))
  );
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_write on public.profiles
  for all using (
    public.is_platform_admin()
    or (public.is_admin() and tenant_id = public.current_tenant())
  ) with check (
    public.is_platform_admin()
    or (public.is_admin() and tenant_id = public.current_tenant())
  );

-- ── taxonomy: tenant members read; the tenant's Admin writes ──
create policy taxonomy_select on public.taxonomy
  for select using (tenant_id = public.current_tenant());
create policy taxonomy_admin_write on public.taxonomy
  for all using (public.is_admin() and tenant_id = public.current_tenant())
  with check (public.is_admin() and tenant_id = public.current_tenant());

-- ── stakeholders ─────────────────────────────────────────────
create policy stakeholders_select on public.stakeholders
  for select using (
    tenant_id = public.current_tenant() and public.can_read_function(function)
  );
create policy stakeholders_insert on public.stakeholders
  for insert with check (
    tenant_id = public.current_tenant()
    and (public.is_leadership_or_admin()
         or (public.current_role_name() = 'head' and function = public.current_function()))
  );
create policy stakeholders_update on public.stakeholders
  for update using (
    tenant_id = public.current_tenant()
    and (owner_id = auth.uid() or public.is_leadership_or_admin()
         or (public.current_role_name() = 'head' and function = public.current_function()))
  ) with check (
    tenant_id = public.current_tenant()
    and (owner_id = auth.uid() or public.is_leadership_or_admin()
         or (public.current_role_name() = 'head' and function = public.current_function()))
  );
create policy stakeholders_delete on public.stakeholders
  for delete using (tenant_id = public.current_tenant() and public.is_admin());

-- ── engagements: within tenant + stakeholder scope ───────────
create policy engagements_select on public.engagements
  for select using (
    tenant_id = public.current_tenant()
    and exists (
      select 1 from public.stakeholders s
      where s.id = engagements.stakeholder_id and public.can_read_function(s.function)
    )
  );
create policy engagements_insert on public.engagements
  for insert with check (
    tenant_id = public.current_tenant()
    and logged_by = auth.uid()
    and exists (
      select 1 from public.stakeholders s
      where s.id = engagements.stakeholder_id and public.can_read_function(s.function)
    )
  );

-- ── commitments: same scope as the stakeholder ───────────────
create policy commitments_select on public.commitments
  for select using (
    tenant_id = public.current_tenant()
    and exists (
      select 1 from public.stakeholders s
      where s.id = commitments.stakeholder_id and public.can_read_function(s.function)
    )
  );
create policy commitments_write on public.commitments
  for all using (
    tenant_id = public.current_tenant()
    and (owner_id = auth.uid() or public.is_leadership_or_admin()
         or exists (
           select 1 from public.stakeholders s
           where s.id = commitments.stakeholder_id
             and public.current_role_name() = 'head'
             and s.function = public.current_function()
         ))
  ) with check (
    tenant_id = public.current_tenant()
    and (owner_id = auth.uid() or public.is_leadership_or_admin()
         or exists (
           select 1 from public.stakeholders s
           where s.id = commitments.stakeholder_id
             and public.current_role_name() = 'head'
             and s.function = public.current_function()
         ))
  );

-- ── escalations: read within scope; Head/Leadership/Admin work
--    the lifecycle. Auto-open is a definer trigger (no INSERT policy). ─
create policy escalations_select on public.escalations
  for select using (
    tenant_id = public.current_tenant()
    and exists (
      select 1 from public.stakeholders s
      where s.id = escalations.stakeholder_id and public.can_read_function(s.function)
    )
  );
create policy escalations_update on public.escalations
  for update using (
    tenant_id = public.current_tenant()
    and (public.is_leadership_or_admin()
         or exists (
           select 1 from public.stakeholders s
           where s.id = escalations.stakeholder_id
             and public.current_role_name() = 'head'
             and s.function = public.current_function()
         ))
  ) with check (
    tenant_id = public.current_tenant()
    and (public.is_leadership_or_admin()
         or exists (
           select 1 from public.stakeholders s
           where s.id = escalations.stakeholder_id
             and public.current_role_name() = 'head'
             and s.function = public.current_function()
         ))
  );

-- ── stakeholder_requests: requester sees own; tenant Admin acts ─
create policy requests_select on public.stakeholder_requests
  for select using (
    tenant_id = public.current_tenant() and (requested_by = auth.uid() or public.is_admin())
  );
create policy requests_insert on public.stakeholder_requests
  for insert with check (
    tenant_id = public.current_tenant() and requested_by = auth.uid()
  );
create policy requests_admin_update on public.stakeholder_requests
  for update using (tenant_id = public.current_tenant() and public.is_admin())
  with check (tenant_id = public.current_tenant() and public.is_admin());

-- ── audit_log: Leadership/Admin read WITHIN their tenant; no client writes ─
create policy audit_select on public.audit_log
  for select using (
    tenant_id = public.current_tenant() and public.is_leadership_or_admin()
  );
-- (No insert/update/delete policies ⇒ closed to clients. audit_row() writes
--  as SECURITY DEFINER, bypassing RLS.)
