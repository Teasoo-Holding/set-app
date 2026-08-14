-- ─────────────────────────────────────────────────────────────
-- E0-5 / E12-2 · Per-role AND per-tenant RLS tests (pgTAP).
-- Run with:  supabase test db
--
-- Proves at the database (not the UI):
--   • Role/function scope within a tenant (field/head walled to their function)
--   • TENANT ISOLATION — a user in tenant A reads ZERO of tenant B's rows on
--     every table; a platform admin reads ZERO business rows; tenant_id is
--     immutable; a cross-tenant insert is refused.
--   • audit_log closed to clients; escalation auto-open; self-escalation blocked.
--
-- Fixtures are created as the (superuser) test runner, then act_as() switches
-- to an authenticated JWT so RLS applies. Everything rolls back.
-- ─────────────────────────────────────────────────────────────
begin;
select plan(20);

-- Clean slate: truncating tenants cascades to every tenant-scoped table.
-- audit_log has no FK to tenants, so clear it explicitly.
truncate public.tenants cascade;
delete from public.audit_log;

-- ── Fixtures: two tenants ────────────────────────────────────
insert into public.tenants (id, name, slug) values
  ('0a000000-0000-0000-0000-0000000000a0', 'Tenant A', 'tenant-a'),
  ('0b000000-0000-0000-0000-0000000000b0', 'Tenant B', 'tenant-b');

insert into public.taxonomy (tenant_id, kind, value, label) values
  ('0a000000-0000-0000-0000-0000000000a0', 'function', 'Sales', 'Sales'),
  ('0a000000-0000-0000-0000-0000000000a0', 'function', 'Legal', 'Legal'),
  ('0a000000-0000-0000-0000-0000000000a0', 'category', 'Regulator', 'Regulator'),
  ('0a000000-0000-0000-0000-0000000000a0', 'engagement_type', 'Call', 'Call'),
  ('0b000000-0000-0000-0000-0000000000b0', 'function', 'Sales', 'Sales'),
  ('0b000000-0000-0000-0000-0000000000b0', 'category', 'Regulator', 'Regulator'),
  ('0b000000-0000-0000-0000-0000000000b0', 'engagement_type', 'Call', 'Call');

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'field.sales.a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'head.sales.a@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'leadership.a@example.com'),
  ('44444444-4444-4444-4444-444444444444', 'field.sales.b@example.com'),
  ('55555555-5555-5555-5555-555555555555', 'platform.test@example.com');

-- handle_new_user() created default (null-tenant, field) profiles above; set them.
insert into public.profiles (id, tenant_id, full_name, email, role, function) values
  ('11111111-1111-1111-1111-111111111111', '0a000000-0000-0000-0000-0000000000a0', 'Field A',      'field.sales.a@example.com', 'field',          'Sales'),
  ('22222222-2222-2222-2222-222222222222', '0a000000-0000-0000-0000-0000000000a0', 'Head A',       'head.sales.a@example.com',  'head',           'Sales'),
  ('33333333-3333-3333-3333-333333333333', '0a000000-0000-0000-0000-0000000000a0', 'Leadership A', 'leadership.a@example.com',  'leadership',     null),
  ('44444444-4444-4444-4444-444444444444', '0b000000-0000-0000-0000-0000000000b0', 'Field B',      'field.sales.b@example.com', 'field',          'Sales'),
  ('55555555-5555-5555-5555-555555555555', null,                                   'Platform',     'platform.test@example.com', 'platform_admin', null)
on conflict (id) do update set
  tenant_id = excluded.tenant_id, full_name = excluded.full_name,
  role = excluded.role, function = excluded.function;

insert into public.stakeholders (id, tenant_id, name, category, function, tier, owner_id, risk, sentiment) values
  ('aaaaaaaa-0000-0000-0000-0000000000a1', '0a000000-0000-0000-0000-0000000000a0', 'A Sales Reg', 'Regulator', 'Sales', 1, '11111111-1111-1111-1111-111111111111', 'low', 'neutral'),
  ('aaaaaaaa-0000-0000-0000-0000000000a2', '0a000000-0000-0000-0000-0000000000a0', 'A Legal Reg', 'Regulator', 'Legal', 1, '11111111-1111-1111-1111-111111111111', 'low', 'neutral'),
  ('bbbbbbbb-0000-0000-0000-0000000000b1', '0b000000-0000-0000-0000-0000000000b0', 'B Sales Reg', 'Regulator', 'Sales', 1, '44444444-4444-4444-4444-444444444444', 'low', 'neutral');

insert into public.engagements (tenant_id, stakeholder_id, type, logged_by) values
  ('0b000000-0000-0000-0000-0000000000b0', 'bbbbbbbb-0000-0000-0000-0000000000b1', 'Call', '44444444-4444-4444-4444-444444444444');

-- Impersonation helper.
create schema if not exists tests;
grant usage on schema tests to public;
create or replace function tests.act_as(uid uuid) returns void
language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end;
$$;
grant execute on function tests.act_as(uuid) to public;

