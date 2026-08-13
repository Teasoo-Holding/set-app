import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FieldHome } from "@/components/FieldHome";
import type { StakeholderSummary } from "@/components/StakeholderCard";

export default async function FieldHomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  // Only field users land here; other roles route to their own landing.
  if (getLandingPath(profile.role) !== "/home") redirect(getLandingPath(profile.role));

  const supabase = createClient();
  const [{ data: mine }, { data: commits }, { data: typeRows }, { data: catRows }] =
    await Promise.all([
      supabase
        .from("stakeholders")
        .select("id, name, function, category, tier, risk, sentiment, flagged")
        .eq("owner_id", profile.id),
      supabase
        .from("commitments")
        .select(
          "id, description, due_date, priority, stakeholder:stakeholders!commitments_stakeholder_id_fkey ( id, name )",
        )
        .eq("owner_id", profile.id)
        .eq("status", "open")
        .order("due_date", { ascending: true }),
      supabase
        .from("taxonomy")
        .select("value")
        .eq("kind", "engagement_type")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("taxonomy")
        .select("value")
        .eq("kind", "category")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

  const myStakeholders = (mine as StakeholderSummary[] | null) ?? [];

  const commitments = (
    (commits as unknown as {
      id: string;
      description: string;
      due_date: string;
      priority: "high" | "low";
      stakeholder: { id: string; name: string } | null;
    }[]) ?? []
  )
    .filter((c) => c.stakeholder !== null)
    .map((c) => ({
      id: c.id,
      description: c.description,
      due_date: c.due_date,
      priority: c.priority,
      stakeholderId: c.stakeholder!.id,
      stakeholderName: c.stakeholder!.name,
    }));

  const types = ((typeRows as { value: string }[] | null) ?? []).map((t) => t.value);
  const categories = ((catRows as { value: string }[] | null) ?? []).map((t) => t.value);
  const today = new Date().toISOString().slice(0, 10);
  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <FieldHome
      viewer={{ full_name: profile.full_name, role: profile.role, function: profile.function }}
      dateLabel={dateLabel}
      myStakeholders={myStakeholders}
      commitments={commitments}
      types={types}
      categories={categories}
      today={today}
    />
  );
}
