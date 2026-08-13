import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/brevo";
import { commitmentReminderEmail, headOverdueEmail } from "@/lib/emails";

export const dynamic = "force-dynamic";

type Owner = {
  id: string;
  full_name: string;
  email: string;
  manager_id: string | null;
  functional_manager_id: string | null;
};
type Row = {
  id: string;
  description: string;
  due_date: string;
  priority: string;
  owner: Owner | null;
  stakeholder: { id: string; name: string; tier: number } | null;
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * E7-2/E7-3 — commitment reminder cron. Runs daily (Vercel Cron). Emails the
 * owner at T-3, on the due date, and daily while overdue; Tier-1 overdue also
 * emails the owner's Head. Idempotent via reminder_sends. Uses the service
 * role (system-owned; bypasses RLS). No-ops safely until Brevo is configured.
 *
 * Protected by CRON_SECRET (Vercel Cron sends it as a Bearer token).
 */
export async function GET(request: Request) {
  // Fail CLOSED: this route uses the service role (bypasses RLS) and sends
  // email, so it must never be callable without the secret. A missing/empty
  // CRON_SECRET is treated as "deny", not "skip the check". (#58)
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const appUrl = new URL(request.url).origin;
  const today = new Date();
  const todayStr = iso(today);
  const t3Str = iso(new Date(today.getTime() + 3 * 86_400_000));

  const { data, error } = await admin
    .from("commitments")
    .select(
      "id, description, due_date, priority, " +
        "owner:profiles!commitments_owner_id_fkey ( id, full_name, email, manager_id, functional_manager_id ), " +
        "stakeholder:stakeholders!commitments_stakeholder_id_fkey ( id, name, tier )",
    )
    .eq("status", "open")
    .lte("due_date", t3Str);
  if (error) {
    // Log the detail server-side; don't leak DB/schema detail to the caller. (#58)
    console.error("cron/reminders query failed:", error.message);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }

  const rows = (data as unknown as Row[]) ?? [];

  // Pre-fetch Head emails for Tier-1 overdue items.
  const headIds = new Set<string>();
  for (const r of rows) {
    if (r.stakeholder && r.stakeholder.tier === 1 && r.due_date < todayStr && r.owner) {
      const head = r.owner.functional_manager_id ?? r.owner.manager_id;
      if (head) headIds.add(head);
    }
  }
  const headEmail = new Map<string, { email: string; full_name: string }>();
  if (headIds.size > 0) {
    const { data: heads } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", [...headIds]);
    for (const h of (heads as { id: string; full_name: string; email: string }[]) ?? []) {
      headEmail.set(h.id, { email: h.email, full_name: h.full_name });
    }
  }

  let sent = 0;
  let skipped = 0;

  for (const r of rows) {
    if (!r.owner) continue;
    const overdue = r.due_date < todayStr;
    let type: "t-3" | "t-0" | "overdue" | null = null;
    let sentForDate = r.due_date;
    if (overdue) {
      type = "overdue";
      sentForDate = todayStr; // daily while overdue
    } else if (r.due_date === todayStr) {
      type = "t-0";
    } else if (r.due_date === t3Str) {
      type = "t-3";
    }
    if (!type) continue;

    // Claim the send (idempotent): only proceed if this insert is new.
    const { data: claimed } = await admin
      .from("reminder_sends")
      .upsert(
        { commitment_id: r.id, reminder_type: type, sent_for_date: sentForDate },
        { onConflict: "commitment_id,reminder_type,sent_for_date", ignoreDuplicates: true },
      )
      .select("commitment_id");
    if (!claimed || claimed.length === 0) {
      skipped += 1;
      continue;
    }

    const stakeholderName = r.stakeholder?.name ?? "a stakeholder";
    const link = `${appUrl}/directory/${r.stakeholder?.id ?? ""}`;

    // Email the owner.
    const ownerMail = commitmentReminderEmail({
      ownerName: r.owner.full_name,
      stakeholderName,
      description: r.description,
      dueDate: r.due_date,
      type,
      link,
    });
    await sendEmail({
      to: [{ email: r.owner.email, name: r.owner.full_name }],
      subject: ownerMail.subject,
      html: ownerMail.html,
    });
    sent += 1;

    // E7-3: Tier-1 overdue also emails the owner's Head (separately, addressed to them).
    if (type === "overdue" && r.stakeholder?.tier === 1) {
      const headId = r.owner.functional_manager_id ?? r.owner.manager_id;
      const head = headId ? headEmail.get(headId) : undefined;
      if (head) {
        const headMail = headOverdueEmail({
          headName: head.full_name,
          ownerName: r.owner.full_name,
          stakeholderName,
          description: r.description,
          dueDate: r.due_date,
          link,
        });
        await sendEmail({
          to: [{ email: head.email, name: head.full_name }],
          subject: headMail.subject,
          html: headMail.html,
        });
        sent += 1;
      }
    }
  }

  return NextResponse.json({ processed: rows.length, sent, skipped });
}
