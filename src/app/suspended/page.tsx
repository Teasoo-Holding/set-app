import { createClient } from "@/lib/supabase/server";
import { SuspendedView } from "@/components/SuspendedView";

/**
 * Shown to members of a suspended organisation (the middleware routes them here).
 * A dignified "access paused" message with a way out.
 */
export default async function SuspendedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let orgName = "your organisation";
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("tenant:tenants!profiles_tenant_id_fkey ( name )")
      .eq("id", user.id)
      .maybeSingle();
    orgName = (data as { tenant: { name: string } | null } | null)?.tenant?.name ?? orgName;
  }
  return <SuspendedView orgName={orgName} />;
}
