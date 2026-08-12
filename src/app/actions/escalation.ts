"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// E6-5 lifecycle: Open → Acknowledged → Assigned → Intervened → Resolved.
const NEXT_STATUS = {
  acknowledge: "acknowledged",
  assign: "assigned",
  intervene: "intervened",
  resolve: "resolved",
} as const;

type Action = keyof typeof NEXT_STATUS;

/**
 * Move an escalation through its lifecycle. RLS (escalations_update) enforces
 * who may act (Head of the function / Leadership / Admin). Assign sets the
 * owner to the acting user; Resolve stamps resolved_at (which drops it off the
 * active board). Every transition is audit-logged by the trigger.
 */
export async function setEscalationStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "") as Action;
  const status = NEXT_STATUS[action];
  if (!id || !status) {
    throw new Error("Invalid escalation action.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const patch: Record<string, unknown> = { status };
  if (action === "assign") patch.assigned_to = user?.id ?? null;
  if (action === "resolve") patch.resolved_at = new Date().toISOString();

  const { error } = await supabase.from("escalations").update(patch).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/escalations");
  revalidatePath("/directory");
  for (const p of ["/home", "/dashboard", "/portfolio", "/governance"]) {
    revalidatePath(p);
  }
}
