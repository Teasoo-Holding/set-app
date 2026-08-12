import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { RoleLanding } from "@/components/RoleLanding";

export default async function FieldHome() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (getLandingPath(profile.role) !== "/home") redirect(getLandingPath(profile.role));

  return (
    <RoleLanding
      profile={profile}
      title={`Good day, ${profile.full_name.split(" ")[0]}`}
      subtitle="Your stakeholders and your capture, in one place."
    />
  );
}
