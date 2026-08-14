import "server-only";

import { randomBytes, createHash } from "crypto";
import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/brevo";
import { invitationEmail } from "@/lib/emails";
import { ROLE_LABEL, type Role } from "@/lib/roles";

export const INVITE_TTL_DAYS = 7;

/** SHA-256 hex of a token. We store only the hash; the raw token lives in the
 *  emailed link, so a database read can't reveal a usable invitation link. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newInviteToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

/** Site origin, honouring the Vercel proxy and an optional override. */
export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Default reference values seeded into a new tenant (E12-3). */
export const DEFAULT_TAXONOMY: { kind: string; value: string; label: string; sort_order: number }[] = [
  { kind: "category", value: "Regulator", label: "Regulator", sort_order: 1 },
  { kind: "category", value: "Government", label: "Government", sort_order: 2 },
  { kind: "category", value: "Community", label: "Community", sort_order: 3 },
  { kind: "category", value: "Commercial", label: "Commercial", sort_order: 4 },
  { kind: "function", value: "Corporate Affairs", label: "Corporate Affairs", sort_order: 1 },
  { kind: "function", value: "Sales", label: "Sales", sort_order: 2 },
  { kind: "function", value: "Regulatory", label: "Regulatory", sort_order: 3 },
  { kind: "function", value: "Supply Chain", label: "Supply Chain", sort_order: 4 },
  { kind: "engagement_type", value: "Virtual Meeting", label: "Virtual Meeting", sort_order: 1 },
  { kind: "engagement_type", value: "Physical Meeting", label: "Physical Meeting", sort_order: 2 },
  { kind: "engagement_type", value: "Call", label: "Call", sort_order: 3 },
  { kind: "engagement_type", value: "Email", label: "Email", sort_order: 4 },
  { kind: "engagement_type", value: "Site Visit", label: "Site Visit", sort_order: 5 },
  { kind: "engagement_type", value: "Event", label: "Event", sort_order: 6 },
];

/**
 * Create a pending invitation and email the recipient a one-time accept link.
 * Uses the passed service-role client (callers verify authorisation first).
 * Any existing pending invite for the same tenant+email is revoked first so the
 * one-pending-per-email index is satisfied and old links stop working.
 */
export async function createAndSendInvite(
  db: SupabaseClient,
  args: {
    tenantId: string;
    orgName: string;
    email: string;
    role: Role;
    func: string | null;
    invitedById: string;
    inviterName: string | null;
  },
): Promise<{ link: string; emailed: boolean }> {
  const { token, hash } = newInviteToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000).toISOString();

  await db
    .from("invitations")
    .update({ status: "revoked" })
    .eq("tenant_id", args.tenantId)
    .eq("email", args.email)
    .eq("status", "pending");

  const { error } = await db.from("invitations").insert({
    tenant_id: args.tenantId,
    email: args.email,
    role: args.role,
    function: args.func,
    token_hash: hash,
    invited_by: args.invitedById,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);

  const link = `${siteOrigin()}/invite/accept?token=${token}`;

  // Email is best-effort: a Brevo misconfiguration must NOT fail the invite.
  // The caller surfaces the link so onboarding works even before email is set up.
  let emailed = false;
  try {
    const res = await sendEmail({
      to: [{ email: args.email }],
      ...invitationEmail({
        orgName: args.orgName,
        roleLabel: ROLE_LABEL[args.role],
        inviterName: args.inviterName,
        link,
        expiresOn: expiresAt.slice(0, 10),
      }),
    });
    emailed = !res.skipped;
  } catch (e) {
    console.error("Invitation email failed to send:", e);
  }

  return { link, emailed };
}
