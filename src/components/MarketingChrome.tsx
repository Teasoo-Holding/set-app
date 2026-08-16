"use client";

import * as React from "react";
import Link from "next/link";
import { makeStyles } from "@fluentui/react-components";
import { COMPANY } from "@/lib/company";

const ARCHIVO = "var(--font-archivo), -apple-system, Helvetica, Arial, sans-serif";
const FIGTREE = "var(--font-figtree), -apple-system, Helvetica, Arial, sans-serif";

/** Teasoo red triangle logo mark (design handoff). */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ display: "block" }}>
      <polygon points="20,4 36,36 26,36 20,20 14,36 4,36" fill="#e01f2d" />
    </svg>
  );
}

const useStyles = makeStyles({
  header: {
    position: "sticky", top: 0, zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.86)", backdropFilter: "blur(10px)",
    borderBottom: "1px solid #ecedf2",
  },
  headerInner: {
    maxWidth: "1200px", margin: "0 auto", padding: "16px 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between", columnGap: "16px",
    "@media (max-width: 520px)": { padding: "14px 20px" },
  },
  brand: { display: "flex", alignItems: "center", columnGap: "10px", textDecoration: "none" },
  brandName: { fontFamily: ARCHIVO, fontWeight: 800, fontSize: "19px", color: "#17235b", letterSpacing: "-0.01em" },
  nav: { display: "flex", alignItems: "center", columnGap: "26px" },
  navLink: { fontFamily: FIGTREE, fontWeight: 500, fontSize: "15px", color: "#4a5162", textDecoration: "none", ":hover": { color: "#e01f2d" }, "@media (max-width: 620px)": { display: "none" } },
  signin: {
    fontFamily: FIGTREE, fontWeight: 600, fontSize: "15px", color: "#ffffff",
    backgroundColor: "#17235b", padding: "10px 18px", borderRadius: "8px", textDecoration: "none",
    ":hover": { backgroundColor: "#101a4a" },
  },

  footer: { backgroundColor: "#0e1642", color: "#c3cae6", fontFamily: FIGTREE },
  footerInner: {
    maxWidth: "1200px", margin: "0 auto", padding: "60px 32px 40px",
    display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.6fr", columnGap: "32px", rowGap: "36px",
    "@media (max-width: 820px)": { gridTemplateColumns: "1fr 1fr" },
    "@media (max-width: 520px)": { gridTemplateColumns: "1fr", padding: "48px 24px 32px" },
  },
  fCol: { display: "flex", flexDirection: "column", rowGap: "10px" },
  fBrand: { display: "flex", alignItems: "center", columnGap: "10px", marginBottom: "2px" },
  fBrandName: { fontFamily: ARCHIVO, fontWeight: 800, fontSize: "18px", color: "#ffffff" },
  fMuted: { color: "#8b95bd", fontSize: "14px" },
  fHead: { color: "#6d78a6", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "12px", fontWeight: 700, marginBottom: "2px" },
  fLink: { color: "#c3cae6", fontSize: "14.5px", textDecoration: "none", ":hover": { color: "#ffffff" } },
  bottom: { borderTop: "1px solid #1c2856", padding: "20px 32px", textAlign: "center" },
  bottomText: { color: "#6d78a6", fontFamily: FIGTREE, fontSize: "13px" },
});

export function MarketingHeader() {
  const s = useStyles();
  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        <Link href="/" className={s.brand}>
          <LogoMark />
          <span className={s.brandName}>Teasoo SET</span>
        </Link>
        <nav className={s.nav}>
          <a href="#what" className={s.navLink}>Features</a>
          <a href="#security" className={s.navLink}>Security</a>
          <Link href="/login" className={s.signin}>Sign in</Link>
        </nav>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  const s = useStyles();
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.fCol}>
          <div className={s.fBrand}><LogoMark size={24} /><span className={s.fBrandName}>Teasoo SET</span></div>
          <span className={s.fMuted}>{COMPANY.productLong}</span>
          <span className={s.fMuted}>
            By{" "}
            <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className={s.fLink}>{COMPANY.name}</a>
          </span>
        </div>
        <div className={s.fCol}>
          <span className={s.fHead}>Product</span>
          <a href="#what" className={s.fLink}>Features</a>
          <a href="#security" className={s.fLink}>Security &amp; privacy</a>
          <Link href="/login" className={s.fLink}>Sign in</Link>
        </div>
        <div className={s.fCol}>
          <span className={s.fHead}>Legal</span>
          <Link href="/terms" className={s.fLink}>Terms of service</Link>
          <Link href="/privacy" className={s.fLink}>Privacy notice</Link>
        </div>
        <div className={s.fCol}>
          <span className={s.fHead}>Contact</span>
          <a href={`mailto:${COMPANY.email}`} className={s.fLink}>{COMPANY.email}</a>
          <a href={COMPANY.phoneHref} className={s.fLink}>{`Call us: ${COMPANY.phone}`}</a>
          <span className={s.fMuted}>{COMPANY.address}</span>
        </div>
      </div>
      <div className={s.bottom}>
        <span className={s.bottomText}>{`© ${COMPANY.name}. All rights reserved.`}</span>
      </div>
    </footer>
  );
}
