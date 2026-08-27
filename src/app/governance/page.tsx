import { redirect } from "next/navigation";
import { getCurrentProfile, getLandingPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  GovernanceAdmin,
  type PendingRequest,
  type TaxonomyValue,
  type PersonOption,
  type Member,
  type PendingInvite,
} from "@/components/GovernanceAdmin";

export default async function GovernancePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect(getLandingPath(profile.role));

  const supabase = createClient();
  const [{ data: reqRows }, { data: taxRows }, { data: people }, { data: owned }, { data: inviteRows }] =
    await Promise.all([
      supabase
        .from("stakeholder_requests")
        .select("id, requested_name, category, reason, created_at, requester:profiles!stakeholder_requests_requested_by_fkey ( full_name )")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
      supabase.from("taxonomy").select("id, kind, value, label, is_active").order("kind").order("sort_order"),
      supabase.from("profiles").select("id, full_name, role, email, function").order("full_name"),
      supabase.from("stakeholders").select("owner_id"),
      supabase
        .from("invitations")
        .select("id, email, role, function, created_at, expires_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

  const requests: PendingRequest[] = (
    (reqRows as unknown as {
      id: string;
      requested_name: string;
      category: string;
      reason: string;
      created_at: string;
      requester: { full_name: string } | null;
    }[]) ?? []
  ).map((r) => ({
    id: r.id,
    name: r.requested_name,
    category: r.category,
    reason: r.reason,
    createdAt: r.created_at,
    requesterName: r.requester?.full_name ?? "Unknown",
  }));

  const taxonomy = (taxRows as TaxonomyValue[]) ?? [];

  const counts = new Map<string, number>();
  for (const s of (owned as { owner_id: string }[]) ?? []) {
    counts.set(s.owner_id, (counts.get(s.owner_id) ?? 0) + 1);
  }
  const peopleRows =
    (people as { id: string; full_name: string; role: string; email: string; function: string | null }[]) ?? [];
  const persons: PersonOption[] = peopleRows.map((p) => ({
    id: p.id,
    name: p.full_name,
    role: p.role,
    owns: counts.get(p.id) ?? 0,
  }));
  const members: Member[] = peopleRows.map((p) => ({
    id: p.id,
    name: p.full_name,
    email: p.email,
    role: p.role,
    function: p.function,
  }));

  const functions = taxonomy
    .filter((t) => t.kind === "function" && t.is_active)
    .map((t) => t.value)
    .sort((a, b) => a.localeCompare(b));

  const invites: PendingInvite[] = (
    (inviteRows as { id: string; email: string; role: string; function: string | null; created_at: string; expires_at: string }[]) ?? []
  ).map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    function: i.function,
    createdAt: i.created_at,
    expiresAt: i.expires_at,
  }));

  return (
    <GovernanceAdmin
      viewer={{ full_name: profile.full_name, role: profile.role, function: profile.function }}
      requests={requests}
      taxonomy={taxonomy}
      persons={persons}
      members={members}
      invites={invites}
      functions={functions}
    />
  );
}
