import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DirectoryView, type DirectoryRow } from "@/components/DirectoryView";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { function?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = createClient();
  const { data } = await supabase
    .from("stakeholders")
    .select(
      "id, name, category, function, tier, risk, sentiment, flagged, last_contact_at, notes, owner_id, owner:profiles!stakeholders_owner_id_fkey(full_name)",
    );

  const rows: DirectoryRow[] = (
    (data as unknown as (Omit<DirectoryRow, "ownerName"> & {
      owner: { full_name: string } | null;
    })[]) ?? []
  ).map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    function: s.function,
    tier: s.tier,
    risk: s.risk,
    sentiment: s.sentiment,
    flagged: s.flagged,
    last_contact_at: s.last_contact_at,
    notes: s.notes,
    ownerName: s.owner?.full_name ?? null,
    owner_id: s.owner_id,
  }));

  return (
    <DirectoryView
      profile={{ id: profile.id, full_name: profile.full_name, role: profile.role, function: profile.function }}
      rows={rows}
      initialFunction={searchParams.function ?? null}
    />
  );
}
