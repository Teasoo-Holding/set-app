import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EscalationsBoard, type EscalationItem } from "@/components/EscalationsBoard";

const SEV_RANK = { critical: 0, elevated: 1 } as const;

export default async function EscalationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = createClient();
  const { data } = await supabase
    .from("escalations")
    .select(
      "id, status, severity, source, summary, opened_at, next_action_date, assigned_to, " +
        "stakeholder:stakeholders!escalations_stakeholder_id_fkey ( id, name, tier, function, risk, sentiment, owner:profiles!stakeholders_owner_id_fkey ( full_name ) ), " +
        "assignee:profiles!escalations_assigned_to_fkey ( full_name )",
    )
    .neq("status", "resolved");

  type Raw = {
    id: string;
    status: EscalationItem["status"];
    severity: "critical" | "elevated";
    source: string;
    summary: string | null;
    opened_at: string;
    next_action_date: string | null;
    assigned_to: string | null;
    stakeholder: {
      id: string;
      name: string;
      tier: number;
      function: string;
      risk: "low" | "medium" | "high";
      sentiment: "supportive" | "neutral" | "resistant";
      owner: { full_name: string } | null;
    } | null;
    assignee: { full_name: string } | null;
  };

  const now = Date.now();
  const items: EscalationItem[] = ((data as unknown as Raw[]) ?? [])
    .filter((e) => e.stakeholder !== null)
    .map((e) => {
      const s = e.stakeholder!;
      const ageDays = Math.max(
        0,
        Math.floor((now - new Date(e.opened_at).getTime()) / 86_400_000),
      );
      return {
        id: e.id,
        status: e.status,
        severity: e.severity,
        summary: e.summary,
        nextActionDate: e.next_action_date,
        ageDays,
        stakeholderId: s.id,
        stakeholderName: s.name,
        tier: s.tier,
        function: s.function,
        risk: s.risk,
        sentiment: s.sentiment,
        ownerName: s.owner?.full_name ?? null,
        assigneeName: e.assignee?.full_name ?? null,
      };
    })
    .sort((a, b) => {
      const sev = SEV_RANK[a.severity] - SEV_RANK[b.severity];
      if (sev !== 0) return sev;
      if (b.ageDays !== a.ageDays) return b.ageDays - a.ageDays; // oldest first
      return a.stakeholderName.localeCompare(b.stakeholderName);
    });

  const counts = {
    critical: items.filter((i) => i.severity === "critical").length,
    elevated: items.filter((i) => i.severity === "elevated").length,
    total: items.length,
  };

  const canManage =
    profile.role === "head" || profile.role === "leadership" || profile.role === "admin";

  return (
    <EscalationsBoard
      viewer={{ full_name: profile.full_name, role: profile.role, function: profile.function }}
      items={items}
      counts={counts}
      canManage={canManage}
    />
  );
}
