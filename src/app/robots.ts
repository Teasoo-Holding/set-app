import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://set-app-olive.vercel.app";
const PRIVATE = ["/home", "/dashboard", "/portfolio", "/governance", "/platform", "/directory", "/escalations", "/account", "/invite", "/api", "/demo"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/terms", "/privacy", "/login"], disallow: PRIVATE },
      // Allow answer engines onto the public pages (deliberate, so the product
      // can be surfaced by AI). Flip to disallow "/" here to opt out.
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"],
        allow: ["/", "/terms", "/privacy"],
        disallow: PRIVATE,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
