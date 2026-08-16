import type { Metadata } from "next";
import { Archivo, Figtree } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Marketing-page display + body faces (design handoff). Exposed as CSS variables
// only — the authenticated app keeps its Fluent font; marketing styles opt in
// via var(--font-archivo) / var(--font-figtree).
const archivo = Archivo({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-archivo", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-figtree", display: "swap" });

export const metadata: Metadata = {
  title: "Teasoo SET · Stakeholder Engagement Tracker",
  description:
    "One authoritative source of truth for stakeholder relationships: frictionless field capture rolling up into risk visibility for leadership.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${figtree.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
