"use client";

import * as React from "react";
import Link from "next/link";
import { makeStyles } from "@fluentui/react-components";
import { EyeRegular, EyeOffRegular, CheckmarkCircle20Filled } from "@fluentui/react-icons";
import { LogoMark } from "@/components/MarketingChrome";
import {
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithPassword,
  requestPasswordReset,
} from "@/app/actions/auth";
import { DEMO_MODE } from "@/lib/roles";

const ARCHIVO = "var(--font-archivo), -apple-system, Helvetica, Arial, sans-serif";
const FIGTREE = "var(--font-figtree), -apple-system, Helvetica, Arial, sans-serif";

// Accounts are created by invitation only (E12), so there's no self-serve
// sign-up here — just sign in and password reset.
type Mode = "signin" | "forgot";

/** Google's "G" logo (official colours). */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ display: "block" }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92A8.78 8.78 0 0 0 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

/** Microsoft's four-square logo (official colours). */
function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true" style={{ display: "block" }}>
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

const useStyles = makeStyles({
  split: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    fontFamily: FIGTREE,
    "@media (max-width: 719px)": { gridTemplateColumns: "1fr" },
  },

  // ---- Brand panel (navy) ----
  brand: {
    position: "relative",
    overflow: "hidden",
    minHeight: "100vh",
    background: "linear-gradient(160deg, #17235b, #131d4d 55%, #0e1642)",
    color: "#c3cae6",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    rowGap: "28px",
    padding: "52px 60px 48px",
    "@media (min-width: 1440px)": { padding: "72px 88px 64px" },
    "@media (max-width: 999px)": { padding: "34px 34px 30px", rowGap: "18px" },
    "@media (max-width: 719px)": { display: "none" },
  },
  glowRed: {
    position: "absolute", top: "-120px", right: "-100px", width: "420px", height: "420px",
    borderRadius: "50%", pointerEvents: "none",
    background: "radial-gradient(circle, rgba(224,31,45,0.30), rgba(224,31,45,0) 70%)",
  },
  glowWhite: {
    position: "absolute", bottom: "-150px", left: "-120px", width: "460px", height: "460px",
    borderRadius: "50%", pointerEvents: "none",
    background: "radial-gradient(circle, rgba(255,255,255,0.10), rgba(255,255,255,0) 70%)",
  },
  brandRow: { position: "relative", zIndex: 1 },
  brandTop: { display: "flex", alignItems: "center", columnGap: "11px" },
  brandName: { fontFamily: ARCHIVO, fontWeight: 800, fontSize: "20px", color: "#ffffff", letterSpacing: "-0.01em" },
  brandMid: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", rowGap: "22px", "@media (max-width: 999px)": { rowGap: "16px" } },
  brandLabel: { fontFamily: FIGTREE, fontWeight: 700, fontSize: "12.5px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#7f8bc0" },
  brandH1: {
    fontFamily: ARCHIVO, fontWeight: 800, fontSize: "40px", lineHeight: 1.12, letterSpacing: "-0.02em",
    color: "#ffffff", margin: 0, maxWidth: "15ch",
    "@media (min-width: 1440px)": { fontSize: "44px" },
    "@media (max-width: 999px)": { fontSize: "27px" },
  },
  points: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", rowGap: "14px", "@media (max-width: 999px)": { rowGap: "10px" } },
  point: { display: "flex", alignItems: "center", columnGap: "12px", fontSize: "16px", color: "#c3cae6", "@media (max-width: 999px)": { fontSize: "14.5px" } },
  check: { color: "#34d399", flexShrink: 0, display: "flex", fontSize: "20px" },
  brandFoot: { position: "relative", zIndex: 1, color: "#6d78a6", fontSize: "13.5px" },

  // ---- Form panel (white) ----
  formPanel: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 52px",
    "@media (min-width: 1440px)": { padding: "64px 96px" },
    "@media (max-width: 999px)": { padding: "32px 36px" },
    "@media (max-width: 719px)": { padding: "40px 22px", alignItems: "flex-start" },
  },
  formInner: { width: "100%", maxWidth: "440px", "@media (min-width: 1440px)": { maxWidth: "460px" } },

  mobileBrand: {
    display: "none",
    "@media (max-width: 719px)": { display: "flex", alignItems: "center", justifyContent: "center", columnGap: "10px", marginBottom: "28px" },
  },
  mobileBrandName: { fontFamily: ARCHIVO, fontWeight: 800, fontSize: "19px", color: "#17235b", letterSpacing: "-0.01em" },

  h2: {
    fontFamily: ARCHIVO, fontWeight: 800, fontSize: "34px", lineHeight: 1.12, letterSpacing: "-0.02em",
    color: "#131829", margin: "0 0 10px",
    "@media (max-width: 719px)": { fontSize: "28px" },
  },
  blurb: { fontSize: "15.5px", lineHeight: 1.6, color: "#4a5162", margin: "0 0 22px", "@media (max-width: 999px)": { margin: "0 0 18px" } },

  alert: { padding: "11px 14px", borderRadius: "9px", fontSize: "14px", lineHeight: 1.45, marginBottom: "18px" },
  alertError: { backgroundColor: "#fdecee", border: "1px solid #f5c2c7", color: "#8a1a24" },
  alertSuccess: { backgroundColor: "#e7f9f1", border: "1px solid #a7e8cf", color: "#12613f" },

  form: { margin: 0, display: "flex", flexDirection: "column", rowGap: "16px", "@media (max-width: 999px)": { rowGap: "12px" } },
  fieldLabelRow: { display: "flex", alignItems: "baseline", justifyContent: "space-between", columnGap: "12px", marginBottom: "6px" },
  label: { fontFamily: FIGTREE, fontWeight: 600, fontSize: "13.5px", color: "#131829" },
  forgotLink: {
    fontFamily: FIGTREE, fontWeight: 600, fontSize: "13px", color: "#17235b",
    whiteSpace: "nowrap", background: "transparent", border: "none", padding: 0, cursor: "pointer",
    ":hover": { color: "#e01f2d", textDecoration: "underline" },
  },
  inputWrap: { position: "relative" },
  input: {
    width: "100%", boxSizing: "border-box", display: "block",
    padding: "13px 14px", fontFamily: FIGTREE, fontSize: "15px", color: "#131829",
    backgroundColor: "#ffffff", border: "1px solid #d7dbe6", borderRadius: "9px", outline: "none",
    "::placeholder": { color: "#9199a6" },
    ":focus": { border: "1px solid #17235b", boxShadow: "0 0 0 3px rgba(23,35,91,0.12)" },
  },
  inputPassword: { paddingRight: "46px" },
  eyeBtn: {
    position: "absolute", top: "50%", right: "8px", transform: "translateY(-50%)",
    display: "flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px",
    background: "transparent", border: "none", borderRadius: "7px", cursor: "pointer",
    color: "#6b7280", fontSize: "18px",
    ":hover": { color: "#17235b", backgroundColor: "#f4f6fd" },
  },

  primaryBtn: {
    width: "100%", minHeight: "44px", marginTop: "2px",
    padding: "12px 16px", border: "none", borderRadius: "9px",
    backgroundColor: "#17235b", color: "#ffffff",
    fontFamily: FIGTREE, fontSize: "15px", fontWeight: 600, cursor: "pointer",
    ":hover": { backgroundColor: "#101a4a" },
  },
  backLink: {
    alignSelf: "center", background: "transparent", border: "none", padding: 0, cursor: "pointer",
    fontFamily: FIGTREE, fontSize: "13.5px", fontWeight: 600, color: "#17235b",
    ":hover": { color: "#e01f2d", textDecoration: "underline" },
  },

  divider: {
    display: "flex", alignItems: "center", columnGap: "12px", color: "#9199a6", fontSize: "13px",
    margin: "18px 0", "@media (max-width: 999px)": { margin: "12px 0" },
    "::before": { content: '""', flexGrow: 1, height: "1px", backgroundColor: "#ebedf2" },
    "::after": { content: '""', flexGrow: 1, height: "1px", backgroundColor: "#ebedf2" },
  },
  msForm: { margin: 0 },
  msBtn: {
    width: "100%", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center", columnGap: "10px",
    padding: "12px 16px", border: "1px solid #d7dbe6", borderRadius: "9px", backgroundColor: "#ffffff",
    fontFamily: FIGTREE, fontSize: "15px", fontWeight: 600, color: "#131829", cursor: "pointer",
    ":hover": { border: "1px solid #17235b", backgroundColor: "#fafbfc" },
  },

  demoHint: { marginTop: "24px", textAlign: "center", fontSize: "14px", color: "#9199a6", "@media (max-width: 999px)": { marginTop: "16px" } },
  demoLink: { color: "#17235b", fontWeight: 600, textDecoration: "none", ":hover": { color: "#e01f2d", textDecoration: "underline" } },
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

