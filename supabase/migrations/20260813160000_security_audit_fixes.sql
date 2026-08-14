-- ─────────────────────────────────────────────────────────────
-- Security audit (#58) remediation — database layer.
-- ─────────────────────────────────────────────────────────────

-- ── [CRITICAL] Stop self privilege-escalation via profiles_update_self ──
-- The `profiles_update_self` policy (for update using id = auth.uid() with
-- check id = auth.uid()) only re-confirms row ownership. RLS WITH CHECK
-- cannot compare OLD vs NEW, so it cannot stop a user rewriting the columns
-- on THEIR OWN row that drive authorization — e.g.
--     update public.profiles set role = 'admin' where id = auth.uid();
-- passes the check and escalates them to Admin, defeating the §8 scope model.
-- Enforce column immutability for non-admins with a BEFORE UPDATE trigger
-- (the only place OLD/NEW can be compared). Admins may still change anything
-- (that path is itself gated by profiles_admin_write + is_admin()). CWE-269.
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Trusted server contexts with no end-user JWT (service role, migrations,
  -- seed) already bypass RLS — don't second-guess them. The guard exists to
  -- constrain real authenticated end-users, who always carry auth.uid().
  if auth.uid() is null then
    return new;
  end if;

  -- E12: tenant_id is the isolation boundary. Only a platform admin (or a
  -- trusted server context, handled above) may move a profile between tenants.
  -- No tenant admin, and certainly no end-user, may change it. CWE-269.
  if new.tenant_id is distinct from old.tenant_id and not public.is_platform_admin() then
    raise exception 'Not allowed: tenant cannot be changed.'
      using errcode = '42501';
  end if;

  -- Tenant admins (and platform admins) may assign role/function/reporting
  -- lines within their remit (row-level tenant scope is enforced by RLS).
  if public.is_admin() or public.is_platform_admin() then
    return new;
  end if;

  -- Everyone else: the authorization-bearing columns are read-only. Changing
  -- your own name is fine; changing your role/function/managers is not.
  if new.role is distinct from old.role
     or new.function is distinct from old.function
     or new.manager_id is distinct from old.manager_id
     or new.functional_manager_id is distinct from old.functional_manager_id then
    raise exception
      'Not allowed: role, function and reporting lines can only be changed by an administrator.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged on public.profiles;
create trigger profiles_guard_privileged
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- ── [LOW/defense-in-depth] Revoke client DML on system-owned tables ──
-- audit_log is insert-only via the SECURITY DEFINER audit_row() trigger (which
-- runs as the definer, so this revoke does not affect it) and reminder_sends is
-- written only by the service role. RLS already denies client writes to both;
-- removing the underlying table grant closes the gap in depth so integrity does
-- not rest on RLS alone. CWE-284.
revoke insert, update, delete on public.audit_log      from authenticated, anon;
revoke insert, update, delete on public.reminder_sends from authenticated, anon;
