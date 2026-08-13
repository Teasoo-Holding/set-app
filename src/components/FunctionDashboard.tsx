"use client";

import Link from "next/link";
import { makeStyles, tokens, Title2, Title3, Body1, Caption1, Text, Avatar, Badge } from "@fluentui/react-components";
import { AppShell } from "@/components/AppShell";
import type { Role } from "@/lib/roles";

type Kpi = { highRisk: number; openEscalations: number; dueThisWeek: number; pctSupportive: number };
type Mix = { supportive: number; neutral: number; resistant: number; total: number };
type TeamMember = { id: string; name: string; stakeholderCount: number; escalationCount: number };
type Esc = { id: string; severity: "critical" | "elevated"; stakeholderId: string; stakeholderName: string; ageDays: number };
type Activity = {
  id: string;
  stakeholder_id: string;
  stakeholder_name: string;
  sentiment: "supportive" | "neutral" | "resistant";
  engagement_type: string;
  occurred_on: string;
  note_excerpt: string | null;
};

const sentDot = { supportive: "#0e700e", neutral: "#eaa300", resistant: "#c50f1f" } as const;
function fmt(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const useStyles = makeStyles({
  main: { maxWidth: "1040px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", rowGap: "20px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  head: { display: "flex", flexDirection: "column", rowGap: "2px" },
  kpis: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", columnGap: "12px", rowGap: "12px" },
  kpi: { padding: "16px 18px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, display: "flex", flexDirection: "column", rowGap: "2px" },
  kpiNum: { fontSize: "28px", fontWeight: tokens.fontWeightBold },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", columnGap: "16px", rowGap: "16px" },
  card: { padding: "20px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, display: "flex", flexDirection: "column", rowGap: "12px" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", columnGap: "8px" },
  bar: { display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden", backgroundColor: tokens.colorNeutralBackground3 },
  legend: { display: "flex", columnGap: "16px", rowGap: "6px", flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", columnGap: "6px" },
  dot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  row: { display: "flex", alignItems: "center", columnGap: "10px", padding: "8px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  rowGrow: { flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" },
  right: { display: "flex", alignItems: "center", columnGap: "8px", flexShrink: 0 },
  link: { textDecoration: "none", color: tokens.colorBrandForeground1, fontWeight: tokens.fontWeightSemibold },
  muted: { color: tokens.colorNeutralForeground3 },
  actTop: { display: "flex", justifyContent: "space-between", columnGap: "8px" },
  actDate: { color: tokens.colorNeutralForeground3, whiteSpace: "nowrap", flexShrink: 0 },
  empty: { color: tokens.colorNeutralForeground3, paddingTop: "4px" },
});

function pct(n: number, total: number): number {
  return total ? Math.round((n / total) * 100) : 0;
}

export function FunctionDashboard({
  viewer,
  functionName,
  kpis,
  mix,
  team,
  escalations,
  activity,
}: {
  viewer: { full_name: string; role: Role; function: string | null };
  functionName: string;
  kpis: Kpi;
  mix: Mix;
  team: TeamMember[];
  escalations: Esc[];
  activity: Activity[];
}) {
  const styles = useStyles();

  const kpiCards = [
    { label: "High risk", value: kpis.highRisk, color: tokens.colorStatusDangerForeground1 },
    { label: "Open escalations", value: kpis.openEscalations, color: tokens.colorStatusWarningForeground1 },
    { label: "Due this week", value: kpis.dueThisWeek, color: tokens.colorNeutralForeground1 },
    { label: "% Supportive", value: `${kpis.pctSupportive}%`, color: tokens.colorStatusSuccessForeground1 },
  ];

  return (
    <AppShell profile={viewer} active="home">
      <main className={styles.main}>
        <div className={styles.head}>
          <Title2>{`${functionName} dashboard`}</Title2>
          <Body1>Your function&apos;s health, team, and what&apos;s urgent — at a glance.</Body1>
        </div>

        {/* E8-1 KPI cards */}
        <div className={styles.kpis}>
          {kpiCards.map((k) => (
            <div key={k.label} className={styles.kpi}>
              <span className={styles.kpiNum} style={{ color: k.color }}>{k.value}</span>
              <Caption1>{k.label}</Caption1>
            </div>
          ))}
        </div>

        <div className={styles.grid2}>
          {/* E8-2 Sentiment mix */}
          <div className={styles.card}>
            <Title3>Sentiment mix</Title3>
            {mix.total === 0 ? (
              <div className={styles.empty}>No stakeholders yet.</div>
            ) : (
              <>
                <div className={styles.bar}>
                  <span style={{ width: `${pct(mix.supportive, mix.total)}%`, backgroundColor: sentDot.supportive }} />
                  <span style={{ width: `${pct(mix.neutral, mix.total)}%`, backgroundColor: sentDot.neutral }} />
                  <span style={{ width: `${pct(mix.resistant, mix.total)}%`, backgroundColor: sentDot.resistant }} />
                </div>
                <div className={styles.legend}>
                  <span className={styles.legendItem}>
                    <span className={styles.dot} style={{ backgroundColor: sentDot.supportive }} />
                    <Caption1>{`Supportive ${pct(mix.supportive, mix.total)}%`}</Caption1>
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.dot} style={{ backgroundColor: sentDot.neutral }} />
                    <Caption1>{`Neutral ${pct(mix.neutral, mix.total)}%`}</Caption1>
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.dot} style={{ backgroundColor: sentDot.resistant }} />
                    <Caption1>{`Resistant ${pct(mix.resistant, mix.total)}%`}</Caption1>
                  </span>
                </div>
                <Caption1 className={styles.muted}>Trend over time comes with risk/sentiment history.</Caption1>
              </>
            )}
          </div>

          {/* E8-3 Team roster */}
          <div className={styles.card}>
            <Title3>My team</Title3>
            {team.length === 0 ? (
              <div className={styles.empty}>No direct reports on file.</div>
            ) : (
              team.map((m) => (
                <div key={m.id} className={styles.row}>
                  <Avatar name={m.name} color="colorful" size={28} />
                  <span className={styles.rowGrow}>
                    <Text weight="semibold">{m.name}</Text>
                  </span>
                  <span className={styles.right}>
                    <Badge appearance="tint" color="informative" size="small">{`${m.stakeholderCount} stakeholders`}</Badge>
                    {m.escalationCount > 0 && (
                      <Badge appearance="tint" color="danger" size="small">{`${m.escalationCount} esc.`}</Badge>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* E8-4 Function escalations */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <Title3>Escalations</Title3>
            <Link href="/escalations" className={styles.link}>
              View board
            </Link>
          </div>
          {escalations.length === 0 ? (
            <div className={styles.empty}>Nothing on the board. 🎉</div>
          ) : (
            escalations.map((e) => (
              <div key={e.id} className={styles.row}>
                <Badge appearance="filled" color={e.severity === "critical" ? "danger" : "warning"} size="small">
                  {e.severity === "critical" ? "Critical" : "Elevated"}
                </Badge>
                <span className={styles.rowGrow}>
                  <Link href={`/directory/${e.stakeholderId}`} className={styles.link}>
                    {e.stakeholderName}
                  </Link>
                </span>
                <Caption1 className={styles.muted}>{`${e.ageDays}d open`}</Caption1>
              </div>
            ))
          )}
        </div>

        {/* E8-4 Recent activity */}
        <div className={styles.card}>
          <Title3>Recent activity</Title3>
          {activity.length === 0 ? (
            <div className={styles.empty}>No recent engagements in your function.</div>
          ) : (
            activity.map((a) => (
              <div key={a.id} className={styles.row}>
                <span className={styles.dot} style={{ backgroundColor: sentDot[a.sentiment], marginTop: "6px" }} />
                <span className={styles.rowGrow}>
                  <div className={styles.actTop}>
                    <Text>
                      <Link href={`/directory/${a.stakeholder_id}`} className={styles.link}>
                        {a.stakeholder_name}
                      </Link>
                      <Caption1 className={styles.muted}>{`  ·  ${a.engagement_type}`}</Caption1>
                    </Text>
                    <Caption1 className={styles.actDate}>{fmt(a.occurred_on)}</Caption1>
                  </div>
                  {a.note_excerpt && <Caption1 className={styles.muted}>{a.note_excerpt}</Caption1>}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </AppShell>
  );
}
