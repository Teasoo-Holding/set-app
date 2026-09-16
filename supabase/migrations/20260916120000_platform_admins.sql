-- Platform team — add & manage platform admins (self-service).
--
-- A platform admin can invite another platform admin by email and can
-- deactivate/reactivate them. Exactly one profile is the protected "super"
-- platform admin (is_platform_owner): it can never be deactivated, demoted or
-- removed through the app. "Deactivate" is reversible — it bans the auth user
-- (blocking sign-in and token refresh) and stamps deactivated_at.
--
-- Changes:
--   • profiles: is_platform_owner flag (at most one, system-wide) + deactivated_at
--   • invitations: allow platform-scoped invites (tenant_id null, role
--     platform_admin), which the old `role <> 'platform_admin'` check forbade
--   • platform_admins() / platform_admin_invites(): platform-admin-gated,
--     SECURITY DEFINER reads for the console (no tenant business data)

-- ── profiles: ownership + deactivation ───────────────────────
alter table public.profiles
  add column if not exists is_platform_owner boolean not null default false,
  add column if not exists deactivated_at timestamptz;

comment on column public.profiles.is_platform_owner is
  'The one protected super platform admin: never deactivated, demoted or removed via the app.';
comment on column public.profiles.deactivated_at is
  'When set, this account is deactivated (sign-in blocked). Reversible.';

-- At most one super platform admin across the whole system.
create unique index if not exists profiles_one_platform_owner
  on public.profiles (is_platform_owner) where is_platform_owner;

-- Designate the bootstrap operator as the super admin on existing databases.
-- (On a fresh reset the seed sets this; migrations run before the seed, so this
-- UPDATE matches nothing then and the seed handles it.)
update public.profiles
   set is_platform_owner = true
 where role = 'platform_admin'
   and email = 'efeosasere.okoro@teasooconsulting.com'
   and not exists (select 1 from public.profiles where is_platform_owner);

-- ── invitations: allow platform-scoped invites ───────────────
alter table public.invitations alter column tenant_id drop not null;

-- Replace the blanket "no platform_admin invites" check with a scope rule:
-- a platform-admin invite carries NO tenant; every other role must have one.
do $$
declare c text;
begin
  select conname into c from pg_constraint
   where conrelid = 'public.invitations'::regclass and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%platform_admin%';
  if c is not null then execute format('alter table public.invitations drop constraint %I', c); end if;
end $$;

alter table public.invitations
  add constraint invitations_scope_ck check (
    (role = 'platform_admin' and tenant_id is null)
    or (role <> 'platform_admin' and tenant_id is not null)
  );

-- One live platform invite per email. (The tenant index is partial on tenant_id,
-- and unique indexes treat nulls as distinct, so platform invites need their own.)
create unique index if not exists invitations_one_pending_platform
  on public.invitations (email)
  where (status = 'pending' and tenant_id is null);

-- ── Console reads (platform-admin-gated, SECURITY DEFINER) ────
-- Return only facts about platform admins / their invites — never any tenant
-- business data. The is_platform_admin() predicate means a non-platform caller
-- gets zero rows, so isolation holds exactly as with platform_tenant_stats().
create or replace function public.platform_admins()
returns table (
  id uuid,
  full_name text,
  email text,
  is_platform_owner boolean,
  deactivated_at timestamptz,
  created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.email::text, p.is_platform_owner, p.deactivated_at, p.created_at
  from public.profiles p
  where p.role = 'platform_admin'
    and public.is_platform_admin()
  order by p.is_platform_owner desc, p.created_at;
$$;

create or replace function public.platform_admin_invites()
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  expires_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select i.id, i.email::text, i.created_at, i.expires_at
  from public.invitations i
  where i.role = 'platform_admin'
    and i.status = 'pending'
    and public.is_platform_admin()
  order by i.created_at desc;
$$;

grant execute on function public.platform_admins() to authenticated;
grant execute on function public.platform_admin_invites() to authenticated;
