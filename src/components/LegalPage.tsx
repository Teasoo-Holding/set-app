"use client";

import * as React from "react";
import { makeStyles, tokens, Title1, Caption1 } from "@fluentui/react-components";
import { MarketingHeader, MarketingFooter } from "@/components/MarketingChrome";
import { COMPANY } from "@/lib/company";

const useStyles = makeStyles({
  page: { backgroundColor: tokens.colorNeutralBackground2, minHeight: "100vh", display: "flex", flexDirection: "column" },
  main: { maxWidth: "760px", margin: "0 auto", padding: "40px 24px 8px", width: "100%", boxSizing: "border-box", flexGrow: 1 },
  updated: { color: tokens.colorNeutralForeground3, display: "block", marginTop: "6px", marginBottom: "28px" },
  prose: {
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase400,
    "& h2": { fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, marginTop: "34px", marginBottom: "8px" },
    "& h3": { fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightSemibold, marginTop: "20px", marginBottom: "6px" },
    "& p": { marginTop: 0, marginBottom: "14px" },
    "& ul": { marginTop: 0, marginBottom: "14px", paddingLeft: "22px" },
    "& li": { marginBottom: "6px" },
    "& a": { color: tokens.colorBrandForeground1 },
    "& strong": { fontWeight: tokens.fontWeightSemibold },
  },
});

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <MarketingHeader />
      <main className={styles.main}>
        <Title1 as="h1">{title}</Title1>
        <Caption1 className={styles.updated}>{`Last updated: ${COMPANY.legalUpdated}`}</Caption1>
        <div className={styles.prose}>{children}</div>
      </main>
      <MarketingFooter />
    </div>
  );
}
