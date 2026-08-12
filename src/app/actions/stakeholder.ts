"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * E2-6 — change a stakeholder's tier. RLS (stakeholders_update) enforces who
 * may do this (owner / Head of the function / Leadership / Admin); an
 * out-of-scope caller simply updates zero rows. The change is captured by the
 * audit trigger automatically (§6.3 "tier changes logged").
 */
export async function setTier(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const tier = Number(formData.get("tier"));
  if (!id || (tier !== 1 && tier !== 2)) {
    throw new Error("Invalid tier change.");
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("stakeholders")
    .update({ tier })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/directory/${id}`);
}
