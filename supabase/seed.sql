-- ─────────────────────────────────────────────────────────────
-- E0-2 · Seed / demo dataset. Loaded by `supabase db reset`.
-- Known-good data so every environment is demonstrable and testable.
-- Escalations are NOT seeded directly — they auto-open via the
-- sync_escalation() trigger when high-risk/flagged stakeholders land.
-- Dates are relative to current_date so the demo always looks fresh.
-- ─────────────────────────────────────────────────────────────

-- ── Taxonomy ─────────────────────────────────────────────────
insert into public.taxonomy (kind, value, label, sort_order) values
  ('category', 'Regulator',  'Regulator',  1),
  ('category', 'Government', 'Government', 2),
  ('category', 'Community',  'Community',  3),
  ('category', 'Commercial', 'Commercial', 4),
  ('function', 'Corporate Affairs', 'Corporate Affairs', 1),
  ('function', 'Sales',             'Sales',             2),
  ('function', 'Regulatory',        'Regulatory',        3),
  ('function', 'Supply Chain',      'Supply Chain',      4),
  ('engagement_type', 'Virtual Meeting',  'Virtual Meeting',  1),
  ('engagement_type', 'Physical Meeting', 'Physical Meeting', 2),
  ('engagement_type', 'Call',             'Call',             3),
  ('engagement_type', 'Email',            'Email',            4),
  ('engagement_type', 'Site Visit',       'Site Visit',       5),
  ('engagement_type', 'Event',            'Event',            6);

-- ── Users (auth) + profiles ──────────────────────────────────
-- Demo auth rows. To be visible to GoTrue (Supabase Auth) and allow
-- password sign-in, directly-inserted users need instance_id, aud, role,
-- an email-provider app_meta, a confirmed email, and an encrypted password.
-- The shared demo password below MUST match DEMO_LOGIN_PASSWORD. Demo only.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated', 'zainab.obagun@example.com', extensions.crypt('sis-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Zainab Obagun"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a2', 'authenticated', 'authenticated', 'chidi.okonkwo@example.com', extensions.crypt('sis-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Chidi Okonkwo"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a3', 'authenticated', 'authenticated', 'amara.eze@example.com', extensions.crypt('sis-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Amara Eze"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a4', 'authenticated', 'authenticated', 'tunde.bello@example.com', extensions.crypt('sis-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tunde Bello"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a5', 'authenticated', 'authenticated', 'ngozi.udo@example.com', extensions.crypt('sis-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ngozi Udo"}'),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a6', 'authenticated', 'authenticated', 'admin@example.com', extensions.crypt('sis-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"System Admin"}')
on conflict (id) do nothing;

-- GoTrue also expects an identities row per email user for password login.
insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', now(), now(), now()
from auth.users u
where u.email like '%@example.com'
on conflict do nothing;

-- GoTrue scans many auth.users columns into non-nullable Go types; NULLs
-- (the default on a direct insert) cause "Database error querying schema".
-- Normalise timestamps + token columns so password sign-in works.
update auth.users set
  created_at                 = coalesce(created_at, now()),
  updated_at                 = coalesce(updated_at, now()),
  last_sign_in_at            = coalesce(last_sign_in_at, now()),
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, ''),
  email_change_confirm_status = coalesce(email_change_confirm_status, 0)
where email like '%@example.com';

insert into public.profiles (id, full_name, email, role, function, manager_id) values
  ('00000000-0000-0000-0000-0000000000a1', 'Zainab Obagun', 'zainab.obagun@example.com', 'leadership', null,                 null),
  ('00000000-0000-0000-0000-0000000000a3', 'Amara Eze',     'amara.eze@example.com',     'head',       'Corporate Affairs',  '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000a4', 'Tunde Bello',   'tunde.bello@example.com',   'head',       'Sales',              '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000a2', 'Chidi Okonkwo', 'chidi.okonkwo@example.com', 'field',      'Sales',              '00000000-0000-0000-0000-0000000000a4'),
  ('00000000-0000-0000-0000-0000000000a5', 'Ngozi Udo',     'ngozi.udo@example.com',     'field',      'Corporate Affairs',  '00000000-0000-0000-0000-0000000000a3'),
  ('00000000-0000-0000-0000-0000000000a6', 'System Admin',  'admin@example.com',         'admin',      null,                 null)
on conflict (id) do update set
  full_name = excluded.full_name,
  role      = excluded.role,
  function  = excluded.function,
  manager_id = excluded.manager_id;

