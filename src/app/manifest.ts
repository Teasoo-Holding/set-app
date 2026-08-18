import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Teasoo SET — Stakeholder Engagement Tracker",
    short_name: "Teasoo SET",
    description: "Log stakeholder engagements, track risk and commitments, one live source of truth.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f1e3d",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
