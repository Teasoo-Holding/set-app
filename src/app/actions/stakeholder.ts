"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyEscalationOpened } from "@/lib/escalation-notify";

const RISKS = ["low", "medium", "high"];
const SENTIMENTS = ["supportive", "neutral", "resistant"];

/** Is there a live (non-resolved) escalation for this stakeholder right now? */
async function hasActiveEscalation(supabase: ReturnType<typeof createClient>, stakeholderId: string): Promise<boolean> {
  const { data } = await supabase
    .from("escalations")
    .select("id")
    .eq("stakeholder_id", stakeholderId)
    .neq("status", "resolved")
    .maybeSingle();
  return !!data;
}

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
    // A risk/sentiment change can open an escalation (via the DB trigger). Note
    // whether one was already active so we only notify on a fresh open.
    const mayEscalate = "risk" in patch || "sentiment" in patch;
    const wasActive = mayEscalate ? await hasActiveEscalation(supabase, id) : true;
    const { error } = await supabase.from("stakeholders").update(patch).eq("id", id);
    if (error) throw new Error("Sorry, that couldn't be saved. Please try again.");
    if (mayEscalate && !wasActive) await notifyEscalationOpened(id);
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
  if (error) throw new Error("Sorry, that couldn't be saved. Please try again.");

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
  if (error) throw new Error("Sorry, that couldn't be saved. Please try again.");

  for (const p of ["/directory", "/home", "/dashboard", "/portfolio", "/governance"]) {
    revalidatePath(p);
  }
}

// ── Bulk CSV import (#115) ───────────────────────────────────
export type ImportResult = { imported: number; total: number; errors: { row: number; message: string }[] };

/** Minimal RFC-4180 CSV parser: handles quoted fields with embedded commas, quotes and newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Bulk-import stakeholders from CSV. Columns: name, category, function, tier,
 * owner (optional name/email), risk (optional), sentiment (optional), notes
 * (optional). Each row is validated against the tenant's active taxonomy, tier
 * and (if given) owner; RLS scopes everything to the tenant. Valid rows are
 * imported; invalid rows are reported by row number so the admin can fix them.
 */
export async function importStakeholders(formData: FormData): Promise<ImportResult> {
  const text = String(formData.get("csv") ?? "").replace(/^﻿/, "").trim();
  if (!text) return { imported: 0, total: 0, errors: [{ row: 0, message: "Paste some CSV first." }] };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { imported: 0, total: 0, errors: [{ row: 0, message: "Not signed in." }] };

  const [{ data: taxRows }, { data: peopleRows }] = await Promise.all([
    supabase.from("taxonomy").select("kind, value").eq("is_active", true),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  // lowercase → canonical, so matching is case-insensitive but we store the canonical value.
  const cat = new Map<string, string>();
  const fn = new Map<string, string>();
  for (const t of (taxRows as { kind: string; value: string }[]) ?? []) {
    if (t.kind === "category") cat.set(t.value.toLowerCase(), t.value);
    else if (t.kind === "function") fn.set(t.value.toLowerCase(), t.value);
  }
  const ownerBy = new Map<string, string>();
  for (const p of (peopleRows as { id: string; full_name: string; email: string }[]) ?? []) {
    ownerBy.set(p.full_name.toLowerCase(), p.id);
    ownerBy.set(p.email.toLowerCase(), p.id);
  }

  const parsed = parseCsv(text);
  const start = parsed[0]?.[0]?.trim().toLowerCase() === "name" ? 1 : 0;
  const dataRows = parsed.slice(start).filter((r) => r.some((c) => c.trim() !== ""));
  if (dataRows.length === 0) return { imported: 0, total: 0, errors: [{ row: 0, message: "No data rows found." }] };

  const errors: { row: number; message: string }[] = [];
  const toInsert: Record<string, unknown>[] = [];

  dataRows.forEach((cols, idx) => {
    const rowNo = idx + 1;
    const name = (cols[0] ?? "").trim();
    const category = (cols[1] ?? "").trim();
    const func = (cols[2] ?? "").trim();
    const tier = Number((cols[3] ?? "").trim());
    const owner = (cols[4] ?? "").trim();
    const risk = (cols[5] ?? "").trim().toLowerCase() || "low";
    const sentiment = (cols[6] ?? "").trim().toLowerCase() || "neutral";
    const notes = (cols[7] ?? "").trim();

    if (!name) {
      errors.push({ row: rowNo, message: "Missing name." });
      return;
    }
    if (!cat.has(category.toLowerCase())) {
      errors.push({ row: rowNo, message: `Unknown category "${category}".` });
      return;
    }
    if (!fn.has(func.toLowerCase())) {
      errors.push({ row: rowNo, message: `Unknown function "${func}".` });
      return;
    }
    if (tier !== 1 && tier !== 2) {
      errors.push({ row: rowNo, message: "Tier must be 1 or 2." });
      return;
    }
    if (!RISKS.includes(risk)) {
      errors.push({ row: rowNo, message: `Invalid risk "${risk}".` });
      return;
    }
    if (!SENTIMENTS.includes(sentiment)) {
      errors.push({ row: rowNo, message: `Invalid sentiment "${sentiment}".` });
      return;
    }
    let ownerId = user.id;
    if (owner) {
      const found = ownerBy.get(owner.toLowerCase());
      if (!found) {
        errors.push({ row: rowNo, message: `Unknown owner "${owner}".` });
        return;
      }
      ownerId = found;
    }
    toInsert.push({
      name,
      category: cat.get(category.toLowerCase()),
      function: fn.get(func.toLowerCase()),
      tier,
      owner_id: ownerId,
      risk,
      sentiment,
      notes: notes || null,
    });
  });

  let imported = 0;
  if (toInsert.length > 0) {
    const { error } = await supabase.from("stakeholders").insert(toInsert);
    if (error) {
      errors.push({
        row: 0,
        message: "Some rows couldn't be saved. Check that you have permission and that categories/functions match your organisation.",
      });
    } else {
      imported = toInsert.length;
      for (const p of ["/directory", "/home", "/dashboard", "/portfolio", "/governance"]) revalidatePath(p);
    }
  }

  return { imported, total: dataRows.length, errors };
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
  // Flagging opens an escalation (via the trigger); notify only on a fresh open.
  const wasActive = flag ? await hasActiveEscalation(supabase, id) : true;
  const { error } = await supabase
    .from("stakeholders")
    .update({ flagged: flag, flag_reason: flag ? reason : null })
    .eq("id", id);
  if (error) throw new Error("Sorry, that couldn't be saved. Please try again.");
  if (flag && !wasActive) await notifyEscalationOpened(id);

  revalidateStakeholder(id);
}
