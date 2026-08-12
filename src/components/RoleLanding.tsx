import { createClient } from "@/lib/supabase/server";
import { LandingView } from "@/components/LandingView";
import type { StakeholderRow } from "@/components/StakeholderTable";
import type { Profile } from "@/lib/roles";

const RISK_RANK = { high: 3, medium: 2, low: 1 } as const;

/**
 * Server data-fetch for the authenticated landing. The stakeholder query
 * runs through the signed-in user's session, so the rows returned are
 * exactly what RLS permits — this list IS the E1-3 proof, live. Presentation
 * is delegated to the client <LandingView> (Fluent can't render on the server).
 */
export async function RoleLanding({
  profile,
  title,
  subtitle,
}: {
  profile: Profile;
  title: string;
  subtitle: string;
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("stakeholders")
    .select("id, name, function, category, tier, risk, sentiment, flagged");

  const rows = ((data as StakeholderRow[] | null) ?? []).sort(
    (a, b) =>
      RISK_RANK[b.risk] - RISK_RANK[a.risk] || a.name.localeCompare(b.name),
  );

  return (
    <LandingView
      name={profile.full_name}
      role={profile.role}
      func={profile.function}
      title={title}
      subtitle={subtitle}
      rows={rows}
    />
  );
}
