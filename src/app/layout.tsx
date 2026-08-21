import type { Metadata } from "next";
import { Archivo, Figtree } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@/components/Analytics";

// Marketing-page display + body faces (design handoff). Exposed as CSS variables
// only — the authenticated app keeps its Fluent font; marketing styles opt in
// via var(--font-archivo) / var(--font-figtree).
const archivo = Archivo({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-archivo", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-figtree", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://set.teasooconsulting.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Teasoo SET · Stakeholder Engagement Tracker",
    template: "%s · Teasoo SET",
  },
  description:
    "Teasoo SET is a multi-tenant stakeholder engagement tracker by Teasoo Consulting. Log engagements, track risk, sentiment and commitments, and give leadership one live source of truth. GDPR and Nigeria NDPA aligned.",
  applicationName: "Teasoo SET",
  authors: [{ name: "Teasoo Consulting", url: "https://teasooconsulting.com" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Teasoo SET",
    url: SITE_URL,
    title: "Teasoo SET · Stakeholder Engagement Tracker",
    description:
      "One authoritative source of truth for stakeholder relationships. Fast field capture, live risk visibility for leadership. By Teasoo Consulting.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teasoo SET · Stakeholder Engagement Tracker",
    description:
      "Log stakeholder engagements, track risk and commitments, give leadership one live source of truth. By Teasoo Consulting.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${figtree.variable}`}>
        <Providers>
          <Analytics />
          {children}
        </Providers>
      </body>
    </html>
  );
}
