import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DEMO_MODE } from "@/lib/roles";
import { DemoRoster } from "@/components/DemoRoster";

export const metadata: Metadata = {
  title: "Explore the demo",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  // Demo shortcuts exist only when demo mode is on; otherwise this route is off.
  if (!DEMO_MODE) redirect("/login");
  return <DemoRoster />;
}
