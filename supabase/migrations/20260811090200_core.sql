-- ─────────────────────────────────────────────────────────────
-- E0-1 + E12-1 · Core data model (PRD §6.1), MULTI-TENANT.
--
-- Every business record belongs to exactly one tenant. Isolation is enforced
-- in two layers:
--   • Structural (here): NOT NULL tenant_id on every business table, and
--     COMPOSITE tenant-scoped foreign keys — a child row can only reference a
--     stakeholder / taxonomy value IN THE SAME TENANT, so records can never be
--     linked across tenants even by a buggy or malicious insert.
--   • RLS (see the rls migration): every policy is AND-ed with
--     tenant_id = current_tenant().
-- ─────────────────────────────────────────────────────────────

-- ── Enums (fixed domains) ────────────────────────────────────
-- platform_admin = cross-tenant operator (no tenant, no business data).
-- admin          = TENANT admin (scoped to their tenant).
create type public.user_role          as enum ('field', 'head', 'leadership', 'admin', 'platform_admin');
create type public.risk_level         as enum ('low', 'medium', 'high');
create type public.sentiment          as enum ('supportive', 'neutral', 'resistant');
create type public.commitment_priority as enum ('high', 'low');
create type public.commitment_status   as enum ('open', 'completed');
create type public.escalation_status   as enum ('open', 'acknowledged', 'assigned', 'intervened', 'resolved');
create type public.escalation_severity as enum ('elevated', 'critical');
create type public.escalation_source   as enum ('auto_risk', 'manual_flag');
create type public.request_status      as enum ('pending', 'approved', 'rejected');
create type public.taxonomy_kind       as enum ('category', 'function', 'engagement_type');
create type public.invitation_status   as enum ('pending', 'accepted', 'revoked');

-- ── Tenants (the isolation root) ─────────────────────────────
create table public.tenants (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  slug       text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  status     text not null default 'active' check (status in ('active', 'suspended')),
  created_by uuid references auth.users (id) on delete set null,  -- platform admin
  created_at timestamptz not null default now()
);
comment on table public.tenants is 'One organisation. Root of the tenant-isolation boundary (E12).';

-- ── Taxonomy (per-tenant reference values) ───────────────────
create table public.taxonomy (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  kind       public.taxonomy_kind not null,
  value      text not null check (length(trim(value)) > 0),
  label      text not null,
  sort_order int  not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, kind, value)
);
comment on table public.taxonomy is 'Per-tenant reference values (E10-2): category, function, engagement_type.';

-- ── Profiles (mirror of auth.users + role/function) ──────────
-- tenant_id is NULL only for platform_admin (they belong to no tenant).
create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  tenant_id             uuid references public.tenants (id) on delete cascade,
  full_name             text not null,
  email                 citext not null unique,
  role                  public.user_role not null default 'field',
  function              text,
  function_kind         public.taxonomy_kind generated always as ('function') stored,
  manager_id            uuid references public.profiles (id) on delete set null,
  functional_manager_id uuid references public.profiles (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  foreign key (tenant_id, function_kind, function)
    references public.taxonomy (tenant_id, kind, value)
);
comment on column public.profiles.functional_manager_id is
  'Overrides HR manager_id for Head team views when functional ≠ HR line (E10-4, §6.5).';

-- ── Stakeholders (the authoritative directory) ───────────────
create table public.stakeholders (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants (id) on delete cascade,
  name            text not null check (length(trim(name)) > 0),
  category        text not null,
  category_kind   public.taxonomy_kind generated always as ('category') stored,
  function        text not null,
  function_kind   public.taxonomy_kind generated always as ('function') stored,
  tier            smallint not null check (tier in (1, 2)),
  owner_id        uuid not null references public.profiles (id),
  risk            public.risk_level not null default 'low',
  sentiment       public.sentiment  not null default 'neutral',
  flagged         boolean not null default false,
  flag_reason     text,
  last_contact_at date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- FK target for child tables so they can bind to (tenant_id, id) and never
  -- reference a stakeholder in another tenant.
  unique (tenant_id, id),
  foreign key (tenant_id, category_kind, category) references public.taxonomy (tenant_id, kind, value),
  foreign key (tenant_id, function_kind, function) references public.taxonomy (tenant_id, kind, value)
);
comment on table public.stakeholders is 'One authoritative, tiered record per stakeholder (E2).';

-- ── Engagements (the capture log) ────────────────────────────
create table public.engagements (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  stakeholder_id uuid not null,
  type           text not null,
  type_kind      public.taxonomy_kind generated always as ('engagement_type') stored,
  occurred_on    date not null default current_date,
  notes          text,
  logged_by      uuid not null references public.profiles (id),
  created_at     timestamptz not null default now(),
  foreign key (tenant_id, stakeholder_id) references public.stakeholders (tenant_id, id) on delete cascade,
  foreign key (tenant_id, type_kind, type) references public.taxonomy (tenant_id, kind, value)
);
comment on table public.engagements is 'Frictionless capture; each log refreshes the record (E3).';

