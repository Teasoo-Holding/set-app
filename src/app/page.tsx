"use client";

import {
  makeStyles,
  tokens,
  Title2,
  Title3,
  Body1,
  Caption1,
  Card,
  Badge,
  Divider,
} from "@fluentui/react-components";
import {
  CheckmarkCircleFilled,
  BranchFilled,
  DatabaseFilled,
  ShieldTaskFilled,
  RocketFilled,
} from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
    display: "flex",
    justifyContent: "center",
    padding: "48px 24px",
  },
  shell: {
    width: "100%",
    maxWidth: "880px",
    display: "flex",
    flexDirection: "column",
    rowGap: "24px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
  },
  headerText: { display: "flex", flexDirection: "column" },
  hero: { display: "flex", flexDirection: "column", rowGap: "8px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
  },
  card: { padding: "20px", display: "flex", flexDirection: "column", rowGap: "12px" },
  cardHead: { display: "flex", alignItems: "center", columnGap: "10px" },
  icon: { fontSize: "24px", color: tokens.colorBrandForeground1 },
  storyList: { display: "flex", flexDirection: "column", rowGap: "8px", margin: 0 },
  story: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
  },
  storyDone: { color: tokens.colorStatusSuccessForeground1, fontSize: "16px" },
  footer: { display: "flex", flexDirection: "column", rowGap: "4px" },
});

type Foundation = {
  icon: React.ReactNode;
  title: string;
  stories: { id: string; label: string }[];
};

const foundations: Foundation[] = [
  {
    icon: <DatabaseFilled />,
    title: "Data model & audit",
    stories: [
      { id: "E0-1", label: "Core entities + referential integrity" },
      { id: "E0-3", label: "Append-only audit log (triggers)" },
    ],
  },
  {
    icon: <BranchFilled />,
    title: "Seed & demo data",
    stories: [{ id: "E0-2", label: "10 stakeholders, one-command load" }],
  },
  {
    icon: <ShieldTaskFilled />,
    title: "Access control",
    stories: [{ id: "E0-5", label: "RLS policy framework + test harness" }],
  },
  {
    icon: <RocketFilled />,
    title: "Deploy & environments",
    stories: [{ id: "E0-4", label: "CI deploy + externalised config" }],
  },
];

export default function Home() {
  const styles = useStyles();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <BrandMark size="lg" />
          <div className={styles.headerText}>
            <Title3>Stakeholder Intelligence System</Title3>
            <Caption1>Teasoo · Platform Foundations</Caption1>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Badge appearance="tint" color="brand">
              Epic E0
            </Badge>
          </div>
        </div>

        <Card className={styles.card}>
          <div className={styles.hero}>
            <Title2>One voice, one source of truth.</Title2>
            <Body1>
              The substrate every feature builds on — a deployable app with the
              real data model, an audit trail, seed data, access-control
              policies, and a deploy pipeline. Frictionless field capture rolling
              up into risk visibility for leadership.
            </Body1>
          </div>
        </Card>

        <div className={styles.grid}>
          {foundations.map((f) => (
            <Card key={f.title} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.icon}>{f.icon}</span>
                <Title3>{f.title}</Title3>
              </div>
              <Divider />
              <ul className={styles.storyList}>
                {f.stories.map((s) => (
                  <li key={s.id} className={styles.story}>
                    <CheckmarkCircleFilled className={styles.storyDone} />
                    <Body1>
                      <strong>{s.id}</strong> — {s.label}
                    </Body1>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className={styles.footer}>
          <Caption1>
            Stack: Next.js · Fluent UI v9 (Fluent 2) · Supabase (Postgres + Auth
            + RLS) · Brevo. Migrations are the source of truth; run{" "}
            <code>supabase db reset</code> to stand up the schema + seed.
          </Caption1>
          <Caption1>
            Next: E1 (auth &amp; RLS enforcement) → E2 (directory) → E3 (log
            engagement).
          </Caption1>
        </div>
      </div>
    </main>
  );
}
