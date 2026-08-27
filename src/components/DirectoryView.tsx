"use client";

import * as React from "react";
import { makeStyles, tokens, Title2, Caption1, Text, Button, SearchBox, Select } from "@fluentui/react-components";
import { AppShell } from "@/components/AppShell";
import { StakeholderCard } from "@/components/StakeholderCard";
import { AddStakeholderDialog, type MemberOption } from "@/components/AddStakeholderDialog";
import { ImportStakeholdersDialog } from "@/components/ImportStakeholdersDialog";
import { RequestStakeholderDialog } from "@/components/RequestStakeholderDialog";
import { EmptyState } from "@/components/EmptyState";
import type { Role } from "@/lib/roles";

export type DirectoryRow = {
  id: string;
  name: string;
  category: string;
  function: string;
  tier: number;
  risk: "low" | "medium" | "high";
  sentiment: "supportive" | "neutral" | "resistant";
  flagged: boolean;
  last_contact_at: string | null;
  notes: string | null;
  ownerName: string | null;
  owner_id: string;
};

const RISK_RANK = { high: 3, medium: 2, low: 1 } as const;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const useStyles = makeStyles({
  main: { maxWidth: "960px", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", rowGap: "16px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  header: { display: "flex", alignItems: "flex-start", columnGap: "12px" },
  headerActions: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  headText: { display: "flex", flexDirection: "column", flexGrow: 1 },
  search: { width: "100%" },
  chipRow: { display: "flex", alignItems: "center", columnGap: "8px", rowGap: "8px", flexWrap: "wrap" },
  chipSpacer: { flexGrow: 1 },
  sortWrap: { display: "flex", alignItems: "center", columnGap: "8px" },
  list: { display: "flex", flexDirection: "column", rowGap: "10px", marginTop: "4px" },
  empty: { padding: "40px", textAlign: "center", color: tokens.colorNeutralForeground3 },
});

export function DirectoryView({
  profile,
  rows,
  categories,
  functions,
  members,
  initialFunction = null,
}: {
  profile: { id: string; full_name: string; role: Role; function: string | null };
  rows: DirectoryRow[];
  categories: string[];
  functions: string[];
  members: MemberOption[];
  initialFunction?: string | null;
}) {
  const styles = useStyles();

  // Admin/Leadership/Head add stakeholders directly; a Head only in their own
  // function. Field users propose via a request for admin approval.
  const canAdd = profile.role === "admin" || profile.role === "leadership" || profile.role === "head";
  const addFunctions = profile.role === "head" && profile.function ? [profile.function] : functions;

  // Who the viewer may flag — mirrors the stakeholders_update RLS policy.
  const canFlag = (r: DirectoryRow) =>
    profile.role === "leadership" ||
    profile.role === "admin" ||
    r.owner_id === profile.id ||
    (profile.role === "head" && r.function === profile.function);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");
  const [tier, setTier] = React.useState<string>("All");
  const [sort, setSort] = React.useState<string>("risk");
  const [functionFilter, setFunctionFilter] = React.useState<string | null>(initialFunction);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (functionFilter && r.function !== functionFilter) return false;
      if (category !== "All" && r.category !== category) return false;
      if (tier !== "All" && String(r.tier) !== tier) return false;
      if (q) {
        const hay = `${r.name} ${r.notes ?? ""} ${r.ownerName ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      if (sort === "recent")
        return (b.last_contact_at ?? "").localeCompare(a.last_contact_at ?? "");
      if (sort === "name") return a.name.localeCompare(b.name);
      return RISK_RANK[b.risk] - RISK_RANK[a.risk] || a.name.localeCompare(b.name);
    });
    return out;
  }, [rows, query, category, tier, sort, functionFilter]);

  const chip = (value: string, current: string, set: (v: string) => void, label: string) => (
    <Button
      key={value}
      size="small"
      appearance={current === value ? "primary" : "outline"}
      shape="circular"
      onClick={() => set(value)}
    >
      {label}
    </Button>
  );

  return (
    <AppShell profile={profile} active="directory">
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headText}>
            <Title2>Directory</Title2>
            <Caption1>{`${rows.length} stakeholder${rows.length === 1 ? "" : "s"} in your scope`}</Caption1>
          </div>
          {canAdd ? (
            <div className={styles.headerActions}>
              {profile.role === "admin" && <ImportStakeholdersDialog categories={categories} functions={functions} />}
              <AddStakeholderDialog
                categories={categories}
                functions={addFunctions}
                members={members}
                currentUserId={profile.id}
              />
            </div>
          ) : (
            <RequestStakeholderDialog categories={categories} />
          )}
        </div>

        <SearchBox
          className={styles.search}
          placeholder="Search names, notes, owners…"
          value={query}
          onChange={(_, d) => setQuery(d.value)}
        />

        {functionFilter && (
          <div className={styles.chipRow}>
            <Button
              size="small"
              appearance="primary"
              shape="circular"
              onClick={() => setFunctionFilter(null)}
            >
              {`Function: ${functionFilter}  ✕`}
            </Button>
          </div>
        )}

        <div className={styles.chipRow}>
          {chip("All", category, setCategory, "All")}
          {categories.map((c) => chip(c, category, setCategory, c))}
        </div>

        <div className={styles.chipRow}>
          {chip("All", tier, setTier, "All")}
          {chip("1", tier, setTier, "Tier 1")}
          {chip("2", tier, setTier, "Tier 2")}
          <div className={styles.chipSpacer} />
          <div className={styles.sortWrap}>
            <Caption1>Sort</Caption1>
            <Select value={sort} onChange={(_, d) => setSort(d.value)}>
              <option value="risk">Risk (high → low)</option>
              <option value="recent">Last contact (recent)</option>
              <option value="name">Name (A → Z)</option>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          rows.length === 0 ? (
            <EmptyState
              title="No stakeholders yet"
              hint={
                canAdd
                  ? "Add your first stakeholder using the button above to start building your directory."
                  : "Stakeholders in your scope will appear here once they're added."
              }
            />
          ) : (
            <div className={styles.empty}>
              <Text>No stakeholders match your filters.</Text>
            </div>
          )
        ) : (
          <div className={styles.list}>
            {filtered.map((r) => (
              <StakeholderCard
                key={r.id}
                id={r.id}
                name={r.name}
                tier={r.tier}
                risk={r.risk}
                sentiment={r.sentiment}
                flagged={r.flagged}
                canFlag={canFlag(r)}
                meta={`${r.category} · ${r.ownerName ?? "Unassigned"} · Last contact ${formatDate(r.last_contact_at)}`}
              />
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
