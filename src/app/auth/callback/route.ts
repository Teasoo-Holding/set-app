import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLandingPath, type Role } from "@/lib/roles";

/**
 * #23 — OAuth callback for Microsoft Entra sign-in. Microsoft (via Supabase)
 * returns here with a one-time `code`; we exchange it for a session (the
 * PKCE verifier is read from the cookie set when the flow started), then land
 * the user on their role's home. On failure we bounce back to /login with a
 * readable message rather than a blank error.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
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

  // Land on the role's home. A brand-new user is provisioned as 'field' by the
  // handle_new_user trigger; an Admin can adjust role/function afterwards.
  let role: Role = "field";
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = ((profile as { role: Role } | null)?.role ?? "field") as Role;
  }

  return NextResponse.redirect(`${base}${getLandingPath(role)}`);
}
