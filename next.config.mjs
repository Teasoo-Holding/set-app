/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fluent UI v9 ships ESM; keep transpilation predictable across Vercel/Node.
  transpilePackages: ["@fluentui/react-components", "@fluentui/react-icons"],
};

export default nextConfig;
