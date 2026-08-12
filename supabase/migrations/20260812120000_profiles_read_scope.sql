-- ─────────────────────────────────────────────────────────────
-- E2 · Let users read profiles within their readable function scope,
-- so the directory can show each stakeholder's owner name. Still
-- deny-by-default: field/head see their own function's people;
-- leadership/admin see all; everyone sees themselves.
-- ─────────────────────────────────────────────────────────────
drop policy if exists profiles_select on public.profiles;

create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or public.is_leadership_or_admin()
    or public.can_read_function(function)
  );
