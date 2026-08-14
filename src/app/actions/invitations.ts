"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { createAndSendInvite, hashToken } from "@/lib/invite";
import { getLandingPath, type Role } from "@/lib/roles";

const TENANT_ROLES: Role[] = ["field", "head", "leadership", "admin"];
const MIN_PASSWORD = 8;

/**
 * E12-4/E12-6 — a tenant admin invites a teammate (role + function). Gated to
 * the caller's own tenant; the invitee joins only via the emailed link.
 */
export async function inviteUser(formData: FormData) {
  const me = await getCurrentProfile();
  if (!me || me.role !== "admin" || !me.tenant_id) {
    throw new Error("Only a tenant administrator can invite people.");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as Role;
  const func = String(formData.get("function") ?? "").trim() || null;
  if (!email || !TENANT_ROLES.includes(role)) throw new Error("A valid email and role are required.");
  if ((role === "field" || role === "head") && !func) {
    throw new Error("Choose a function for a standard user or function head.");
  }

  const db = createAdminClient();
  const { data: t } = await db.from("tenants").select("name").eq("id", me.tenant_id).single();

  await createAndSendInvite(db, {
    tenantId: me.tenant_id,
    orgName: (t as { name: string } | null)?.name ?? "your organisation",
    email,
    role,
    func: role === "admin" || role === "leadership" ? null : func,
    invitedById: me.id,
    inviterName: me.full_name,
  });
  revalidatePath("/governance");
}

/** E12-4 — revoke a pending invitation (tenant admin: own tenant; platform admin: any). */
export async function revokeInvite(formData: FormData) {
  const me = await getCurrentProfile();
  if (!me || (me.role !== "admin" && me.role !== "platform_admin")) {
    throw new Error("Not authorised.");
  }
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing invitation id.");

  const db = createAdminClient();
  let q = db.from("invitations").update({ status: "revoked" }).eq("id", id).eq("status", "pending");
  if (me.role === "admin") q = q.eq("tenant_id", me.tenant_id);
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath("/governance");
  revalidatePath("/platform");
}

/**
 * E12-5 — accept an invitation: validate the token, create the account bound to
 * the invitation's tenant + role, and sign the user in. Runs via the service
 * role (the invitee has no session yet); the token is the authorisation.
 */
export async function acceptInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fail = (msg: string) =>
    redirect(`/invite/accept?token=${encodeURIComponent(token)}&error=${encodeURIComponent(msg)}`);

  if (!token) redirect(`/login?error=${encodeURIComponent("That invitation link is invalid.")}`);
  if (!fullName) fail("Enter your full name.");
  if (password.length < MIN_PASSWORD) fail(`Choose a password of at least ${MIN_PASSWORD} characters.`);

  const db = createAdminClient();
  const { data: inv } = await db
    .from("invitations")
    .select("id, tenant_id, email, role, function, status, expires_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  const invite = inv as {
    id: string; tenant_id: string; email: string; role: Role;
    function: string | null; status: string; expires_at: string;
  } | null;

  if (!invite || invite.status !== "pending") fail("This invitation is no longer valid. Ask for a new one.");
  if (new Date(invite!.expires_at) < new Date()) fail("This invitation has expired. Ask for a new one.");

  const { data: created, error: cErr } = await db.auth.admin.createUser({
    email: invite!.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let uid: string;
  if (created?.user) {
    uid = created.user.id;
  } else {
    // createUser failed. If an account already exists for this email but has no
    // tenant yet (e.g. a half-finished earlier attempt), adopt it and set the
    // password. If it already belongs to a tenant, they should just sign in.
    const { data: existing } = await db
      .from("profiles")
      .select("id, tenant_id")
      .eq("email", invite!.email)
      .maybeSingle();
    const ex = existing as { id: string; tenant_id: string | null } | null;

    if (ex && ex.tenant_id) {
      return fail("An account for this email already exists. Please sign in instead.");
    }
    if (ex && !ex.tenant_id) {
      uid = ex.id;
      const { error: upErr } = await db.auth.admin.updateUserById(uid, {
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (upErr) return fail("We couldn't finish setting up your account. Ask for a new invitation.");
    } else {
      console.error("acceptInvite createUser failed:", cErr?.message);
      return fail(
        cErr?.message
          ? `We couldn't create your account: ${cErr.message}`
          : "We couldn't create your account. Ask for a new invitation.",
      );
    }
  }

  // handle_new_user created a tenant-less profile; bind it to the invitation.
  const { error: pErr } = await db.from("profiles").upsert({
    id: uid,
    tenant_id: invite!.tenant_id,
    email: invite!.email,
    full_name: fullName,
    role: invite!.role,
    function: invite!.function,
  });
  if (pErr) return fail("We couldn't finish setting up your account. Ask for a new invitation.");

  await db
    .from("invitations")
    .update({ status: "accepted", accepted_by: uid, accepted_at: new Date().toISOString() })
    .eq("id", invite!.id);

  const supabase = createClient();
  const { error: sErr } = await supabase.auth.signInWithPassword({ email: invite!.email, password });
  if (sErr) redirect(`/login?message=${encodeURIComponent("Account created. Please sign in.")}`);

  redirect(getLandingPath(invite!.role));
}
