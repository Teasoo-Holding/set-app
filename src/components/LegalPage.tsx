"use client";

import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { Clock16Regular } from "@fluentui/react-icons";
import { MarketingHeader, MarketingFooter } from "@/components/MarketingChrome";
import { COMPANY } from "@/lib/company";

const ARCHIVO = "var(--font-archivo), -apple-system, Helvetica, Arial, sans-serif";
const FIGTREE = "var(--font-figtree), -apple-system, Helvetica, Arial, sans-serif";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

const useStyles = makeStyles({
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff", fontFamily: FIGTREE, color: "#4a5162" },

  layout: {
    flexGrow: 1, width: "100%", maxWidth: "1160px", margin: "0 auto", boxSizing: "border-box",
    padding: "56px 32px 84px",
    display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", columnGap: "56px", alignItems: "start",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr", padding: "36px 24px 64px" },
    "@media (max-width: 520px)": { padding: "28px 20px 56px" },
  },

  // "On this page" section nav
  aside: {
    position: "sticky", top: "96px", display: "flex", flexDirection: "column", rowGap: "2px",
    "@media (max-width: 900px)": { display: "none" },
  },
  asideHead: { fontFamily: FIGTREE, fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9199a6", marginBottom: "12px" },
  asideLink: {
    fontFamily: FIGTREE, fontWeight: 500, fontSize: "13.5px", lineHeight: 1.4, color: "#6b7280",
    textDecoration: "none", padding: "7px 0 7px 14px", borderLeft: "2px solid #ecedf2",
    ":hover": { color: "#17235b", borderLeftColor: "#e01f2d" },
  },

  article: { maxWidth: "720px", width: "100%", minWidth: 0 },
  eyebrow: { display: "block", fontFamily: FIGTREE, fontWeight: 700, fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#e01f2d", marginBottom: "14px" },
  h1: {
    fontFamily: ARCHIVO, fontWeight: 800, fontSize: "46px", lineHeight: 1.08, letterSpacing: "-0.02em",
    color: "#131829", margin: "0 0 18px",
    "@media (max-width: 520px)": { fontSize: "34px" },
  },
  badge: {
    display: "inline-flex", alignItems: "center", columnGap: "7px", boxSizing: "border-box",
    backgroundColor: "#f4f6fd", border: "1px solid #e6e8ef", borderRadius: "999px",
    color: "#4a5162", fontSize: "13px", fontWeight: 600, padding: "6px 14px", marginBottom: "32px",
  },
  badgeIcon: { display: "flex", fontSize: "15px", color: "#6b7280" },

  lead: {
    fontSize: "16.5px", lineHeight: 1.7, color: "#4a5162",
    "& p": { margin: "0 0 14px" },
    "& p:last-child": { marginBottom: 0 },
    "& a": { color: "#17235b", fontWeight: 600, textDecoration: "none", ":hover": { color: "#e01f2d", textDecoration: "underline" } },
  },

  section: { marginTop: "38px", scrollMarginTop: "96px" },
  h2: {
    fontFamily: ARCHIVO, fontWeight: 700, fontSize: "24px", lineHeight: 1.25, letterSpacing: "-0.01em",
    color: "#131829", margin: "0 0 12px",
  },

  prose: {
    fontSize: "16px", lineHeight: 1.7, color: "#4a5162",
    "& p": { margin: "0 0 14px" },
    "& p:last-child": { marginBottom: 0 },
    "& strong": { color: "#131829", fontWeight: 700 },
    "& a": { color: "#17235b", fontWeight: 600, textDecoration: "none", ":hover": { color: "#e01f2d", textDecoration: "underline" } },
    "& ul": { listStyle: "none", margin: "0 0 14px", padding: 0, display: "flex", flexDirection: "column", rowGap: "10px" },
    "& ul:last-child": { marginBottom: 0 },
    "& li": { position: "relative", paddingLeft: "22px" },
    "& li::before": { content: '""', position: "absolute", left: "3px", top: "10px", width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#17235b" },
  },

  // Highlighted "Contact us" card
  card: {
    marginTop: "38px", scrollMarginTop: "96px",
    backgroundColor: "#fafbfc", border: "1px solid #ebedf2", borderRadius: "14px", padding: "26px 28px",
  },
});

export function LegalPage({
  title,
  lead,
  sections,
  eyebrow = "Legal",
}: {
  title: string;
  lead: React.ReactNode;
  sections: LegalSection[];
  eyebrow?: string;
}) {
  const s = useStyles();
  return (
    <div className={s.page}>
      <MarketingHeader />

      <div className={s.layout}>
        <aside className={s.aside} aria-label="On this page">
          <span className={s.asideHead}>On this page</span>
          {sections.map((sec) => (
            <a key={sec.id} href={`#${sec.id}`} className={s.asideLink}>
              {sec.title}
            </a>
          ))}
        </aside>

        <article className={s.article}>
          <span className={s.eyebrow}>{eyebrow}</span>
          <h1 className={s.h1}>{title}</h1>
          <span className={s.badge}>
            <span className={s.badgeIcon}><Clock16Regular /></span>
            {`Last updated: ${COMPANY.legalUpdated}`}
          </span>

          <div className={s.lead}>{lead}</div>

          {sections.map((sec) =>
            sec.id === "contact" ? (
              <section key={sec.id} id={sec.id} className={s.card}>
                <h2 className={s.h2}>{sec.title}</h2>
                <div className={s.prose}>{sec.body}</div>
              </section>
            ) : (
              <section key={sec.id} id={sec.id} className={s.section}>
                <h2 className={s.h2}>{sec.title}</h2>
                <div className={s.prose}>{sec.body}</div>
              </section>
            ),
          )}
        </article>
      </div>

      <MarketingFooter />
    </div>
  );
}
