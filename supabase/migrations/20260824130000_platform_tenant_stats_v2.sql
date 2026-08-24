-- Platform-admin metrics v2 (#104): expand platform_tenant_stats() with the full
-- KPI set — invite acceptance, activity (7d/30d/all-time, active contributors,
-- last activity), delivery (commitment & escalation totals + completion/resolution),
-- and a risk snapshot (high-risk / flagged / sentiment). Still COUNTS ONLY, still
-- platform-admin-gated, so tenant isolation is preserved.

drop function if exists public.platform_tenant_stats();

create function public.platform_tenant_stats()
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
  invites_accepted int,
  invites_pending int,
  stakeholders int,
  stakeholders_high_risk int,
  stakeholders_flagged int,
  stakeholders_negative int,
  stakeholders_supportive int,
  engagements_7d int,
  engagements_30d int,
  engagements_total int,
  active_users_30d int,
  last_activity_at timestamptz,
  commitments_total int,
  commitments_completed int,
  open_commitments int,
  escalations_total int,
  escalations_resolved int,
  open_escalations int,
  escalations_critical int
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.is_platform_admin() then
    raise exception 'Only platform admins may read platform statistics' using errcode = '42501';
  end if;

  return query
  select
    t.id, t.name, t.slug, t.status, t.created_at,
    coalesce(p.total, 0)::int, coalesce(p.admins, 0)::int, coalesce(p.leadership, 0)::int,
    coalesce(p.heads, 0)::int, coalesce(p.field, 0)::int,
    inv.pending_admin_email,
    coalesce(inv.accepted, 0)::int, coalesce(inv.pending, 0)::int,
    coalesce(s.total, 0)::int, coalesce(s.high_risk, 0)::int, coalesce(s.flagged, 0)::int,
    coalesce(s.negative, 0)::int, coalesce(s.supportive, 0)::int,
    coalesce(e.e7, 0)::int, coalesce(e.e30, 0)::int, coalesce(e.etotal, 0)::int,
    coalesce(e.active_users, 0)::int, e.last_activity_at,
    coalesce(c.total, 0)::int, coalesce(c.completed, 0)::int, coalesce(c.open_cnt, 0)::int,
    coalesce(esc.total, 0)::int, coalesce(esc.resolved, 0)::int, coalesce(esc.open_cnt, 0)::int,
    coalesce(esc.critical, 0)::int
  from public.tenants t
  left join (
    select tenant_id,
      count(*) as total,
      count(*) filter (where role = 'admin') as admins,
      count(*) filter (where role = 'leadership') as leadership,
      count(*) filter (where role = 'head') as heads,
      count(*) filter (where role = 'field') as field
    from public.profiles where tenant_id is not null group by tenant_id
  ) p on p.tenant_id = t.id
  left join (
    select tenant_id,
      count(*) filter (where status = 'accepted') as accepted,
      count(*) filter (where status = 'pending') as pending,
      (min(email) filter (where role = 'admin' and status = 'pending'))::text as pending_admin_email
    from public.invitations group by tenant_id
  ) inv on inv.tenant_id = t.id
  left join (
    select tenant_id,
      count(*) as total,
      count(*) filter (where risk = 'high') as high_risk,
      count(*) filter (where flagged) as flagged,
      count(*) filter (where sentiment = 'resistant') as negative,
      count(*) filter (where sentiment = 'supportive') as supportive
    from public.stakeholders group by tenant_id
  ) s on s.tenant_id = t.id
  left join (
    select tenant_id,
      count(*) filter (where created_at >= now() - interval '7 days') as e7,
      count(*) filter (where created_at >= now() - interval '30 days') as e30,
      count(*) as etotal,
      count(distinct logged_by) filter (where created_at >= now() - interval '30 days') as active_users,
      max(created_at) as last_activity_at
    from public.engagements group by tenant_id
  ) e on e.tenant_id = t.id
  left join (
    select tenant_id,
      count(*) as total,
      count(*) filter (where status = 'completed') as completed,
      count(*) filter (where status = 'open') as open_cnt
    from public.commitments group by tenant_id
  ) c on c.tenant_id = t.id
  left join (
    select tenant_id,
      count(*) as total,
      count(*) filter (where status = 'resolved') as resolved,
      count(*) filter (where status <> 'resolved') as open_cnt,
      count(*) filter (where status <> 'resolved' and severity = 'critical') as critical
    from public.escalations group by tenant_id
  ) esc on esc.tenant_id = t.id
  order by t.created_at desc;
end;
$$;

revoke execute on function public.platform_tenant_stats() from public, anon;
grant execute on function public.platform_tenant_stats() to authenticated;
