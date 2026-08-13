-- ─────────────────────────────────────────────────────────────
-- E7-2 · Idempotency log for commitment reminders. The reminder cron
-- (service role) records each send keyed on (commitment, type, date) so a
-- re-run or overlapping run can't double-send. System-owned: RLS on, no
-- client policies (closed to anon/authenticated); the service role bypasses.
-- ─────────────────────────────────────────────────────────────
create table public.reminder_sends (
  commitment_id uuid not null references public.commitments (id) on delete cascade,
  reminder_type text not null check (reminder_type in ('t-3', 't-0', 'overdue')),
  sent_for_date date not null,
  sent_at       timestamptz not null default now(),
  primary key (commitment_id, reminder_type, sent_for_date)
);

alter table public.reminder_sends enable row level security;
-- No policies ⇒ closed to clients. The reminder job uses the service role.
