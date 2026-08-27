import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LeadershipPortfolio } from "@/components/LeadershipPortfolio";

const SEV_RANK = { critical: 0, elevated: 1 } as const;

export default async function PortfolioPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (getLandingPath(profile.role) !== "/portfolio") redirect(getLandingPath(profile.role));

  const supabase = createClient();
  const inAWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [
    { data: stakeholders },
    { data: escRows },
    { data: dueRows },
    { data: activity },
    { data: fnSummary },
    { data: tenantRow },
    { data: memberRows },
  ] = await Promise.all([
    supabase.from("stakeholders").select("id, risk, sentiment"),
    supabase
      .from("escalations")
      .select("id, severity, opened_at, stakeholder:stakeholders!escalations_stakeholder_id_fkey ( id, name, function )")
      .neq("status", "resolved"),
    supabase.from("commitments").select("id").eq("status", "open").gte("due_date", todayStr).lte("due_date", inAWeek),
    supabase
      .from("recent_activity")
      .select("id, stakeholder_id, stakeholder_name, sentiment, engagement_type, occurred_on, note_excerpt")
      .limit(8),
    supabase.from("function_summary").select("function, stakeholders, high_risk, open_escalations, supportive"),
    profile.tenant_id ? supabase.from("tenants").select("name").eq("id", profile.tenant_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("profiles").select("id"),
  ]);

  const sh = (stakeholders as { id: string; risk: string; sentiment: string }[]) ?? [];
  const total = sh.length;
  const supportive = sh.filter((s) => s.sentiment === "supportive").length;
  const neutral = sh.filter((s) => s.sentiment === "neutral").length;
  const resistant = sh.filter((s) => s.sentiment === "resistant").length;

  const now = Date.now();
  const escalations = (
    (escRows as unknown as {
      id: string;
      severity: "critical" | "elevated";
      opened_at: string;
      stakeholder: { id: string; name: string; function: string } | null;
    }[]) ?? []
  )
    .filter((e) => e.stakeholder !== null)
    .map((e) => ({
      id: e.id,
      severity: e.severity,
      stakeholderId: e.stakeholder!.id,
      stakeholderName: e.stakeholder!.name,
      functionName: e.stakeholder!.function,
      ageDays: Math.max(0, Math.floor((now - new Date(e.opened_at).getTime()) / 86_400_000)),
    }))
    .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity] || b.ageDays - a.ageDays);

  const functions = (
    (fnSummary as {
      function: string;
      stakeholders: number;
      high_risk: number;
      open_escalations: number;
      supportive: number;
    }[]) ?? []
  )
    .map((f) => ({
      function: f.function,
      stakeholders: Number(f.stakeholders),
      highRisk: Number(f.high_risk),
      openEscalations: Number(f.open_escalations),
    }))
    .sort((a, b) => b.highRisk - a.highRisk || b.stakeholders - a.stakeholders);

  const onboarding = {
    orgName: (tenantRow as { name: string } | null)?.name ?? "your organisation",
    memberCount: (memberRows as { id: string }[] | null)?.length ?? 0,
    stakeholderCount: total,
    engagementCount: (activity as unknown[] | null)?.length ?? 0,
  };

  return (
    <LeadershipPortfolio
      viewer={{ full_name: profile.full_name, role: profile.role, function: profile.function }}
      onboarding={onboarding}
      kpis={{
        highRisk: sh.filter((s) => s.risk === "high").length,
        openEscalations: escalations.length,
        dueThisWeek: (dueRows as { id: string }[])?.length ?? 0,
        pctSupportive: total ? Math.round((supportive / total) * 100) : 0,
      }}
      mix={{ supportive, neutral, resistant, total }}
      functions={functions}
      escalations={escalations.slice(0, 5)}
      activity={
        (activity as unknown as {
          id: string;
          stakeholder_id: string;
          stakeholder_name: string;
          sentiment: "supportive" | "neutral" | "resistant";
          engagement_type: string;
          occurred_on: string;
          note_excerpt: string | null;
        }[]) ?? []
      }
    />
  );
}
