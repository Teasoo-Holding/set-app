"use client";

import * as React from "react";
import Link from "next/link";
import {
  makeStyles,
  tokens,
  Title2,
  Caption1,
  Text,
  Body1,
  Button,
  SearchBox,
  Select,
  Avatar,
  Badge,
} from "@fluentui/react-components";
import { AddRegular, FlagFilled } from "@fluentui/react-icons";
import { AppShell } from "@/components/AppShell";
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
};

const CATEGORIES = ["Regulator", "Government", "Community", "Commercial"];
const RISK_RANK = { high: 3, medium: 2, low: 1 } as const;
const riskColor = { high: "danger", medium: "warning", low: "success" } as const;
const riskLabel = { high: "High risk", medium: "Medium risk", low: "Low risk" } as const;
const sentColor = { supportive: "success", neutral: "warning", resistant: "danger" } as const;
const sentLabel = { supportive: "Supportive", neutral: "Neutral", resistant: "Resistant" } as const;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const useStyles = makeStyles({
  main: { maxWidth: "960px", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", rowGap: "16px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  header: { display: "flex", alignItems: "flex-start", columnGap: "12px" },
  headText: { display: "flex", flexDirection: "column", flexGrow: 1 },
  search: { width: "100%" },
  chipRow: { display: "flex", alignItems: "center", columnGap: "8px", rowGap: "8px", flexWrap: "wrap" },
  chipSpacer: { flexGrow: 1 },
  sortWrap: { display: "flex", alignItems: "center", columnGap: "8px" },
  list: { display: "flex", flexDirection: "column", rowGap: "10px", marginTop: "4px" },
  card: {
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
    padding: "14px 18px",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
    transitionProperty: "box-shadow, border-color",
    transitionDuration: tokens.durationNormal,
    ":hover": {
      boxShadow: tokens.shadow8,
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
  },
  cardMid: { display: "flex", flexDirection: "column", rowGap: "3px", flexGrow: 1, minWidth: 0 },
  nameRow: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  name: { fontSize: tokens.fontSizeBase400, lineHeight: tokens.lineHeightBase400 },
  meta: { color: tokens.colorNeutralForeground3 },
  pills: { display: "flex", flexDirection: "column", alignItems: "flex-end", rowGap: "6px", flexShrink: 0 },
  flagBadge: { display: "inline-flex", alignItems: "center", columnGap: "4px" },
  empty: { padding: "40px", textAlign: "center", color: tokens.colorNeutralForeground3 },
});

export function DirectoryView({
  profile,
  rows,
}: {
  profile: { full_name: string; role: Role; function: string | null };
  rows: DirectoryRow[];
}) {
  const styles = useStyles();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");
  const [tier, setTier] = React.useState<string>("All");
  const [sort, setSort] = React.useState<string>("risk");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => {
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
  }, [rows, query, category, tier, sort]);

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
          <Button appearance="outline" icon={<AddRegular />} title="Coming with E4-3">
            Request new
          </Button>
        </div>

        <SearchBox
          className={styles.search}
          placeholder="Search names, notes, owners…"
          value={query}
          onChange={(_, d) => setQuery(d.value)}
        />

        <div className={styles.chipRow}>
          {chip("All", category, setCategory, "All")}
          {CATEGORIES.map((c) => chip(c, category, setCategory, c))}
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
          <div className={styles.empty}>
            <Text>No stakeholders match your filters.</Text>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((r) => (
              <Link key={r.id} href={`/directory/${r.id}`} className={styles.card}>
                <Avatar name={r.name} color="colorful" size={40} shape="square" />
                <div className={styles.cardMid}>
                  <div className={styles.nameRow}>
                    <Text weight="semibold" className={styles.name}>
                      {r.name}
                    </Text>
                    <Badge appearance="tint" color="informative" size="small">
                      {`Tier ${r.tier}`}
                    </Badge>
                    {r.flagged && (
                      <Badge appearance="tint" color="danger" size="small">
                        <span className={styles.flagBadge}>
                          <FlagFilled fontSize={12} /> Flagged
                        </span>
                      </Badge>
                    )}
                  </div>
                  <Caption1 className={styles.meta}>
                    {`${r.category} · ${r.ownerName ?? "Unassigned"} · Last contact ${formatDate(r.last_contact_at)}`}
                  </Caption1>
                </div>
                <div className={styles.pills}>
                  <Badge appearance="filled" color={riskColor[r.risk]}>
                    {riskLabel[r.risk]}
                  </Badge>
                  <Badge appearance="tint" color={sentColor[r.sentiment]}>
                    {sentLabel[r.sentiment]}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
