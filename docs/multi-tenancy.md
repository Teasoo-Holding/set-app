# Multi-tenancy & onboarding (E12)

Teasoo SET is a multi-tenant SaaS. Every organisation is a **tenant**, and its
data is isolated from every other tenant's.

## Isolation model (how a tenant can't see another tenant)

Three layers, all in the database:

1. **Structural.** Every business table has a `NOT NULL tenant_id`. Taxonomy is
   per-tenant with composite tenant-scoped foreign keys, and child records
   (engagements, commitments, escalations) bind to `stakeholders(tenant_id, id)`
   — so a row can't reference another tenant's data even in principle.
2. **RLS.** `tenant_id = current_tenant()` is AND-ed into every policy on every
   table. `current_tenant()` reads the caller's `profiles.tenant_id`; it's
   `null` for platform admins, so they read **zero** business rows.
3. **Immutability.** A trigger blocks changing a row's `tenant_id` (only the
   platform admin / a trusted server context can).

Proven by cross-tenant pgTAP tests in CI (`supabase/tests/rls_test.sql`): a
tenant-A user reads 0 of tenant-B's rows; a cross-tenant insert is refused; a
user can't move themselves between tenants; a platform admin sees 0 business rows.

## Roles

| Role | Scope | Can |
|---|---|---|
| `platform_admin` | cross-tenant, **no business data** | create/suspend tenants, invite tenant admins |
| `admin` (tenant admin) | one tenant | invite/manage users, taxonomy, requests, reassignment |
| `leadership` / `head` / `field` | one tenant (+ function) | as before, walled to their tenant |

One tenant per user (email is globally unique).

## Onboarding (invite-only — there is no open sign-up)

1. **Platform admin** (`/platform`) creates an organisation → its default
   taxonomy is seeded → the first **tenant admin** is emailed an invitation.
2. That admin clicks the link (`/invite/accept?token=…`), sets a password, and
   is bound to the tenant as `admin`.
3. The tenant admin invites their team from **Governance → People & invitations**
   (choosing role + function). Each teammate accepts the same way.

Invitations are hashed (only the SHA-256 is stored), single-use, and expire
after 7 days. Emails send via Brevo (see `docs/email-smtp-brevo.md`).

## Applying the schema to a hosted project

The migrations are validated in CI on a fresh database. Applying them to an
existing hosted project is a **destructive reset** (E12 is a breaking schema
change; we chose a fresh reseed). Options:

- **Supabase CLI** (in a terminal, project linked): `supabase db reset --linked`.
- **No CLI:** ask for the consolidated teardown+rebuild SQL to run in the
  Supabase SQL editor.

After the reset, set the platform-admin password (`docs/platform-admin.md`).
