"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateAll(stakeholderId?: string) {
  if (stakeholderId) revalidatePath(`/directory/${stakeholderId}`);
  for (const p of ["/home", "/dashboard", "/portfolio", "/governance"]) {
    revalidatePath(p);
  }
}

/**
 * E7-1 — create a commitment against a stakeholder, owned by the current user.
 * RLS (commitments_write) requires owner_id = auth.uid() (or Head/Leadership/
 * Admin scope). Audit-logged.
 */
export async function createCommitment(formData: FormData) {
  const stakeholderId = String(formData.get("stakeholderId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "");
  const priority = String(formData.get("priority") ?? "low");
  if (!stakeholderId || !description || !dueDate) {
    throw new Error("Description and due date are required.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase.from("commitments").insert({
    stakeholder_id: stakeholderId,
    description,
    due_date: dueDate,
    priority: priority === "high" ? "high" : "low",
    owner_id: user.id,
    status: "open",
  });
  if (error) throw new Error(error.message);

  revalidateAll(stakeholderId);
}

/** E7-1 — mark a commitment complete. RLS-gated; audit-logged. */
export async function completeCommitment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const stakeholderId = String(formData.get("stakeholderId") ?? "") || undefined;
  if (!id) throw new Error("Missing commitment id.");

  const supabase = createClient();
  const { error } = await supabase
    .from("commitments")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateAll(stakeholderId);
}
