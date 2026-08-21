"use server";

import * as Sentry from "@sentry/nextjs";
import { getCurrentProfile } from "@/lib/auth";

/**
 * Send a deliberate test error to Sentry to verify server-side monitoring.
 *
 * Double-gated: the SENTRY_TEST flag must be "1", and the caller must be a
 * platform admin. Never enabled in normal production use.
 */
export async function sendSentryTestEvent(): Promise<{ ok: boolean; message: string }> {
  if (process.env.SENTRY_TEST !== "1") {
    return { ok: false, message: "Diagnostics are disabled." };
  }
  const me = await getCurrentProfile();
  if (!me || me.role !== "platform_admin") {
    return { ok: false, message: "Not authorised." };
  }

  const eventId = Sentry.captureException(
    new Error("Sentry server-side test event (admin diagnostics)"),
  );
  // Serverless functions can freeze before the event is flushed; wait for it.
  await Sentry.flush(2000);

  return {
    ok: true,
    message: `Sent a server-side test event to Sentry${eventId ? ` (id ${eventId.slice(0, 8)}…)` : ""}. Check Sentry → Issues.`,
  };
}
