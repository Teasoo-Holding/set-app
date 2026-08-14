"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const RISKS = ["low", "medium", "high"];
const SENTIMENTS = ["supportive", "neutral", "resistant"];

function revalidateStakeholder(id: string) {
  revalidatePath(`/directory/${id}`);
  revalidatePath("/directory");
  for (const p of ["/home", "/dashboard", "/portfolio", "/governance"]) {
    revalidatePath(p);
  }
}

/**
 * E2-6 / E5-1 — update tier, risk and/or sentiment on a stakeholder. RLS
 * (stakeholders_update) enforces who may do this (owner / Head of the function
 * / Leadership / Admin); an out-of-scope caller updates zero rows. Changes are
 * captured by the audit trigger, and risk/sentiment changes may trip the
 * escalation triggers (E6).
 */
export async function updateStakeholder(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing stakeholder id.");

  const tier = Number(formData.get("tier"));
  const risk = String(formData.get("risk") ?? "");
  const sentiment = String(formData.get("sentiment") ?? "");

  const patch: Record<string, string | number> = {};
  if (tier === 1 || tier === 2) patch.tier = tier;
  if (RISKS.includes(risk)) patch.risk = risk;
  if (SENTIMENTS.includes(sentiment)) patch.sentiment = sentiment;

  if (Object.keys(patch).length > 0) {
    const supabase = createClient();
    const { error } = await supabase.from("stakeholders").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
  }
  revalidateStakeholder(id);
}

/**
 * E4-3 — propose a new stakeholder into the master directory. Inserts a
 * pending stakeholder_request as the current user (RLS: requested_by =
 * auth.uid()). Admins approve/reject later (E10-1).
 */
export async function requestStakeholder(formData: FormData) {
  const requested_name = String(formData.get("requested_name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!requested_name || !category || !reason) {
    throw new Error("Name, category and reason are required.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase.from("stakeholder_requests").insert({
    requested_name,
    category,
    reason,
    requested_by: user.id,
  });
  if (error) throw new Error(error.message);

  for (const p of ["/home", "/dashboard", "/portfolio", "/governance"]) {
    revalidatePath(p);
  }
}

/**
 * Directly create a stakeholder (Admin / Leadership / Head). Field users can't
 * reach this — they propose via requestStakeholder. RLS (stakeholders_insert)
 * is the real guard: Leadership/Admin anywhere in the tenant, a Head only in
 * their own function. tenant_id defaults to the caller's tenant.
 */
export async function createStakeholder(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const func = String(formData.get("function") ?? "").trim();
  const tier = Number(formData.get("tier"));
  const ownerId = String(formData.get("owner_id") ?? "").trim();
  if (!name || !category || !func) throw new Error("Name, category and function are required.");
  if (tier !== 1 && tier !== 2) throw new Error("Choose a tier.");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase.from("stakeholders").insert({
    name,
    category,
    function: func,
    tier,
    owner_id: ownerId || user.id,
  });
  if (error) throw new Error(error.message);

  for (const p of ["/directory", "/home", "/dashboard", "/portfolio", "/governance"]) {
    revalidatePath(p);
  }
}

/**
 * E5-2 / E5-3 — flag or unflag a stakeholder. Flagging sets `flagged` (and an
 * optional reason); the sync_escalation trigger opens/closes the escalation.
 * RLS gates who may flag; the audit trigger logs it.
 */
export async function toggleFlag(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing stakeholder id.");

  const flag = String(formData.get("flag")) === "true";
  const reason = String(formData.get("reason") ?? "").trim() || null;

  const supabase = createClient();
  const { error } = await supabase
    .from("stakeholders")
    .update({ flagged: flag, flag_reason: flag ? reason : null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateStakeholder(id);
}
