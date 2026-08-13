import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/brevo";

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
  stakeholder: { name: string; tier: number } | null;
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
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const today = new Date();
  const todayStr = iso(today);
  const t3Str = iso(new Date(today.getTime() + 3 * 86_400_000));

  const { data, error } = await admin
    .from("commitments")
    .select(
      "id, description, due_date, priority, " +
        "owner:profiles!commitments_owner_id_fkey ( id, full_name, email, manager_id, functional_manager_id ), " +
        "stakeholder:stakeholders!commitments_stakeholder_id_fkey ( name, tier )",
    )
    .eq("status", "open")
    .lte("due_date", t3Str);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    const when =
      type === "overdue"
        ? `overdue (was due ${r.due_date})`
        : type === "t-0"
          ? `due today`
          : `due in 3 days (${r.due_date})`;
    const subject = `Reminder: "${r.description}" is ${type === "overdue" ? "overdue" : type === "t-0" ? "due today" : "coming up"}`;
    const html = `<p>Hi ${r.owner.full_name},</p><p>Your commitment on <strong>${r.stakeholder?.name ?? "a stakeholder"}</strong> is ${when}:</p><blockquote>${r.description}</blockquote><p>— Teasoo SET</p>`;

    const recipients: { email: string; name?: string }[] = [
      { email: r.owner.email, name: r.owner.full_name },
    ];
    if (type === "overdue" && r.stakeholder?.tier === 1) {
      const headId = r.owner.functional_manager_id ?? r.owner.manager_id;
      const head = headId ? headEmail.get(headId) : undefined;
      if (head) recipients.push({ email: head.email, name: head.full_name });
    }

    await sendEmail({ to: recipients, subject, html });
    sent += 1;
  }

  return NextResponse.json({ processed: rows.length, sent, skipped });
}
