"use client";

import * as React from "react";
import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Caption1,
  Text,
  Avatar,
  Divider,
  Field,
  Input,
  Button,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { ArrowRightRegular } from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";
import { PasswordInput } from "@/components/PasswordInput";
import {
  signInAsDemo,
  signInWithMicrosoft,
  signInWithPassword,
  requestPasswordReset,
} from "@/app/actions/auth";
import { DEMO_USERS, DEMO_MODE, ENTRA_ENABLED, ROLE_LABEL } from "@/lib/roles";

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
  sectionLabel: {
    color: tokens.colorNeutralForeground3,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontWeight: tokens.fontWeightSemibold,
  },
  roles: { display: "flex", flexDirection: "column", rowGap: "8px" },
  roleForm: { margin: 0 },
  roleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
    textAlign: "left",
    padding: "12px 14px",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
    fontFamily: tokens.fontFamilyBase,
    ":hover": { backgroundColor: tokens.colorNeutralBackground1Hover, border: `1px solid ${tokens.colorBrandStroke1}` },
  },
  roleText: { display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 },
  arrow: { color: tokens.colorNeutralForeground3, fontSize: "18px" },
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
        <Text as="h1" weight="semibold" size={500}>
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
            <MessageBarBody>
              <MessageBarTitle>Something went wrong</MessageBarTitle>
              {error}
            </MessageBarBody>
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
          <>
            <Divider />
            <Caption1 className={styles.sectionLabel}>Continue as a demo role</Caption1>
            <div className={styles.roles}>
              {DEMO_USERS.map((u) => (
                <form key={u.email} action={signInAsDemo} className={styles.roleForm}>
                  <input type="hidden" name="email" value={u.email} />
                  <button type="submit" className={styles.roleBtn}>
                    <Avatar name={u.name} color="colorful" />
                    <span className={styles.roleText}>
                      <Body1>
                        <strong>{u.name}</strong>
                      </Body1>
                      <Caption1>
                        {ROLE_LABEL[u.role]}
                        {u.function ? ` · ${u.function}` : ""}
                      </Caption1>
                    </span>
                    <ArrowRightRegular className={styles.arrow} />
                  </button>
                </form>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
