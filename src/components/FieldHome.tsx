"use client";

import Link from "next/link";
import { makeStyles, tokens, Title2, Title3, Body1, Caption1, Text, Badge, Button } from "@fluentui/react-components";
import { AppShell } from "@/components/AppShell";
import { StakeholderCard, type StakeholderSummary } from "@/components/StakeholderCard";
import { LogEngagementDialog } from "@/components/LogEngagementDialog";
import { RequestStakeholderDialog } from "@/components/RequestStakeholderDialog";
import { completeCommitment } from "@/app/actions/commitment";
import type { Role } from "@/lib/roles";

type Commitment = {
  id: string;
  description: string;
  due_date: string;
  priority: "high" | "low";
  stakeholderId: string;
  stakeholderName: string;
};

function fmt(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function isOverdue(due: string): boolean {
  return new Date(due + "T00:00:00") < new Date(new Date().toDateString());
}

const useStyles = makeStyles({
  main: { maxWidth: "1040px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", rowGap: "20px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  head: { display: "flex", flexDirection: "column", rowGap: "2px" },
  ctas: { display: "flex", alignItems: "center", columnGap: "10px", rowGap: "10px", flexWrap: "wrap" },
  statCard: { padding: "16px 20px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, maxWidth: "260px", textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", rowGap: "2px", ":hover": { border: `1px solid ${tokens.colorBrandStroke1}` } },
  statNum: { fontSize: "28px", fontWeight: tokens.fontWeightBold, color: tokens.colorBrandForeground1 },
  card: { padding: "20px", backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge },
  commitRow: { display: "flex", alignItems: "center", columnGap: "10px", rowGap: "8px", flexWrap: "wrap", padding: "10px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  commitDesc: { display: "flex", flexDirection: "column", flexGrow: 1, minWidth: "150px" },
  link: { textDecoration: "none", color: tokens.colorBrandForeground1, fontWeight: tokens.fontWeightSemibold },
  badges: { display: "flex", alignItems: "center", columnGap: "8px", flexShrink: 0, marginLeft: "auto" },
  form: { margin: 0, display: "flex" },
  muted: { color: tokens.colorNeutralForeground3 },
  section: { display: "flex", flexDirection: "column", rowGap: "8px" },
  list: { display: "flex", flexDirection: "column", rowGap: "10px" },
  empty: { color: tokens.colorNeutralForeground3, paddingTop: "8px" },
});

export function FieldHome({
  viewer,
  dateLabel,
  myStakeholders,
  commitments,
  types,
  categories,
  today,
}: {
  viewer: { full_name: string; role: Role; function: string | null };
  dateLabel: string;
  myStakeholders: StakeholderSummary[];
  commitments: Commitment[];
  types: string[];
  categories: string[];
  today: string;
}) {
  const styles = useStyles();
  const firstName = viewer.full_name.split(" ")[0];
  const picker = myStakeholders.map((s) => ({ id: s.id, name: s.name }));

  return (
    <AppShell profile={viewer} active="home">
      <main className={styles.main}>
        <div className={styles.head}>
          <Title2>{`Good day, ${firstName}`}</Title2>
          <Caption1 className={styles.muted}>{dateLabel}</Caption1>
        </div>

        <div className={styles.ctas}>
          <LogEngagementDialog
            stakeholders={picker}
            types={types}
            today={today}
            triggerLabel="Log an engagement"
          />
          <RequestStakeholderDialog categories={categories} />
        </div>

        <Link href="/directory" className={styles.statCard}>
          <span className={styles.statNum}>{myStakeholders.length}</span>
          <Body1>my stakeholders</Body1>
          <Caption1 className={styles.muted}>The relationships I own. Tap to open the directory.</Caption1>
        </Link>

        <div className={styles.card}>
          <Title3>My open commitments</Title3>
          {commitments.length === 0 ? (
            <div className={styles.empty}>Nothing due — you&apos;re all caught up. 🎉</div>
          ) : (
            commitments.map((c) => (
              <div key={c.id} className={styles.commitRow}>
                <span className={styles.commitDesc}>
                  <Body1>{c.description}</Body1>
                  <Caption1 className={styles.muted}>
                    <Link href={`/directory/${c.stakeholderId}`} className={styles.link}>
                      {c.stakeholderName}
                    </Link>
                  </Caption1>
                </span>
                <span className={styles.badges}>
                  {c.priority === "high" && (
                    <Badge appearance="tint" color="danger" size="small">High</Badge>
                  )}
                  <Badge appearance="tint" color={isOverdue(c.due_date) ? "danger" : "informative"} size="small">
                    {isOverdue(c.due_date) ? `Overdue · ${fmt(c.due_date)}` : `Due ${fmt(c.due_date)}`}
                  </Badge>
                  <form action={completeCommitment} className={styles.form}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button type="submit" size="small" appearance="subtle">Done</Button>
                  </form>
                </span>
              </div>
            ))
          )}
        </div>

        <div className={styles.section}>
          <Title3>My stakeholders</Title3>
          {myStakeholders.length === 0 ? (
            <div className={styles.empty}>You don&apos;t own any stakeholders yet.</div>
          ) : (
            <div className={styles.list}>
              {myStakeholders.map((r) => (
                <StakeholderCard
                  key={r.id}
                  id={r.id}
                  name={r.name}
                  tier={r.tier}
                  risk={r.risk}
                  sentiment={r.sentiment}
                  flagged={r.flagged}
                  meta={`${r.category} · ${r.function}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
