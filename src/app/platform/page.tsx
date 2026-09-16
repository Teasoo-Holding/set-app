import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PlatformConsole, type TenantRow, type PlatformAdminRow, type PlatformInviteRow } from "@/components/PlatformConsole";
import { SuspendedView } from "@/components/SuspendedView";

// One row per tenant from platform_tenant_stats() — aggregate COUNTS only,
// never stakeholder rows or content.
type StatRow = {
  tenant_id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  created_at: string;
  members_total: number;
  members_admin: number;
  members_leadership: number;
  members_head: number;
  members_field: number;
  pending_admin_email: string | null;
  invites_accepted: number;
  invites_pending: number;
  stakeholders: number;
  stakeholders_high_risk: number;
  stakeholders_flagged: number;
  stakeholders_negative: number;
  stakeholders_supportive: number;
  engagements_7d: number;
  engagements_30d: number;
  engagements_total: number;
  active_users_30d: number;
  last_activity_at: string | null;
  commitments_total: number;
  commitments_completed: number;
  open_commitments: number;
  escalations_total: number;
  escalations_resolved: number;
  open_escalations: number;
  escalations_critical: number;
};

type AdminStatRow = {
  id: string;
  full_name: string;
  email: string;
  is_platform_owner: boolean;
  deactivated_at: string | null;
  created_at: string;
};
type InviteStatRow = { id: string; email: string; created_at: string; expires_at: string };

export default async function PlatformPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/login");
  if (me.role !== "platform_admin") redirect(getLandingPath(me.role));

  // A deactivated platform admin is locked out of the console (the account is
  // also banned at the auth layer, so sign-in and token refresh already fail).
  if (me.deactivated_at) return <SuspendedView orgName="the platform team" />;

  const supabase = createClient();
  // Privileged aggregation in the DB (each function enforces platform-admin and
  // returns counts / admin facts only), so isolation holds and no tenant rows
  // reach the client.
  const [{ data }, { data: adminData }, { data: inviteData }] = await Promise.all([
    supabase.rpc("platform_tenant_stats"),
    supabase.rpc("platform_admins"),
    supabase.rpc("platform_admin_invites"),
  ]);

  const admins: PlatformAdminRow[] = ((adminData as AdminStatRow[] | null) ?? []).map((a) => ({
    id: a.id,
    name: a.full_name,
    email: a.email,
    isOwner: a.is_platform_owner,
    deactivated: a.deactivated_at !== null,
    createdAt: a.created_at,
  }));
  const platformInvites: PlatformInviteRow[] = ((inviteData as InviteStatRow[] | null) ?? []).map((i) => ({
    id: i.id,
    email: i.email,
    createdAt: i.created_at,
    expiresAt: i.expires_at,
  }));

  const rows: TenantRow[] = ((data as StatRow[] | null) ?? []).map((r) => ({
    id: r.tenant_id,
    name: r.name,
    slug: r.slug,
    status: r.status,
    createdAt: r.created_at,
    members: r.members_total,
    byRole: {
      admin: r.members_admin,
      leadership: r.members_leadership,
      head: r.members_head,
      field: r.members_field,
    },
    hasAdmin: r.members_admin > 0,
    pendingAdminEmail: r.pending_admin_email,
    invitesAccepted: r.invites_accepted,
    invitesPending: r.invites_pending,
    stakeholders: r.stakeholders,
    highRisk: r.stakeholders_high_risk,
    flagged: r.stakeholders_flagged,
    negative: r.stakeholders_negative,
    supportive: r.stakeholders_supportive,
    engagements7d: r.engagements_7d,
    engagements30d: r.engagements_30d,
    engagementsTotal: r.engagements_total,
    activeUsers30d: r.active_users_30d,
    lastActivityAt: r.last_activity_at,
    commitmentsTotal: r.commitments_total,
    commitmentsCompleted: r.commitments_completed,
    openCommitments: r.open_commitments,
    escalationsTotal: r.escalations_total,
    escalationsResolved: r.escalations_resolved,
    openEscalations: r.open_escalations,
    escalationsCritical: r.escalations_critical,
  }));

  return (
    <PlatformConsole
      viewer={{ full_name: me.full_name, id: me.id }}
      tenants={rows}
      admins={admins}
      platformInvites={platformInvites}
      sentryTestEnabled={process.env.SENTRY_TEST === "1"}
    />
  );
}
