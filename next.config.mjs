import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 14 needs this flag for the instrumentation.ts hook (Sentry server/edge init).
  experimental: { instrumentationHook: true },
  // Fluent UI v9 ships ESM; keep transpilation predictable across Vercel/Node.
  transpilePackages: ["@fluentui/react-components", "@fluentui/react-icons"],
  // Belt-and-braces noindex for the authenticated surface (redirects protect it,
  // but redirects aren't an indexing directive).
  async headers() {
    return [
      {
        source: "/:seg(home|dashboard|portfolio|governance|platform|directory|escalations|account)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:seg(home|dashboard|portfolio|governance|platform|directory|escalations|account)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

// Source maps are uploaded only when SENTRY_ORG + SENTRY_PROJECT + SENTRY_AUTH_TOKEN
// are all set (e.g. on Vercel). CI and local builds without the token just skip
// the upload — no build failure.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true, // no plugin logging in the build output
  telemetry: false, // don't send build telemetry to Sentry
  widenClientFileUpload: true,
});
