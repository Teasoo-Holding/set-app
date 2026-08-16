import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/brevo";
import { escalationOpenedEmail } from "@/lib/emails";
import { siteOrigin } from "@/lib/invite";

/**
 * Notify the right people that an escalation just opened for a stakeholder:
 * the function's Head(s) always, plus Leadership when it's Critical. Best-effort
 * (never throws) — a mail failure must not fail the write that triggered it.
 * Callers only invoke this on a fresh open (they check there was no active
 * escalation before the change), so it fires once per open.
 */
export async function notifyEscalationOpened(stakeholderId: string): Promise<void> {
  try {
    const db = createAdminClient();

    const { data: st } = await db
      .from("stakeholders")
      .select("id, name, function, tenant_id")
      .eq("id", stakeholderId)
      .maybeSingle();
    const s = st as { id: string; name: string; function: string; tenant_id: string } | null;
    if (!s) return;

    const { data: esc } = await db
      .from("escalations")
      .select("severity")
      .eq("stakeholder_id", stakeholderId)
      .neq("status", "resolved")
      .maybeSingle();
    const severity = (esc as { severity: "critical" | "elevated" } | null)?.severity;
    if (!severity) return; // nothing actually opened

    const roles = severity === "critical" ? ["head", "leadership"] : ["head"];
    const { data: people } = await db
      .from("profiles")
      .select("full_name, email, role, function")
      .eq("tenant_id", s.tenant_id)
      .in("role", roles);

    const recipients = (
      (people as { full_name: string; email: string; role: string; function: string | null }[]) ?? []
    ).filter((p) => p.role === "leadership" || p.function === s.function);
    if (recipients.length === 0) return;

    const link = `${siteOrigin()}/directory/${s.id}`;
    for (const r of recipients) {
      await sendEmail({
        to: [{ email: r.email, name: r.full_name }],
        ...escalationOpenedEmail({
          recipientName: r.full_name,
          stakeholderName: s.name,
          functionName: s.function,
          severity,
          link,
        }),
      });
    }
  } catch (e) {
    console.error("Escalation-opened notification failed:", e);
  }
}
