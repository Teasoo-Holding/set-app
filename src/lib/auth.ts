import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/roles";

export type { Profile, Role } from "@/lib/roles";
export { getLandingPath, ROLE_LABEL } from "@/lib/roles";

/** Current signed-in user's profile (role/function), or null. Server only. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, tenant_id, full_name, email, role, function")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}
