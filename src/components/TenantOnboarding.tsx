"use client";

import * as React from "react";
import Link from "next/link";
import { makeStyles, tokens, Title2, Body1, Caption1, Button } from "@fluentui/react-components";
import { CheckmarkCircleFilled, CircleRegular, ArrowRightRegular, DismissRegular } from "@fluentui/react-icons";

const DISMISS_KEY = "teasoo_onboarding_dismissed";

const useStyles = makeStyles({
  card: {
    padding: "24px",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorBrandStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
  },
  headRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", columnGap: "12px" },
  head: { display: "flex", flexDirection: "column", rowGap: "4px" },
  muted: { color: tokens.colorNeutralForeground3 },
  bar: { height: "6px", borderRadius: tokens.borderRadiusCircular, backgroundColor: tokens.colorNeutralBackground4, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: tokens.colorBrandBackground, transition: "width 200ms ease" },
  steps: { display: "flex", flexDirection: "column" },
  step: { display: "flex", alignItems: "flex-start", columnGap: "12px", padding: "14px 0", borderTop: `1px solid ${tokens.colorNeutralStroke2}` },
  icon: { fontSize: "22px", display: "flex", flexShrink: 0, marginTop: "1px" },
  done: { color: tokens.colorStatusSuccessForeground1 },
  todo: { color: tokens.colorNeutralForeground4 },
  body: { display: "flex", flexDirection: "column", rowGap: "3px", flexGrow: 1 },
  titleDone: { color: tokens.colorNeutralForeground3 },
  action: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: "4px",
    marginTop: "6px",
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    textDecoration: "none",
    fontSize: tokens.fontSizeBase200,
    ":hover": { textDecoration: "underline" },
  },
});

type Step = { done: boolean; title: string; body: string; actionLabel?: string; actionHref?: string; alwaysLink?: boolean };

/**
 * Setup guide for a tenant admin. Instead of a bare screen, it welcomes them and
 * walks through setting up their organisation with live progress. It persists
 * through setup and hides itself automatically once every step is done, or when
 * the admin dismisses it (remembered per browser).
 */
export function TenantOnboarding({
  orgName,
  adminFirstName,
  memberCount,
  stakeholderCount,
  engagementCount,
}: {
  orgName: string;
  adminFirstName: string;
  memberCount: number;
  stakeholderCount: number;
  engagementCount: number;
}) {
  const styles = useStyles();
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      // ignore — storage may be unavailable; just show the guide.
    }
  }, []);

  const steps: Step[] = [
    { done: true, title: "Create your organisation", body: `You're set up as the administrator of ${orgName}.` },
    {
      done: true,
      alwaysLink: true,
      title: "Set up your categories & functions",
      body: "We've added starter lists. Customise your categories, functions and engagement types any time.",
      actionLabel: "Manage lists",
      actionHref: "/governance",
    },
    {
      done: memberCount > 1,
      title: "Invite your team",
      body: "Add your leaders, function heads and standard users, so everyone works from one place.",
      actionLabel: "Invite people",
      actionHref: "/governance",
    },
    {
      done: stakeholderCount > 0,
      title: "Add your stakeholders",
      body: "Build the directory of the relationships your organisation manages.",
      actionLabel: "Go to the directory",
      actionHref: "/directory",
    },
    {
      done: engagementCount > 0,
      title: "Log your first engagement",
      body: "Capture what happens in a relationship, so nothing gets lost.",
      actionLabel: "Open the directory",
      actionHref: "/directory",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);
  const allDone = steps.every((s) => s.done);

  // Nothing to show once setup is complete or the admin has hidden it.
  if (allDone || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.headRow}>
        <div className={styles.head}>
          <Title2>{`Welcome, ${adminFirstName}. Let's get ${orgName} ready.`}</Title2>
          <Caption1 className={styles.muted}>{`A few steps to set up your organisation. ${doneCount} of ${steps.length} done.`}</Caption1>
        </div>
        <Button appearance="subtle" size="small" icon={<DismissRegular />} aria-label="Hide setup guide" onClick={dismiss} />
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.steps}>
        {steps.map((s, i) => (
          <div key={i} className={styles.step}>
            <span className={`${styles.icon} ${s.done ? styles.done : styles.todo}`}>
              {s.done ? <CheckmarkCircleFilled /> : <CircleRegular />}
            </span>
            <span className={styles.body}>
              <Body1 className={s.done ? styles.titleDone : undefined}>{s.title}</Body1>
              <Caption1 className={styles.muted}>{s.body}</Caption1>
              {(!s.done || s.alwaysLink) && s.actionLabel && s.actionHref && (
                <Link href={s.actionHref} className={styles.action}>
                  {s.actionLabel}
                  <ArrowRightRegular />
                </Link>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
