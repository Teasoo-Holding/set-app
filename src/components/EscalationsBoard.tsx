"use client";

import * as React from "react";
import Link from "next/link";
import { makeStyles, tokens, Title2, Title3, Body1, Caption1, Text, Button, Badge } from "@fluentui/react-components";
import { AppShell } from "@/components/AppShell";
import { setEscalationStatus } from "@/app/actions/escalation";
import type { Role } from "@/lib/roles";

export type EscalationItem = {
  id: string;
  status: "open" | "acknowledged" | "assigned" | "intervened" | "resolved";
  severity: "critical" | "elevated";
  summary: string | null;
  nextActionDate: string | null;
  ageDays: number;
  stakeholderId: string;
  stakeholderName: string;
  tier: number;
  function: string;
  risk: "low" | "medium" | "high";
  sentiment: "supportive" | "neutral" | "resistant";
  ownerName: string | null;
  assigneeName: string | null;
};

const statusLabel = {
  open: "Open",
  acknowledged: "Acknowledged",
  assigned: "Assigned",
  intervened: "Intervened",
  resolved: "Resolved",
} as const;
const riskLabel = { high: "High risk", medium: "Medium risk", low: "Low risk" } as const;
const riskColor = { high: "danger", medium: "warning", low: "success" } as const;
const sentLabel = { supportive: "Supportive", neutral: "Neutral", resistant: "Resistant" } as const;

// The next lifecycle step for the current status (E6-5).
function nextStep(status: EscalationItem["status"]): { action: string; label: string } | null {
  switch (status) {
    case "open":
      return { action: "acknowledge", label: "Acknowledge" };
    case "acknowledged":
      return { action: "assign", label: "Assign to me" };
    case "assigned":
      return { action: "intervene", label: "Mark intervened" };
    default:
      return null;
  }
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const useStyles = makeStyles({
  main: { maxWidth: "960px", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", rowGap: "16px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  head: { display: "flex", flexDirection: "column", rowGap: "4px" },
  counters: { display: "flex", columnGap: "12px", rowGap: "12px", flexWrap: "wrap" },
  tile: { flex: 1, minWidth: "130px", padding: "16px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, display: "flex", flexDirection: "column", rowGap: "2px" },
  tileNum: { fontSize: "26px", fontWeight: tokens.fontWeightBold },
  chipRow: { display: "flex", alignItems: "center", columnGap: "8px", rowGap: "8px", flexWrap: "wrap" },
  list: { display: "flex", flexDirection: "column", rowGap: "10px" },
  card: { padding: "16px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, display: "flex", flexDirection: "column", rowGap: "10px" },
  cardTop: { display: "flex", alignItems: "flex-start", columnGap: "10px", flexWrap: "wrap" },
  cardName: { display: "flex", flexDirection: "column", rowGap: "2px", flexGrow: 1, minWidth: 0 },
  nameRow: { display: "flex", alignItems: "center", columnGap: "8px", flexWrap: "wrap" },
  tags: { display: "flex", alignItems: "center", columnGap: "6px", rowGap: "6px", flexWrap: "wrap" },
  meta: { color: tokens.colorNeutralForeground3 },
  actions: { display: "flex", alignItems: "center", columnGap: "8px", rowGap: "8px", flexWrap: "wrap", paddingTop: "4px", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  spacer: { flexGrow: 1 },
  form: { margin: 0, display: "flex" },
  empty: { padding: "40px", textAlign: "center", color: tokens.colorNeutralForeground3 },
});

export function EscalationsBoard({
  viewer,
  items,
  counts,
  canManage,
}: {
  viewer: { full_name: string; role: Role; function: string | null };
  items: EscalationItem[];
  counts: { critical: number; elevated: number; total: number };
  canManage: boolean;
}) {
  const styles = useStyles();
  const [filter, setFilter] = React.useState<"all" | "critical" | "high">("all");

  const shown = items.filter((i) => {
    if (filter === "critical") return i.severity === "critical";
    if (filter === "high") return i.risk === "high";
    return true;
  });

  const chip = (value: typeof filter, label: string) => (
    <Button size="small" shape="circular" appearance={filter === value ? "primary" : "outline"} onClick={() => setFilter(value)}>
      {label}
    </Button>
  );

  return (
    <AppShell profile={viewer} active="escalations">
      <main className={styles.main}>
        <div className={styles.head}>
          <Title2>Escalations</Title2>
          <Body1>High-risk and flagged stakeholders as an ordered, workable queue.</Body1>
        </div>

        <div className={styles.counters}>
          <div className={styles.tile}>
            <span className={styles.tileNum} style={{ color: tokens.colorStatusDangerForeground1 }}>{counts.critical}</span>
            <Caption1>Critical</Caption1>
          </div>
          <div className={styles.tile}>
            <span className={styles.tileNum} style={{ color: tokens.colorStatusWarningForeground1 }}>{counts.elevated}</span>
            <Caption1>Elevated</Caption1>
          </div>
          <div className={styles.tile}>
            <span className={styles.tileNum}>{counts.total}</span>
            <Caption1>Total active</Caption1>
          </div>
        </div>

        <div className={styles.chipRow}>
          {chip("all", "All")}
          {chip("critical", "Critical")}
          {chip("high", "High risk")}
        </div>

        {shown.length === 0 ? (
          <div className={styles.empty}>
            <Text>Nothing on the board. There are no active escalations in your scope right now.</Text>
          </div>
        ) : (
          <div className={styles.list}>
            {shown.map((e) => {
              const step = nextStep(e.status);
              return (
                <div key={e.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardName}>
                      <div className={styles.nameRow}>
                        <Text weight="semibold">{e.stakeholderName}</Text>
                        <Badge appearance="tint" color="informative" size="small">{`Tier ${e.tier}`}</Badge>
                        <Caption1 className={styles.meta}>{e.function}</Caption1>
                      </div>
                      <Caption1 className={styles.meta}>
                        {`Owner · ${e.ownerName ?? "Unassigned"}`}
                        {e.assigneeName ? `  ·  Assigned · ${e.assigneeName}` : ""}
                        {`  ·  ${e.ageDays}d open  ·  Next action ${fmt(e.nextActionDate)}`}
                      </Caption1>
                    </div>
                    <div className={styles.tags}>
                      <Badge appearance="filled" color={e.severity === "critical" ? "danger" : "warning"}>
                        {e.severity === "critical" ? "Critical" : "Elevated"}
                      </Badge>
                      <Badge appearance="tint" color="subtle" size="small">{statusLabel[e.status]}</Badge>
                    </div>
                  </div>

                  <div className={styles.tags}>
                    <Badge appearance="tint" color={riskColor[e.risk]} size="small">{riskLabel[e.risk]}</Badge>
                    <Badge appearance="tint" color="subtle" size="small">{sentLabel[e.sentiment]}</Badge>
                  </div>

                  {e.summary && <Body1 className={styles.meta}>{e.summary}</Body1>}

                  <div className={styles.actions}>
                    <Link href={`/directory/${e.stakeholderId}`}>
                      <Button size="small" appearance="subtle">View profile</Button>
                    </Link>
                    <div className={styles.spacer} />
                    {canManage && step && (
                      <form action={setEscalationStatus} className={styles.form}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="action" value={step.action} />
                        <Button size="small" type="submit">{step.label}</Button>
                      </form>
                    )}
                    {canManage && (
                      <form action={setEscalationStatus} className={styles.form}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="action" value="resolve" />
                        <Button size="small" type="submit" appearance="primary">Resolve</Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
