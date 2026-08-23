import "server-only";

/**
 * Minimal Resend transactional-email helper. Server-only.
 * No-ops (returns { skipped: true }) when RESEND_API_KEY isn't configured, so
 * jobs (e.g. the reminder cron) run safely before email is wired up.
 *
 * Sender: set EMAIL_FROM to `Name <address@your-domain>`; the address must be
 * on a domain verified in Resend.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
}): Promise<{ skipped: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { skipped: true };
  }

  const from = process.env.EMAIL_FROM ?? "Teasoo SET <efeosasere.okoro@teasooconsulting.com>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: to.map((t) => (t.name ? `${t.name} <${t.email}>` : t.email)),
      subject,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
  return { skipped: false };
}
