"use client";

import * as React from "react";
import Link from "next/link";
import { makeStyles, tokens, Title1, Title2, Title3, Body1, Body2, Caption1, Text, Button } from "@fluentui/react-components";
import {
  PeopleTeamRegular, NotepadRegular, WarningRegular, DataTrendingRegular,
  ShieldCheckmarkRegular, MailRegular, LockClosedRegular, GlobeRegular,
} from "@fluentui/react-icons";
import { MarketingHeader, MarketingFooter } from "@/components/MarketingChrome";
import { COMPANY } from "@/lib/company";

const useStyles = makeStyles({
  page: { backgroundColor: tokens.colorNeutralBackground2, minHeight: "100vh", display: "flex", flexDirection: "column" },
  section: { maxWidth: "1080px", margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box" },

  hero: { textAlign: "center", padding: "64px 24px 56px", display: "flex", flexDirection: "column", alignItems: "center", rowGap: "20px" },
  heroTitle: { maxWidth: "760px" },
  heroSub: { maxWidth: "620px", color: tokens.colorNeutralForeground2, fontSize: tokens.fontSizeBase400, lineHeight: tokens.lineHeightBase400 },
  ctaRow: { display: "flex", columnGap: "12px", rowGap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "4px" },
  pill: { display: "inline-flex", alignItems: "center", columnGap: "8px", padding: "6px 14px", borderRadius: tokens.borderRadiusCircular, backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1, fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold },

  band: { padding: "56px 24px" },
  bandAlt: { backgroundColor: tokens.colorNeutralBackground1, borderTop: `1px solid ${tokens.colorNeutralStroke2}`, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  bandHead: { textAlign: "center", display: "flex", flexDirection: "column", rowGap: "8px", alignItems: "center", marginBottom: "36px" },
  bandSub: { color: tokens.colorNeutralForeground2, maxWidth: "620px" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", columnGap: "20px", rowGap: "20px" },
  card: { backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, padding: "24px", display: "flex", flexDirection: "column", rowGap: "10px" },
  cardAlt: { backgroundColor: tokens.colorNeutralBackground2, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, padding: "24px", display: "flex", flexDirection: "column", rowGap: "10px" },
  icon: { fontSize: "26px", color: tokens.colorBrandForeground1, display: "flex" },
  cardBody: { color: tokens.colorNeutralForeground2 },

  steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", columnGap: "20px", rowGap: "20px" },
  step: { display: "flex", flexDirection: "column", rowGap: "8px" },
  stepNum: { width: "32px", height: "32px", borderRadius: tokens.borderRadiusCircular, backgroundColor: tokens.colorBrandBackground, color: tokens.colorNeutralForegroundOnBrand, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: tokens.fontWeightSemibold },

  secList: { display: "flex", flexDirection: "column", rowGap: "14px" },
  secItem: { display: "flex", alignItems: "flex-start", columnGap: "12px" },
  secText: { display: "flex", flexDirection: "column", rowGap: "2px" },

  ctaBand: { textAlign: "center", padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", rowGap: "16px" },
});

const FEATURES = [
  { icon: <PeopleTeamRegular />, title: "One authoritative directory", body: "Every stakeholder in one tiered record — no more scattered spreadsheets or conflicting versions of the truth." },
  { icon: <NotepadRegular />, title: "Frictionless logging", body: "The field captures an engagement in seconds. Each log refreshes the record and keeps relationships from going stale." },
  { icon: <WarningRegular />, title: "Risk & escalations", body: "High risk or a raised flag opens an escalation automatically, so the right people act before a problem grows." },
  { icon: <DataTrendingRegular />, title: "Leadership visibility", body: "Function heads and leadership see sentiment, risk and commitments across the portfolio — live, not in a monthly deck." },
];

const STEPS = [
  { n: 1, title: "Log the engagement", body: "The field records who they met and what happened." },
  { n: 2, title: "See the risk", body: "Sentiment and risk update; escalations open when they need to." },
  { n: 3, title: "Follow through", body: "Commitments are tracked and nudged so nothing is dropped." },
  { n: 4, title: "Report with confidence", body: "Leadership reads one live source of truth across every function." },
];

const SECURITY = [
  { icon: <LockClosedRegular />, title: "Strict tenant isolation", body: "Each organisation's data is walled off in the database — enforced by row-level security and tested continuously. One customer can never see another's data." },
  { icon: <ShieldCheckmarkRegular />, title: "Role-based access", body: "People see only what their role allows. Access is decided in the database, not just hidden in the interface." },
  { icon: <GlobeRegular />, title: "GDPR & NDPA aligned", body: "Built to the EU GDPR and the Nigeria Data Protection Act 2023. Read our plain-English privacy notice for the detail." },
];

export function LandingPage() {
  const styles = useStyles();

  return (
    <div className={styles.page}>
      <MarketingHeader />

      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.pill}>Stakeholder Engagement Tracker</span>
        <Title1 as="h1" className={styles.heroTitle}>One voice, one source of truth for every stakeholder relationship.</Title1>
        <Body1 className={styles.heroSub}>
          {COMPANY.product} gives your teams one place to log engagements, track risk and commitments, and give leadership a live
          view of every relationship — so nothing important slips.
        </Body1>
        <div className={styles.ctaRow}>
          <Link href="/login"><Button appearance="primary" size="large">Sign in</Button></Link>
          <a href={`mailto:${COMPANY.email}?subject=Teasoo%20SET%20demo`}>
            <Button appearance="outline" size="large" icon={<MailRegular />}>Request a demo</Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`${styles.band} ${styles.bandAlt}`}>
        <div className={styles.section}>
          <div className={styles.bandHead}>
            <Title2>Everything the relationship needs, in one place</Title2>
            <Body1 className={styles.bandSub}>From the field team&apos;s first note to the boardroom summary.</Body1>
          </div>
          <div className={styles.grid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.card}>
                <span className={styles.icon}>{f.icon}</span>
                <Title3>{f.title}</Title3>
                <Body2 className={styles.cardBody}>{f.body}</Body2>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.band}>
        <div className={styles.section}>
          <div className={styles.bandHead}>
            <Title2>How it works</Title2>
            <Body1 className={styles.bandSub}>A simple loop that keeps every relationship moving.</Body1>
          </div>
          <div className={styles.steps}>
            {STEPS.map((s) => (
              <div key={s.n} className={styles.step}>
                <span className={styles.stepNum}>{s.n}</span>
                <Title3>{s.title}</Title3>
                <Body2 className={styles.cardBody}>{s.body}</Body2>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className={`${styles.band} ${styles.bandAlt}`}>
        <div className={styles.section}>
          <div className={styles.bandHead}>
            <Title2>Security &amp; privacy by design</Title2>
            <Body1 className={styles.bandSub}>Built for multinational organisations that take data protection seriously.</Body1>
          </div>
          <div className={styles.secList}>
            {SECURITY.map((s) => (
              <div key={s.title} className={styles.card}>
                <div className={styles.secItem}>
                  <span className={styles.icon}>{s.icon}</span>
                  <span className={styles.secText}>
                    <Title3>{s.title}</Title3>
                    <Body2 className={styles.cardBody}>{s.body}</Body2>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaBand}>
        <Title2>Ready to see it?</Title2>
        <Body1 className={styles.bandSub}>Access is by invitation. Talk to us about a pilot for your organisation.</Body1>
        <div className={styles.ctaRow}>
          <a href={`mailto:${COMPANY.email}?subject=Teasoo%20SET%20demo`}>
            <Button appearance="primary" size="large" icon={<MailRegular />}>Email {COMPANY.email}</Button>
          </a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
