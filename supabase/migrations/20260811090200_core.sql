-- ─────────────────────────────────────────────────────────────
-- E0-1 · Core data model (PRD §6.1)
-- Entities: profiles, taxonomy, stakeholders, engagements,
--           commitments, escalations, stakeholder_requests.
-- Fixed domains use enums; extensible domains (category, function,
-- engagement type) reference the taxonomy table so Admins can change
-- them without a deploy (E10-2 / E3-2).
-- ─────────────────────────────────────────────────────────────

-- ── Enums (fixed domains) ────────────────────────────────────
create type public.user_role          as enum ('field', 'head', 'leadership', 'admin');
create type public.risk_level         as enum ('low', 'medium', 'high');
create type public.sentiment          as enum ('supportive', 'neutral', 'resistant');
create type public.commitment_priority as enum ('high', 'low');
create type public.commitment_status   as enum ('open', 'completed');
create type public.escalation_status   as enum ('open', 'acknowledged', 'assigned', 'intervened', 'resolved');
create type public.escalation_severity as enum ('elevated', 'critical');
create type public.escalation_source   as enum ('auto_risk', 'manual_flag');
create type public.request_status      as enum ('pending', 'approved', 'rejected');
create type public.taxonomy_kind       as enum ('category', 'function', 'engagement_type');

-- ── Taxonomy (Admin-managed reference values) ────────────────
create table public.taxonomy (
  id         uuid primary key default gen_random_uuid(),
  kind       public.taxonomy_kind not null,
  value      text not null check (length(trim(value)) > 0),
  label      text not null,
  sort_order int  not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (kind, value)
);
comment on table public.taxonomy is 'Extensible reference values (E10-2): category, function, engagement_type.';

-- ── Profiles (mirror of auth.users + role/function) ──────────
create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  full_name             text not null,
  email                 citext not null unique,
  role                  public.user_role not null default 'field',
  function              text,                         -- FK to taxonomy(function) below
  function_kind         public.taxonomy_kind generated always as ('function') stored,
  manager_id            uuid references public.profiles (id) on delete set null,
  functional_manager_id uuid references public.profiles (id) on delete set null, -- E10-4 override
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  foreign key (function_kind, function) references public.taxonomy (kind, value)
);
comment on column public.profiles.functional_manager_id is
  'Overrides HR manager_id for Head team views when functional ≠ HR line (E10-4, §6.5).';

-- ── Stakeholders (the authoritative directory) ───────────────
create table public.stakeholders (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (length(trim(name)) > 0),
  category        text not null,
  category_kind   public.taxonomy_kind generated always as ('category') stored,
  function        text not null,
  function_kind   public.taxonomy_kind generated always as ('function') stored,
  tier            smallint not null check (tier in (1, 2)),
  owner_id        uuid not null references public.profiles (id) on delete restrict,
  risk            public.risk_level not null default 'low',
  sentiment       public.sentiment  not null default 'neutral',
  flagged         boolean not null default false,
  flag_reason     text,
  last_contact_at date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  foreign key (category_kind, category) references public.taxonomy (kind, value),
  foreign key (function_kind, function) references public.taxonomy (kind, value)
);
comment on table public.stakeholders is 'One authoritative, tiered record per stakeholder (E2).';

-- ── Engagements (the capture log) ────────────────────────────
create table public.engagements (
  id             uuid primary key default gen_random_uuid(),
  stakeholder_id uuid not null references public.stakeholders (id) on delete cascade,
  type           text not null,
  type_kind      public.taxonomy_kind generated always as ('engagement_type') stored,
  occurred_on    date not null default current_date,
  notes          text,
  logged_by      uuid not null references public.profiles (id) on delete restrict,
  created_at     timestamptz not null default now(),
  foreign key (type_kind, type) references public.taxonomy (kind, value)
);
comment on table public.engagements is 'Frictionless capture; each log refreshes the record (E3).';

-- ── Commitments (follow-through) ─────────────────────────────
create table public.commitments (
  id             uuid primary key default gen_random_uuid(),
  stakeholder_id uuid not null references public.stakeholders (id) on delete cascade,
  description    text not null check (length(trim(description)) > 0),
  due_date       date not null,
  priority       public.commitment_priority not null default 'low',
  status         public.commitment_status   not null default 'open',
  owner_id       uuid not null references public.profiles (id) on delete restrict,
  created_at     timestamptz not null default now(),
  completed_at   timestamptz
);
comment on table public.commitments is 'Promises to stakeholders, tracked and nudged (E7).';

-- ── Escalations (the workable queue) ─────────────────────────
create table public.escalations (
  id               uuid primary key default gen_random_uuid(),
  stakeholder_id   uuid not null references public.stakeholders (id) on delete cascade,
  status           public.escalation_status   not null default 'open',
  severity         public.escalation_severity not null default 'elevated',
  source           public.escalation_source   not null,
  summary          text,
  opened_at        timestamptz not null default now(),
  next_action_date date,
  assigned_to      uuid references public.profiles (id) on delete set null,
  resolved_at      timestamptz,
  -- At most one live escalation per stakeholder (E6-1 de-dup).
  is_active        boolean generated always as (status <> 'resolved') stored
);
comment on table public.escalations is 'High-risk/flagged items as an ordered lifecycle (E6).';
create unique index escalations_one_active_per_stakeholder
  on public.escalations (stakeholder_id)
  where (status <> 'resolved');

-- ── Stakeholder requests (field proposes → admin approves) ───
create table public.stakeholder_requests (
  id                   uuid primary key default gen_random_uuid(),
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
  foreign key (category_kind, category) references public.taxonomy (kind, value)
);
comment on table public.stakeholder_requests is 'Proposals into the master directory (E4-3 → E10-1).';

-- ── Indexes for scope/sort hot paths ─────────────────────────
create index stakeholders_function_idx   on public.stakeholders (function);
create index stakeholders_owner_idx       on public.stakeholders (owner_id);
create index stakeholders_risk_idx        on public.stakeholders (risk);
create index engagements_stakeholder_idx  on public.engagements (stakeholder_id, occurred_on desc);
create index commitments_owner_status_idx on public.commitments (owner_id, status, due_date);
create index commitments_due_idx          on public.commitments (due_date) where status = 'open';
create index escalations_stakeholder_idx  on public.escalations (stakeholder_id);
create index escalations_active_idx       on public.escalations (severity, opened_at) where status <> 'resolved';
create index profiles_function_idx        on public.profiles (function);

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
