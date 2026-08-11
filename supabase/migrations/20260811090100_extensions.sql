-- ─────────────────────────────────────────────────────────────
-- E0-1 · Extensions
-- ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto" with schema extensions;   -- gen_random_uuid()
create extension if not exists "citext" with schema extensions;     -- case-insensitive email
