/**
 * Next.js instrumentation hook. Loads the Sentry server / edge config for the
 * matching runtime. The config files no-op unless a DSN is set.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
