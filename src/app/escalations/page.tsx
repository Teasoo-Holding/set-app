import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { ComingSoon } from "@/components/ComingSoon";

export default async function EscalationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <ComingSoon
      profile={{ full_name: profile.full_name, role: profile.role, function: profile.function }}
      active="escalations"
      title="Escalations"
      subtitle="High-risk and flagged stakeholders as an ordered, workable queue."
      epic="E6"
    />
  );
}
