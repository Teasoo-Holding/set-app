# Platform admin — bootstrap & password

The platform admin (`platform_admin` role, no tenant) provisions tenants and
invites tenant admins. It cannot read any tenant's business data.

- **Bootstrap account:** `efeosasere.okoro@teasooconsulting.com`
- Seeded by `supabase/seed.sql` with a **throwaway demo password** for local/CI
  only. The real production password is **never committed** to the repo (a real
  admin credential in git history / CI logs is a security risk).

## Set the real password on the live database

Do this once on the hosted project, out-of-band. Two options:

### Option A — Supabase dashboard (simplest)
Supabase → **Authentication → Users** → find `efeosasere.okoro@teasooconsulting.com`
→ **⋯ → Reset password** (or Send magic link) → set the password you want.

### Option B — SQL editor (one-off, do not commit)
Supabase → **SQL editor**, paste and run — replacing the placeholder with your
real password:

```sql
update auth.users
set encrypted_password = extensions.crypt('YOUR_REAL_PASSWORD_HERE', extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'efeosasere.okoro@teasooconsulting.com';
```

Run it in the editor only; don't paste the real password into any file, commit,
or chat. Rotate it if it's ever exposed.

## Notes
- On a fresh `supabase db reset` of a hosted project, the seed re-applies the
  demo password — re-run the step above afterwards.
- The platform admin lands on the platform console (`/platform`, E12-3), not on
  any tenant's data.
