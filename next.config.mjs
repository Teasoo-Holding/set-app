/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

export default nextConfig;
