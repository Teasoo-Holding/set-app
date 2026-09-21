-- Let a requester edit or withdraw their own PENDING stakeholder request (#122).
--
-- Until now only an Admin could update a request (requests_admin_update) and
-- there was no delete policy, so a field user who proposed a stakeholder had no
-- way to fix a typo or cancel it. These two policies let the requester act on
-- their own row while it is still pending; once an Admin decides it (approved/
-- rejected) it is locked to them again. Admin policies are unchanged.
create policy requests_owner_update on public.stakeholder_requests
  for update using (
    tenant_id = public.current_tenant() and requested_by = auth.uid() and status = 'pending'
  ) with check (
    tenant_id = public.current_tenant() and requested_by = auth.uid() and status = 'pending'
  );

create policy requests_owner_delete on public.stakeholder_requests
  for delete using (
    tenant_id = public.current_tenant() and requested_by = auth.uid() and status = 'pending'
  );
