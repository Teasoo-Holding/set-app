-- ─────────────────────────────────────────────────────────────
-- E0-5 / NFR-2 · Per-role RLS test harness (pgTAP).
-- Run with:  supabase test db
--
-- Proves the §8 scope guarantees hold at the database, not the UI:
--   • field/head cannot read another function's stakeholders
--   • leadership reads across functions
--   • audit_log is closed to client writes
--   • escalation auto-opens when a stakeholder becomes High risk
--
-- Fixtures are created inside the test transaction and rolled back.
-- ─────────────────────────────────────────────────────────────
begin;
select plan(9);

-- `supabase db reset` loads seed.sql before tests run. Start from a clean
-- slate so fixtures don't collide with seed data and counts are exact.
-- Everything is inside this transaction and rolled back at the end.
truncate auth.users, public.taxonomy restart identity cascade;

-- ── Fixtures ─────────────────────────────────────────────────
-- Two functions, four users (one per role) plus a second field user.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'field.sales@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'head.sales@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'leadership@example.com'),
  ('44444444-4444-4444-4444-444444444444', 'field.legal@example.com');

insert into public.taxonomy (kind, value, label) values
  ('function', 'Sales', 'Sales'),
  ('function', 'Legal', 'Legal'),
  ('category', 'Regulator', 'Regulator'),
  ('engagement_type', 'Call', 'Call');

insert into public.profiles (id, full_name, email, role, function) values
  ('11111111-1111-1111-1111-111111111111', 'Field Sales',  'field.sales@example.com', 'field',      'Sales'),
  ('22222222-2222-2222-2222-222222222222', 'Head Sales',   'head.sales@example.com',  'head',       'Sales'),
  ('33333333-3333-3333-3333-333333333333', 'Leadership',   'leadership@example.com',  'leadership', null),
  ('44444444-4444-4444-4444-444444444444', 'Field Legal',  'field.legal@example.com', 'field',      'Legal');

insert into public.stakeholders (id, name, category, function, tier, owner_id, risk, sentiment) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Sales Reg A', 'Regulator', 'Sales', 1, '11111111-1111-1111-1111-111111111111', 'low', 'neutral'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Legal Reg B', 'Regulator', 'Legal', 1, '44444444-4444-4444-4444-444444444444', 'low', 'neutral');

-- Impersonation helper: become an authenticated user with a jwt sub.
create or replace function tests.act_as(uid uuid) returns void
language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end;
$$;

-- ── field (Sales) sees only Sales stakeholders ───────────────
select tests.act_as('11111111-1111-1111-1111-111111111111');
select is(
  (select count(*)::int from public.stakeholders),
  1,
  'field(Sales) sees exactly their function''s stakeholders'
);
select is(
  (select count(*)::int from public.stakeholders where function = 'Legal'),
  0,
  'field(Sales) cannot read Legal stakeholders (E1 success signal)'
);

-- field can log an engagement on an in-scope stakeholder…
select lives_ok(
  $$ insert into public.engagements (stakeholder_id, type, logged_by)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'Call', '11111111-1111-1111-1111-111111111111') $$,
  'field can log an engagement within scope (E3-1)'
);
-- …but not on an out-of-scope stakeholder.
select throws_ok(
  $$ insert into public.engagements (stakeholder_id, type, logged_by)
     values ('bbbbbbbb-0000-0000-0000-000000000002', 'Call', '11111111-1111-1111-1111-111111111111') $$,
  '42501',
  null,
  'field cannot log against an out-of-scope stakeholder'
);

-- ── head (Sales) is function-scoped ──────────────────────────
select tests.act_as('22222222-2222-2222-2222-222222222222');
select is(
  (select count(*)::int from public.stakeholders where function = 'Legal'),
  0,
  'head(Sales) cannot read Legal stakeholders'
);

-- ── leadership reads across functions ────────────────────────
select tests.act_as('33333333-3333-3333-3333-333333333333');
select is(
  (select count(*)::int from public.stakeholders),
  2,
  'leadership reads all functions'
);

-- ── audit_log is closed to client writes ─────────────────────
select tests.act_as('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ insert into public.audit_log (action, entity_type) values ('HACK', 'stakeholders') $$,
  '42501',
  null,
  'clients cannot write audit_log directly'
);

-- ── escalation auto-opens on High risk (E6-1 trigger) ────────
-- Head raises risk on a Sales stakeholder → active escalation appears.
select tests.act_as('22222222-2222-2222-2222-222222222222');
update public.stakeholders
  set risk = 'high', sentiment = 'resistant'
  where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select is(
  (select severity::text from public.escalations
    where stakeholder_id = 'aaaaaaaa-0000-0000-0000-000000000001' and status <> 'resolved'),
  'critical',
  'High + Resistant auto-opens a Critical escalation (E6-2)'
);

-- Dropping back below High clears it.
update public.stakeholders
  set risk = 'low', sentiment = 'neutral'
  where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select is(
  (select count(*)::int from public.escalations
    where stakeholder_id = 'aaaaaaaa-0000-0000-0000-000000000001' and status <> 'resolved'),
  0,
  'dropping below High resolves the auto escalation (E6-1)'
);

select * from finish();
rollback;
