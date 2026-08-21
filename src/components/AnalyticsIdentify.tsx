"use client";

import * as React from "react";
import posthog from "posthog-js";

/**
 * Identify the signed-in user to PostHog by their UUID only — no name or email —
 * and group them by their tenant UUID, so we can see per-user funnels and
 * per-organisation usage without sending any personal data.
 */
export function AnalyticsIdentify({
  userId,
  tenantId,
  role,
}: {
  userId: string;
  tenantId: string | null;
  role: string;
}) {
  React.useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !userId) return;
    posthog.identify(userId, { role });
    if (tenantId) posthog.group("tenant", tenantId);
  }, [userId, tenantId, role]);
  return null;
}