-- ── Stakeholders (10) — mix of tiers, risk, sentiment ────────
insert into public.stakeholders
  (id, name, category, function, tier, owner_id, risk, sentiment, flagged, flag_reason, last_contact_at, notes) values
  ('c0000000-0000-0000-0000-000000000001', 'National Telecoms Commission', 'Regulator',  'Regulatory',        1, '00000000-0000-0000-0000-0000000000a5', 'high',   'resistant',  false, null,                         current_date - 21, 'Pushing back on the new spectrum framework.'),
  ('c0000000-0000-0000-0000-000000000002', 'Ministry of Trade',            'Government', 'Corporate Affairs', 1, '00000000-0000-0000-0000-0000000000a5', 'high',   'neutral',    false, null,                         current_date - 9,  'Awaiting position on the local-content bill.'),
  ('c0000000-0000-0000-0000-000000000003', 'Lagos Retailers Association',  'Commercial', 'Sales',             2, '00000000-0000-0000-0000-0000000000a2', 'medium', 'supportive', false, null,                         current_date - 3,  'Strong partner; renewing distribution terms.'),
  ('c0000000-0000-0000-0000-000000000004', 'Riverside Community Council',  'Community',  'Corporate Affairs', 2, '00000000-0000-0000-0000-0000000000a5', 'medium', 'resistant',  true,  'Escalating land-use complaints to press.', current_date - 14, 'Flagged: threatening local media campaign.'),
  ('c0000000-0000-0000-0000-000000000005', 'Federal Tax Authority',        'Government', 'Regulatory',        1, '00000000-0000-0000-0000-0000000000a5', 'low',    'neutral',    false, null,                         current_date - 5,  'Routine compliance cadence.'),
  ('c0000000-0000-0000-0000-000000000006', 'Northern Distributors Ltd',    'Commercial', 'Sales',             2, '00000000-0000-0000-0000-0000000000a2', 'low',    'supportive', false, null,                         current_date - 2,  'Reliable; exploring volume expansion.'),
  ('c0000000-0000-0000-0000-000000000007', 'Consumer Rights Network',      'Community',  'Corporate Affairs', 2, '00000000-0000-0000-0000-0000000000a5', 'medium', 'neutral',    false, null,                         current_date - 30, 'Quiet lately — relationship going stale.'),
  ('c0000000-0000-0000-0000-000000000008', 'State Environmental Agency',   'Regulator',  'Regulatory',        1, '00000000-0000-0000-0000-0000000000a5', 'high',   'supportive', false, null,                         current_date - 7,  'Supportive but demanding on emissions data.'),
  ('c0000000-0000-0000-0000-000000000009', 'Eastern Wholesale Group',      'Commercial', 'Sales',             2, '00000000-0000-0000-0000-0000000000a2', 'low',    'neutral',    false, null,                         current_date - 1,  'New account; onboarding underway.'),
  ('c0000000-0000-0000-0000-00000000000a', 'Port Authority Board',         'Government', 'Supply Chain',      1, '00000000-0000-0000-0000-0000000000a4', 'medium', 'supportive', false, null,                         current_date - 11, 'Key for import throughput; generally aligned.');

-- ── Engagements ──────────────────────────────────────────────
insert into public.engagements (stakeholder_id, type, occurred_on, notes, logged_by) values
  ('c0000000-0000-0000-0000-000000000001', 'Physical Meeting', current_date - 21, 'Tense session on spectrum pricing; they want concessions.', '00000000-0000-0000-0000-0000000000a5'),
  ('c0000000-0000-0000-0000-000000000002', 'Email',            current_date - 9,  'Sent our position paper on local content.',                '00000000-0000-0000-0000-0000000000a5'),
  ('c0000000-0000-0000-0000-000000000003', 'Call',             current_date - 3,  'Confirmed renewal terms verbally.',                        '00000000-0000-0000-0000-0000000000a2'),
  ('c0000000-0000-0000-0000-000000000004', 'Site Visit',       current_date - 14, 'Community meeting turned hostile over land use.',          '00000000-0000-0000-0000-0000000000a5'),
  ('c0000000-0000-0000-0000-000000000008', 'Virtual Meeting',  current_date - 7,  'Walked through emissions dashboard; positive.',            '00000000-0000-0000-0000-0000000000a5'),
  ('c0000000-0000-0000-0000-000000000006', 'Call',             current_date - 2,  'Discussed Q3 volume targets.',                             '00000000-0000-0000-0000-0000000000a2');

-- ── Commitments ──────────────────────────────────────────────
insert into public.commitments (stakeholder_id, description, due_date, priority, status, owner_id) values
  ('c0000000-0000-0000-0000-000000000001', 'Submit revised spectrum proposal',        current_date + 2,  'high', 'open',      '00000000-0000-0000-0000-0000000000a5'),
  ('c0000000-0000-0000-0000-000000000002', 'Follow up on local-content bill position', current_date - 1,  'high', 'open',      '00000000-0000-0000-0000-0000000000a5'),
  ('c0000000-0000-0000-0000-000000000004', 'Arrange mediation with community council', current_date + 4,  'high', 'open',      '00000000-0000-0000-0000-0000000000a5'),
  ('c0000000-0000-0000-0000-000000000003', 'Send signed distribution agreement',       current_date + 5,  'low',  'open',      '00000000-0000-0000-0000-0000000000a2'),
  ('c0000000-0000-0000-0000-000000000007', 'Re-establish quarterly check-in',          current_date - 4,  'low',  'open',      '00000000-0000-0000-0000-0000000000a5'),
  ('c0000000-0000-0000-0000-000000000006', 'Share volume-expansion pack',              current_date - 6,  'low',  'completed', '00000000-0000-0000-0000-0000000000a2');

-- ── A pending stakeholder request (feeds E10-1 approval queue) ─
insert into public.stakeholder_requests (requested_name, category, reason, requested_by) values
  ('West Coast Logistics Co', 'Commercial', 'New distributor entering our territory; want it tracked.', '00000000-0000-0000-0000-0000000000a2');
