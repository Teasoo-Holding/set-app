"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/brevo";
import { requestDecisionEmail, reassignmentEmail } from "@/lib/emails";
import { siteOrigin } from "@/lib/invite";

function revalidate() {
  for (const p of ["/governance", "/directory", "/home", "/dashboard", "/portfolio"]) {
    revalidatePath(p);
  }
}

/**
 * E10-1 — approve a stakeholder request: create the record (owned by the
 * requester, in their function, Tier 2 by default) and mark the request
 * approved. RLS gates both writes to Admin; audit-logged.
 */
export async function approveRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing request id.");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: req } = await supabase
    .from("stakeholder_requests")
    .select("id, requested_name, category, requested_by")
    .eq("id", id)
    .maybeSingle();
  if (!req) throw new Error("Request not found.");

  const r = req as { requested_name: string; category: string; requested_by: string };
  const { data: requester } = await supabase
    .from("profiles")
    .select("function, full_name, email")
    .eq("id", r.requested_by)
    .maybeSingle();
  const rq = requester as { function: string | null; full_name: string; email: string } | null;
  const fn = rq?.function;
  if (!fn) throw new Error("The person who requested this has no function yet. Give them a function before you approve.");

  const { data: created, error } = await supabase
    .from("stakeholders")
    .insert({
      name: r.requested_name,
      category: r.category,
      function: fn,
      owner_id: r.requested_by,
      tier: 2,
      risk: "low",
      sentiment: "neutral",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const stakeholderId = (created as { id: string }).id;
  await supabase
    .from("stakeholder_requests")
    .update({
      status: "approved",
      decided_by: user?.id ?? null,
      decided_at: new Date().toISOString(),
      created_stakeholder_id: stakeholderId,
    })
    .eq("id", id);

  await notifyRequester(rq, r.requested_name, true, `${siteOrigin()}/directory/${stakeholderId}`);
  revalidate();
}

/** Best-effort email to the requester when their request is decided. */
async function notifyRequester(
  rq: { full_name: string; email: string } | null,
  stakeholderName: string,
  approved: boolean,
  link?: string,
): Promise<void> {
  if (!rq?.email) return;
  try {
    await sendEmail({
      to: [{ email: rq.email, name: rq.full_name }],
      ...requestDecisionEmail({ requesterName: rq.full_name, stakeholderName, approved, link }),
    });
  } catch (e) {
    console.error("Request-decision email failed:", e);
  }
}

/** E10-1 — reject a stakeholder request. */
export async function rejectRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing request id.");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: req } = await supabase
    .from("stakeholder_requests")
    .select("requested_name, requester:profiles!stakeholder_requests_requested_by_fkey ( full_name, email )")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("stakeholder_requests")
    .update({ status: "rejected", decided_by: user?.id ?? null, decided_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const rr = req as { requested_name: string; requester: { full_name: string; email: string } | null } | null;
  if (rr) await notifyRequester(rr.requester, rr.requested_name, false);
  revalidate();
}

/** E10-2 — add a taxonomy value (Admin-only via RLS). */
export async function addTaxonomy(formData: FormData) {
  const kind = String(formData.get("kind") ?? "");
  const value = String(formData.get("value") ?? "").trim();
  if (!["category", "function", "engagement_type"].includes(kind) || !value) {
    throw new Error("A kind and value are required.");
  }
  const supabase = createClient();
  const { error } = await supabase.from("taxonomy").insert({ kind, value, label: value });
  if (error) throw new Error(error.message);
  revalidate();
}

/** E10-2 — activate/deactivate a taxonomy value (safe for in-use values). */
export async function setTaxonomyActive(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active")) === "true";
  if (!id) throw new Error("Missing taxonomy id.");
  const supabase = createClient();
  const { error } = await supabase.from("taxonomy").update({ is_active: active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}

/**
 * E10-3 — bulk-reassign every stakeholder owned by one person to another.
 * RLS gates the update (Admin = global); audit-logged per row.
 */
export async function reassignStakeholders(formData: FormData) {
  const fromId = String(formData.get("from") ?? "");
  const toId = String(formData.get("to") ?? "");
  if (!fromId || !toId || fromId === toId) {
    throw new Error("Pick a different person to reassign to.");
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("stakeholders")
    .update({ owner_id: toId })
    .eq("owner_id", fromId);
  if (error) throw new Error(error.message);

  // Move OPEN commitments too, so a departing owner stops getting reminders and
  // the new owner inherits the follow-through (offboarding completeness).
  await supabase.from("commitments").update({ owner_id: toId }).eq("owner_id", fromId).eq("status", "open");

  // Let the new owner know they've inherited relationships (best-effort).
  try {
    const { data: to } = await supabase.from("profiles").select("full_name, email").eq("id", toId).maybeSingle();
    const t = to as { full_name: string; email: string } | null;
    if (t?.email) {
      await sendEmail({
        to: [{ email: t.email, name: t.full_name }],
        ...reassignmentEmail({ ownerName: t.full_name, link: `${siteOrigin()}/directory` }),
      });
    }
  } catch (e) {
    console.error("Reassignment email failed:", e);
  }

  revalidate();
}
