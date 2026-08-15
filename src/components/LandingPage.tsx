"use client";

import * as React from "react";
import { makeStyles, tokens, Title2, Title3, Body1, Body2, Caption1, Text, Button } from "@fluentui/react-components";
import {
  PeopleTeamRegular, NotepadRegular, WarningRegular, DataTrendingRegular,
  ShieldCheckmarkRegular, MailRegular, LockClosedRegular, GlobeRegular,
  ArrowRightRegular, CheckmarkCircleFilled,
} from "@fluentui/react-icons";
import { MarketingHeader, MarketingFooter } from "@/components/MarketingChrome";
import { COMPANY } from "@/lib/company";

const useStyles = makeStyles({
  page: { backgroundColor: tokens.colorNeutralBackground2, minHeight: "100vh", display: "flex", flexDirection: "column" },
  section: { maxWidth: "1120px", margin: "0 auto", padding: "0 24px", width: "100%", boxSizing: "border-box" },

  /* ---- Hero ---- */
  hero: {
    position: "relative",
    overflow: "hidden",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    backgroundImage: `radial-gradient(80% 120% at 92% -10%, ${tokens.colorBrandBackground2} 0%, transparent 60%)`,
  },
  heroInner: {
    maxWidth: "1120px", margin: "0 auto", padding: "72px 24px 76px", width: "100%", boxSizing: "border-box",
    display: "grid", gridTemplateColumns: "1.08fr 0.92fr", columnGap: "56px", rowGap: "48px", alignItems: "center",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr", padding: "48px 24px 56px" },
  },
  heroCopy: { display: "flex", flexDirection: "column", rowGap: "22px" },
  pill: {
    alignSelf: "flex-start", display: "inline-flex", alignItems: "center", columnGap: "8px",
    padding: "6px 14px", borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1,
    fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold, letterSpacing: "0.02em",
  },
  pillDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: tokens.colorBrandForeground1 },
  h1: {
    margin: 0, fontFamily: tokens.fontFamilyBase, fontWeight: tokens.fontWeightBold,
    fontSize: "clamp(38px, 5.4vw, 60px)", lineHeight: 1.04, letterSpacing: "-0.02em", color: tokens.colorNeutralForeground1,
  },
  heroSub: { color: tokens.colorNeutralForeground2, fontSize: "clamp(17px, 2vw, 20px)", lineHeight: 1.55, maxWidth: "42ch" },
  ctaRow: { display: "flex", columnGap: "12px", rowGap: "12px", flexWrap: "wrap", marginTop: "2px" },
  trustLine: { display: "flex", alignItems: "center", columnGap: "18px", rowGap: "8px", flexWrap: "wrap", marginTop: "8px" },
  trustItem: { display: "inline-flex", alignItems: "center", columnGap: "6px", color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 },
  trustCheck: { color: tokens.colorStatusSuccessForeground1, fontSize: "16px", display: "flex" },

  /* ---- Product preview mock ---- */
  mock: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: "0 24px 60px -20px rgba(16,26,58,.28), 0 2px 8px rgba(16,26,58,.08)",
    overflow: "hidden",
    "@media (max-width: 900px)": { maxWidth: "520px", justifySelf: "center", width: "100%" },
  },
  mockBar: {
    display: "flex", alignItems: "center", columnGap: "8px", padding: "12px 16px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, backgroundColor: tokens.colorNeutralBackground2,
  },
  mockDot: { width: "10px", height: "10px", borderRadius: "50%" },
  mockBarLabel: { marginLeft: "8px", color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200, fontWeight: tokens.fontWeightSemibold },
  mockBody: { padding: "18px", display: "flex", flexDirection: "column", rowGap: "14px" },
  mockKpis: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", columnGap: "10px" },
  mockKpi: { border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, padding: "12px" },
  mockKpiNum: { fontSize: "24px", fontWeight: tokens.fontWeightBold, lineHeight: 1.1 },
  mockKpiLabel: { color: tokens.colorNeutralForeground3, fontSize: "11px", marginTop: "2px" },
  mockCard: { border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusLarge, padding: "14px", display: "flex", flexDirection: "column", rowGap: "10px" },
  mockCardTitle: { color: tokens.colorNeutralForeground2, fontSize: "12px", fontWeight: tokens.fontWeightSemibold, letterSpacing: "0.02em" },
  mockSentiment: { display: "flex", height: "10px", borderRadius: tokens.borderRadiusCircular, overflow: "hidden" },
  mockLegend: { display: "flex", columnGap: "14px", flexWrap: "wrap" },
  mockLegendItem: { display: "inline-flex", alignItems: "center", columnGap: "6px", color: tokens.colorNeutralForeground3, fontSize: "11px" },
  legDot: { width: "8px", height: "8px", borderRadius: "50%" },
  mockRow: { display: "flex", alignItems: "center", columnGap: "10px" },
  mockChip: { fontSize: "10px", fontWeight: tokens.fontWeightBold, letterSpacing: "0.04em", padding: "3px 7px", borderRadius: "6px", textTransform: "uppercase" },
  mockRowText: { flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" },
  mockRowName: { fontSize: "13px", fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 },
  mockRowMeta: { fontSize: "11px", color: tokens.colorNeutralForeground3 },
  mockAge: { fontSize: "11px", color: tokens.colorNeutralForeground3, whiteSpace: "nowrap" },

  /* ---- Trust bar ---- */
  trustBar: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`, backgroundColor: tokens.colorNeutralBackground2,
    padding: "22px 24px",
  },
  trustBarInner: { maxWidth: "1120px", margin: "0 auto", display: "flex", alignItems: "center", columnGap: "28px", rowGap: "12px", flexWrap: "wrap", justifyContent: "center" },
  trustBarLabel: { color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "11px", fontWeight: tokens.fontWeightSemibold },
  wordmark: { fontSize: "26px", fontWeight: tokens.fontWeightBold, color: tokens.colorNeutralForeground2, letterSpacing: "0.01em" },

  /* ---- Bands ---- */
  band: { padding: "72px 24px" },
  bandAlt: { backgroundColor: tokens.colorNeutralBackground1, borderTop: `1px solid ${tokens.colorNeutralStroke2}`, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` },
  bandHead: { display: "flex", flexDirection: "column", rowGap: "10px", alignItems: "center", textAlign: "center", marginBottom: "44px" },
  bandKicker: { color: tokens.colorBrandForeground1, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "12px", fontWeight: tokens.fontWeightSemibold },
  bandSub: { color: tokens.colorNeutralForeground2, maxWidth: "60ch" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", columnGap: "20px", rowGap: "20px" },
  card: {
    backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge, padding: "26px", display: "flex", flexDirection: "column", rowGap: "12px",
    transitionProperty: "transform, box-shadow, border-color", transitionDuration: "160ms",
    ":hover": { transform: "translateY(-2px)", boxShadow: "0 12px 28px -12px rgba(16,26,58,.22)", border: `1px solid ${tokens.colorBrandStroke1}` },
  },
  iconBadge: {
    width: "44px", height: "44px", borderRadius: tokens.borderRadiusLarge, display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1, fontSize: "22px",
  },
  cardBody: { color: tokens.colorNeutralForeground2 },

  steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", columnGap: "20px", rowGap: "24px" },
  step: { display: "flex", flexDirection: "column", rowGap: "10px" },
  stepNum: {
    width: "34px", height: "34px", borderRadius: tokens.borderRadiusCircular, backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand, display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: tokens.fontWeightBold, fontSize: "15px",
  },

  secGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", columnGap: "20px", rowGap: "20px" },
  secItem: { display: "flex", alignItems: "flex-start", columnGap: "14px", backgroundColor: tokens.colorNeutralBackground2, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusXLarge, padding: "22px" },
  secText: { display: "flex", flexDirection: "column", rowGap: "4px" },
  secIcon: { fontSize: "24px", color: tokens.colorBrandForeground1, display: "flex", flexShrink: 0, marginTop: "2px" },

  ctaBand: {
    margin: "0 24px 72px", maxWidth: "1120px", marginLeft: "auto", marginRight: "auto",
    borderRadius: tokens.borderRadiusXLarge, padding: "56px 32px", textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "center", rowGap: "16px",
    backgroundColor: tokens.colorNeutralBackground1, border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundImage: `radial-gradient(90% 140% at 50% -20%, ${tokens.colorBrandBackground2} 0%, transparent 60%)`,
  },
});

