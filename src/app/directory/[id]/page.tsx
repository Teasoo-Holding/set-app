import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileView, type StakeholderProfile } from "@/components/ProfileView";

export default async function StakeholderProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = createClient();

  const { data: s } = await supabase
    .from("stakeholders")
    .select(
      "id, name, category, function, tier, risk, sentiment, flagged, flag_reason, last_contact_at, notes, owner:profiles!stakeholders_owner_id_fkey(full_name)",
    )
    .eq("id", params.id)
    .maybeSingle();

  // Not found OR out of RLS scope → 404 (the DB simply returns no row).
  if (!s) notFound();

  const [{ data: engagements }, { data: commitments }, { data: escalation }] =
    await Promise.all([
      supabase
        .from("engagements")
        .select(
          "id, type, occurred_on, notes, logger:profiles!engagements_logged_by_fkey(full_name)",
        )
        .eq("stakeholder_id", params.id)
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("commitments")
        .select("id, description, due_date, priority, status")
        .eq("stakeholder_id", params.id)
        .eq("status", "open")
        .order("due_date", { ascending: true }),
      supabase
        .from("escalations")
        .select("id, severity, status, summary, opened_at, next_action_date")
        .eq("stakeholder_id", params.id)
        .neq("status", "resolved")
        .maybeSingle(),
    ]);

  const data = s as unknown as {
    owner: { full_name: string } | null;
  } & Omit<StakeholderProfile, "ownerName">;

  const model: StakeholderProfile = {
    id: data.id,
    name: data.name,
    category: data.category,
    function: data.function,
    tier: data.tier,
    risk: data.risk,
    sentiment: data.sentiment,
    flagged: data.flagged,
    flag_reason: data.flag_reason,
    last_contact_at: data.last_contact_at,
    notes: data.notes,
    ownerName: data.owner?.full_name ?? null,
  };

  return (
    <ProfileView
      viewer={{ full_name: profile.full_name, role: profile.role, function: profile.function }}
      stakeholder={model}
      engagements={
        (engagements as unknown as {
          id: string;
          type: string;
          occurred_on: string;
          notes: string | null;
          logger: { full_name: string } | null;
        }[]) ?? []
      }
      commitments={
        (commitments as unknown as {
          id: string;
          description: string;
          due_date: string;
          priority: "high" | "low";
          status: string;
        }[]) ?? []
      }
      escalation={
        (escalation as unknown as {
          id: string;
          severity: "elevated" | "critical";
          status: string;
          summary: string | null;
          opened_at: string;
          next_action_date: string | null;
        } | null) ?? null
      }
    />
  );
}
