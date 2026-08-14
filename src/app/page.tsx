import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { LandingPage } from "@/components/LandingPage";

/**
 * Public marketing landing page. Signed-in users are routed straight to their
 * role home; anonymous visitors see the landing (E-landing).
 */
export default async function Home() {
  const profile = await getCurrentProfile();
  if (profile) redirect(getLandingPath(profile.role));
  return <LandingPage />;
}
