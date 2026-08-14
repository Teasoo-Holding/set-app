import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";

/**
 * Set-new-password page. Reached from the reset email (via /auth/callback, which
 * establishes a short-lived recovery session), or by an already-signed-in user.
 * Guarded: without a session there's nothing to update, so bounce to /login.
 */
export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Your%20reset%20link%20has%20expired.%20Request%20a%20new%20one.");

  return <UpdatePasswordForm error={searchParams?.error} />;
}
