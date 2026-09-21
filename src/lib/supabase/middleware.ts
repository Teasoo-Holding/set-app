import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Paths the session gate doesn't redirect. Default-deny everywhere else.
// Only routes that handle their own auth are allow-listed: /auth (OAuth
// callback) and /api/cron (verifies CRON_SECRET, fails closed). We deliberately
// do NOT blanket-allow all of /api, so any future API route is gated by
// default rather than silently public. (#58)
const PUBLIC_PREFIXES = ["/login", "/auth", "/api/cron", "/invite", "/terms", "/privacy", "/demo"];
// Exact public paths (can't be prefixes — "/" would match everything).
const PUBLIC_EXACT = ["/"];

// The auth checks below call out to Supabase (auth server + one DB read). If
// that upstream is slow or unreachable we must NOT hang until Vercel kills the
// middleware (504 MIDDLEWARE_INVOCATION_TIMEOUT) — that would take the whole
// site down for a transient backend blip. Cap each call and degrade safely
// instead. A healthy call settles well under a second, so this only ever fires
// during a genuine backend brownout.
const AUTH_TIMEOUT_MS = 5_000;

/**
 * Resolve to `fallback` if `promise` hasn't settled within `ms`. The underlying
 * promise is left to settle on its own; we just stop waiting on it.
 */
function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    Promise.resolve(promise).then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

/**
 * Refreshes the Supabase session on every request and gates access.
 * Runs in middleware so protected routes never render for anon users
 * (the real guarantee is still RLS at the DB — this is convenience).
 *
 * Availability: every Supabase call is time-boxed and fails safe. If the auth
 * lookup times out on a protected route we send the visitor to /login (fail
 * closed, never open); if the suspension read times out we let the request
 * through (a soft gate — RLS still protects the data). Either way a slow
 * backend degrades gracefully instead of returning a gateway timeout.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_EXACT.includes(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  // Public content routes don't depend on who's signed in, so they skip the
  // auth round trip entirely — a Supabase slowdown can never 504 a public page.
  // The one exception is /login, which bounces already-signed-in users home.
  // (The landing page at "/" does its own signed-in redirect server-side.)
  if (isPublic && pathname !== "/login") {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }: CookieToSet) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with Supabase; do not trust
  // getSession() alone in server code. Time-boxed: a hung auth server resolves
  // to "no user" rather than blocking, which fails closed on protected routes.
  // withTimeout turns both a timeout and a rejection into the `null` fallback.
  const user = await withTimeout(
    supabase.auth.getUser().then((r) => r.data.user),
    AUTH_TIMEOUT_MS,
    null,
  );

  // Redirect while preserving any refreshed auth cookies on `response`
  // (Supabase SSR requirement: don't drop cookies when returning a new response).
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!user && !isPublic) {
    return redirectTo("/login");
  }

  // Signed-in users hitting /login go home (role router decides where).
  if (user && pathname === "/login") {
    return redirectTo("/");
  }

  // Tenant-suspension gate. A suspended organisation's members are blocked from
  // the app and sent to /suspended; platform admins are exempt. One joined read
  // under RLS, only on the private surface. Time-boxed: if the read is slow we
  // let the request through (soft gate — RLS still protects the data) rather
  // than 504 the whole app during a backend blip.
  if (user && !isPublic) {
    const ctx = await withTimeout(
      supabase
        .from("profiles")
        .select("role, tenant:tenants!profiles_tenant_id_fkey ( status )")
        .eq("id", user.id)
        .maybeSingle()
        .then((r) => r.data),
      AUTH_TIMEOUT_MS,
      null,
    );
    const c = ctx as { role: string; tenant: { status: string } | null } | null;
    const suspended = !!c && c.role !== "platform_admin" && c.tenant?.status === "suspended";
    if (suspended && pathname !== "/suspended") return redirectTo("/suspended");
    if (!suspended && pathname === "/suspended") return redirectTo("/");
  }

  return response;
}
