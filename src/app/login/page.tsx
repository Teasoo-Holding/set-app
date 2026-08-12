"use client";

import {
  makeStyles,
  tokens,
  Title1,
  Body1,
  Caption1,
  Text,
  Avatar,
  Divider,
  Badge,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { ArrowRightRegular, LockClosedRegular } from "@fluentui/react-icons";
import { BrandMark } from "@/components/BrandMark";
import { signInAsDemo } from "@/app/actions/auth";
import { DEMO_USERS, DEMO_MODE, ROLE_LABEL } from "@/lib/roles";

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
    maxWidth: "460px",
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    rowGap: "20px",
    boxShadow: tokens.shadow4,
  },
  hero: { display: "flex", flexDirection: "column", rowGap: "8px" },
  ssoRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "10px",
    padding: "12px 14px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
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
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
  },
  roleText: { display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 },
  arrow: { color: tokens.colorNeutralForeground3, fontSize: "18px" },
});

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const styles = useStyles();
  const error = searchParams?.error;

  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <BrandMark size="md" />
        <Text as="h1" weight="semibold" size={500}>
          Stakeholder Intelligence
        </Text>
      </div>

      <div className={styles.card}>
        <div className={styles.hero}>
          <Title1>One voice, one source of truth.</Title1>
          <Body1>
            Sign in with your corporate email. Your role decides what you see —
            frictionless logging for the field, full risk visibility for
            leadership.
          </Body1>
        </div>

        {error && (
          <MessageBar intent="error">
            <MessageBarBody>
              <MessageBarTitle>Sign-in failed</MessageBarTitle>
              {error}
            </MessageBarBody>
          </MessageBar>
        )}

        <div className={styles.ssoRow}>
          <LockClosedRegular />
          <Body1 style={{ flexGrow: 1 }}>Corporate SSO</Body1>
          <Badge appearance="tint" color="informative">
            Coming soon
          </Badge>
        </div>

        {DEMO_MODE && (
          <>
            <Divider />
            <Caption1 className={styles.sectionLabel}>
              Continue as — demo roles
            </Caption1>
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
