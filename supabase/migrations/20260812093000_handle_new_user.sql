-- ─────────────────────────────────────────────────────────────
-- E1-3 · Auto-provision a profile when a new auth user is created.
-- Real sign-ups (SSO / magic-link) get a default 'field' profile so
-- the app always has a role/function row to authorise against. Admins
-- adjust role/function afterwards (E10). Seed rows upsert on top of this.
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'field'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
