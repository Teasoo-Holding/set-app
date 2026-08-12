"use client";

import Link from "next/link";
import { makeStyles, tokens, Title2, Title3, Body1, Caption1, Text, Card } from "@fluentui/react-components";
import { AppShell } from "@/components/AppShell";
import { StakeholderTable, type StakeholderRow } from "@/components/StakeholderTable";
import type { Role } from "@/lib/roles";

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
  main: { maxWidth: "1040px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", rowGap: "20px" },
  head: { display: "flex", flexDirection: "column", rowGap: "4px" },
  scopeCard: { padding: "20px", display: "flex", flexDirection: "column", rowGap: "6px", maxWidth: "520px" },
  count: { fontSize: "28px", color: tokens.colorBrandForeground1 },
  card: { padding: "20px" },
  actItem: { display: "flex", columnGap: "10px", padding: "10px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  dot: { width: "8px", height: "8px", borderRadius: "50%", marginTop: "7px", flexShrink: 0 },
  actBody: { display: "flex", flexDirection: "column", rowGap: "2px", flexGrow: 1, minWidth: 0 },
  actTop: { display: "flex", justifyContent: "space-between", columnGap: "8px" },
  link: { textDecoration: "none", color: tokens.colorBrandForeground1, fontWeight: tokens.fontWeightSemibold },
  muted: { color: tokens.colorNeutralForeground3 },
  empty: { color: tokens.colorNeutralForeground3, paddingTop: "8px" },
});

export function LandingView({
  name,
  role,
  func,
  title,
  subtitle,
  rows,
  activity,
}: {
  name: string;
  role: Role;
  func: string | null;
  title: string;
  subtitle: string;
  rows: StakeholderRow[];
  activity: Activity[];
}) {
  const styles = useStyles();

  return (
    <AppShell profile={{ full_name: name, role, function: func }} active="home">
      <main className={styles.main}>
        <div className={styles.head}>
          <Title2>{title}</Title2>
          <Body1>{subtitle}</Body1>
        </div>

        <Card className={styles.scopeCard}>
          <Title2 as="h2" className={styles.count}>
            {rows.length}
          </Title2>
          <Body1>stakeholders visible to you</Body1>
          <Caption1>
            Enforced by row-level security — the database returns only what your
            role and function permit, not a UI filter.
          </Caption1>
        </Card>

        {/* Recent activity (E3-4) */}
        <Card className={styles.card}>
          <Title3>Recent activity</Title3>
          {activity.length === 0 ? (
            <div className={styles.empty}>No recent engagements in your scope.</div>
          ) : (
            activity.map((a) => (
              <div key={a.id} className={styles.actItem}>
                <span className={styles.dot} style={{ backgroundColor: sentDot[a.sentiment] }} />
                <div className={styles.actBody}>
                  <div className={styles.actTop}>
                    <Text>
                      <Link href={`/directory/${a.stakeholder_id}`} className={styles.link}>
                        {a.stakeholder_name}
                      </Link>
                      <Caption1 className={styles.muted}>{`  ·  ${a.engagement_type}`}</Caption1>
                    </Text>
                    <Caption1 className={styles.muted}>{fmt(a.occurred_on)}</Caption1>
                  </div>
                  {a.note_excerpt && <Caption1 className={styles.muted}>{a.note_excerpt}</Caption1>}
                </div>
              </div>
            ))
          )}
        </Card>

        <StakeholderTable rows={rows} />
      </main>
    </AppShell>
  );
}
