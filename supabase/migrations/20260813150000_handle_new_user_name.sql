-- ─────────────────────────────────────────────────────────────
-- #23 · Microsoft Entra sign-in fills `raw_user_meta_data->>'name'`
-- (OIDC `name` claim), not `full_name`. Broaden the fallback chain so
-- Entra users get a readable display name on first sign-in. Behaviour
-- is otherwise unchanged: new users still get a default 'field' profile
-- for an Admin to adjust (E10).
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
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    'field'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
