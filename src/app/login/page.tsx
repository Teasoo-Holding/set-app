"use client";

import * as React from "react";
import Link from "next/link";
import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Caption1,
  Text,
  Field,
  Input,
  Button,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import { BrandMark } from "@/components/BrandMark";
import { PasswordInput } from "@/components/PasswordInput";
import {
  signInWithMicrosoft,
  signInWithPassword,
  requestPasswordReset,
} from "@/app/actions/auth";
import { DEMO_MODE, ENTRA_ENABLED } from "@/lib/roles";

// Accounts are created by invitation only (E12), so there's no self-serve
// sign-up here — just sign in and password reset.
type Mode = "signin" | "forgot";

/** Microsoft's four-square logo (official colours). */
function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px",
    rowGap: "24px",
  },
  brand: { display: "flex", alignItems: "center", columnGap: "10px" },
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    rowGap: "20px",
    boxShadow: tokens.shadow4,
    "@media (max-width: 480px)": { padding: "24px 18px" },
  },
  hero: { display: "flex", flexDirection: "column", rowGap: "8px" },
  form: { margin: 0, display: "flex", flexDirection: "column", rowGap: "14px" },
  submit: { marginTop: "2px" },
  linkRow: { display: "flex", alignItems: "center", justifyContent: "space-between", columnGap: "8px", flexWrap: "wrap" },
  linkBtn: {
    backgroundColor: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: tokens.colorBrandForeground1,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    ":hover": { textDecoration: "underline" },
  },
  divideText: {
    display: "flex",
    alignItems: "center",
    columnGap: "10px",
    color: tokens.colorNeutralForeground3,
    "::before": { content: '""', flexGrow: 1, height: "1px", backgroundColor: tokens.colorNeutralStroke2 },
    "::after": { content: '""', flexGrow: 1, height: "1px", backgroundColor: tokens.colorNeutralStroke2 },
  },
  msForm: { margin: 0 },
  msButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "10px",
    padding: "12px 14px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    ":hover": { backgroundColor: tokens.colorNeutralBackground1Hover, border: `1px solid ${tokens.colorBrandStroke1}` },
  },
  demoHint: { color: tokens.colorNeutralForeground3, textAlign: "center" },
  demoLink: { color: tokens.colorBrandForeground1, fontWeight: tokens.fontWeightSemibold, textDecoration: "none", ":hover": { textDecoration: "underline" } },
});

const COPY: Record<Mode, { title: string; blurb: string; cta: string }> = {
  signin: {
    title: "One voice, one source of truth.",
    blurb: "Sign in with your email. Your role decides what you see: frictionless logging for the field, and full risk visibility for leadership.",
    cta: "Sign in",
  },
  forgot: {
    title: "Reset your password.",
    blurb: "Enter your email and we'll send you a link to set a new password.",
    cta: "Send reset link",
  },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; message?: string; mode?: string };
}) {
  const styles = useStyles();
  const error = searchParams?.error;
  const message = searchParams?.message;
  const initialMode: Mode = searchParams?.mode === "forgot" ? "forgot" : "signin";
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const copy = COPY[mode];

  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <BrandMark size="md" />
        <Text as="span" weight="semibold" size={500}>
          Teasoo SET
        </Text>
      </div>

      <div className={styles.card}>
        <div className={styles.hero}>
          <Title1>{copy.title}</Title1>
          <Body1>{copy.blurb}</Body1>
        </div>

        {error && (
          <MessageBar intent="error">
            <MessageBarBody>{error}</MessageBarBody>
          </MessageBar>
        )}
        {message && !error && (
          <MessageBar intent="success">
            <MessageBarBody>{message}</MessageBarBody>
          </MessageBar>
        )}

        {/* Sign in */}
        {mode === "signin" && (
          <form action={signInWithPassword} className={styles.form}>
            <Field label="Email">
              <Input name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
            </Field>
            <Field label="Password">
              <PasswordInput name="password" autoComplete="current-password" required />
            </Field>
            <Button type="submit" appearance="primary" className={styles.submit}>
              {copy.cta}
            </Button>
            <div className={styles.linkRow}>
              <button type="button" className={styles.linkBtn} onClick={() => setMode("forgot")}>
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* Forgot password */}
        {mode === "forgot" && (
          <form action={requestPasswordReset} className={styles.form}>
            <Field label="Email">
              <Input name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
            </Field>
            <Button type="submit" appearance="primary" className={styles.submit}>
              {copy.cta}
            </Button>
            <div className={styles.linkRow}>
              <button type="button" className={styles.linkBtn} onClick={() => setMode("signin")}>
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {/* Microsoft sign-in — parked behind a flag (#23) */}
        {ENTRA_ENABLED && mode === "signin" && (
          <>
            <Caption1 className={styles.divideText}>or</Caption1>
            <form action={signInWithMicrosoft} className={styles.msForm}>
              <button type="submit" className={styles.msButton}>
                <MicrosoftLogo />
                Sign in with Microsoft
              </button>
            </form>
          </>
        )}

        {DEMO_MODE && (
          <Caption1 className={styles.demoHint}>
            Just exploring? <Link href="/demo" className={styles.demoLink}>See the demo</Link>.
          </Caption1>
        )}
      </div>
    </main>
  );
}
