import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PlatformConsole, type TenantRow } from "@/components/PlatformConsole";

// One row per tenant returned by the platform_tenant_stats() SECURITY DEFINER
// function — aggregate counts only, never stakeholder rows or content.
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
  stakeholders: number;
  engagements_30d: number;
  open_commitments: number;
  open_escalations: number;
};

export default async function PlatformPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/login");
  if (me.role !== "platform_admin") redirect(getLandingPath(me.role));

  const supabase = createClient();
  // Privileged aggregation in the DB (the function enforces platform-admin, and
  // returns counts only), so isolation holds and no tenant rows reach the client.
  const { data } = await supabase.rpc("platform_tenant_stats");

  const rows: TenantRow[] = ((data as StatRow[] | null) ?? []).map((r) => ({
    id: r.tenant_id,
    name: r.name,
    slug: r.slug,
    status: r.status,
    createdAt: r.created_at,
    members: r.members_total,
    hasAdmin: r.members_admin > 0,
    pendingAdminEmail: r.pending_admin_email,
    byRole: {
      admin: r.members_admin,
      leadership: r.members_leadership,
      head: r.members_head,
      field: r.members_field,
    },
    stakeholders: r.stakeholders,
    engagements30d: r.engagements_30d,
    openCommitments: r.open_commitments,
    openEscalations: r.open_escalations,
  }));

  return (
    <PlatformConsole
      viewer={{ full_name: me.full_name }}
      tenants={rows}
      sentryTestEnabled={process.env.SENTRY_TEST === "1"}
    />
  );
}
