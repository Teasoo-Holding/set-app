"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const RISKS = ["low", "medium", "high"] as const;
const SENTIMENTS = ["supportive", "neutral", "resistant"] as const;

/**
 * E3-1/E3-2/E3-3 — log an engagement. Inserts as the current user (RLS
 * requires logged_by = auth.uid() and the stakeholder to be in scope). The
 * last-contact date is refreshed by a DB trigger. Optionally updates
 * risk/sentiment (E3-3), which may trip the escalation triggers (E6).
 */
export async function logEngagement(formData: FormData) {
  const stakeholderId = String(formData.get("stakeholderId") ?? "");
  const type = String(formData.get("type") ?? "");
  const occurredOn = String(formData.get("occurred_on") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const risk = String(formData.get("risk") ?? "");
  const sentiment = String(formData.get("sentiment") ?? "");

  if (!stakeholderId || !type || !occurredOn) {
    throw new Error("Stakeholder, type and date are required.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not signed in.");
  }

  const { error } = await supabase.from("engagements").insert({
    stakeholder_id: stakeholderId,
    type,
    occurred_on: occurredOn,
    notes,
    logged_by: user.id,
  });
  if (error) {
    throw new Error(error.message);
  }

  // E3-3 — optional risk/sentiment update in the same flow. Validate against
  // the allowed values (mirrors updateStakeholder) rather than trusting the
  // posted string; the DB enum backstops this, but reject early and clearly. (#58)
  const patch: Record<string, string> = {};
  if (risk) {
    if (!RISKS.includes(risk as (typeof RISKS)[number])) throw new Error("Invalid risk value.");
    patch.risk = risk;
  }
  if (sentiment) {
    if (!SENTIMENTS.includes(sentiment as (typeof SENTIMENTS)[number])) throw new Error("Invalid sentiment value.");
    patch.sentiment = sentiment;
  }
  if (Object.keys(patch).length > 0) {
    await supabase.from("stakeholders").update(patch).eq("id", stakeholderId);
  }

  revalidatePath(`/directory/${stakeholderId}`);
  revalidatePath("/directory");
  for (const p of ["/home", "/dashboard", "/portfolio", "/governance"]) {
    revalidatePath(p);
  }
}