const FEATURES = [
  { icon: <PeopleTeamRegular />, title: "One authoritative directory", body: "Every stakeholder in one tiered record. No more scattered spreadsheets or conflicting versions of the truth." },
  { icon: <NotepadRegular />, title: "Fast field capture", body: "The field team logs an engagement in seconds. Each log refreshes the record and keeps relationships from going stale." },
  { icon: <WarningRegular />, title: "Risk and escalations", body: "High risk or a raised flag opens an escalation automatically, so the right people act before a problem grows." },
  { icon: <DataTrendingRegular />, title: "Leadership visibility", body: "Function heads and leadership see sentiment, risk and commitments across the portfolio, live rather than in a monthly deck." },
];

const STEPS = [
  { n: 1, title: "Log the engagement", body: "The field team records who they met and what happened." },
  { n: 2, title: "See the risk", body: "Sentiment and risk update, and escalations open when they need to." },
  { n: 3, title: "Follow through", body: "Commitments are tracked and nudged, so nothing is dropped." },
  { n: 4, title: "Report with confidence", body: "Leadership reads one live source of truth across every function." },
];

const SECURITY = [
  { icon: <LockClosedRegular />, title: "Your data stays yours", body: "Each organisation's data is walled off in the database, enforced by row-level security and tested continuously. One organisation can never see another's data." },
  { icon: <ShieldCheckmarkRegular />, title: "Role-based access", body: "People see only what their role allows. Access is decided in the database, not just hidden in the interface." },
  { icon: <GlobeRegular />, title: "GDPR and NDPA aligned", body: "Built to the EU GDPR and the Nigeria Data Protection Act 2023. Read our plain-English privacy notice for the detail." },
];

