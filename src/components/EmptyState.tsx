"use client";

import * as React from "react";
import Link from "next/link";
import { makeStyles, tokens, Body1, Caption1 } from "@fluentui/react-components";

const useStyles = makeStyles({
  wrap: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
    padding: "18px 4px",
  },
  icon: { fontSize: "24px", color: tokens.colorNeutralForeground3, display: "flex", marginBottom: "2px" },
  title: { color: tokens.colorNeutralForeground2 },
  hint: { color: tokens.colorNeutralForeground3 },
  action: {
    marginTop: "6px",
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    textDecoration: "none",
    fontSize: tokens.fontSizeBase200,
    ":hover": { textDecoration: "underline" },
  },
});

/**
 * Friendly, on-brand empty state: a clear line about why it's empty, an optional
 * hint, and an optional next-step link. Written in plain English, no em-dashes.
 */
export function EmptyState({
  icon,
  title,
  hint,
  actionLabel,
  actionHref,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  const styles = useStyles();
  return (
    <div className={styles.wrap}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <Body1 className={styles.title}>{title}</Body1>
      {hint && <Caption1 className={styles.hint}>{hint}</Caption1>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className={styles.action}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
