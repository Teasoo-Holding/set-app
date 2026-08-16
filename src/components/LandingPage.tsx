"use client";

import * as React from "react";
import Link from "next/link";
import { makeStyles } from "@fluentui/react-components";
import {
  PeopleTeamRegular, DocumentBulletListRegular, WarningRegular, ArrowTrendingLinesRegular,
  LockClosedRegular, ShieldCheckmarkRegular, GlobeRegular, MailRegular, CallRegular,
  ArrowRightRegular, CheckmarkCircleFilled, DismissCircleFilled, TableRegular,
} from "@fluentui/react-icons";
import { MarketingHeader, MarketingFooter, LogoMark } from "@/components/MarketingChrome";
import { COMPANY } from "@/lib/company";

const ARCHIVO = "var(--font-archivo), -apple-system, Helvetica, Arial, sans-serif";
const FIGTREE = "var(--font-figtree), -apple-system, Helvetica, Arial, sans-serif";
const NAVY = "#17235b";
const RED = "#e01f2d";

const useStyles = makeStyles({
  page: { backgroundColor: "#ffffff", color: "#131829", fontFamily: FIGTREE, overflowX: "hidden" },
  section: { maxWidth: "1200px", margin: "0 auto", padding: "0 32px", "@media (max-width: 520px)": { padding: "0 20px" } },
  eyebrow: { color: RED, textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "12.5px", fontWeight: 700 },
  h2: { fontFamily: ARCHIVO, fontWeight: 800, fontSize: "38px", letterSpacing: "-0.02em", color: "#131829", margin: "10px 0 0", lineHeight: 1.1, "@media (max-width: 640px)": { fontSize: "30px" } },
  bandHead: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", rowGap: "4px", marginBottom: "44px" },
  bandSub: { color: "#4a5162", fontSize: "18px", maxWidth: "58ch", marginTop: "8px" },

  /* Hero */
  hero: { backgroundImage: "linear-gradient(160deg, #17235b 0%, #131d4d 55%, #0e1642 100%)", color: "#fff" },
  heroInner: { maxWidth: "1200px", margin: "0 auto", padding: "84px 32px 92px", display: "grid", gridTemplateColumns: "1.05fr 1fr", columnGap: "64px", rowGap: "48px", alignItems: "center", "@media (max-width: 900px)": { gridTemplateColumns: "1fr", padding: "64px 24px 72px" } },
  h1: { fontFamily: ARCHIVO, fontWeight: 800, fontSize: "62px", lineHeight: 1.03, letterSpacing: "-0.03em", margin: 0, textWrap: "balance", "@media (max-width: 900px)": { fontSize: "44px" }, "@media (max-width: 520px)": { fontSize: "36px" } },
  heroSub: { color: "#c3cae6", fontSize: "18px", lineHeight: 1.6, maxWidth: "460px", marginTop: "20px" },
  heroBtns: { display: "flex", columnGap: "12px", rowGap: "12px", flexWrap: "wrap", marginTop: "28px" },
  heroChecks: { display: "flex", flexDirection: "column", rowGap: "8px", marginTop: "26px" },
  checkRow: { display: "flex", alignItems: "center", columnGap: "8px", color: "#c3cae6", fontSize: "14px" },
  greenCheck: { color: "#34d399", fontSize: "16px", display: "flex" },

  /* Buttons */
  btn: { display: "inline-flex", alignItems: "center", columnGap: "8px", fontFamily: FIGTREE, fontWeight: 600, fontSize: "15px", padding: "12px 20px", borderRadius: "9px", textDecoration: "none", cursor: "pointer", border: "none" },
  btnRed: { backgroundColor: RED, color: "#fff", ":hover": { backgroundColor: "#c41926" } },
  btnNavy: { backgroundColor: NAVY, color: "#fff", ":hover": { backgroundColor: "#101a4a" } },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)", ":hover": { backgroundColor: "rgba(255,255,255,0.16)" } },

  /* Hero dashboard mock */
  dash: { backgroundColor: "#fff", borderRadius: "16px", padding: "20px", boxShadow: "0 24px 60px -22px rgba(20,30,80,0.28)", color: "#131829" },
  dashTitle: { display: "flex", alignItems: "center", columnGap: "8px", marginBottom: "16px" },
  dots: { display: "flex", columnGap: "5px" },
  dot: { width: "9px", height: "9px", borderRadius: "999px" },
  dashLabel: { fontFamily: ARCHIVO, fontWeight: 700, fontSize: "13px", color: "#4a5162", marginLeft: "4px" },
  tiles: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "16px" },
  tile: { border: "1px solid #eef0f4", borderRadius: "10px", padding: "12px" },
  tileNum: { fontFamily: ARCHIVO, fontWeight: 800, fontSize: "26px", lineHeight: 1 },
  tileCap: { fontSize: "11.5px", color: "#6b7280", marginTop: "4px" },
  panel: { border: "1px solid #eef0f4", borderRadius: "10px", padding: "14px", marginBottom: "12px" },
  panelHead: { fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9199a6", marginBottom: "10px" },
  meter: { display: "flex", height: "9px", borderRadius: "999px", overflow: "hidden" },
  legend: { display: "flex", flexWrap: "wrap", columnGap: "12px", marginTop: "10px", fontSize: "12px", color: "#6b7280" },
  escRow: { display: "flex", alignItems: "center", columnGap: "10px", padding: "8px 0", borderTop: "1px solid #f1f2f5" },
  escBadge: { fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", color: "#fff", padding: "3px 7px", borderRadius: "6px", flexShrink: 0 },
  escName: { fontSize: "13px", fontWeight: 600, flexGrow: 1, minWidth: 0 },
  escMeta: { fontSize: "11.5px", color: "#9199a6" },

  /* Trust bar */
  trust: { backgroundColor: "#fafbfc", borderTop: "1px solid #ebedf2", borderBottom: "1px solid #ebedf2", textAlign: "center", padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", rowGap: "14px" },
  trustEyebrow: { color: "#9199a6", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: "12px", fontWeight: 700 },
  trustName: { fontFamily: ARCHIVO, fontWeight: 700, fontSize: "24px", color: NAVY },

  /* Bands */
  band: { padding: "96px 0", "@media (max-width: 640px)": { padding: "64px 0" } },
  bandAlt: { backgroundColor: "#fafbfc", borderTop: "1px solid #ebedf2", borderBottom: "1px solid #ebedf2" },

  /* VS comparison */
  vsWrap: { maxWidth: "1100px", margin: "0 auto", border: "1px solid #e6e8ef", borderRadius: "18px", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr auto 1fr", "@media (max-width: 820px)": { gridTemplateColumns: "1fr" } },
  vsCol: { padding: "32px", display: "flex", flexDirection: "column", rowGap: "18px" },
  vsOld: { backgroundColor: "#fafbfc" },
  vsNew: { backgroundImage: "linear-gradient(160deg, #17235b 0%, #0e1642 100%)", color: "#fff" },
  vsMid: { display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #e6e8ef", borderRight: "1px solid #e6e8ef", "@media (max-width: 820px)": { borderLeft: "none", borderRight: "none", borderTop: "1px solid #e6e8ef", borderBottom: "1px solid #e6e8ef", padding: "12px" } },
  vsCircle: { width: "44px", height: "44px", borderRadius: "999px", backgroundColor: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: "13px" },
  vsHeadRow: { display: "flex", alignItems: "center", columnGap: "10px" },
  vsChip: { width: "34px", height: "34px", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  vsHeadText: { fontFamily: ARCHIVO, fontWeight: 700, fontSize: "19px" },
  vsList: { display: "flex", flexDirection: "column", rowGap: "12px", margin: 0, padding: 0, listStyle: "none" },
  vsItem: { display: "flex", alignItems: "flex-start", columnGap: "10px", fontSize: "14.5px" },
  xIcon: { color: "#b91c1c", fontSize: "18px", flexShrink: 0, marginTop: "1px", display: "flex" },
  checkIcon: { color: "#34d399", fontSize: "18px", flexShrink: 0, marginTop: "1px", display: "flex" },
  hatch: { borderRadius: "12px", padding: "18px", minHeight: "120px", position: "relative", backgroundImage: "repeating-linear-gradient(45deg, #f1f2f5 0, #f1f2f5 10px, #fafbfc 10px, #fafbfc 20px)", border: "1px dashed #d7dbe6", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "flex-start" },
  fileChip: { backgroundColor: "#fff", border: "1px solid #e6e8ef", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", color: "#4a5162", display: "flex", alignItems: "center", columnGap: "6px", boxShadow: "0 4px 12px -8px rgba(23,35,91,0.4)" },
  miniPanel: { backgroundColor: "#fff", borderRadius: "12px", padding: "14px", color: "#131829" },

  /* What it does */
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", "@media (max-width: 900px)": { gridTemplateColumns: "repeat(2,1fr)" }, "@media (max-width: 520px)": { gridTemplateColumns: "1fr" } },
  card: { backgroundColor: "#fff", border: "1px solid #ebedf2", borderRadius: "14px", padding: "26px", display: "flex", flexDirection: "column", rowGap: "12px" },
  cardHi: { border: "1px solid #d5dbf0", boxShadow: "0 14px 34px -20px rgba(23,35,91,0.35)" },
  iconChip: { width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", backgroundColor: "#eef1fb", color: NAVY },
  iconChipRed: { backgroundColor: "#fdeaea", color: RED },
  cardH3: { fontFamily: ARCHIVO, fontWeight: 700, fontSize: "19px", margin: 0 },
  cardBody: { color: "#4a5162", fontSize: "14.5px", lineHeight: 1.6, margin: 0 },

  /* How it works */
  steps: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "22px", position: "relative", "@media (max-width: 900px)": { gridTemplateColumns: "repeat(2,1fr)" }, "@media (max-width: 520px)": { gridTemplateColumns: "1fr" } },
  step: { display: "flex", flexDirection: "column", rowGap: "12px", position: "relative", zIndex: 1 },
  preview: { backgroundColor: "#fff", border: "1px solid #ebedf2", borderRadius: "12px", padding: "14px", boxShadow: "0 10px 24px -18px rgba(23,35,91,0.3)", minHeight: "104px", display: "flex", flexDirection: "column", rowGap: "8px" },
  pvLabel: { fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9199a6" },
  pvBar: { height: "8px", borderRadius: "999px", backgroundColor: "#eef0f4" },
  pvChip: { alignSelf: "flex-start", fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "999px" },
  stepNum: { width: "34px", height: "34px", borderRadius: "999px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: "15px", boxShadow: "0 0 0 4px #fff" },

  /* Security */
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", "@media (max-width: 820px)": { gridTemplateColumns: "1fr" } },
  pills: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "36px" },
  pill: { display: "inline-flex", alignItems: "center", columnGap: "7px", backgroundColor: "#fff", border: "1px solid #e6e8ef", borderRadius: "999px", padding: "8px 14px", fontSize: "13px", color: "#4a5162", fontWeight: 500 },
  pillCheck: { color: "#16a34a", fontSize: "15px", display: "flex" },

  /* CTA */
  ctaBand: { padding: "90px 32px", "@media (max-width: 520px)": { padding: "64px 20px" } },
  ctaCard: { maxWidth: "760px", margin: "0 auto", backgroundImage: "linear-gradient(155deg, #17235b 0%, #0e1642 100%)", borderRadius: "20px", padding: "56px 48px", textAlign: "center", color: "#fff", boxShadow: "0 30px 70px -30px rgba(14,22,66,0.55)", display: "flex", flexDirection: "column", alignItems: "center", rowGap: "12px", "@media (max-width: 520px)": { padding: "44px 24px" } },
  ctaH2: { fontFamily: ARCHIVO, fontWeight: 800, fontSize: "38px", letterSpacing: "-0.02em", margin: 0 },
  ctaSub: { color: "#c3cae6", fontSize: "17px", maxWidth: "44ch" },
  ctaBtns: { display: "flex", columnGap: "12px", rowGap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "18px" },
});

const FEATURES = [
  { icon: <PeopleTeamRegular />, title: "One authoritative directory", body: "Every stakeholder in one tiered record. No more scattered spreadsheets or conflicting versions of the truth." },
  { icon: <DocumentBulletListRegular />, title: "Fast field capture", body: "The field team logs an engagement in seconds. Each log refreshes the record and keeps relationships from going stale.", hi: true },
  { icon: <WarningRegular />, title: "Risk and escalations", body: "High risk or a raised flag opens an escalation automatically, so the right people act before a problem grows.", red: true },
  { icon: <ArrowTrendingLinesRegular />, title: "Leadership visibility", body: "Function heads and leadership see sentiment, risk and commitments across the portfolio, live rather than in a monthly deck." },
];

const OLD = ["Records scattered across spreadsheets, inboxes and chats", "Risk surfaces late, once it is already a problem", "Commitments slip through the cracks", "Leadership waits on a stale monthly deck"];
const NEW = ["One authoritative record per stakeholder", "Risk and escalations open automatically", "Commitments tracked and nudged", "One live source of truth for leadership"];

const SECURITY = [
  { icon: <LockClosedRegular />, title: "Your data stays yours", body: "Each organisation's data is walled off in the database, enforced by row-level security and tested continuously. One organisation can never see another's data." },
  { icon: <ShieldCheckmarkRegular />, title: "Role-based access", body: "People see only what their role allows. Access is decided in the database, not just hidden in the interface." },
  { icon: <GlobeRegular />, title: "GDPR and NDPA aligned", body: "Built to the EU GDPR and the Nigeria Data Protection Act 2023. Read our plain-English privacy notice for the detail." },
];
const PILLS = ["EU GDPR", "Nigeria NDPA 2023", "Row-level security", "Encrypted in transit and at rest", "Access by invitation"];

export function LandingPage() {
  const s = useStyles();
  return (
    <div className={s.page}>
      <MarketingHeader />

      {/* Hero */}
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div>
            <h1 className={s.h1}>One source of truth for every stakeholder relationship.</h1>
            <p className={s.heroSub}>
              Teasoo SET gives your teams one place to log engagements, track risk and commitments, and give leadership
              a live view of every relationship, so nothing important slips.
            </p>
            <div className={s.heroBtns}>
              <Link href="/login" className={`${s.btn} ${s.btnRed}`}>Sign in</Link>
              <a href="#cta" className={`${s.btn} ${s.btnGhost}`}><MailRegular /> Request a demo</a>
            </div>
            <div className={s.heroChecks}>
              {["GDPR and Nigeria NDPA aligned", "Data isolated by organisation", "Access by invitation"].map((t) => (
                <span key={t} className={s.checkRow}><span className={s.greenCheck}><CheckmarkCircleFilled /></span>{t}</span>
              ))}
            </div>
          </div>

          {/* Dashboard mock */}
          <div className={s.dash}>
            <div className={s.dashTitle}>
              <span className={s.dots}>
                <span className={s.dot} style={{ background: "#e01f2d" }} />
                <span className={s.dot} style={{ background: "#d97706" }} />
                <span className={s.dot} style={{ background: "#16a34a" }} />
              </span>
              <span className={s.dashLabel}>Leadership portfolio</span>
            </div>
            <div className={s.tiles}>
              <div className={s.tile}><div className={s.tileNum} style={{ color: "#b91c1c" }}>4</div><div className={s.tileCap}>High risk</div></div>
              <div className={s.tile}><div className={s.tileNum} style={{ color: "#d97706" }}>2</div><div className={s.tileCap}>Open escalations</div></div>
              <div className={s.tile}><div className={s.tileNum} style={{ color: "#16a34a" }}>68%</div><div className={s.tileCap}>Supportive</div></div>
            </div>
            <div className={s.panel}>
              <div className={s.panelHead}>Sentiment mix</div>
              <div className={s.meter}>
                <span style={{ width: "62%", background: "#16a34a" }} />
                <span style={{ width: "26%", background: "#d97706" }} />
                <span style={{ width: "12%", background: "#b91c1c" }} />
              </div>
              <div className={s.legend}><span>Supportive 62%</span><span>Neutral 26%</span><span>Resistant 12%</span></div>
            </div>
            <div className={s.panel} style={{ marginBottom: 0 }}>
              <div className={s.panelHead}>Escalations</div>
              <div className={s.escRow} style={{ borderTop: "none", paddingTop: 0 }}>
                <span className={s.escBadge} style={{ background: "#b91c1c" }}>CRITICAL</span>
                <span className={s.escName}>National Telecoms Commission<br /><span style={{ color: "#9199a6", fontWeight: 400 }}>Regulatory</span></span>
                <span className={s.escMeta}>3d open</span>
              </div>
              <div className={s.escRow}>
                <span className={s.escBadge} style={{ background: "#d97706" }}>ELEVATED</span>
                <span className={s.escName}>Riverside Community Council<br /><span style={{ color: "#9199a6", fontWeight: 400 }}>Corporate Affairs</span></span>
                <span className={s.escMeta}>6d open</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className={s.trust}>
        <span className={s.trustEyebrow}>Trusted by teams at</span>
        <span className={s.trustName}>Unilever</span>
      </section>

      {/* VS comparison */}
      <section className={s.band}>
        <div className={s.section}>
          <div className={s.bandHead}>
            <span className={s.eyebrow}>Why Teasoo SET</span>
            <h2 className={s.h2}>The old way was never built for this</h2>
          </div>
          <div className={s.vsWrap}>
            <div className={`${s.vsCol} ${s.vsOld}`}>
              <div className={s.hatch}>
                <span className={s.fileChip} style={{ transform: "rotate(-4deg)" }}><TableRegular /> Q3-tracker.xlsx</span>
                <span className={s.fileChip} style={{ transform: "rotate(3deg)" }}><MailRegular /> Email thread</span>
                <span className={s.fileChip} style={{ transform: "rotate(-2deg)" }}><DocumentBulletListRegular /> Notes.docx</span>
                <span className={s.fileChip} style={{ transform: "rotate(5deg)" }}>WhatsApp</span>
              </div>
              <div className={s.vsHeadRow}>
                <span className={s.vsChip} style={{ background: "#f0e3e4", color: "#b91c1c" }}><TableRegular /></span>
                <span className={s.vsHeadText} style={{ color: "#131829" }}>Fragmented tools and spreadsheets</span>
              </div>
              <ul className={s.vsList}>
                {OLD.map((t) => (<li key={t} className={s.vsItem} style={{ color: "#4a5162" }}><span className={s.xIcon}><DismissCircleFilled /></span><span>{t}</span></li>))}
              </ul>
            </div>
            <div className={s.vsMid}><span className={s.vsCircle}>VS</span></div>
            <div className={`${s.vsCol} ${s.vsNew}`}>
              <div className={s.miniPanel}>
                <div className={s.dashTitle}>
                  <span className={s.dots}><span className={s.dot} style={{ background: "#e01f2d" }} /><span className={s.dot} style={{ background: "#d97706" }} /><span className={s.dot} style={{ background: "#16a34a" }} /></span>
                  <span className={s.dashLabel}>One workspace</span>
                </div>
                <div className={s.tiles} style={{ marginBottom: 0 }}>
                  <div className={s.tile}><div className={s.tileNum} style={{ color: NAVY }}>240</div><div className={s.tileCap}>Stakeholders</div></div>
                  <div className={s.tile}><div className={s.tileNum} style={{ color: "#d97706" }}>2</div><div className={s.tileCap}>Escalations</div></div>
                  <div className={s.tile}><div className={s.tileNum} style={{ color: "#16a34a" }}>68%</div><div className={s.tileCap}>Supportive</div></div>
                </div>
              </div>
              <div className={s.vsHeadRow}>
                <span className={s.vsChip} style={{ background: "rgba(255,255,255,0.12)" }}><LogoMark size={20} /></span>
                <span className={s.vsHeadText} style={{ color: "#fff" }}>Teasoo SET</span>
              </div>
              <ul className={s.vsList}>
                {NEW.map((t) => (<li key={t} className={s.vsItem} style={{ color: "#d5daec" }}><span className={s.checkIcon}><CheckmarkCircleFilled /></span><span>{t}</span></li>))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What it does */}
      <section id="what" className={`${s.band} ${s.bandAlt}`}>
        <div className={s.section}>
          <div className={s.bandHead}>
            <span className={s.eyebrow}>What it does</span>
            <h2 className={s.h2}>Everything the relationship needs, in one place</h2>
            <p className={s.bandSub}>From the field team&apos;s first note to the boardroom summary.</p>
          </div>
          <div className={s.grid4}>
            {FEATURES.map((f) => (
              <div key={f.title} className={`${s.card} ${f.hi ? s.cardHi : ""}`}>
                <span className={`${s.iconChip} ${f.red ? s.iconChipRed : ""}`}>{f.icon}</span>
                <h3 className={s.cardH3}>{f.title}</h3>
                <p className={s.cardBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={s.band}>
        <div className={s.section}>
          <div className={s.bandHead}>
            <span className={s.eyebrow}>How it works</span>
            <h2 className={s.h2}>A simple loop that keeps every relationship moving</h2>
          </div>
          <div className={s.steps}>
            {[
              { n: 1, red: false, title: "Log the engagement", body: "The field team records who they met and what happened.", pv: (<><span className={s.pvLabel}>New engagement</span><span className={s.pvBar} /><span className={s.pvBar} style={{ width: "70%" }} /><span className={s.pvChip} style={{ background: NAVY, color: "#fff" }}>Save log</span></>) },
              { n: 2, red: false, title: "See the risk", body: "Sentiment and risk update, and escalations open when they need to.", pv: (<><span className={s.pvLabel}>Risk level</span><div className={s.meter}><span style={{ width: "34%", background: "#16a34a" }} /><span style={{ width: "33%", background: "#d97706" }} /><span style={{ width: "33%", background: "#b91c1c" }} /></div><span className={s.pvChip} style={{ background: "#fdeaea", color: "#b91c1c" }}>High risk</span></>) },
              { n: 3, red: false, title: "Follow through", body: "Commitments are tracked and nudged, so nothing is dropped.", pv: (<><span className={s.pvLabel}>Commitments</span><span className={s.checkRow} style={{ color: "#16a34a" }}><span className={s.pillCheck}><CheckmarkCircleFilled /></span><span style={{ color: "#4a5162", fontSize: "12px" }}>Send proposal</span></span><span className={s.pvBar} style={{ width: "60%" }} /></>) },
              { n: 4, red: true, title: "Report with confidence", body: "Leadership reads one live source of truth across every function.", pv: (<><span className={s.pvLabel}>Portfolio</span><div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "34px" }}><span style={{ flex: 1, height: "40%", background: "#dfe3ee", borderRadius: "3px" }} /><span style={{ flex: 1, height: "70%", background: "#dfe3ee", borderRadius: "3px" }} /><span style={{ flex: 1, height: "55%", background: "#dfe3ee", borderRadius: "3px" }} /><span style={{ flex: 1, height: "90%", background: RED, borderRadius: "3px" }} /></div></>) },
            ].map((st) => (
              <div key={st.n} className={s.step}>
                <div className={s.preview}>{st.pv}</div>
                <span className={s.stepNum} style={{ background: st.red ? RED : NAVY }}>{st.n}</span>
                <h3 className={s.cardH3}>{st.title}</h3>
                <p className={s.cardBody}>{st.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className={`${s.band} ${s.bandAlt}`}>
        <div className={s.section}>
          <div className={s.bandHead}>
            <span className={s.eyebrow}>Security and privacy</span>
            <h2 className={s.h2}>Built for organisations that take data protection seriously</h2>
            <p className={s.bandSub}>Isolation and access control are enforced in the database, not just the interface.</p>
          </div>
          <div className={s.grid3}>
            {SECURITY.map((sec) => (
              <div key={sec.title} className={s.card}>
                <span className={s.iconChip}>{sec.icon}</span>
                <h3 className={s.cardH3}>{sec.title}</h3>
                <p className={s.cardBody}>{sec.body}</p>
              </div>
            ))}
          </div>
          <div className={s.pills}>
            {PILLS.map((p) => (<span key={p} className={s.pill}><span className={s.pillCheck}><CheckmarkCircleFilled /></span>{p}</span>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className={s.ctaBand}>
        <div className={s.ctaCard}>
          <h2 className={s.ctaH2}>Ready to see it?</h2>
          <p className={s.ctaSub}>Access is by invitation. Talk to us about a pilot for your organisation.</p>
          <div className={s.ctaBtns}>
            <a href={`mailto:${COMPANY.email}?subject=Teasoo%20SET%20demo`} className={`${s.btn} ${s.btnRed}`}>Email us <ArrowRightRegular /></a>
            <a href={COMPANY.phoneHref} className={`${s.btn} ${s.btnGhost}`}><CallRegular /> {`Call us · ${COMPANY.phone}`}</a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
