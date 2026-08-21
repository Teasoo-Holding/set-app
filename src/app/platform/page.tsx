import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PlatformConsole, type TenantRow } from "@/components/PlatformConsole";

export default async function PlatformPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/login");
  if (me.role !== "platform_admin") redirect(getLandingPath(me.role));

  const supabase = createClient();
  const [{ data: tenants }, { data: profiles }, { data: invites }] = await Promise.all([
    supabase.from("tenants").select("id, name, slug, status, created_at").order("created_at", { ascending: false }),
    supabase.from("profiles").select("tenant_id, role"),
    supabase
      .from("invitations")
      .select("tenant_id, email")
      .eq("role", "admin")
      .eq("status", "pending"),
  ]);

  const members = new Map<string, number>();
  const admins = new Map<string, number>();
  for (const p of (profiles as { tenant_id: string | null; role: string }[]) ?? []) {
    if (!p.tenant_id) continue;
    members.set(p.tenant_id, (members.get(p.tenant_id) ?? 0) + 1);
    if (p.role === "admin") admins.set(p.tenant_id, (admins.get(p.tenant_id) ?? 0) + 1);
  }
  const pendingAdmin = new Map<string, string>();
  for (const i of (invites as { tenant_id: string; email: string }[]) ?? []) {
    if (!pendingAdmin.has(i.tenant_id)) pendingAdmin.set(i.tenant_id, i.email);
  }

  const rows: TenantRow[] = ((tenants as {
    id: string; name: string; slug: string; status: "active" | "suspended"; created_at: string;
  }[]) ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    createdAt: t.created_at,
    members: members.get(t.id) ?? 0,
    hasAdmin: (admins.get(t.id) ?? 0) > 0,
    pendingAdminEmail: pendingAdmin.get(t.id) ?? null,
  }));

  return (
    <PlatformConsole
      viewer={{ full_name: me.full_name }}
      tenants={rows}
      sentryTestEnabled={process.env.SENTRY_TEST === "1"}
    />
  );
}
