import "server-only";

/**
 * Minimal Brevo transactional-email helper (E0-6 / E7-2). Server-only.
 * No-ops (returns { skipped: true }) when BREVO_API_KEY isn't configured, so
 * the reminder job runs safely before email is wired up.
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
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    return { skipped: true };
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": key,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL ?? "no-reply@example.com",
        name: process.env.BREVO_SENDER_NAME ?? "Teasoo SET",
      },
      to,
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  }
  return { skipped: false };
}