-- ── Commitments (follow-through) ─────────────────────────────
create table public.commitments (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  stakeholder_id uuid not null,
  description    text not null check (length(trim(description)) > 0),
  due_date       date not null,
  priority       public.commitment_priority not null default 'low',
  status         public.commitment_status   not null default 'open',
  owner_id       uuid not null references public.profiles (id),
  created_at     timestamptz not null default now(),
  completed_at   timestamptz,
  foreign key (tenant_id, stakeholder_id) references public.stakeholders (tenant_id, id) on delete cascade
);
comment on table public.commitments is 'Promises to stakeholders, tracked and nudged (E7).';

-- ── Escalations (the workable queue) ─────────────────────────
create table public.escalations (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants (id) on delete cascade,
  stakeholder_id   uuid not null,
  status           public.escalation_status   not null default 'open',
  severity         public.escalation_severity not null default 'elevated',
  source           public.escalation_source   not null,
  summary          text,
  opened_at        timestamptz not null default now(),
  next_action_date date,
  assigned_to      uuid references public.profiles (id) on delete set null,
  resolved_at      timestamptz,
  is_active        boolean generated always as (status <> 'resolved') stored,
  foreign key (tenant_id, stakeholder_id) references public.stakeholders (tenant_id, id) on delete cascade
);
comment on table public.escalations is 'High-risk/flagged items as an ordered lifecycle (E6).';
create unique index escalations_one_active_per_stakeholder
  on public.escalations (stakeholder_id)
  where (status <> 'resolved');

-- ── Stakeholder requests (field proposes → admin approves) ───
create table public.stakeholder_requests (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants (id) on delete cascade,
  requested_name       text not null check (length(trim(requested_name)) > 0),
  category             text not null,
  category_kind        public.taxonomy_kind generated always as ('category') stored,
  reason               text not null,
  requested_by         uuid not null references public.profiles (id) on delete cascade,
  status               public.request_status not null default 'pending',
  decided_by           uuid references public.profiles (id) on delete set null,
  decided_at           timestamptz,
  created_stakeholder_id uuid references public.stakeholders (id) on delete set null,
  created_at           timestamptz not null default now(),
  foreign key (tenant_id, category_kind, category) references public.taxonomy (tenant_id, kind, value)
);
comment on table public.stakeholder_requests is 'Proposals into the master directory (E4-3 → E10-1).';

-- ── Invitations (invite-only onboarding, E12-4/E12-5) ────────
create table public.invitations (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants (id) on delete cascade,
  email         citext not null,
  role          public.user_role not null,
  function      text,
  function_kind public.taxonomy_kind generated always as ('function') stored,
  token_hash    text not null unique,          -- SHA-256 hex of the emailed token
  status        public.invitation_status not null default 'pending',
  invited_by    uuid references public.profiles (id) on delete set null,
  accepted_by   uuid references public.profiles (id) on delete set null,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  accepted_at   timestamptz,
  check (role <> 'platform_admin'),            -- platform admins are seeded, never invited into a tenant
  foreign key (tenant_id, function_kind, function) references public.taxonomy (tenant_id, kind, value)
);
comment on table public.invitations is 'Pending access grants; the only way to create a tenant account (E12).';
-- One live invite per email per tenant.
create unique index invitations_one_pending_per_email
  on public.invitations (tenant_id, email)
  where (status = 'pending');

-- ── Indexes for scope/sort hot paths (tenant-first) ──────────
create index stakeholders_tenant_function_idx on public.stakeholders (tenant_id, function);
create index stakeholders_tenant_owner_idx    on public.stakeholders (tenant_id, owner_id);
create index stakeholders_tenant_risk_idx      on public.stakeholders (tenant_id, risk);
create index engagements_tenant_stakeholder_idx on public.engagements (tenant_id, stakeholder_id, occurred_on desc);
create index commitments_tenant_owner_idx       on public.commitments (tenant_id, owner_id, status, due_date);
create index commitments_tenant_due_idx         on public.commitments (tenant_id, due_date) where status = 'open';
create index escalations_tenant_stakeholder_idx on public.escalations (tenant_id, stakeholder_id);
create index escalations_tenant_active_idx      on public.escalations (tenant_id, severity, opened_at) where status <> 'resolved';
create index profiles_tenant_function_idx       on public.profiles (tenant_id, function);
create index taxonomy_tenant_kind_idx           on public.taxonomy (tenant_id, kind);
create index invitations_tenant_status_idx      on public.invitations (tenant_id, status);
create index invitations_email_idx              on public.invitations (email);

-- ── updated_at maintenance ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger stakeholders_updated_at
  before update on public.stakeholders
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
