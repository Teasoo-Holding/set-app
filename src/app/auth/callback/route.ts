import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLandingPath, type Role } from "@/lib/roles";

/**
 * Only allow same-site relative redirect targets — guards against an open
 * redirect via the `next` query param (CWE-601). Must start with a single "/"
 * and not "//" or "/\".
 */
function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

/**
 * Auth callback. Used by (a) the password-reset link and (b) Microsoft Entra
 * sign-in (#23, parked). Exchanges the one-time `code` for a session (the PKCE
 * verifier is read from the cookie set when the flow started), then forwards to
 * a safe `next` path if given, else the user's role home. On failure we bounce
 * back to /login with a readable message rather than a blank error.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  // Behind the Vercel proxy the request origin can be an internal host, so
  // prefer the forwarded host for the final user-facing redirect.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`;

  const bounce = (message: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(message)}`);

  if (oauthError) return bounce(oauthError);
  if (!code) return bounce("No authorization code was returned by Microsoft.");

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return bounce(error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return bounce("Sign-in didn't complete. Please try again.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as { role: Role; tenant_id: string | null } | null;

  // Invite-only: an OAuth sign-in (e.g. Google) that doesn't map to an onboarded,
  // tenant-scoped profile was never invited. Platform admins are the one
  // tenant-less role that's allowed. Anyone else is signed out, so social sign-in
  // never becomes an open sign-up.
  if (!p || (!p.tenant_id && p.role !== "platform_admin")) {
    await supabase.auth.signOut();
    return bounce("Access to Teasoo SET is by invitation. Ask your administrator to invite you.");
  }

  // A password-reset link carries next=/account/update-password → go set the
  // new password. Otherwise land on the role's home.
  if (next) return NextResponse.redirect(`${base}${next}`);

  return NextResponse.redirect(`${base}${getLandingPath(p.role)}`);
}
