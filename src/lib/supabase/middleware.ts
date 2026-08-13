import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Paths the session gate doesn't redirect. API routes handle their own auth
// (e.g. the reminder cron verifies CRON_SECRET), so the middleware must not
// bounce them to /login.
const PUBLIC_PREFIXES = ["/login", "/auth", "/api"];

/**
 * Refreshes the Supabase session on every request and gates access.
 * Runs in middleware so protected routes never render for anon users
 * (the real guarantee is still RLS at the DB — this is convenience).
 */
export async function updateSession(request: NextRequest) {
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
  // getSession() alone in server code.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

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

  return response;
}
