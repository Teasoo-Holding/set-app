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
      "id, name, category, function, tier, risk, sentiment, flagged, flag_reason, last_contact_at, notes, owner_id, owner:profiles!stakeholders_owner_id_fkey(full_name)",
    )
    .eq("id", params.id)
    .maybeSingle();

  // Not found OR out of RLS scope → 404 (the DB simply returns no row).
  if (!s) notFound();

  // Who may edit this stakeholder — mirrors the stakeholders_update RLS policy.
  const sFn = (s as { function: string }).function;
  const sOwner = (s as { owner_id: string }).owner_id;
  const canEdit =
    profile.role === "leadership" ||
    profile.role === "admin" ||
    (profile.role === "head" && profile.function === sFn) ||
    sOwner === profile.id;

  // Owner options for per-stakeholder reassignment (#120). Only Head/Leadership/
  // Admin may reassign; RLS scopes which profiles they can see (a Head sees their
  // own function, Leadership/Admin the whole tenant), so this list is safe as-is.
  const canReassign =
    profile.role === "leadership" || profile.role === "admin" ||
    (profile.role === "head" && profile.function === sFn);

  const [{ data: engagements }, { data: commitments }, { data: escalation }, { data: typeRows }, { data: ownerRows }] =
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
      supabase
        .from("taxonomy")
        .select("value")
        .eq("kind", "engagement_type")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      canReassign
        ? supabase.from("profiles").select("id, full_name").order("full_name", { ascending: true })
        : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
    ]);

  const types = ((typeRows as { value: string }[] | null) ?? []).map((t) => t.value);
  const today = new Date().toISOString().slice(0, 10);

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
    owner_id: data.owner_id,
    ownerName: data.owner?.full_name ?? null,
  };

  const owners = ((ownerRows as { id: string; full_name: string }[] | null) ?? []).map((o) => ({
    id: o.id,
    name: o.full_name,
  }));

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
      types={types}
      today={today}
      canEdit={canEdit}
      canReassign={canReassign}
      owners={owners}
    />
  );
}
