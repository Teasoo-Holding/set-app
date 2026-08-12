import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Teasoo SET — Stakeholder Engagement Tracker",
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
