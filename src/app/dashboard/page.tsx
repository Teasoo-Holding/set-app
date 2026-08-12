import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { RoleLanding } from "@/components/RoleLanding";

export default async function HeadDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (getLandingPath(profile.role) !== "/dashboard") redirect(getLandingPath(profile.role));

  return (
    <RoleLanding
      profile={profile}
      title={`${profile.function ?? "Function"} dashboard`}
      subtitle="Your function's stakeholders, risk, and team at a glance."
    />
  );
}
