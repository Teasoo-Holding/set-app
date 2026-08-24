"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USERS, getLandingPath, type Role } from "@/lib/roles";

const MIN_PASSWORD = 8;

/** The site origin, honouring the Vercel proxy and a configured override. */
function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return requestOrigin();
}

/**
 * The origin of the CURRENT request (never the configured site URL). OAuth must
 * return to the exact domain the flow started on — the PKCE code-verifier cookie
 * is scoped to that domain, so a preview deploy must come back to itself, not to
 * production. Used only for the OAuth redirectTo.
 */
function requestOrigin(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

type SupabaseServerClient = ReturnType<typeof createClient>;

/** Where the just-authenticated user should land, based on their profile role. */
async function landingForSession(supabase: SupabaseServerClient): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/login";
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return getLandingPath(((data as { role: Role } | null)?.role ?? "field"));
}

/**
 * Email + password sign-in. Identity is established by Supabase Auth; the
 * resulting session is a real one, so RLS scopes every later query. Wrong
 * credentials return a single generic message (no account-enumeration).
 */
export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect(`/login?mode=signin&error=${encodeURIComponent("Enter your email and password.")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = /confirm/i.test(error.message)
      ? "Confirm your email first. Check your inbox for the link we sent."
      : "That email and password don't match an account. Try again, or reset your password below.";
    redirect(`/login?mode=signin&error=${encodeURIComponent(msg)}`);
  }
  redirect(await landingForSession(supabase));
}

/**
 * Open sign-up is disabled — accounts are created by invitation only (E12).
 * Kept as a safety net in case anything still posts here.
 */
export async function signUpNewAccount() {
  redirect(
    `/login?error=${encodeURIComponent("Accounts are created by invitation. Ask your administrator to invite you.")}`,
  );
}

/**
 * Start a password reset. Always reports the same message regardless of whether
 * the email exists (no account-enumeration). The link lands on /auth/callback,
 * which establishes a short-lived session then forwards to the set-password page.
 */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    redirect(`/login?mode=forgot&error=${encodeURIComponent("Enter your email.")}`);
  }

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin()}/auth/callback?next=/account/update-password`,
  });
  redirect(
    `/login?mode=signin&message=${encodeURIComponent("If that email has an account, we've sent a link to reset your password.")}`,
  );
}

/** Set a new password for the user in the current (recovery) session. */
export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    redirect(`/account/update-password?error=${encodeURIComponent(`Choose a password of at least ${MIN_PASSWORD} characters.`)}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Your reset link has expired. Request a new one.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/account/update-password?error=${encodeURIComponent(error.message)}`);
  }
  redirect(await landingForSession(supabase));
}

/**
 * #23 — Production sign-in with Microsoft Entra ID via Supabase's Azure OIDC
 * provider (no paid SAML tier). Starts the PKCE flow server-side: Supabase
 * returns the Microsoft authorize URL and stashes the code verifier in a
 * cookie; we redirect the browser there. Microsoft returns to /auth/callback.
 */
export async function signInWithMicrosoft() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      redirectTo: `${requestOrigin()}/auth/callback`,
      scopes: "openid email profile",
    },
  });
  if (error || !data?.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Could not start Microsoft sign-in.")}`);
  }
  redirect(data.url);
}

/**
 * Sign in with Google via Supabase's Google OAuth provider. Starts the PKCE
 * flow server-side (Supabase stashes the code verifier in a cookie) and
 * redirects to Google. Google returns to /auth/callback, which enforces
 * invite-only access — an OAuth user with no onboarded (tenant) profile is
 * signed out, so this never becomes an open sign-up.
 */
export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${requestOrigin()}/auth/callback`,
    },
  });
  if (error || !data?.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Could not start Google sign-in.")}`);
  }
  redirect(data.url);
}

/**
 * Demo sign-in (E1-4). Signs in as one of the seeded demo users using a
 * server-only shared password. Gated by DEMO_MODE so it is absent in a
 * real deployment (where sign-in is SSO / magic-link only).
 *
 * This is deliberately a low-friction demo affordance over REAL sessions:
 * the resulting auth.uid() is genuine, so RLS scopes every subsequent
 * query exactly as it would for a real user.
 */
export async function signInAsDemo(formData: FormData) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    throw new Error("Demo sign-in is disabled.");
  }

  const email = String(formData.get("email") ?? "");
  const demo = DEMO_USERS.find((u) => u.email === email);
  if (!demo) {
    throw new Error("Unknown demo user.");
  }

  const password = process.env.DEMO_LOGIN_PASSWORD;
  if (!password) {
    throw new Error("DEMO_LOGIN_PASSWORD is not configured.");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Fail gracefully back to /login with a message (e.g. demo auth not set up).
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(getLandingPath(demo.role));
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
