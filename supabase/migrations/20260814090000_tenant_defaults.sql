-- ─────────────────────────────────────────────────────────────
-- E12 · Default tenant_id to the caller's tenant on the tables that end-users
-- insert into. This runs after the rls migration (where current_tenant() is
-- defined). Effect:
--   • App server actions can insert without threading tenant_id everywhere;
--     the DB stamps the caller's tenant automatically.
--   • Defense-in-depth: even a forgetful insert lands in the right tenant, and
--     RLS WITH CHECK (tenant_id = current_tenant()) still rejects any mismatch.
--   • Trusted server contexts (service role: seed, cron, invite-accept) have
--     auth.uid() null ⇒ current_tenant() is null, so they must (and do) pass
--     tenant_id explicitly.
-- ─────────────────────────────────────────────────────────────
alter table public.stakeholders         alter column tenant_id set default public.current_tenant();
alter table public.engagements          alter column tenant_id set default public.current_tenant();
alter table public.commitments          alter column tenant_id set default public.current_tenant();
alter table public.stakeholder_requests alter column tenant_id set default public.current_tenant();
alter table public.taxonomy             alter column tenant_id set default public.current_tenant();
