import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getLandingPath, type Role } from "@/lib/roles";

/**
 * Only allow same-site relative redirect targets — guards against an open
 * redirect via the `next` query param (CWE-601).
 */
function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

const ALLOWED_TYPES: EmailOtpType[] = ["recovery", "invite", "signup", "magiclink", "email", "email_change"];

/**
 * Email-link confirmation via a one-time token hash (password reset, and any
 * other Supabase email link). Unlike the PKCE `code` flow in /auth/callback,
 * `verifyOtp` needs no device-bound code verifier, so the link works even when
 * it is opened on a *different* device from the one that requested it — which
 * is the normal case for password resets (request on desktop, open on phone).
 *
 * The Supabase email template must point here, e.g.:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/account/update-password
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  // Behind the Vercel proxy the request origin can be an internal host, so
  // prefer the forwarded host for the final user-facing redirect.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`;

  const bounce = (message: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(message)}`);

  if (!tokenHash || !type || !ALLOWED_TYPES.includes(type)) {
    return bounce("That link is invalid. Request a new one.");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    return bounce("That link has expired or was already used. Request a new one.");
  }

  // A password-reset link carries next=/account/update-password → set the new
  // password. Otherwise land on the user's role home.
  if (next) return NextResponse.redirect(`${base}${next}`);

  let role: Role = "field";
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = ((profile as { role: Role } | null)?.role ?? "field") as Role;
  }

  return NextResponse.redirect(`${base}${getLandingPath(role)}`);
}