-- ── Role/function scope within tenant A ──────────────────────
select tests.act_as('11111111-1111-1111-1111-111111111111');
select is(
  (select count(*)::int from public.stakeholders),
  1,
  'field(A,Sales) sees exactly their function''s stakeholders in their tenant'
);
select is(
  (select count(*)::int from public.stakeholders where function = 'Legal'),
  0,
  'field(A,Sales) cannot read another function''s stakeholders'
);
select lives_ok(
  $$ insert into public.engagements (tenant_id, stakeholder_id, type, logged_by)
     values ('0a000000-0000-0000-0000-0000000000a0', 'aaaaaaaa-0000-0000-0000-0000000000a1', 'Call', '11111111-1111-1111-1111-111111111111') $$,
  'field can log an engagement within scope (E3-1)'
);
select throws_ok(
  $$ insert into public.engagements (tenant_id, stakeholder_id, type, logged_by)
     values ('0a000000-0000-0000-0000-0000000000a0', 'aaaaaaaa-0000-0000-0000-0000000000a2', 'Call', '11111111-1111-1111-1111-111111111111') $$,
  '42501', null,
  'field cannot log against an out-of-scope stakeholder'
);

select tests.act_as('22222222-2222-2222-2222-222222222222');
select is(
  (select count(*)::int from public.stakeholders where function = 'Legal'),
  0,
  'head(A,Sales) cannot read Legal stakeholders'
);

select tests.act_as('33333333-3333-3333-3333-333333333333');
select is(
  (select count(*)::int from public.stakeholders),
  2,
  'leadership(A) reads all functions in their tenant'
);

-- ── TENANT ISOLATION ─────────────────────────────────────────
select tests.act_as('11111111-1111-1111-1111-111111111111');
select is(
  (select count(*)::int from public.stakeholders where tenant_id = '0b000000-0000-0000-0000-0000000000b0'),
  0,
  'ISOLATION: field(A) sees zero of tenant B''s stakeholders'
);
select is(
  (select count(*)::int from public.engagements),
  1,
  'ISOLATION: field(A) sees only tenant A engagements (never tenant B''s)'
);

select tests.act_as('33333333-3333-3333-3333-333333333333');
select is(
  (select count(*)::int from public.stakeholders where tenant_id = '0b000000-0000-0000-0000-0000000000b0'),
  0,
  'ISOLATION: even leadership(A) sees zero of tenant B''s stakeholders'
);
-- Leadership can insert in their own tenant, but NOT into another tenant.
select throws_ok(
  $$ insert into public.stakeholders (tenant_id, name, category, function, tier, owner_id)
     values ('0b000000-0000-0000-0000-0000000000b0', 'Sneaky', 'Regulator', 'Sales', 2, '33333333-3333-3333-3333-333333333333') $$,
  '42501', null,
  'ISOLATION: a user cannot insert a row into another tenant (RLS WITH CHECK)'
);
-- tenant_id is immutable to end-users (cannot smuggle yourself into tenant B).
select throws_ok(
  $$ update public.profiles set tenant_id = '0b000000-0000-0000-0000-0000000000b0'
     where id = '33333333-3333-3333-3333-333333333333' $$,
  '42501', null,
  'ISOLATION: a user cannot move their profile to another tenant'
);

-- Platform admin: manages tenants, sees ZERO business data.
select tests.act_as('55555555-5555-5555-5555-555555555555');
select is(
  (select count(*)::int from public.stakeholders),
  0,
  'ISOLATION: platform admin reads zero tenant business rows'
);
select is(
  (select count(*)::int from public.tenants),
  2,
  'platform admin can see all tenants (management scope)'
);

-- ── audit_log closed to client writes ────────────────────────
select tests.act_as('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ insert into public.audit_log (action, entity_type) values ('HACK', 'stakeholders') $$,
  '42501', null,
  'clients cannot write audit_log directly'
);

-- ── escalation auto-open on High risk (E6-1 trigger) ─────────
select tests.act_as('22222222-2222-2222-2222-222222222222');
update public.stakeholders
  set risk = 'high', sentiment = 'resistant'
  where id = 'aaaaaaaa-0000-0000-0000-0000000000a1';
select is(
  (select severity::text from public.escalations
    where stakeholder_id = 'aaaaaaaa-0000-0000-0000-0000000000a1' and status <> 'resolved'),
  'critical',
  'High + Resistant auto-opens a Critical escalation (E6-2)'
);
update public.stakeholders
  set risk = 'low', sentiment = 'neutral'
  where id = 'aaaaaaaa-0000-0000-0000-0000000000a1';
select is(
  (select count(*)::int from public.escalations
    where stakeholder_id = 'aaaaaaaa-0000-0000-0000-0000000000a1' and status <> 'resolved'),
  0,
  'dropping below High resolves the auto escalation (E6-1)'
);

-- ── self privilege-escalation blocked (#58 F-1) ──────────────
select tests.act_as('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null,
  'field cannot self-escalate role to admin (#58 F-1)'
);
select lives_ok(
  $$ update public.profiles set full_name = 'Field A (edited)' where id = '11111111-1111-1111-1111-111111111111' $$,
  'a user may still edit their own non-privileged columns (#58 F-1)'
);

-- ── every base table has RLS enabled (#58 F-2) ───────────────
select is(
  (select count(*)::int
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not c.relrowsecurity),
  0,
  'every base table in schema public has RLS enabled (#58 F-2)'
);

select * from finish();
rollback;
