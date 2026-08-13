import "server-only";

/**
 * Email copy, written in plain English (GDS content-design style): active
 * voice, "you", the key fact first, one clear action, no jargon. Returns
 * { subject, html } ready for Brevo.
 */

function firstName(full: string): string {
  return full.split(" ")[0];
}
function longDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Simple, readable shell — no images, generous line-height, a single button.
function layout(bodyHtml: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:16px;line-height:1.5;max-width:560px;margin:0 auto;padding:8px">
${bodyHtml}
<p style="color:#616161;font-size:14px;margin-top:28px">Teasoo SET · Stakeholder Engagement Tracker</p>
</div>`;
}
function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;display:inline-block;font-weight:600">${label}</a></p>`;
}

const STATUS = {
  "t-3": { subjectLead: "Due in 3 days", line: (d: string) => `This is due in 3 days, on ${d}.` },
  "t-0": { subjectLead: "Due today", line: () => `This is due today.` },
  overdue: { subjectLead: "Overdue", line: (d: string) => `This was due on ${d} and is now overdue.` },
} as const;

/** Reminder to the person who owns the commitment. */
export function commitmentReminderEmail(args: {
  ownerName: string;
  stakeholderName: string;
  description: string;
  dueDate: string;
  type: "t-3" | "t-0" | "overdue";
  link: string;
}): { subject: string; html: string } {
  const s = STATUS[args.type];
  const subject = `${s.subjectLead}: your commitment for ${args.stakeholderName}`;
  const html = layout(
    `<p>Dear ${esc(firstName(args.ownerName))},</p>
<p>This is a reminder about a commitment you made for <strong>${esc(args.stakeholderName)}</strong>.</p>
<p><strong>${esc(args.description)}</strong></p>
<p>${s.line(longDate(args.dueDate))}</p>
<p>When you have done it, open the stakeholder and mark the commitment complete.</p>
${button(args.link, "Open in Teasoo SET")}
<p>Thanks,<br>Teasoo SET</p>`,
  );
  return { subject, html };
}

/** Escalation to the Head when a Tier-1 commitment is overdue. */
export function headOverdueEmail(args: {
  headName: string;
  ownerName: string;
  stakeholderName: string;
  description: string;
  dueDate: string;
  link: string;
}): { subject: string; html: string } {
  const subject = `Overdue Tier 1 commitment: ${args.stakeholderName}`;
  const html = layout(
    `<p>Dear ${esc(firstName(args.headName))},</p>
<p>A Tier 1 commitment in your function is overdue and needs attention.</p>
<p><strong>Stakeholder:</strong> ${esc(args.stakeholderName)}<br>
<strong>Owned by:</strong> ${esc(args.ownerName)}<br>
<strong>Was due:</strong> ${longDate(args.dueDate)}</p>
<p><strong>${esc(args.description)}</strong></p>
<p>You may want to follow up with ${esc(firstName(args.ownerName))}.</p>
${button(args.link, "Open in Teasoo SET")}
<p>Thanks,<br>Teasoo SET</p>`,
  );
  return { subject, html };
}
