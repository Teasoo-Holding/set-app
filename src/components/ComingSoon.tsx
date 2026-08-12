"use client";

import { makeStyles, tokens, Title2, Body1 } from "@fluentui/react-components";
import { AppShell } from "@/components/AppShell";
import type { Role } from "@/lib/roles";

const useStyles = makeStyles({
  main: { maxWidth: "960px", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", rowGap: "8px", "@media (max-width: 640px)": { padding: "16px 12px" } },
  note: {
    marginTop: "12px",
    padding: "20px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
  },
});

export function ComingSoon({
  profile,
  active,
  title,
  subtitle,
  epic,
}: {
  profile: { full_name: string; role: Role; function: string | null };
  active: "home" | "directory" | "escalations";
  title: string;
  subtitle: string;
  epic: string;
}) {
  const styles = useStyles();
  return (
    <AppShell profile={profile} active={active}>
      <main className={styles.main}>
        <Title2>{title}</Title2>
        <Body1>{subtitle}</Body1>
        <div className={styles.note}>Coming in {epic}.</div>
      </main>
    </AppShell>
  );
}
