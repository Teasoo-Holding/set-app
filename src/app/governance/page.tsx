import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { RoleLanding } from "@/components/RoleLanding";

export default async function Governance() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (getLandingPath(profile.role) !== "/governance") redirect(getLandingPath(profile.role));

  return (
    <RoleLanding
      profile={profile}
      title="Governance & administration"
      subtitle="The full directory and system configuration."
    />
  );
}
