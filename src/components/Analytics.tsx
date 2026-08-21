import { getCurrentProfile } from "@/lib/auth";
import { AnalyticsIdentify } from "@/components/AnalyticsIdentify";

/**
 * Server wrapper that reads the signed-in profile and hands only its UUIDs
 * (user id + tenant id) and role to the client for pseudonymous PostHog
 * identify. Renders nothing for signed-out visitors.
 */
export async function Analytics() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  return <AnalyticsIdentify userId={profile.id} tenantId={profile.tenant_id} role={profile.role} />;
}
