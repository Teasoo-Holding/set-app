"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";
import { createAndSendInvite, DEFAULT_TAXONOMY } from "@/lib/invite";

/** Platform-admin gate. Service-role actions bypass RLS, so authorise here. */
async function requirePlatformAdmin() {
  const me = await getCurrentProfile();
  if (!me || me.role !== "platform_admin") {
    throw new Error("Only the platform administrator can do that.");
  }
  return me;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "tenant"
  );
}

export type TenantActionState = {
  error?: string;
  createdOrg?: string;
  emailed?: boolean;
  inviteLink?: string; // present only when the email couldn't be sent
} | null;

/**
 * E12-3 — provision a tenant: create the org, seed its default taxonomy, and
 * invite its first tenant admin. All via the service role, gated to platform
 * admins. Returns a result (never throws) so the console can show success, the
 * invite link if email isn't set up, or a clear error.
 */
export async function createTenant(_prev: TenantActionState, formData: FormData): Promise<TenantActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const adminEmail = String(formData.get("admin_email") ?? "").trim().toLowerCase();
  if (!name || !adminEmail) return { error: "Organisation name and admin email are both required." };

  try {
    const me = await requirePlatformAdmin();
    const db = createAdminClient();

    let slug = slugify(name);
    const { data: clash } = await db.from("tenants").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${randomSuffix()}`;

    const { data: tenant, error } = await db
      .from("tenants")
      .insert({ name, slug, created_by: me.id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const tenantId = (tenant as { id: string }).id;

    const { error: taxErr } = await db
      .from("taxonomy")
      .insert(DEFAULT_TAXONOMY.map((t) => ({ ...t, tenant_id: tenantId })));
    if (taxErr) throw new Error(taxErr.message);

    const { link, emailed } = await createAndSendInvite(db, {
      tenantId,
      orgName: name,
      email: adminEmail,
      role: "admin",
      func: null,
      invitedById: me.id,
      // Platform-provisioned invite — the email shouldn't name the operator.
      inviterName: null,
    });

    revalidatePath("/platform");
    return { createdOrg: name, emailed, inviteLink: emailed ? undefined : link };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create the organisation." };
  }
}

/** E12-3 — suspend or reactivate a tenant. Suspended tenants can't be used. */
export async function setTenantStatus(formData: FormData) {
  await requirePlatformAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["active", "suspended"].includes(status)) throw new Error("Invalid request.");

  const db = createAdminClient();
  const { error } = await db.from("tenants").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/platform");
}

/** E12-3 — re-send the first tenant admin's invite (new token). */
export async function reinviteTenantAdmin(formData: FormData) {
  const me = await requirePlatformAdmin();
  const tenantId = String(formData.get("tenant_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!tenantId || !email) throw new Error("Missing tenant or email.");

  const db = createAdminClient();
  await createAndSendInvite(db, {
    tenantId,
    orgName: name,
    email,
    role: "admin",
    func: null,
    invitedById: me.id,
    inviterName: null,
  });
  revalidatePath("/platform");
}

function randomSuffix(): string {
  return Math.floor(Date.now() % 1_000_000).toString(36);
}
