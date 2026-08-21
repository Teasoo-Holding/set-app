"use client";

import * as React from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/**
 * Strip query strings from any URL property before it leaves the browser.
 * Invite / password-reset links carry a token in the query, and we must never
 * send those (or any query param) to analytics.
 */
function sanitize(properties: Record<string, unknown>): Record<string, unknown> {
  for (const k of ["$current_url", "$pathname", "$referrer", "$initial_current_url"]) {
    const v = properties[k];
    if (typeof v === "string") properties[k] = v.split("?")[0].split("#")[0];
  }
  return properties;
}

if (typeof window !== "undefined" && KEY && !posthog.__loaded) {
  posthog.init(KEY, {
    api_host: HOST,
    // Privacy-first defaults for a product holding stakeholder data:
    person_profiles: "identified_only", // no anonymous person profiles
    capture_pageview: false, // we send pageviews manually (App Router) with URLs sanitised
    capture_pageleave: true,
    disable_session_recording: true, // never record the screen
    respect_dnt: true,
    sanitize_properties: sanitize,
  });
}

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  React.useEffect(() => {
    if (!KEY || typeof window === "undefined") return;
    // Path only — no query string (tokens live there).
    posthog.capture("$pageview", { $current_url: window.location.origin + pathname });
  }, [pathname, searchParams]);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!KEY) return <>{children}</>; // no-op until configured
  return (
    <PHProvider client={posthog}>
      <React.Suspense fallback={null}>
        <PageviewTracker />
      </React.Suspense>
      {children}
    </PHProvider>
  );
}
