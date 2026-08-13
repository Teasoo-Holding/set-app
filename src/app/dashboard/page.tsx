import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FunctionDashboard } from "@/components/FunctionDashboard";

const SEV_RANK = { critical: 0, elevated: 1 } as const;

export default async function HeadDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (getLandingPath(profile.role) !== "/dashboard") redirect(getLandingPath(profile.role));

  const supabase = createClient();
  const inAWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [
    { data: stakeholders },
    { data: escRows },
    { data: dueRows },
    { data: activity },
    { data: teamRows },
  ] = await Promise.all([
    // RLS scopes all of these to the Head's function.
    supabase.from("stakeholders").select("id, risk, sentiment, owner_id"),
    supabase
      .from("escalations")
      .select("id, severity, opened_at, stakeholder:stakeholders!escalations_stakeholder_id_fkey ( id, name, owner_id )")
      .neq("status", "resolved"),
    supabase
      .from("commitments")
      .select("id")
      .eq("status", "open")
      .gte("due_date", todayStr)
      .lte("due_date", inAWeek),
    supabase
      .from("recent_activity")
      .select("id, stakeholder_id, stakeholder_name, sentiment, engagement_type, occurred_on, note_excerpt")
      .limit(8),
    supabase
      .from("profiles")
      .select("id, full_name")
      .or(`manager_id.eq.${profile.id},functional_manager_id.eq.${profile.id}`),
  ]);

  const sh = (stakeholders as { id: string; risk: string; sentiment: string; owner_id: string }[]) ?? [];
  const total = sh.length;
  const supportive = sh.filter((s) => s.sentiment === "supportive").length;
  const neutral = sh.filter((s) => s.sentiment === "neutral").length;
  const resistant = sh.filter((s) => s.sentiment === "resistant").length;
  const highRisk = sh.filter((s) => s.risk === "high").length;

  const now = Date.now();
  const escalations = (
    (escRows as unknown as {
      id: string;
      severity: "critical" | "elevated";
      opened_at: string;
      stakeholder: { id: string; name: string; owner_id: string } | null;
    }[]) ?? []
  )
    .filter((e) => e.stakeholder !== null)
    .map((e) => ({
      id: e.id,
      severity: e.severity,
      stakeholderId: e.stakeholder!.id,
      stakeholderName: e.stakeholder!.name,
      ownerId: e.stakeholder!.owner_id,
      ageDays: Math.max(0, Math.floor((now - new Date(e.opened_at).getTime()) / 86_400_000)),
    }))
    .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity] || b.ageDays - a.ageDays);

  const team = ((teamRows as { id: string; full_name: string }[]) ?? []).map((m) => ({
    id: m.id,
    name: m.full_name,
    stakeholderCount: sh.filter((s) => s.owner_id === m.id).length,
    escalationCount: escalations.filter((e) => e.ownerId === m.id).length,
  }));

  return (
    <FunctionDashboard
      viewer={{ full_name: profile.full_name, role: profile.role, function: profile.function }}
      functionName={profile.function ?? "Function"}
      kpis={{
        highRisk,
        openEscalations: escalations.length,
        dueThisWeek: (dueRows as { id: string }[])?.length ?? 0,
        pctSupportive: total ? Math.round((supportive / total) * 100) : 0,
      }}
      mix={{ supportive, neutral, resistant, total }}
      team={team}
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