function ProductPreview() {
  const s = useStyles();
  const green = tokens.colorStatusSuccessForeground1;
  const amber = tokens.colorStatusWarningForeground1;
  const red = tokens.colorStatusDangerForeground1;
  return (
    <div className={s.mock} aria-hidden="true">
      <div className={s.mockBar}>
        <span className={s.mockDot} style={{ backgroundColor: "#ff5f57" }} />
        <span className={s.mockDot} style={{ backgroundColor: "#febc2e" }} />
        <span className={s.mockDot} style={{ backgroundColor: "#28c840" }} />
        <span className={s.mockBarLabel}>Leadership portfolio</span>
      </div>
      <div className={s.mockBody}>
        <div className={s.mockKpis}>
          <div className={s.mockKpi}><div className={s.mockKpiNum} style={{ color: red }}>4</div><div className={s.mockKpiLabel}>High risk</div></div>
          <div className={s.mockKpi}><div className={s.mockKpiNum} style={{ color: amber }}>2</div><div className={s.mockKpiLabel}>Open escalations</div></div>
          <div className={s.mockKpi}><div className={s.mockKpiNum} style={{ color: green }}>68%</div><div className={s.mockKpiLabel}>Supportive</div></div>
        </div>
        <div className={s.mockCard}>
          <span className={s.mockCardTitle}>Sentiment mix</span>
          <div className={s.mockSentiment}>
            <span style={{ width: "62%", backgroundColor: green }} />
            <span style={{ width: "26%", backgroundColor: amber }} />
            <span style={{ width: "12%", backgroundColor: red }} />
          </div>
          <div className={s.mockLegend}>
            <span className={s.mockLegendItem}><span className={s.legDot} style={{ backgroundColor: green }} />Supportive 62%</span>
            <span className={s.mockLegendItem}><span className={s.legDot} style={{ backgroundColor: amber }} />Neutral 26%</span>
            <span className={s.mockLegendItem}><span className={s.legDot} style={{ backgroundColor: red }} />Resistant 12%</span>
          </div>
        </div>
        <div className={s.mockCard}>
          <span className={s.mockCardTitle}>Escalations</span>
          <div className={s.mockRow}>
            <span className={s.mockChip} style={{ color: "#fff", backgroundColor: red }}>Critical</span>
            <span className={s.mockRowText}><span className={s.mockRowName}>National Telecoms Commission</span><span className={s.mockRowMeta}>Regulatory</span></span>
            <span className={s.mockAge}>3d open</span>
          </div>
          <div className={s.mockRow}>
            <span className={s.mockChip} style={{ color: "#fff", backgroundColor: amber }}>Elevated</span>
            <span className={s.mockRowText}><span className={s.mockRowName}>Riverside Community Council</span><span className={s.mockRowMeta}>Corporate Affairs</span></span>
            <span className={s.mockAge}>6d open</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const styles = useStyles();

  return (
    <div className={styles.page}>
      <MarketingHeader />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.pill}><span className={styles.pillDot} />Stakeholder Engagement Tracker</span>
            <h1 className={styles.h1}>One source of truth for every stakeholder relationship.</h1>
            <Body1 className={styles.heroSub}>
              {COMPANY.product} gives your teams one place to log engagements, track risk and commitments, and give
              leadership a live view of every relationship, so nothing important slips.
            </Body1>
            <div className={styles.ctaRow}>
              <Button as="a" href="/login" appearance="primary" size="large">Sign in</Button>
              <Button as="a" href={`mailto:${COMPANY.email}?subject=Teasoo%20SET%20demo`} appearance="outline" size="large" icon={<MailRegular />}>
                Request a demo
              </Button>
            </div>
            <div className={styles.trustLine}>
              <span className={styles.trustItem}><span className={styles.trustCheck}><CheckmarkCircleFilled /></span>GDPR and Nigeria NDPA aligned</span>
              <span className={styles.trustItem}><span className={styles.trustCheck}><CheckmarkCircleFilled /></span>Database-level tenant isolation</span>
              <span className={styles.trustItem}><span className={styles.trustCheck}><CheckmarkCircleFilled /></span>Access by invitation</span>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* Trust bar */}
      <div className={styles.trustBar}>
        <div className={styles.trustBarInner}>
          <span className={styles.trustBarLabel}>Trusted by teams at</span>
          <span className={styles.wordmark}>Unilever</span>
        </div>
      </div>

      {/* Features */}
      <section id="features" className={styles.band}>
        <div className={styles.section}>
          <div className={styles.bandHead}>
            <span className={styles.bandKicker}>What it does</span>
            <Title2>Everything the relationship needs, in one place</Title2>
            <Body1 className={styles.bandSub}>From the field team&apos;s first note to the boardroom summary.</Body1>
          </div>
          <div className={styles.grid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.card}>
                <span className={styles.iconBadge}>{f.icon}</span>
                <Title3>{f.title}</Title3>
                <Body2 className={styles.cardBody}>{f.body}</Body2>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`${styles.band} ${styles.bandAlt}`}>
        <div className={styles.section}>
          <div className={styles.bandHead}>
            <span className={styles.bandKicker}>How it works</span>
            <Title2>A simple loop that keeps every relationship moving</Title2>
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
      <section id="security" className={styles.band}>
        <div className={styles.section}>
          <div className={styles.bandHead}>
            <span className={styles.bandKicker}>Security and privacy</span>
            <Title2>Built for organisations that take data protection seriously</Title2>
            <Body1 className={styles.bandSub}>Isolation and access control are enforced in the database, not just the interface.</Body1>
          </div>
          <div className={styles.secGrid}>
            {SECURITY.map((sx) => (
              <div key={sx.title} className={styles.secItem}>
                <span className={styles.secIcon}>{sx.icon}</span>
                <span className={styles.secText}>
                  <Title3>{sx.title}</Title3>
                  <Body2 className={styles.cardBody}>{sx.body}</Body2>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className={styles.ctaBand}>
        <Title2>Ready to see it?</Title2>
        <Body1 className={styles.bandSub}>Access is by invitation. Talk to us about a pilot for your organisation.</Body1>
        <Button as="a" href={`mailto:${COMPANY.email}?subject=Teasoo%20SET%20demo`} appearance="primary" size="large" icon={<ArrowRightRegular />}>
          Email {COMPANY.email}
        </Button>
      </div>

      <MarketingFooter />
    </div>
  );
}