function PasswordField({ styles }: { styles: ReturnType<typeof useStyles> }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className={styles.inputWrap}>
      <input
        id="password"
        name="password"
        type={show ? "text" : "password"}
        autoComplete="current-password"
        required
        className={`${styles.input} ${styles.inputPassword}`}
      />
      <button
        type="button"
        className={styles.eyeBtn}
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((v) => !v)}
      >
        {show ? <EyeOffRegular /> : <EyeRegular />}
      </button>
    </div>
  );
}

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
    <main className={styles.split}>
      {/* Brand panel — hidden on mobile */}
      <section className={styles.brand}>
        <div className={styles.glowRed} aria-hidden="true" />
        <div className={styles.glowWhite} aria-hidden="true" />

        <div className={`${styles.brandRow} ${styles.brandTop}`}>
          <LogoMark size={28} />
          <span className={styles.brandName}>Teasoo SET</span>
        </div>

        <div className={styles.brandMid}>
          <span className={styles.brandLabel}>Stakeholder Engagement Tracker</span>
          <h1 className={styles.brandH1}>One source of truth for every stakeholder relationship.</h1>
          <ul className={styles.points}>
            <li className={styles.point}><span className={styles.check}><CheckmarkCircle20Filled /></span>Frictionless logging for the field team</li>
            <li className={styles.point}><span className={styles.check}><CheckmarkCircle20Filled /></span>Full risk visibility for leadership</li>
            <li className={styles.point}><span className={styles.check}><CheckmarkCircle20Filled /></span>Data isolated by organisation</li>
          </ul>
        </div>

        <div className={styles.brandFoot}>By Teasoo Consulting · Access by invitation</div>
      </section>

      {/* Form panel */}
      <section className={styles.formPanel}>
        <div className={styles.formInner}>
          <div className={styles.mobileBrand}>
            <LogoMark size={26} />
            <span className={styles.mobileBrandName}>Teasoo SET</span>
          </div>

          <h2 className={styles.h2}>{copy.title}</h2>
          <p className={styles.blurb}>{copy.blurb}</p>

          {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
          {message && !error && <div className={`${styles.alert} ${styles.alertSuccess}`}>{message}</div>}

          {/* Sign in */}
          {mode === "signin" && (
            <form action={signInWithPassword} className={styles.form}>
              <div>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.label} htmlFor="email">Email</label>
                </div>
                <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={styles.input} />
              </div>
              <div>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  <button type="button" className={styles.forgotLink} onClick={() => setMode("forgot")}>
                    Forgot password?
                  </button>
                </div>
                <PasswordField styles={styles} />
              </div>
              <button type="submit" className={styles.primaryBtn}>{copy.cta}</button>
            </form>
          )}

          {/* Forgot password */}
          {mode === "forgot" && (
            <form action={requestPasswordReset} className={styles.form}>
              <div>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.label} htmlFor="email">Email</label>
                </div>
                <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={styles.input} />
              </div>
              <button type="submit" className={styles.primaryBtn}>{copy.cta}</button>
              <button type="button" className={styles.backLink} onClick={() => setMode("signin")}>Back to sign in</button>
            </form>
          )}

          {/* Social sign-in. Access stays invite-only — the OAuth callback
              signs out anyone without an onboarded profile. */}
          {mode === "signin" && (
            <>
              <div className={styles.divider}>or</div>
              <form action={signInWithGoogle} className={styles.msForm}>
                <button type="submit" className={styles.msBtn}>
                  <GoogleLogo />
                  Sign in with Google
                </button>
              </form>
              <form action={signInWithMicrosoft} className={styles.msForm}>
                <button type="submit" className={styles.msBtn}>
                  <MicrosoftLogo />
                  Sign in with Microsoft
                </button>
              </form>
            </>
          )}

          {DEMO_MODE && (
            <p className={styles.demoHint}>
              Just exploring? <Link href="/demo" className={styles.demoLink}>See the demo</Link>.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
