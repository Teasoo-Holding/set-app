"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";
import { createAndSendInvite } from "@/lib/invite";

// Deactivating bans the auth user for ~100 years (blocks sign-in and token
// refresh); reactivating clears the ban. Kept here so the two actions agree.
const BAN_FOREVER = "876000h";

/** Platform-admin gate. Service-role actions bypass RLS, so authorise here — and
 *  a deactivated admin (should already be locked out) can never act. */
async function requireActivePlatformAdmin() {
  const me = await getCurrentProfile();
  if (!me || me.role !== "platform_admin" || me.deactivated_at) {
    throw new Error("Only an active platform administrator can do that.");
  }
  return me;
}

export type PlatformInviteState = {
  error?: string;
  invitedEmail?: string;
  emailed?: boolean;
  inviteLink?: string; // present only when the email couldn't be sent
} | null;

/**
 * Invite another platform admin by email. The invitee sets their own password
 * from the emailed link (same flow as tenant invites); the account is created
 * with the platform_admin role and no tenant. Access stays invite-only.
 */
export async function invitePlatformAdmin(
  _prev: PlatformInviteState,
  formData: FormData,
): Promise<PlatformInviteState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "An email address is required." };

  try {
    const me = await requireActivePlatformAdmin();
    const db = createAdminClient();

    // Don't invite someone who is already a platform admin.
    const { data: existing } = await db
      .from("profiles")
      .select("id")
      .eq("email", email)
      .eq("role", "platform_admin")
      .maybeSingle();
    if (existing) return { error: "That person is already a platform administrator." };

    const { link, emailed } = await createAndSendInvite(db, {
      tenantId: null,
      orgName: "Teasoo SET",
      email,
      role: "platform_admin",
      func: null,
      invitedById: me.id,
      inviterName: me.full_name,
    });
    revalidatePath("/platform");
    return { invitedEmail: email, emailed, inviteLink: emailed ? undefined : link };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not send the invitation." };
  }
}

/**
 * Deactivate or reactivate another platform admin. The super admin
 * (is_platform_owner) and your own account are protected. Deactivating bans the
 * auth user (blocking sign-in and token refresh) and stamps deactivated_at;
 * reactivating reverses both.
 */
export async function setPlatformAdminActive(formData: FormData) {
  const me = await requireActivePlatformAdmin();
  const id = String(formData.get("id") ?? "");
  // The desired resulting state: "true" = active (reactivate), else deactivate.
  const active = String(formData.get("active")) === "true";
  if (!id) throw new Error("Missing account id.");
  if (id === me.id) throw new Error("You can't change your own access.");

  const db = createAdminClient();
  const { data: t } = await db
    .from("profiles")
    .select("role, is_platform_owner")
    .eq("id", id)
    .maybeSingle();
  const target = t as { role: string; is_platform_owner: boolean } | null;
  if (!target || target.role !== "platform_admin") {
    throw new Error("That account isn't a platform administrator.");
  }
  if (target.is_platform_owner) throw new Error("The super administrator can't be deactivated.");

  const { error: banErr } = await db.auth.admin.updateUserById(id, {
    ban_duration: active ? "none" : BAN_FOREVER,
  });
  if (banErr) throw new Error(banErr.message);

  const { error } = await db
    .from("profiles")
    .update({ deactivated_at: active ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/platform");
}
