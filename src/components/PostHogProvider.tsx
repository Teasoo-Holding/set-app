"use client";

import * as React from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { makeStyles, tokens, Button, Caption1 } from "@fluentui/react-components";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

/**
 * Strip query strings and hashes from any URL property before it leaves the
 * browser. Invite / password-reset links carry a token in the query, and we
 * must never send those (or any query param) to analytics.
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
    // Privacy-first for a product holding stakeholder data:
    person_profiles: "identified_only", // no anonymous person profiles
    capture_pageview: false, // sent manually (App Router), path only
    capture_pageleave: true,
    disable_session_recording: true, // never record the screen
    // No passive capture: this app shows stakeholder names on screen, so we
    // never let PostHog read element text, click positions, or page timings.
    // Only the pageviews and events we send explicitly are captured.
    autocapture: false,
    capture_heatmaps: false,
    capture_dead_clicks: false,
    capture_performance: false, // disables web vitals + network timing
    respect_dnt: true,
    opt_out_capturing_by_default: true, // nothing is captured until the user consents
    sanitize_properties: sanitize,
  });
}

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  React.useEffect(() => {
    if (!KEY || typeof window === "undefined") return;
    posthog.capture("$pageview", { $current_url: window.location.origin + pathname }); // path only
  }, [pathname, searchParams]);
  return null;
}

const useConsentStyles = makeStyles({
  bar: {
    position: "fixed",
    left: "16px",
    right: "16px",
    bottom: "16px",
    zIndex: 1000,
    maxWidth: "620px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
    rowGap: "10px",
    flexWrap: "wrap",
    padding: "14px 18px",
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: tokens.shadow16,
  },
  text: { flexGrow: 1, minWidth: "220px", color: tokens.colorNeutralForeground2 },
  actions: { display: "flex", alignItems: "center", columnGap: "8px" },
  link: { color: tokens.colorBrandForeground1 },
});

/** Opt-in cookie/analytics consent, persisted locally + reflected to PostHog. */
function CookieConsent() {
  const styles = useConsentStyles();
  const [decided, setDecided] = React.useState(true); // hide until we've checked (no hydration flash)

  React.useEffect(() => {
    const choice = localStorage.getItem("ph_consent");
    if (choice === "in") posthog.opt_in_capturing();
    else if (choice === "out") posthog.opt_out_capturing();
    setDecided(Boolean(choice));
  }, []);

  if (decided) return null;

  const choose = (v: "in" | "out") => {
    localStorage.setItem("ph_consent", v);
    if (v === "in") posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
    setDecided(true);
  };

  return (
    <div className={styles.bar} role="dialog" aria-label="Analytics consent">
      <Caption1 className={styles.text}>
        We use analytics to understand how people use Teasoo SET, so we can improve it. We do not record your screen, and
        we never send links. You can decline. Read our <a href="/privacy" className={styles.link}>privacy notice</a>.
      </Caption1>
      <div className={styles.actions}>
        <Button size="small" appearance="subtle" onClick={() => choose("out")}>Decline</Button>
        <Button size="small" appearance="primary" onClick={() => choose("in")}>Accept</Button>
      </div>
    </div>
  );
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!KEY) return <>{children}</>; // no-op until configured
  return (
    <PHProvider client={posthog}>
      <React.Suspense fallback={null}>
        <PageviewTracker />
      </React.Suspense>
      {children}
      <CookieConsent />
    </PHProvider>
  );
}
