import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { RoleLanding } from "@/components/RoleLanding";

export default async function LeadershipPortfolio() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (getLandingPath(profile.role) !== "/portfolio") redirect(getLandingPath(profile.role));

  return (
    <RoleLanding
      profile={profile}
      title="Leadership portfolio"
      subtitle="Cross-function relationship risk and sentiment across the organisation."
    />
  );
}
