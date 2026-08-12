-- ─────────────────────────────────────────────────────────────
-- Base table privileges for the API roles. RLS still gates ROW access —
-- but without a table-level GRANT the role gets "permission denied for
-- table …" before RLS is ever evaluated. Hosted Supabase sets these via
-- default privileges; declare them explicitly so local/CI matches prod.
-- (Closes the gap noted in the E0-5 review.)
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;

-- authenticated: full DML on public tables/views; RLS decides which rows.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- anon: read-only (still RLS-gated to nothing until signed in).
grant select on all tables in schema public to anon;

-- Future tables/sequences inherit the same, so new migrations are safe.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
