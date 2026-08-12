"use client";

import { makeStyles, tokens, Title2, Body1, Caption1, Card } from "@fluentui/react-components";
import { AppHeader } from "@/components/AppHeader";
import { StakeholderTable, type StakeholderRow } from "@/components/StakeholderTable";
import type { Role } from "@/lib/roles";

const useStyles = makeStyles({
  main: {
    maxWidth: "1040px",
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    rowGap: "20px",
  },
  head: { display: "flex", flexDirection: "column", rowGap: "4px" },
  scopeCard: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    rowGap: "6px",
    maxWidth: "520px",
  },
  count: { fontSize: "28px", color: tokens.colorBrandForeground1 },
});

export function LandingView({
  name,
  role,
  func,
  title,
  subtitle,
  rows,
}: {
  name: string;
  role: Role;
  func: string | null;
  title: string;
  subtitle: string;
  rows: StakeholderRow[];
}) {
  const styles = useStyles();

  return (
    <div>
      <AppHeader name={name} role={role} func={func} />
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
            role and function permit, not a UI filter. Sign in as another role to
            watch this change.
          </Caption1>
        </Card>

        <StakeholderTable rows={rows} />
      </main>
    </div>
  );
}
