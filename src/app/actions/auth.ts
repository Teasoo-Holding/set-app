"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USERS, getLandingPath } from "@/lib/roles";

/** The site origin, honouring the Vercel proxy and a configured override. */
function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
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
      redirectTo: `${siteOrigin()}/auth/callback`,
      scopes: "openid email profile",
    },
  });
  if (error || !data?.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Could not start Microsoft sign-in.")}`);
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
