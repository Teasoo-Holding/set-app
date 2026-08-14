"use client";

import * as React from "react";
import Link from "next/link";
import { makeStyles, tokens, Text, Caption1, Button } from "@fluentui/react-components";
import { BrandMark } from "@/components/BrandMark";
import { COMPANY } from "@/lib/company";

const useStyles = makeStyles({
  header: {
    display: "flex", alignItems: "center", columnGap: "10px", padding: "14px 24px",
    maxWidth: "1080px", margin: "0 auto", width: "100%", boxSizing: "border-box",
  },
  brandLink: { display: "flex", alignItems: "center", columnGap: "10px", textDecoration: "none", color: tokens.colorNeutralForeground1 },
  spacer: { flexGrow: 1 },
  navLinks: { display: "flex", alignItems: "center", columnGap: "18px", "@media (max-width: 560px)": { display: "none" } },
  navLink: { color: tokens.colorNeutralForeground2, textDecoration: "none", fontSize: tokens.fontSizeBase300, ":hover": { color: tokens.colorNeutralForeground1 } },

  footer: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    marginTop: "48px",
  },
  footerInner: {
    maxWidth: "1080px", margin: "0 auto", padding: "32px 24px",
    display: "flex", flexWrap: "wrap", columnGap: "48px", rowGap: "24px",
  },
  footerCol: { display: "flex", flexDirection: "column", rowGap: "8px", minWidth: "200px" },
  footerHead: { color: tokens.colorNeutralForeground3, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: tokens.fontWeightSemibold },
  footerLink: { color: tokens.colorNeutralForeground2, textDecoration: "none", fontSize: tokens.fontSizeBase300, ":hover": { textDecoration: "underline" } },
  muted: { color: tokens.colorNeutralForeground3 },
  legalBar: { borderTop: `1px solid ${tokens.colorNeutralStroke2}`, padding: "16px 24px", textAlign: "center" },
});

export function MarketingHeader() {
  const styles = useStyles();
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brandLink}>
        <BrandMark size="sm" />
        <Text weight="semibold" size={400}>Teasoo SET</Text>
      </Link>
      <div className={styles.spacer} />
      <div className={styles.navLinks}>
        <Link href="/#features" className={styles.navLink}>Features</Link>
        <Link href="/#security" className={styles.navLink}>Security</Link>
      </div>
      <Button as="a" href="/login" appearance="primary">Sign in</Button>
    </header>
  );
}

export function MarketingFooter() {
  const styles = useStyles();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerCol}>
          <div className={styles.brandLink}>
            <BrandMark size="sm" />
            <Text weight="semibold">Teasoo SET</Text>
          </div>
          <Caption1 className={styles.muted}>{COMPANY.productLong}</Caption1>
          <Caption1 className={styles.muted}>
            By{" "}
            <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              {COMPANY.name}
            </a>
          </Caption1>
        </div>

        <div className={styles.footerCol}>
          <Caption1 className={styles.footerHead}>Product</Caption1>
          <Link href="/#features" className={styles.footerLink}>Features</Link>
          <Link href="/#security" className={styles.footerLink}>Security &amp; privacy</Link>
          <Link href="/login" className={styles.footerLink}>Sign in</Link>
        </div>

        <div className={styles.footerCol}>
          <Caption1 className={styles.footerHead}>Legal</Caption1>
          <Link href="/terms" className={styles.footerLink}>Terms of service</Link>
          <Link href="/privacy" className={styles.footerLink}>Privacy notice</Link>
        </div>

        <div className={styles.footerCol}>
          <Caption1 className={styles.footerHead}>Contact</Caption1>
          <a href={`mailto:${COMPANY.email}`} className={styles.footerLink}>{COMPANY.email}</a>
          <Caption1 className={styles.muted}>{COMPANY.address}</Caption1>
        </div>
      </div>
      <div className={styles.legalBar}>
        <Caption1 className={styles.muted}>{`© ${COMPANY.name}. All rights reserved.`}</Caption1>
      </div>
    </footer>
  );
}
