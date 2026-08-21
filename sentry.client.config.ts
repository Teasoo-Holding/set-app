import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "./src/lib/sentry-scrub";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// No-op until a DSN is configured, mirroring the analytics setup.
if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV ?? "production",
    sendDefaultPii: false, // no IP address, cookies, or user identifiers
    tracesSampleRate: 0, // error monitoring only, no performance tracing
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Keep the default error handlers but drop tracing / session replay so no
    // performance data or screen recording is ever collected.
    integrations: (defaults) =>
      defaults.filter((i) => i.name !== "BrowserTracing" && i.name !== "Replay" && i.name !== "ReplayCanvas"),
    beforeSend: scrubEvent,
    beforeBreadcrumb(breadcrumb) {
      // Console and fetch/xhr breadcrumbs can carry payloads; keep only the
      // low-risk ones (navigation, ui clicks).
      if (breadcrumb.category === "console" || breadcrumb.category === "xhr" || breadcrumb.category === "fetch") {
        return null;
      }
      return breadcrumb;
    },
  });
}
