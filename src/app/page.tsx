import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";

/** Root routes the signed-in user to their role landing (E1-2). */
export default async function Home() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  redirect(getLandingPath(profile.role));
}
