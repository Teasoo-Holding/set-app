-- Platform-admin metrics (E12 / #104).
--
-- Per-tenant AGGREGATE COUNTS for the platform console. This is SECURITY DEFINER
-- so it can count across every tenant — platform admins have tenant_id NULL and
-- read ZERO business rows under RLS — but it returns COUNTS ONLY, never a single
-- stakeholder row or its content, and it refuses anyone who is not a platform
-- admin. Tenant isolation is preserved: an admin sees "Acme: 240 stakeholders",
-- never a name.

create or replace function public.platform_tenant_stats()
returns table (
  tenant_id uuid,
  name text,
  slug text,
  status text,
  created_at timestamptz,
  members_total int,
  members_admin int,
  members_leadership int,
  members_head int,
  members_field int,
  pending_admin_email text,
  stakeholders int,
  engagements_30d int,
  open_commitments int,
  open_escalations int
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Only platform admins may read platform statistics' using errcode = '42501';
  end if;

  return query
  select
    t.id,
    t.name,
    t.slug,
    t.status,
    t.created_at,
    coalesce(m.total, 0)::int,
    coalesce(m.admins, 0)::int,
    coalesce(m.leadership, 0)::int,
    coalesce(m.heads, 0)::int,
    coalesce(m.field, 0)::int,
    inv.pending_admin_email,
    coalesce(s.cnt, 0)::int,
    coalesce(e.cnt, 0)::int,
    coalesce(c.cnt, 0)::int,
    coalesce(esc.cnt, 0)::int
  from public.tenants t
  left join (
    select
      tenant_id,
      count(*) as total,
      count(*) filter (where role = 'admin') as admins,
      count(*) filter (where role = 'leadership') as leadership,
      count(*) filter (where role = 'head') as heads,
      count(*) filter (where role = 'field') as field
    from public.profiles
    where tenant_id is not null
    group by tenant_id
  ) m on m.tenant_id = t.id
  left join (
    select tenant_id, min(email)::text as pending_admin_email
    from public.invitations
    where role = 'admin' and status = 'pending'
    group by tenant_id
  ) inv on inv.tenant_id = t.id
  left join (
    select tenant_id, count(*) as cnt from public.stakeholders group by tenant_id
  ) s on s.tenant_id = t.id
  left join (
    select tenant_id, count(*) as cnt from public.engagements
    where created_at >= now() - interval '30 days'
    group by tenant_id
  ) e on e.tenant_id = t.id
  left join (
    select tenant_id, count(*) as cnt from public.commitments
    where status = 'open'
    group by tenant_id
  ) c on c.tenant_id = t.id
  left join (
    select tenant_id, count(*) as cnt from public.escalations
    where status <> 'resolved'
    group by tenant_id
  ) esc on esc.tenant_id = t.id
  order by t.created_at desc;
end;
$$;

-- Signed-in users only; the internal guard restricts it to platform admins.
-- Never callable anonymously.
revoke execute on function public.platform_tenant_stats() from public, anon;
grant execute on function public.platform_tenant_stats() to authenticated;
