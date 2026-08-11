import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVICE-ROLE Supabase client. Bypasses RLS entirely — use ONLY in
 * system-owned server logic (scheduled reminder jobs, admin migrations),
 * never in response to an untrusted request. The `server-only` import above
 * makes bundling this into client code a build error.
 *
 * The service-role key is the highest-value secret in the system
 * (Technical Architecture §8). It is server-only and never NEXT_PUBLIC_.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
