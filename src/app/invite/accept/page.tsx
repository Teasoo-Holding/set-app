import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/invite";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import { AcceptInviteForm, AcceptInviteInvalid } from "@/components/AcceptInviteForm";

/**
 * E12-5 — public invite-accept page. Validates the one-time token via the
 * service role (the invitee has no session yet) and renders the set-password
 * form, or an "invalid/expired" message.
 */
export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams?: { token?: string; error?: string };
}) {
  const token = searchParams?.token;
  if (!token) return <AcceptInviteInvalid reason="This invitation link is missing its token." />;

  const db = createAdminClient();
  const { data } = await db
    .from("invitations")
    .select("email, role, status, expires_at, tenant:tenants!invitations_tenant_id_fkey ( name )")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  const inv = data as
    | { email: string; role: Role; status: string; expires_at: string; tenant: { name: string } | null }
    | null;

  if (!inv || inv.status !== "pending" || new Date(inv.expires_at) < new Date()) {
    return (
      <AcceptInviteInvalid reason="This invitation is no longer valid. It may have been used, revoked, or expired. Ask whoever invited you for a new link." />
    );
  }

  return (
    <AcceptInviteForm
      token={token}
      email={inv.email}
      orgName={inv.tenant?.name ?? "your organisation"}
      roleLabel={ROLE_LABEL[inv.role]}
      error={searchParams?.error}
    />
  );
}
